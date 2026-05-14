<?php

namespace App\Services;

use App\Models\Order;
use App\Models\RevenueCatAlias;
use App\Models\RevenueCatEvent;
use App\Models\User;
use App\Utils\Helper;
use App\Services\OrderService;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RevenueCatService
{
    protected array $config;

    public function __construct()
    {
        $this->config = config('revenuecat');
    }

    /**
     * Process incoming webhook event
     */
    public function processWebhook(array $payload): array
    {
        $event = $payload['event'] ?? null;

        if (!$event) {
            return ['success' => false, 'error' => 'Invalid payload: missing event'];
        }

        $eventId = $event['id'] ?? null;
        $eventType = $event['type'] ?? null;

        $environment = strtoupper((string) ($event['environment'] ?? 'PRODUCTION'));
        $configuredEnvironment = strtoupper((string) ($this->config['environment'] ?? 'PRODUCTION'));
        if ($configuredEnvironment !== 'ALL' && $environment !== $configuredEnvironment) {
            Log::info('RevenueCat: Event environment ignored', [
                'event_environment' => $environment,
                'configured_environment' => $configuredEnvironment,
            ]);
            return ['success' => true, 'message' => 'Event environment ignored'];
        }

        $rcEvent = null;
        if ($eventId) {
            $rcEvent = RevenueCatEvent::where('event_id', $eventId)->first();
            if ($rcEvent && $rcEvent->processed) {
                Log::info('RevenueCat: Duplicate event ignored', ['event_id' => $eventId]);
                return ['success' => true, 'message' => 'Duplicate event'];
            }
        }

        $eventData = [
            'event_id' => $eventId ?? Str::uuid()->toString(),
            'event_type' => $eventType,
            'app_user_id' => $event['app_user_id'] ?? '',
            'transaction_id' => $this->getTransactionId($event),
            'product_id' => $this->getProductId($event),
            'environment' => $environment,
            'payload' => $payload,
        ];

        if ($rcEvent) {
            $rcEvent->update($eventData);
        } else {
            $rcEvent = RevenueCatEvent::create($eventData);
        }

        if ($environment === 'SANDBOX') {
            // Match the fallback policy that the matching production-side
            // handler would use: paid event types (TestFlight purchases) get
            // the subscriber-attribute fallback so we can still resolve the
            // user when canonical IDs are anonymous; destructive types
            // (CANCELLATION / REFUND / EXPIRATION / PRODUCT_CHANGE) do not.
            // Without this, a sandbox NON_RENEWING_PURCHASE with anonymous
            // canonical IDs would be markProcessed() here and never reach
            // handlePaidEvent, defeating the recovery path on TestFlight.
            $allowAttrFallback = in_array($eventType, [
                'INITIAL_PURCHASE',
                'RENEWAL',
                'TRIAL_STARTED',
                'TRIAL_CONVERTED',
                'NON_RENEWING_PURCHASE',
            ], true);
            $sandboxUser = $this->findUser($event, allowSubscriberAttributeFallback: $allowAttrFallback);
            if (!$sandboxUser) {
                $rcEvent->markProcessed();
                Log::info('RevenueCat: Sandbox event ignored, user not found', [
                    'event_id' => $eventId,
                    'app_user_id' => $event['app_user_id'] ?? null,
                ]);
                return ['success' => true, 'message' => 'Sandbox event ignored: user not found'];
            }

            if (!$this->isSandboxUserAllowed($sandboxUser, $event)) {
                $rcEvent->markProcessed();
                Log::warning('RevenueCat: Sandbox event blocked for non-whitelisted user', [
                    'event_id' => $eventId,
                    'app_user_id' => $event['app_user_id'] ?? null,
                    'user_id' => $sandboxUser->id,
                    'email' => $sandboxUser->email,
                    'event_type' => $eventType,
                ]);
                return ['success' => true, 'message' => 'Sandbox event ignored: user not whitelisted'];
            }
        }

        try {
            $result = $this->handleEvent($event);
            // Pending = identity not yet resolvable (e.g. anonymous RC ID with
            // no alias mapping yet). Keep the row processed=0 with a sentinel
            // error so the reconciler / recover-endpoint can later replay it.
            if (($result['pending'] ?? false) === true) {
                $rcEvent->markFailed($result['message'] ?? 'awaiting_identity');
                return ['success' => true, 'message' => 'queued pending identity'];
            }
            if (($result['success'] ?? false) === true) {
                $rcEvent->markProcessed();
            } else {
                $rcEvent->markFailed($result['error'] ?? 'Processing failed');
            }
            return $result;
        } catch (\Exception $e) {
            $rcEvent->markFailed($e->getMessage());
            Log::error('RevenueCat: Event processing failed', [
                'event_id' => $eventId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }

    protected function handleEvent(array $event): array
    {
        $type = $event['type'] ?? 'UNKNOWN';

        return match ($type) {
            'INITIAL_PURCHASE' => $this->handleInitialPurchase($event),
            'RENEWAL' => $this->handleRenewal($event),
            'TRIAL_STARTED' => $this->handleTrialStarted($event),
            'TRIAL_CONVERTED' => $this->handleTrialConverted($event),
            'TRIAL_CANCELLED' => $this->handleTrialCancelled($event),
            'CANCELLATION' => $this->handleCancellation($event),
            'UNCANCELLATION' => $this->handleUncancellation($event),
            'EXPIRATION' => $this->handleExpiration($event),
            'BILLING_ISSUE' => $this->handleBillingIssue($event),
            'PRODUCT_CHANGE' => $this->handleProductChange($event),
            'NON_RENEWING_PURCHASE' => $this->handleNonRenewingPurchase($event),
            'REFUND' => $this->handleRefund($event),
            'REFUND_REVERSED' => $this->handleRefundReversed($event),
            'TRANSFER' => $this->handleTransfer($event),
            default => ['success' => true, 'message' => "Unhandled event type: $type"],
        };
    }

    /**
     * Recover orphaned anonymous purchases.
     *
     * RevenueCat sends a TRANSFER event whenever a customer's set of app_user_ids
     * changes — most commonly when a user that was making purchases under
     * `$RCAnonymousID:…` later signs in and we alias the anonymous identity to
     * their xboard user ID. Any purchase webhooks that arrived during the
     * anonymous window were rejected with `User not found` (issue #26's exact
     * symptom). This handler walks back through those orphaned events and
     * replays them under the resolved identity so the user receives the plan
     * they paid for, without manual support intervention.
     */
    protected function handleTransfer(array $event): array
    {
        $resolvedUser = $this->findUser($event);
        if (!$resolvedUser) {
            // No xboard identity in the TRANSFER's `transferred_to` candidates —
            // nothing to replay onto. This is normal for transfers between two
            // anonymous IDs and does not represent a failure.
            return ['success' => true, 'message' => 'TRANSFER ignored: no xboard user in transferred_to'];
        }

        $fromIds = array_values(array_filter(
            (array) ($event['transferred_from'] ?? []),
            static fn ($value) => is_string($value) && $value !== ''
        ));

        // Walk the full RC alias chain via the V2 customer endpoint so
        // multi-hop transfers (anon → intermediate → final xboard ID) are
        // covered: take the first transferred_to candidate, fetch its alias
        // list, and union them into $fromIds. Without this, an orphan
        // attributed to a grand-parent anon ID is invisible to this replay
        // loop.
        $transferredTo = (array) ($event['transferred_to'] ?? []);
        $primaryTo = null;
        foreach ($transferredTo as $cand) {
            if (is_string($cand) && $cand !== '') {
                $primaryTo = $cand;
                break;
            }
        }
        if ($primaryTo) {
            $customer = $this->fetchRevenueCatCustomer($primaryTo);
            if ($customer) {
                foreach ($customer['aliases'] as $aliasId) {
                    if ($aliasId !== '' && !in_array($aliasId, $fromIds, true)) {
                        $fromIds[] = $aliasId;
                    }
                }
            }
        }

        // Always persist alias links to enable reverse lookups for future
        // anonymous-id-orphan events from any of the from-side IDs — even when
        // there is no orphan to replay right now.
        foreach ($fromIds as $fromId) {
            $this->rememberRevenueCatAlias($fromId, $resolvedUser->id, 'transfer');
        }
        if ($primaryTo && $primaryTo !== (string) $resolvedUser->id) {
            $this->rememberRevenueCatAlias($primaryTo, $resolvedUser->id, 'transfer');
        }

        if (!$fromIds) {
            return ['success' => true, 'message' => 'TRANSFER acknowledged: no transferred_from'];
        }

        $orphaned = RevenueCatEvent::where('processed', false)
            ->whereIn('app_user_id', $fromIds)
            ->orderBy('created_at')
            ->get();

        if ($orphaned->isEmpty()) {
            return ['success' => true, 'message' => 'TRANSFER acknowledged: no orphaned events'];
        }

        $replayed = 0;
        $stillFailing = 0;
        foreach ($orphaned as $orphan) {
            $payload = is_array($orphan->payload) ? $orphan->payload : json_decode((string) $orphan->payload, true);
            $orphanEvent = $payload['event'] ?? null;
            if (!is_array($orphanEvent)) {
                // Garbage/legacy stored payload — do not silently skip; mark
                // failed so it shows up in monitoring and is not pretended to be
                // resolved by a later TRANSFER.
                $orphan->markFailed('TRANSFER replay failed: stored payload is not an array');
                $stillFailing++;
                continue;
            }

            // Inject the resolved xboard user as a candidate so `findUser()` will
            // pick it up when `handleEvent` runs below. We do not overwrite the
            // original app_user_id — keeping the receipt's original RC identity
            // makes audit trails honest.
            $existingAliases = (array) ($orphanEvent['aliases'] ?? []);
            $orphanEvent['aliases'] = array_values(array_unique(array_merge(
                $existingAliases,
                [(string) $resolvedUser->id]
            )));

            try {
                $result = $this->handleEvent($orphanEvent);
                if (($result['success'] ?? false) === true) {
                    $orphan->markProcessed();
                    $replayed++;
                } else {
                    $orphan->markFailed($result['error'] ?? 'TRANSFER replay failed');
                    $stillFailing++;
                }
            } catch (\Throwable $e) {
                $orphan->markFailed($e->getMessage());
                $stillFailing++;
                Log::error('RevenueCat: TRANSFER replay threw', [
                    'orphan_event_id' => $orphan->event_id,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        Log::info('RevenueCat: TRANSFER replay summary', [
            'resolved_user_id' => $resolvedUser->id,
            'transferred_from' => $fromIds,
            'replayed' => $replayed,
            'still_failing' => $stillFailing,
        ]);

        // If any orphan failed to replay, return failure so `processWebhook()`
        // does NOT mark this TRANSFER row as processed. RevenueCat will retry
        // the webhook for up to 72h, giving the system another shot at draining
        // the orphan queue (e.g. after a transient DB issue or bad plan-mapping
        // is corrected). Marking processed here would silently strand the
        // automated recovery path.
        if ($stillFailing > 0) {
            return [
                'success' => false,
                'error' => "TRANSFER replay incomplete: replayed=$replayed, still_failing=$stillFailing",
            ];
        }

        return [
            'success' => true,
            'message' => "TRANSFER processed: replayed=$replayed",
        ];
    }

    protected function handleInitialPurchase(array $event): array
    {
        return $this->handlePaidEvent($event, Order::TYPE_NEW_PURCHASE);
    }

    protected function handleRenewal(array $event): array
    {
        return $this->handlePaidEvent($event, Order::TYPE_RENEWAL);
    }

    protected function handleTrialStarted(array $event): array
    {
        return $this->handlePaidEvent($event, Order::TYPE_NEW_PURCHASE, true);
    }

    protected function handleTrialConverted(array $event): array
    {
        return $this->handleInitialPurchase($event);
    }

    protected function handleTrialCancelled(array $event): array
    {
        return $this->handleCancellation($event);
    }

    protected function handleNonRenewingPurchase(array $event): array
    {
        return $this->handlePaidEvent($event, Order::TYPE_NEW_PURCHASE, false, true);
    }

    protected function handleProductChange(array $event): array
    {
        // PRODUCT_CHANGE mutates an existing user's plan, so we treat it like
        // CANCELLATION/REFUND for fallback purposes — canonical IDs only,
        // never subscriber attributes (which a holder of the RC public key
        // could use to redirect plan changes onto an unrelated xboard user).
        return $this->handlePaidEvent(
            $event,
            Order::TYPE_UPGRADE,
            allowSubscriberAttributeFallback: false
        );
    }

    protected function handleCancellation(array $event): array
    {
        $cancelReason = $event['cancel_reason'] ?? ($event['cancellation_reason'] ?? null);
        if ($cancelReason && strtoupper((string) $cancelReason) === 'CUSTOMER_SUPPORT') {
            $expiresAt = $this->getEntitlementExpiresAt($event);
            if ($expiresAt === null || $expiresAt <= time()) {
                return $this->handleRefund($event);
            }
        }

        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $user->update([
            'subscription_will_renew' => false,
        ]);

        return ['success' => true, 'message' => 'Cancellation recorded'];
    }

    protected function handleUncancellation(array $event): array
    {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $user->update([
            'subscription_will_renew' => true,
        ]);

        return ['success' => true, 'message' => 'Uncancellation recorded'];
    }

    protected function handleExpiration(array $event): array
    {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $expiresAt = $this->getEntitlementExpiresAt($event) ?? time();
        if ($expiresAt > time()) {
            $expiresAt = time();
        }

        $user->update([
            'expired_at' => $expiresAt,
            'subscription_will_renew' => false,
            'subscription_billing_issue' => false,
            'subscription_grace_period_expires_at' => null,
        ]);

        return ['success' => true, 'message' => 'Subscription expired'];
    }

    protected function handleBillingIssue(array $event): array
    {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $gracePeriodExpires = $this->getGracePeriodExpiresAt($event);

        $user->update([
            'subscription_billing_issue' => true,
            'subscription_grace_period_expires_at' => $gracePeriodExpires,
        ]);

        return ['success' => true, 'message' => 'Billing issue recorded'];
    }

    protected function handleRefund(array $event): array
    {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $transactionId = $this->getTransactionId($event);
        $originalTransactionId = $this->getOriginalTransactionId($event);
        $refundAmount = $this->getTransactionAmountCents($event);

        $order = Order::where('revenuecat_original_transaction_id', $originalTransactionId)
            ->orWhere('revenuecat_transaction_id', $transactionId)
            ->first();

        if ($order) {
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'refund_amount' => $refundAmount,
            ]);
        } else {
            Log::warning('RevenueCat: Refund received but original order not found', [
                'original_transaction_id' => $originalTransactionId,
                'transaction_id' => $transactionId,
            ]);
        }

        $expiresAt = $this->getEntitlementExpiresAt($event) ?? time();
        if ($expiresAt > time()) {
            $expiresAt = time();
        }

        $user->update([
            'expired_at' => $expiresAt,
            'subscription_will_renew' => false,
            'subscription_billing_issue' => false,
            'subscription_grace_period_expires_at' => null,
        ]);

        return [
            'success' => true,
            'message' => 'Refund processed, access revoked',
            'order_id' => $order?->id,
        ];
    }

    protected function handleRefundReversed(array $event): array
    {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $transactionId = $this->getTransactionId($event);
        $originalTransactionId = $this->getOriginalTransactionId($event);

        $order = Order::where('revenuecat_original_transaction_id', $originalTransactionId)
            ->orWhere('revenuecat_transaction_id', $transactionId)
            ->first();

        if ($order && $order->status === Order::STATUS_CANCELLED) {
            $order->update([
                'status' => Order::STATUS_COMPLETED,
                'refund_amount' => null,
            ]);
        }

        $expiresAt = $this->getEntitlementExpiresAt($event);
        if ($expiresAt && $expiresAt > time()) {
            $user->update([
                'expired_at' => $expiresAt,
                'subscription_will_renew' => true,
            ]);
        }

        return [
            'success' => true,
            'message' => 'Refund reversal processed',
            'order_id' => $order?->id,
        ];
    }

    protected function handlePaidEvent(
        array $event,
        int $orderType,
        bool $isTrial = false,
        bool $isNonRenewing = false,
        bool $allowSubscriberAttributeFallback = true
    ): array {
        // Subscriber-attribute fallback is opt-in per call site. New-purchase /
        // renewal / trial flows turn it ON so an anonymous-attributed iOS
        // receipt can still credit the right user (issue #26 root cause).
        // PRODUCT_CHANGE / refund / cancellation / expiration / billing-issue
        // flows turn it OFF — those mutate existing state and must only act
        // on canonical RevenueCat IDs.
        $user = $this->findUser(
            $event,
            allowSubscriberAttributeFallback: $allowSubscriberAttributeFallback
        );
        if (!$user) {
            // Paid events without a resolvable user are NOT terminal failures.
            // They can still be reconciled later via the alias table or RC
            // REST chain walk (the in-app /iap/recover-receipt endpoint or
            // the orphan reconciler cron). Surface a pending result so the
            // event row is preserved for replay instead of being marked
            // permanently failed under "User not found".
            if ($allowSubscriberAttributeFallback) {
                return [
                    'success' => true,
                    'pending' => true,
                    'message' => 'awaiting_identity',
                ];
            }
            return ['success' => false, 'error' => 'User not found'];
        }

        $planMapping = $this->getPlanMapping($event);
        if (!$planMapping) {
            return ['success' => false, 'error' => 'Unknown product ID'];
        }

        $isSandbox = $this->isSandboxEvent($event);
        $order = $this->createOrder($event, $user, $planMapping, $orderType, $isTrial, $isSandbox);
        $this->syncEntitlementExpiration($user, $event);

        $user->subscription_will_renew = $isSandbox ? false : ($isNonRenewing ? false : true);
        $user->subscription_billing_issue = false;
        $user->subscription_grace_period_expires_at = null;
        // Only adopt the receipt's app_user_id as the user's canonical RC
        // identity when it is NOT the anonymous placeholder. Persisting the
        // anon ID into `users.revenuecat_app_user_id` would poison every
        // future canonical-ID lookup for this user. Always mirror the mapping
        // into the alias table for reverse lookup.
        $appUserId = $event['app_user_id'] ?? null;
        if ($appUserId && !str_starts_with((string) $appUserId, '$RCAnonymousID:')) {
            $user->revenuecat_app_user_id = $appUserId;
        }
        $user->save();
        if ($appUserId) {
            $this->rememberRevenueCatAlias((string) $appUserId, $user->id, 'paid_event');
        }

        return [
            'success' => true,
            'order_id' => $order->id,
            'trade_no' => $order->trade_no,
        ];
    }

    protected function createOrder(
        array $event,
        User $user,
        array $planMapping,
        int $orderType,
        bool $isTrial = false,
        bool $isSandbox = false
    ): Order {
        $transactionId = $this->getTransactionId($event);
        $originalTransactionId = $this->getOriginalTransactionId($event);
        $productId = $this->getProductId($event);
        $isSandboxNonBillable = $isSandbox && !$this->isSandboxBillable();
        $totalAmount = ($isTrial || $isSandboxNonBillable) ? 0 : $this->getTransactionAmountCents($event);
        $eventId = $event['id'] ?? null;

        if ($eventId) {
            $existingOrder = Order::where('revenuecat_event_id', $eventId)->first();
            if ($existingOrder) {
                if ($existingOrder->status === Order::STATUS_PENDING) {
                    $orderService = new OrderService($existingOrder);
                    $callbackNo = $isSandboxNonBillable
                        ? 'sandbox:' . ($transactionId ?? $existingOrder->trade_no)
                        : ($transactionId ?? $existingOrder->trade_no);
                    $orderService->paid($callbackNo);
                }
                return $existingOrder->fresh();
            }
        }
        if ($transactionId) {
            $existingOrder = Order::where('revenuecat_transaction_id', $transactionId)->first();
            if ($existingOrder) {
                if ($existingOrder->status === Order::STATUS_PENDING) {
                    $orderService = new OrderService($existingOrder);
                    $callbackNo = $isSandboxNonBillable
                        ? 'sandbox:' . ($transactionId ?? $existingOrder->trade_no)
                        : ($transactionId ?? $existingOrder->trade_no);
                    $orderService->paid($callbackNo);
                }
                return $existingOrder->fresh();
            }
        }

        $order = new Order();
        $order->user_id = $user->id;
        $order->plan_id = $planMapping['plan_id'];
        $order->period = $planMapping['period'];
        $order->trade_no = Helper::generateOrderNo();
        $order->total_amount = $totalAmount;
        $order->status = Order::STATUS_PENDING;
        $order->type = $orderType;
        $order->payment_id = $isSandboxNonBillable ? null : ($this->config['payment_id'] ?? null);

        $order->revenuecat_event_id = $event['id'] ?? null;
        $order->revenuecat_transaction_id = $transactionId;
        $order->revenuecat_original_transaction_id = $originalTransactionId;
        $order->revenuecat_product_id = $productId;
        $order->currency = $isSandboxNonBillable
            ? $this->getSandboxCurrency()
            : ($event['currency'] ?? ($event['transaction']['currency'] ?? null));

        $order->save();

        $orderService = new OrderService($order);
        $callbackNo = $isSandboxNonBillable
            ? 'sandbox:' . ($transactionId ?? $order->trade_no)
            : ($transactionId ?? $order->trade_no);
        if (!$orderService->paid($callbackNo)) {
            throw new \Exception('Failed to mark order as paid');
        }

        return $order->fresh();
    }

    protected function isSandboxEvent(array $event): bool
    {
        return strtoupper((string) ($event['environment'] ?? 'PRODUCTION')) === 'SANDBOX';
    }

    protected function isSandboxBillable(): bool
    {
        return (bool) ($this->config['sandbox_billable'] ?? false);
    }

    protected function getSandboxCurrency(): string
    {
        return strtoupper((string) ($this->config['sandbox_currency'] ?? 'XTS'));
    }

    protected function isSandboxUserAllowed(User $user, array $event): bool
    {
        $allowUserIds = array_map('intval', $this->config['sandbox_allowed_user_ids'] ?? []);
        if (in_array((int) $user->id, $allowUserIds, true)) {
            return true;
        }

        $allowEmails = array_map(
            static fn ($email) => strtolower(trim((string) $email)),
            $this->config['sandbox_allowed_emails'] ?? []
        );
        if ($user->email && in_array(strtolower((string) $user->email), $allowEmails, true)) {
            return true;
        }

        $appUserId = (string) ($event['app_user_id'] ?? '');
        if ($appUserId !== '' && ctype_digit($appUserId) && in_array((int) $appUserId, $allowUserIds, true)) {
            return true;
        }

        return false;
    }

    protected function syncEntitlementExpiration(User $user, array $event): void
    {
        $expiresAt = $this->getEntitlementExpiresAt($event);
        if ($expiresAt) {
            $user->expired_at = $expiresAt;
            $user->save();
        }
    }

    protected function getEntitlementExpiresAt(array $event): ?int
    {
        if (isset($event['expiration_at_ms'])) {
            return $this->parseTimestamp($event['expiration_at_ms']);
        }
        if (isset($event['expiration_at'])) {
            return $this->parseTimestamp($event['expiration_at']);
        }

        $entitlement = $this->getFirstEntitlement($event);
        if ($entitlement) {
            if (!empty($entitlement['expires_at_ms'])) {
                return $this->parseTimestamp($entitlement['expires_at_ms']);
            }
            if (!empty($entitlement['expires_at'])) {
                return $this->parseTimestamp($entitlement['expires_at']);
            }
        }
        return null;
    }

    protected function getGracePeriodExpiresAt(array $event): ?int
    {
        if (isset($event['grace_period_expiration_at_ms'])) {
            return $this->parseTimestamp($event['grace_period_expiration_at_ms']);
        }
        if (isset($event['grace_period_expires_at'])) {
            return $this->parseTimestamp($event['grace_period_expires_at']);
        }

        $entitlement = $this->getFirstEntitlement($event);
        if ($entitlement && !empty($entitlement['grace_period_expires_at'])) {
            return $this->parseTimestamp($entitlement['grace_period_expires_at']);
        }
        return null;
    }

    protected function getProductId(array $event): ?string
    {
        $transaction = $event['transaction'] ?? [];
        $entitlement = $this->getFirstEntitlement($event);

        return $event['product_id']
            ?? ($transaction['product_id'] ?? null)
            ?? ($entitlement['product_identifier'] ?? null);
    }

    protected function getTransactionId(array $event): ?string
    {
        $transaction = $event['transaction'] ?? [];

        return $event['transaction_id']
            ?? ($transaction['transaction_id'] ?? null);
    }

    protected function getOriginalTransactionId(array $event): ?string
    {
        $transaction = $event['transaction'] ?? [];
        return $event['original_transaction_id']
            ?? ($transaction['original_transaction_id'] ?? null);
    }

    protected function getTransactionAmountCents(array $event): int
    {
        $transaction = $event['transaction'] ?? [];
        $price = $event['price_in_purchased_currency']
            ?? $event['price']
            ?? ($transaction['price'] ?? 0);
        return (int) round($price * 100);
    }

    protected function getFirstEntitlement(array $event): ?array
    {
        $entitlements = $event['entitlements'] ?? [];
        if (empty($entitlements)) {
            return null;
        }
        if (function_exists('array_is_list') && array_is_list($entitlements)) {
            return $entitlements[0] ?? null;
        }
        $values = array_values($entitlements);
        return $values[0] ?? null;
    }

    protected function parseTimestamp(mixed $value): ?int
    {
        if ($value === null) {
            return null;
        }
        if (is_numeric($value)) {
            $timestamp = (int) $value;
            if ($timestamp > 100000000000) {
                return (int) floor($timestamp / 1000);
            }
            return $timestamp;
        }
        $parsed = strtotime((string) $value);
        return $parsed ?: null;
    }

    /**
     * Canonical RevenueCat identity candidates for an event: `app_user_id`,
     * `original_app_user_id`, `aliases`, and (for TRANSFER) `transferred_to`.
     * RevenueCat manages these IDs server-to-server, so they are not spoofable
     * by anyone holding only the RC public key.
     */
    protected function canonicalRevenueCatCandidates(array $event): array
    {
        $candidates = [];

        $appUserId = $event['app_user_id'] ?? null;
        $originalAppUserId = $event['original_app_user_id'] ?? null;

        if ($appUserId) {
            $candidates[] = $appUserId;
        }
        if ($originalAppUserId && $originalAppUserId !== $appUserId) {
            $candidates[] = $originalAppUserId;
        }
        foreach ((array) ($event['aliases'] ?? []) as $alias) {
            if ($alias && !in_array($alias, $candidates, true)) {
                $candidates[] = $alias;
            }
        }
        // TRANSFER events do not populate `app_user_id`/`aliases`; the resolved
        // identity lives in `transferred_to` instead. Including those keeps a
        // single resolution path for every event type. `transferred_from` is
        // intentionally excluded — that is the SOURCE side of the transfer and
        // would re-credit purchases to a user RC has already moved away from.
        foreach ((array) ($event['transferred_to'] ?? []) as $alias) {
            if ($alias && !in_array($alias, $candidates, true)) {
                $candidates[] = $alias;
            }
        }

        return $candidates;
    }

    /**
     * True when every canonical candidate is RevenueCat's anonymous placeholder.
     * Used to gate the subscriber-attribute fallback: trusting attributes when a
     * canonical ID is present would let any holder of the RC public key spoof an
     * arbitrary xboard user.
     *
     * An empty candidate list is NOT treated as "all anonymous" — a malformed
     * webhook with no `app_user_id` / `original_app_user_id` / `aliases` /
     * `transferred_to` should fail closed rather than fall through to public
     * subscriber attributes.
     */
    protected function onlyAnonymousRevenueCatIds(array $candidates): bool
    {
        if (!$candidates) {
            return false;
        }
        foreach ($candidates as $candidate) {
            if (!is_string($candidate) || !str_starts_with($candidate, '$RCAnonymousID:')) {
                return false;
            }
        }
        return true;
    }

    /**
     * Resolve a User from a RevenueCat event.
     *
     * Subscriber attributes are public-key writable (per RevenueCat SDK docs:
     * "attributes are writable using a public key … should not be used for
     * managing secure or sensitive information"). To prevent a malicious or
     * misconfigured client from claiming another user's identity by setting
     * `xboard_user_id` / `$email` arbitrarily, we only consult those attributes
     * when:
     *
     *   1. The caller explicitly opts in (`$allowSubscriberAttributeFallback`),
     *   2. Every canonical candidate is `$RCAnonymousID:…` (i.e. we have no
     *      server-side-managed identity to honor in the first place), and
     *   3. BOTH `xboard_user_id` and `$email` are present and resolve to the
     *      same User row (cross-checked, case-insensitive on email).
     *
     * Destructive event types (CANCELLATION, REFUND, EXPIRATION, …) leave the
     * fallback off entirely and only act on canonical IDs.
     */
    protected function findUser(array $event, bool $allowSubscriberAttributeFallback = false): ?User
    {
        $candidates = $this->canonicalRevenueCatCandidates($event);

        foreach ($candidates as $candidate) {
            if (is_numeric($candidate)) {
                $user = User::find((int) $candidate);
                if ($user) {
                    return $user;
                }
            }

            $user = User::where('revenuecat_app_user_id', $candidate)->first();
            if ($user) {
                return $user;
            }
        }

        // Alias-table reverse lookup: covers the case where a paid event
        // arrives under an anonymous `$RCAnonymousID:…` that has previously
        // been mapped to a real xboard user (e.g. by a prior TRANSFER, a
        // /iap/recover-receipt call, or the orphan reconciler). This must
        // run BEFORE the subscriber-attribute fallback because alias rows
        // are signed by server-trusted sources, not the public SDK key.
        foreach ($candidates as $candidate) {
            if (!is_string($candidate) || $candidate === '') {
                continue;
            }
            $user = $this->lookupAliasUser($candidate);
            if ($user) {
                return $user;
            }
        }

        if (!$allowSubscriberAttributeFallback || !$this->onlyAnonymousRevenueCatIds($candidates)) {
            return null;
        }

        $attrs = $event['subscriber_attributes'] ?? [];
        if (!is_array($attrs)) {
            return null;
        }

        $xboardId = $attrs['xboard_user_id']['value'] ?? null;
        $email = $attrs['$email']['value'] ?? null;
        if (!ctype_digit((string) $xboardId)
            || !is_string($email)
            || trim($email) === ''
        ) {
            return null;
        }

        return User::whereKey((int) $xboardId)
            ->whereRaw('LOWER(email) = ?', [strtolower(trim($email))])
            ->first();
    }

    protected function getPlanMapping(array $event): ?array
    {
        $productId = $this->getProductId($event);
        if (!$productId) {
            return null;
        }

        return $this->config['product_plan_mapping'][$productId] ?? null;
    }

    /**
     * Persist (or refresh) an alias row mapping a RevenueCat app_user_id to
     * an xboard user. Idempotent on `app_user_id` (unique index). `$source`
     * records why the alias was learned for forensics: transfer, paid_event,
     * reconciler, recover_endpoint, login, …
     *
     * The RevenueCatAlias model has $timestamps = false and stores integer
     * Unix timestamps in created_at/updated_at, so we manage them manually.
     */
    protected function rememberRevenueCatAlias(string $appUserId, int $userId, string $source): void
    {
        if ($appUserId === '' || $userId <= 0) {
            return;
        }
        $now = time();
        try {
            $existing = RevenueCatAlias::where('app_user_id', $appUserId)->first();
            if ($existing) {
                $existing->user_id = $userId;
                $existing->source = $source;
                $existing->updated_at = $now;
                $existing->save();
                return;
            }
            $alias = new RevenueCatAlias();
            $alias->app_user_id = $appUserId;
            $alias->user_id = $userId;
            $alias->source = $source;
            $alias->created_at = $now;
            $alias->updated_at = $now;
            $alias->save();
        } catch (\Throwable $e) {
            // Race: a concurrent webhook may have inserted the same
            // app_user_id between SELECT and INSERT (unique constraint).
            // Treat that as "already remembered" and best-effort refresh.
            Log::warning('RevenueCat: alias persist conflict, retrying as update', [
                'app_user_id' => $appUserId,
                'user_id' => $userId,
                'err' => $e->getMessage(),
            ]);
            try {
                RevenueCatAlias::where('app_user_id', $appUserId)
                    ->update(['user_id' => $userId, 'source' => $source, 'updated_at' => $now]);
            } catch (\Throwable $e2) {
                Log::warning('RevenueCat: alias update fallback failed', [
                    'app_user_id' => $appUserId,
                    'err' => $e2->getMessage(),
                ]);
            }
        }
    }

    /**
     * Reverse-lookup a User by RevenueCat app_user_id via the alias table.
     */
    protected function lookupAliasUser(string $appUserId): ?User
    {
        if ($appUserId === '') {
            return null;
        }
        $alias = RevenueCatAlias::where('app_user_id', $appUserId)->first();
        return $alias ? User::find($alias->user_id) : null;
    }

    /**
     * Build the V2 customer base URL for a given app_user_id.
     *
     * The issued RC API key family is V2-only — calls to `/v1/subscribers/...`
     * return error 7723 ("incompatible with RevenueCat API V1"), so customer
     * data must come from `/v2/projects/{project_id}/customers/{id}` and its
     * `/aliases` / `/attributes` sub-resources.
     */
    protected function rcBaseUrl(string $customerId): string
    {
        $projectId = (string) ($this->config['project_id'] ?? config('revenuecat.project_id') ?? '');
        return 'https://api.revenuecat.com/v2/projects/' . $projectId
            . '/customers/' . rawurlencode($customerId);
    }

    /**
     * GET a RevenueCat V2 URL with the configured secret key. Returns the
     * decoded JSON body on 2xx, null on 404 / config-missing / non-2xx /
     * network failure. Never throws — callers degrade gracefully.
     */
    protected function rcGet(string $url): ?array
    {
        $secret = $this->config['secret_api_key'] ?? config('revenuecat.secret_api_key');
        $projectId = $this->config['project_id'] ?? config('revenuecat.project_id');
        if (empty($secret) || empty($projectId)) {
            Log::warning('RevenueCat V2 not configured', [
                'has_secret' => !empty($secret),
                'has_project' => !empty($projectId),
            ]);
            return null;
        }
        try {
            $resp = Http::withToken($secret)
                ->timeout(10)
                ->get($url);
            if ($resp->status() === 404) {
                return null;
            }
            if (!$resp->successful()) {
                Log::warning('RC V2 failed', [
                    'status' => $resp->status(),
                    'url' => $url,
                    'body' => substr((string) $resp->body(), 0, 500),
                ]);
                return null;
            }
            $body = $resp->json();
            return is_array($body) ? $body : null;
        } catch (\Throwable $e) {
            Log::warning('RC V2 exception', [
                'err' => $e->getMessage(),
                'url' => $url,
            ]);
            return null;
        }
    }

    /**
     * Fetch a RevenueCat customer's resolved identity bundle (aliases +
     * curated attributes) via the V2 customer / aliases / attributes
     * endpoints, returning a flat shape the orphan-recovery paths can
     * consume directly. Returns null when the customer does not exist
     * (404) or the key/project is unconfigured.
     *
     * Used by the orphan-recovery paths (recover-endpoint, reconciler,
     * TRANSFER chain-walk) to walk the full alias chain + read $email /
     * xboard_user_id when the webhook payload itself only contains an
     * anonymous identity (`$RCAnonymousID:…`).
     *
     * @return ?array{aliases: list<string>, email: ?string, xboard_user_id: ?string}
     */
    protected function fetchRevenueCatCustomer(string $appUserId): ?array
    {
        if ($appUserId === '') {
            return null;
        }
        $base = $this->rcBaseUrl($appUserId);

        // Customer must exist (this verifies key + key access + customer
        // existence in one shot; everything below assumes a real customer).
        $cust = $this->rcGet($base);
        if (!$cust) {
            return null;
        }

        $aliasesResp = $this->rcGet($base . '/aliases') ?: [];
        $aliases = [];
        foreach ((array) ($aliasesResp['items'] ?? []) as $item) {
            $id = is_array($item) ? ($item['id'] ?? null) : null;
            if (is_string($id) && $id !== '') {
                $aliases[] = $id;
            }
        }

        $attrsResp = $this->rcGet($base . '/attributes') ?: [];
        $attrs = [];
        foreach ((array) ($attrsResp['items'] ?? []) as $item) {
            $name = is_array($item) ? ($item['name'] ?? null) : null;
            if (is_string($name) && $name !== '') {
                $attrs[$name] = $item['value'] ?? null;
            }
        }

        return [
            'aliases' => $aliases,
            'email' => isset($attrs['$email']) && $attrs['$email'] !== '' ? (string) $attrs['$email'] : null,
            'xboard_user_id' => isset($attrs['xboard_user_id']) && $attrs['xboard_user_id'] !== ''
                ? (string) $attrs['xboard_user_id']
                : null,
        ];
    }

    /**
     * Recover a single missing IAP order by transaction id, called by the
     * authenticated `/api/v1/user/iap/recover-receipt` endpoint. The auth'd
     * xboard user must be verifiable as the owner of the receipt via the
     * V2 customer endpoints — one of:
     *
     *   - a numeric xboard alias inside the customer's alias chain, or
     *   - the `$email` attribute matching authUser->email (case-insensitive), or
     *   - the `xboard_user_id` attribute matching authUser->id.
     *
     * On success, persists the alias mapping and replays the orphaned
     * webhook event to create the missing order.
     *
     * @return array{success: bool, order_id: ?int, event_id: ?int, message: string}
     */
    public function recoverByTransactionId(string $transactionId, ?string $appUserId, User $authUser): array
    {
        if ($transactionId === '') {
            return ['success' => false, 'order_id' => null, 'event_id' => null, 'message' => 'transaction_not_found'];
        }

        // Locate the orphaned event row. Match on the payload's
        // event.transaction_id (canonical placement) so we recover even if
        // the dedicated `transaction_id` column was never populated.
        $rcEvent = RevenueCatEvent::where('processed', 0)
            ->whereRaw("JSON_EXTRACT(payload, '$.event.transaction_id') = ?", [$transactionId])
            ->orderByDesc('id')
            ->first();

        if (!$rcEvent) {
            $existing = RevenueCatEvent::whereRaw("JSON_EXTRACT(payload, '$.event.transaction_id') = ?", [$transactionId])
                ->orderByDesc('id')
                ->first();
            if ($existing && $existing->processed) {
                return [
                    'success' => true,
                    'order_id' => null,
                    'event_id' => $existing->id,
                    'message' => 'already_processed',
                ];
            }
            return [
                'success' => false,
                'order_id' => null,
                'event_id' => null,
                'message' => 'transaction_not_found',
            ];
        }

        // Verify ownership via RC V2 against the receipt's app_user_id.
        // We prefer the explicit $appUserId from the client (matches the
        // identity the iOS SDK is using right now), falling back to whatever
        // the stored event recorded.
        $eventAppUserId = ($appUserId !== null && $appUserId !== '') ? $appUserId : (string) $rcEvent->app_user_id;
        $customer = $this->fetchRevenueCatCustomer($eventAppUserId);
        $verified = false;

        if ($customer) {
            foreach ($customer['aliases'] as $alias) {
                if (is_numeric($alias) && (int) $alias === (int) $authUser->id) {
                    $verified = true;
                    break;
                }
            }
            if (!$verified && $customer['email'] !== null
                && is_string($authUser->email)
                && strcasecmp($customer['email'], (string) $authUser->email) === 0
            ) {
                $verified = true;
            }
            if (!$verified && $customer['xboard_user_id'] !== null
                && (int) $customer['xboard_user_id'] === (int) $authUser->id
            ) {
                $verified = true;
            }
        }

        if (!$verified) {
            Log::warning('RevenueCat: recover ownership mismatch', [
                'auth_user_id' => $authUser->id,
                'app_user_id' => $eventAppUserId,
                'transaction_id' => $transactionId,
            ]);
            return [
                'success' => false,
                'order_id' => null,
                'event_id' => $rcEvent->id,
                'message' => 'ownership_mismatch',
            ];
        }

        // Persist the alias before replay so findUser() resolves on the
        // anonymous candidate too.
        $this->rememberRevenueCatAlias($eventAppUserId, $authUser->id, 'recover_endpoint');

        $payload = is_array($rcEvent->payload) ? $rcEvent->payload : (array) json_decode((string) $rcEvent->payload, true);
        $event = is_array($payload['event'] ?? null) ? $payload['event'] : $payload;
        // Inject the auth user id (as string) AND the original app_user_id
        // into the aliases list so findUser() has multiple ways to land on
        // the right user, regardless of column state.
        $existingAliases = (array) ($event['aliases'] ?? []);
        $event['aliases'] = array_values(array_unique(array_merge(
            $existingAliases,
            [(string) $authUser->id, (string) $eventAppUserId]
        )));

        try {
            $result = $this->handleEvent($event);
        } catch (\Throwable $e) {
            Log::error('RevenueCat: recover replay threw', [
                'event_id' => $rcEvent->id,
                'err' => $e->getMessage(),
            ]);
            return [
                'success' => false,
                'order_id' => null,
                'event_id' => $rcEvent->id,
                'message' => 'replay_failed',
            ];
        }

        if (($result['success'] ?? false) === true && empty($result['pending'])) {
            $rcEvent->markProcessed();
            return [
                'success' => true,
                'order_id' => $result['order_id'] ?? null,
                'event_id' => $rcEvent->id,
                'message' => 'recovered',
            ];
        }

        return [
            'success' => false,
            'order_id' => null,
            'event_id' => $rcEvent->id,
            'message' => 'replay_failed',
        ];
    }

    /**
     * Scan recent orphaned events and try to resolve each via the RC REST
     * subscriber endpoint. Mutates rows in-place (markProcessed on success).
     *
     * Called by the RevenueCatOrphanReconciler scheduled command. The
     * $withinMinutes window defaults to 7 days (10080 minutes) so we catch
     * paid receipts that the user has been sitting on for a while.
     *
     * @return array{scanned: int, recovered: int, still_pending: int, errors: list<string>}
     */
    public function reconcileOrphans(int $withinMinutes = 10080): array
    {
        $cutoff = now()->subMinutes(max(1, $withinMinutes));

        $rows = RevenueCatEvent::where('processed', 0)
            ->whereIn('error_message', ['User not found', 'awaiting_identity'])
            ->where('created_at', '>=', $cutoff)
            ->orderBy('id')
            ->limit(200)
            ->get();

        $scanned = 0;
        $recovered = 0;
        $stillPending = 0;
        $errors = [];

        foreach ($rows as $row) {
            $scanned++;
            try {
                $payload = is_array($row->payload) ? $row->payload : (array) json_decode((string) $row->payload, true);
                $event = is_array($payload['event'] ?? null) ? $payload['event'] : $payload;
                $appUserId = (string) ($event['app_user_id'] ?? $row->app_user_id ?? '');
                if ($appUserId === '') {
                    $stillPending++;
                    continue;
                }

                $customer = $this->fetchRevenueCatCustomer($appUserId);
                $user = null;

                if ($customer) {
                    // 1. Numeric xboard alias inside the customer's alias chain.
                    foreach ($customer['aliases'] as $alias) {
                        if (is_numeric($alias)) {
                            $candidate = User::find((int) $alias);
                            if ($candidate) {
                                $user = $candidate;
                                break;
                            }
                        }
                    }
                    // 2. xboard_user_id attribute (cross-checked with email
                    //    when both present, mirroring findUser()'s strict
                    //    fallback policy).
                    if (!$user && $customer['xboard_user_id'] !== null && ctype_digit((string) $customer['xboard_user_id'])) {
                        $candidate = User::find((int) $customer['xboard_user_id']);
                        if ($candidate) {
                            if ($customer['email'] === null
                                || (is_string($candidate->email)
                                    && strcasecmp($customer['email'], (string) $candidate->email) === 0)
                            ) {
                                $user = $candidate;
                            }
                        }
                    }
                    // 3. Email-only fallback.
                    if (!$user && $customer['email'] !== null && trim($customer['email']) !== '') {
                        $user = User::whereRaw('LOWER(email) = ?', [strtolower(trim($customer['email']))])->first();
                    }
                }

                if (!$user) {
                    $stillPending++;
                    continue;
                }

                $this->rememberRevenueCatAlias($appUserId, $user->id, 'reconciler');

                $existingAliases = (array) ($event['aliases'] ?? []);
                $event['aliases'] = array_values(array_unique(array_merge(
                    $existingAliases,
                    [(string) $user->id, $appUserId]
                )));

                $result = $this->handleEvent($event);
                if (($result['success'] ?? false) === true && empty($result['pending'])) {
                    $row->markProcessed();
                    $recovered++;
                } else {
                    $stillPending++;
                }
            } catch (\Throwable $e) {
                $errors[] = "row {$row->id}: {$e->getMessage()}";
                Log::warning('RevenueCat: reconciler row failed', [
                    'event_id' => $row->id,
                    'err' => $e->getMessage(),
                ]);
            }
        }

        return [
            'scanned' => $scanned,
            'recovered' => $recovered,
            'still_pending' => $stillPending,
            'errors' => $errors,
        ];
    }
}

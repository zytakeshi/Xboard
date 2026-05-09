<?php

namespace App\Services;

use App\Models\Order;
use App\Models\RevenueCatEvent;
use App\Models\User;
use App\Utils\Helper;
use App\Services\OrderService;
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
        $user->revenuecat_app_user_id = $event['app_user_id'] ?? $user->revenuecat_app_user_id;
        $user->save();

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
}

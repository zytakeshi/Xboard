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
            default => ['success' => true, 'message' => "Unhandled event type: $type"],
        };
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
        return $this->handlePaidEvent($event, Order::TYPE_UPGRADE);
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
        bool $isNonRenewing = false
    ): array {
        $user = $this->findUser($event);
        if (!$user) {
            return ['success' => false, 'error' => 'User not found'];
        }

        $planMapping = $this->getPlanMapping($event);
        if (!$planMapping) {
            return ['success' => false, 'error' => 'Unknown product ID'];
        }

        $order = $this->createOrder($event, $user, $planMapping, $orderType, $isTrial);
        $this->syncEntitlementExpiration($user, $event);

        $user->subscription_will_renew = $isNonRenewing ? false : true;
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
        bool $isTrial = false
    ): Order {
        $transactionId = $this->getTransactionId($event);
        $originalTransactionId = $this->getOriginalTransactionId($event);
        $productId = $this->getProductId($event);
        $totalAmount = $isTrial ? 0 : $this->getTransactionAmountCents($event);
        $eventId = $event['id'] ?? null;

        if ($eventId) {
            $existingOrder = Order::where('revenuecat_event_id', $eventId)->first();
            if ($existingOrder) {
                if ($existingOrder->status === Order::STATUS_PENDING) {
                    $orderService = new OrderService($existingOrder);
                    $orderService->paid($transactionId ?? $existingOrder->trade_no);
                }
                return $existingOrder->fresh();
            }
        }
        if ($transactionId) {
            $existingOrder = Order::where('revenuecat_transaction_id', $transactionId)->first();
            if ($existingOrder) {
                if ($existingOrder->status === Order::STATUS_PENDING) {
                    $orderService = new OrderService($existingOrder);
                    $orderService->paid($transactionId ?? $existingOrder->trade_no);
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
        $order->payment_id = $this->config['payment_id'] ?? null;

        $order->revenuecat_event_id = $event['id'] ?? null;
        $order->revenuecat_transaction_id = $transactionId;
        $order->revenuecat_original_transaction_id = $originalTransactionId;
        $order->revenuecat_product_id = $productId;
        $order->currency = $event['currency'] ?? ($event['transaction']['currency'] ?? null);

        $order->save();

        $orderService = new OrderService($order);
        if (!$orderService->paid($transactionId ?? $order->trade_no)) {
            throw new \Exception('Failed to mark order as paid');
        }

        return $order->fresh();
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

    protected function findUser(array $event): ?User
    {
        $candidates = [];
        $appUserId = $event['app_user_id'] ?? null;
        $originalAppUserId = $event['original_app_user_id'] ?? null;
        $aliases = $event['aliases'] ?? [];

        if ($appUserId) {
            $candidates[] = $appUserId;
        }
        if ($originalAppUserId && $originalAppUserId !== $appUserId) {
            $candidates[] = $originalAppUserId;
        }
        if (is_array($aliases)) {
            foreach ($aliases as $alias) {
                if ($alias && !in_array($alias, $candidates, true)) {
                    $candidates[] = $alias;
                }
            }
        }

        if (!$candidates) {
            return null;
        }

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

        return null;
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

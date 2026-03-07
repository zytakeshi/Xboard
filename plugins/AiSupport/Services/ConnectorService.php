<?php

namespace Plugin\AiSupport\Services;

use App\Models\Coupon;
use App\Models\Knowledge;
use App\Models\Order;
use App\Models\Plan;
use App\Models\Server;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use App\Services\TicketService;
use App\Utils\Helper;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

/**
 * Connector Service — implements the 15 tools available to the central AI service.
 *
 * 8 read-only tools + 7 action tools. Each method returns an array suitable
 * for JSON serialization in the connector response.
 */
class ConnectorService
{
    // ─── Read-Only Tools ─────────────────────────────────────────────────

    /**
     * Get user subscription info: plan, expiry, traffic.
     *
     * @return array{plan_name: string|null, plan_id: int|null, expired_at: int|null, ...}
     */
    public function getUserSubscription(int $userId): array
    {
        $user = User::with('plan')->find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        $plan = $user->plan;

        return [
            'success' => true,
            'user_id' => $user->id,
            'plan_id' => $user->plan_id,
            'plan_name' => $plan?->name,
            'expired_at' => $user->expired_at,
            'transfer_enable' => $user->transfer_enable,
            'upload' => $user->u,
            'download' => $user->d,
            'total_used' => $user->getTotalUsedTraffic(),
            'remaining' => $user->getRemainingTraffic(),
            'usage_percentage' => round($user->getTrafficUsagePercentage(), 2),
            'is_active' => $user->isActive(),
            'speed_limit' => $user->speed_limit,
            'device_limit' => $user->device_limit,
        ];
    }

    /**
     * List user's order history.
     *
     * @return array{success: bool, orders: array}
     */
    public function listUserOrders(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        $orders = Order::where('user_id', $userId)
            ->with('plan')
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        $result = $orders->map(fn(Order $order) => [
            'id' => $order->id,
            'trade_no' => $order->trade_no,
            'plan_name' => $order->plan?->name,
            'period' => $order->period,
            'total_amount' => $order->total_amount,
            'status' => $order->status,
            'status_text' => Order::$statusMap[$order->status] ?? 'unknown',
            'type' => $order->type,
            'type_text' => Order::$typeMap[$order->type] ?? 'unknown',
            'discount_amount' => $order->discount_amount,
            'created_at' => $order->created_at,
            'paid_at' => $order->paid_at,
        ])->toArray();

        return ['success' => true, 'orders' => $result];
    }

    /**
     * Get server/node health status.
     *
     * @return array{success: bool, servers: array}
     */
    public function getServerStatus(): array
    {
        $servers = Server::where('show', true)
            ->whereNull('parent_id')
            ->get();

        $result = $servers->map(fn(Server $server) => [
            'id' => $server->id,
            'name' => $server->name,
            'type' => $server->type,
            'is_online' => $server->is_online,
            'online_users' => $server->online,
            'rate' => $server->getCurrentRate(),
            'tags' => $server->tags,
        ])->toArray();

        return ['success' => true, 'servers' => $result];
    }

    /**
     * Check user traffic usage details.
     *
     * @return array{success: bool, upload: int, download: int, ...}
     */
    public function checkUserTraffic(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        return [
            'success' => true,
            'user_id' => $user->id,
            'upload' => $user->u,
            'download' => $user->d,
            'total_used' => $user->getTotalUsedTraffic(),
            'transfer_enable' => $user->transfer_enable,
            'remaining' => $user->getRemainingTraffic(),
            'usage_percentage' => round($user->getTrafficUsagePercentage(), 2),
            'next_reset_at' => $user->next_reset_at,
            'last_reset_at' => $user->last_reset_at,
        ];
    }

    /**
     * Get plan details including pricing.
     *
     * @return array{success: bool, plan: array}
     */
    public function getPlanDetails(int $planId): array
    {
        $plan = Plan::find($planId);
        if (!$plan) {
            return ['error' => 'Plan not found', 'success' => false];
        }

        return [
            'success' => true,
            'plan' => [
                'id' => $plan->id,
                'name' => $plan->name,
                'transfer_enable' => $plan->transfer_enable,
                'speed_limit' => $plan->speed_limit,
                'device_limit' => $plan->device_limit,
                'content' => $plan->content,
                'prices' => $plan->getPriceList(),
                'can_reset_traffic' => $plan->canResetTraffic(),
                'reset_traffic_price' => $plan->getResetTrafficPrice(),
                'reset_traffic_method' => $plan->reset_traffic_method,
            ],
        ];
    }

    /**
     * Search knowledge base articles by keyword.
     *
     * @return array{success: bool, articles: array}
     */
    public function searchKnowledgeBase(string $query): array
    {
        $articles = Knowledge::where('show', true)
            ->where(function ($q) use ($query) {
                $q->where('title', 'LIKE', "%{$query}%")
                    ->orWhere('body', 'LIKE', "%{$query}%");
            })
            ->orderByDesc('sort')
            ->limit(20)
            ->get();

        $result = $articles->map(fn(Knowledge $article) => [
            'id' => $article->id,
            'title' => $article->title,
            'category' => $article->category,
            'body' => mb_substr(strip_tags($article->body ?? ''), 0, 500),
            'language' => $article->language,
            'updated_at' => $article->updated_at,
        ])->toArray();

        return ['success' => true, 'articles' => $result];
    }

    /**
     * Validate a coupon code.
     *
     * @return array{success: bool, valid: bool, ...}
     */
    public function validateCoupon(string $code): array
    {
        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon) {
            return ['success' => true, 'valid' => false, 'reason' => 'Coupon not found'];
        }

        $now = time();

        // Check if started
        if ($coupon->started_at && $coupon->started_at > $now) {
            return ['success' => true, 'valid' => false, 'reason' => 'Coupon not yet active'];
        }

        // Check if expired
        if ($coupon->ended_at && $coupon->ended_at < $now) {
            return ['success' => true, 'valid' => false, 'reason' => 'Coupon expired'];
        }

        // Check usage limit
        if ($coupon->limit_use !== null && $coupon->limit_use <= 0) {
            return ['success' => true, 'valid' => false, 'reason' => 'Coupon usage limit reached'];
        }

        return [
            'success' => true,
            'valid' => true,
            'code' => $coupon->code,
            'name' => $coupon->name,
            'type' => $coupon->type, // 1=amount, 2=percentage
            'value' => $coupon->value,
            'limit_use' => $coupon->limit_use,
            'limit_plan_ids' => $coupon->limit_plan_ids,
            'limit_period' => $coupon->limit_period,
            'started_at' => $coupon->started_at,
            'ended_at' => $coupon->ended_at,
        ];
    }

    /**
     * Get user invite/referral and commission info.
     *
     * @return array{success: bool, ...}
     */
    public function getUserInviteInfo(int $userId): array
    {
        $user = User::with('invite_user')->find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        // Count referred users
        $referralCount = User::where('invite_user_id', $userId)->count();

        // Commission stats
        $totalCommission = Order::where('invite_user_id', $userId)
            ->where('status', Order::STATUS_COMPLETED)
            ->sum('commission_balance');

        return [
            'success' => true,
            'user_id' => $user->id,
            'commission_balance' => $user->commission_balance,
            'commission_rate' => $user->commission_rate,
            'commission_type' => $user->commission_type,
            'referral_count' => $referralCount,
            'total_commission_earned' => $totalCommission,
            'invite_user_email' => $user->invite_user?->email,
        ];
    }

    // ─── Action Tools ────────────────────────────────────────────────────

    /**
     * Create a support ticket on behalf of a user.
     *
     * @return array{success: bool, ticket_id: int|null}
     */
    public function createSupportTicket(int $userId, string $subject, string $message, int $level = 2): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        try {
            DB::beginTransaction();

            $ticket = Ticket::create([
                'user_id' => $userId,
                'subject' => $subject,
                'level' => $level,
                'status' => Ticket::STATUS_OPENING,
                'reply_status' => Ticket::STATUS_OPENING,
            ]);

            TicketMessage::create([
                'user_id' => $userId,
                'ticket_id' => $ticket->id,
                'message' => $message,
            ]);

            DB::commit();

            return [
                'success' => true,
                'ticket_id' => $ticket->id,
                'status' => 'created',
            ];
        } catch (\Throwable $e) {
            DB::rollBack();
            Log::error('AiSupport: Failed to create ticket', [
                'user_id' => $userId,
                'error' => $e->getMessage(),
            ]);
            return ['error' => 'Failed to create ticket', 'success' => false];
        }
    }

    /**
     * Reply to an existing ticket (as admin/AI).
     *
     * @return array{success: bool, reply_id: int|null}
     */
    public function replyToTicket(int $ticketId, string $message): array
    {
        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            return ['error' => 'Ticket not found', 'success' => false];
        }

        try {
            $ticketService = new TicketService();

            // Find any admin user to attribute the reply to
            $adminUser = User::where('is_admin', true)->first();
            if (!$adminUser) {
                return ['error' => 'No admin user found', 'success' => false];
            }

            $ticketService->replyByAdmin($ticketId, $message, $adminUser->id);

            $lastReply = TicketMessage::where('ticket_id', $ticketId)
                ->orderByDesc('id')
                ->first();

            return [
                'success' => true,
                'reply_id' => $lastReply?->id,
                'status' => 'replied',
            ];
        } catch (\Throwable $e) {
            Log::error('AiSupport: Failed to reply to ticket', [
                'ticket_id' => $ticketId,
                'error' => $e->getMessage(),
            ]);
            return ['error' => 'Failed to reply to ticket', 'success' => false];
        }
    }

    /**
     * Close a ticket.
     *
     * @return array{success: bool}
     */
    public function closeTicket(int $ticketId): array
    {
        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            return ['error' => 'Ticket not found', 'success' => false];
        }

        $ticket->status = Ticket::STATUS_CLOSED;
        if (!$ticket->save()) {
            return ['error' => 'Failed to close ticket', 'success' => false];
        }

        return ['success' => true, 'status' => 'closed'];
    }

    /**
     * Reset user's subscription link (generate new token).
     *
     * @return array{success: bool, subscribe_url: string|null}
     */
    public function resetUserSubscriptionLink(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        $user->token = Helper::guid();
        if (!$user->save()) {
            return ['error' => 'Failed to reset subscription link', 'success' => false];
        }

        return [
            'success' => true,
            'subscribe_url' => Helper::getSubscribeUrl($user->token),
        ];
    }

    /**
     * Check connection health for a user (composite diagnostic).
     *
     * Checks: subscription active, traffic remaining, servers online, expired.
     *
     * @return array{success: bool, diagnostics: array}
     */
    public function checkConnectionHealth(int $userId): array
    {
        $user = User::with('plan')->find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        $diagnostics = [];
        $issues = [];

        // Check subscription status
        $isActive = $user->isActive();
        $diagnostics['subscription_active'] = $isActive;
        if (!$isActive) {
            if ($user->banned) {
                $issues[] = 'Account is banned';
            } elseif ($user->expired_at !== null && $user->expired_at <= time()) {
                $issues[] = 'Subscription has expired';
            } elseif ($user->plan_id === null) {
                $issues[] = 'No active plan';
            }
        }

        // Check traffic
        $remaining = $user->getRemainingTraffic();
        $usagePercent = $user->getTrafficUsagePercentage();
        $diagnostics['traffic_remaining_bytes'] = $remaining;
        $diagnostics['traffic_usage_percent'] = round($usagePercent, 2);
        if ($remaining <= 0) {
            $issues[] = 'Traffic quota exhausted';
        } elseif ($usagePercent > 95) {
            $issues[] = 'Traffic usage above 95%';
        }

        // Check available servers
        $userGroupId = $user->group_id;
        $serverQuery = Server::where('show', true)->whereNull('parent_id');
        if ($userGroupId) {
            $serverQuery->whereJsonContains('group_ids', $userGroupId);
        }
        $servers = $serverQuery->get();
        $onlineCount = $servers->filter(fn(Server $s) => $s->is_online === 1)->count();
        $totalCount = $servers->count();

        $diagnostics['servers_total'] = $totalCount;
        $diagnostics['servers_online'] = $onlineCount;
        if ($onlineCount === 0 && $totalCount > 0) {
            $issues[] = 'No servers currently online';
        }

        // Check plan
        $diagnostics['plan_name'] = $user->plan?->name;
        $diagnostics['expired_at'] = $user->expired_at;

        $healthy = empty($issues);

        return [
            'success' => true,
            'healthy' => $healthy,
            'diagnostics' => $diagnostics,
            'issues' => $issues,
        ];
    }

    /**
     * Send the user's subscribe link via Telegram or other channel.
     *
     * @return array{success: bool}
     */
    public function sendSubscribeLink(int $userId): array
    {
        $user = User::find($userId);
        if (!$user) {
            return ['error' => 'User not found', 'success' => false];
        }

        $subscribeUrl = Helper::getSubscribeUrl($user->token);
        $appName = admin_setting('app_name', 'Xboard');

        if ($user->telegram_id) {
            $text = "{$appName}\n\nYour subscription link:\n{$subscribeUrl}\n\nImport this link into your VPN client app.";

            try {
                $telegramService = new \App\Services\TelegramService();
                $telegramService->sendMessage($user->telegram_id, $text);

                return ['success' => true, 'channel' => 'telegram', 'sent' => true];
            } catch (\Throwable $e) {
                Log::error('AiSupport: Failed to send subscribe link via Telegram', [
                    'user_id' => $userId,
                    'error' => $e->getMessage(),
                ]);
                return ['error' => 'Failed to send message via Telegram', 'success' => false];
            }
        }

        return ['error' => 'User has no Telegram ID linked', 'success' => false];
    }

    /**
     * Apply a coupon code to a pending order.
     *
     * @return array{success: bool}
     */
    public function applyCouponToOrder(int $orderId, string $code): array
    {
        $order = Order::find($orderId);
        if (!$order) {
            return ['error' => 'Order not found', 'success' => false];
        }

        if ($order->status !== Order::STATUS_PENDING) {
            return ['error' => 'Order is not in pending status', 'success' => false];
        }

        $coupon = Coupon::where('code', $code)->first();
        if (!$coupon) {
            return ['error' => 'Coupon not found', 'success' => false];
        }

        // Basic validation
        $validation = $this->validateCoupon($code);
        if (!($validation['valid'] ?? false)) {
            return ['error' => $validation['reason'] ?? 'Coupon invalid', 'success' => false];
        }

        // Check plan restriction
        if (!empty($coupon->limit_plan_ids) && !in_array($order->plan_id, $coupon->limit_plan_ids)) {
            return ['error' => 'Coupon not applicable to this plan', 'success' => false];
        }

        // Check period restriction
        if (!empty($coupon->limit_period) && !in_array($order->period, $coupon->limit_period)) {
            return ['error' => 'Coupon not applicable to this billing period', 'success' => false];
        }

        try {
            // Calculate discount
            $discount = 0;
            if ($coupon->type === 1) {
                // Fixed amount discount
                $discount = min($coupon->value, $order->total_amount);
            } elseif ($coupon->type === 2) {
                // Percentage discount
                $discount = (int) floor($order->total_amount * ($coupon->value / 100));
            }

            $order->coupon_id = $coupon->id;
            $order->discount_amount = $discount;
            $order->total_amount = max(0, $order->total_amount - $discount);

            if (!$order->save()) {
                return ['error' => 'Failed to apply coupon', 'success' => false];
            }

            // Decrement coupon usage
            if ($coupon->limit_use !== null) {
                $coupon->decrement('limit_use');
            }

            return [
                'success' => true,
                'discount' => $discount,
                'new_total' => $order->total_amount,
            ];
        } catch (\Throwable $e) {
            Log::error('AiSupport: Failed to apply coupon', [
                'order_id' => $orderId,
                'coupon_code' => $code,
                'error' => $e->getMessage(),
            ]);
            return ['error' => 'Failed to apply coupon', 'success' => false];
        }
    }

    /**
     * Route a tool call to the appropriate method.
     *
     * @return array Tool execution result
     */
    public function executeTool(string $toolName, array $params): array
    {
        return match ($toolName) {
            // Read-only tools
            'get_user_subscription' => $this->getUserSubscription((int) ($params['user_id'] ?? 0)),
            'list_user_orders' => $this->listUserOrders((int) ($params['user_id'] ?? 0)),
            'get_server_status' => $this->getServerStatus(),
            'check_user_traffic' => $this->checkUserTraffic((int) ($params['user_id'] ?? 0)),
            'get_plan_details' => $this->getPlanDetails((int) ($params['plan_id'] ?? 0)),
            'search_knowledge_base' => $this->searchKnowledgeBase((string) ($params['query'] ?? '')),
            'validate_coupon' => $this->validateCoupon((string) ($params['code'] ?? '')),
            'get_user_invite_info' => $this->getUserInviteInfo((int) ($params['user_id'] ?? 0)),
            // Action tools
            'create_support_ticket' => $this->createSupportTicket(
                (int) ($params['user_id'] ?? 0),
                (string) ($params['subject'] ?? ''),
                (string) ($params['message'] ?? ''),
                (int) ($params['level'] ?? 2),
            ),
            'reply_to_ticket' => $this->replyToTicket(
                (int) ($params['ticket_id'] ?? 0),
                (string) ($params['message'] ?? ''),
            ),
            'close_ticket' => $this->closeTicket((int) ($params['ticket_id'] ?? 0)),
            'reset_user_subscription_link' => $this->resetUserSubscriptionLink((int) ($params['user_id'] ?? 0)),
            'check_connection_health' => $this->checkConnectionHealth((int) ($params['user_id'] ?? 0)),
            'send_subscribe_link' => $this->sendSubscribeLink((int) ($params['user_id'] ?? 0)),
            'apply_coupon_to_order' => $this->applyCouponToOrder(
                (int) ($params['order_id'] ?? 0),
                (string) ($params['code'] ?? ''),
            ),
            default => ['error' => "Unknown tool: {$toolName}", 'success' => false],
        };
    }
}

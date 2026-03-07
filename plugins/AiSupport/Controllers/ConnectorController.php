<?php

namespace Plugin\AiSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Models\Knowledge;
use App\Models\Order;
use App\Models\Server;
use App\Models\Ticket;
use App\Models\TicketMessage;
use App\Models\User;
use Plugin\AiSupport\Observers\TicketObserver;
use Plugin\AiSupport\Services\ConnectorService;
use App\Services\TelegramService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

/**
 * Connector Controller — implements the 10 callback endpoints
 * that the central AI service calls to get data from Xboard.
 *
 * All routes are protected by ConnectorAuth middleware (HMAC validation).
 */
class ConnectorController extends Controller
{
    private ConnectorService $connectorService;

    public function __construct(ConnectorService $connectorService)
    {
        $this->connectorService = $connectorService;
    }

    /**
     * GET /api/v1/ai-connector/user-context/{user_id}
     *
     * Returns user profile with plan, traffic, and subscription info.
     */
    public function getUserContext(int $userId): JsonResponse
    {
        $user = User::with('plan')->find($userId);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        return response()->json([
            'user_id' => $user->id,
            'email' => $user->email,
            'telegram_id' => $user->telegram_id,
            'plan_name' => $user->plan?->name,
            'plan_id' => $user->plan_id,
            'expired_at' => $user->expired_at,
            'traffic_used' => $user->getTotalUsedTraffic(),
            'traffic_total' => $user->transfer_enable,
            'traffic_remaining' => $user->getRemainingTraffic(),
            'is_active' => $user->isActive(),
            'balance' => $user->balance,
            'commission_balance' => $user->commission_balance,
            'created_at' => $user->created_at,
            'last_login_at' => $user->last_login_at,
            'banned' => $user->banned,
            'speed_limit' => $user->speed_limit,
            'device_limit' => $user->device_limit,
        ]);
    }

    /**
     * GET /api/v1/ai-connector/server-status
     *
     * Returns health info for all visible servers.
     */
    public function getServerStatus(): JsonResponse
    {
        $result = $this->connectorService->getServerStatus();
        return response()->json($result);
    }

    /**
     * POST /api/v1/ai-connector/create-ticket
     *
     * Creates a new support ticket.
     */
    public function createTicket(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:v2_user,id',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:10000',
            'level' => 'integer|in:0,1,2',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()->toArray(),
            ], 422);
        }

        TicketObserver::$suppressEvents = true;
        try {
            $result = $this->connectorService->createSupportTicket(
                (int) $request->input('user_id'),
                $request->input('subject'),
                $request->input('message'),
                (int) $request->input('level', 2),
            );
        } finally {
            TicketObserver::$suppressEvents = false;
        }

        $status = ($result['success'] ?? false) ? 201 : 500;
        return response()->json($result, $status);
    }

    /**
     * POST /api/v1/ai-connector/reply-ticket/{ticket_id}
     *
     * Replies to an existing ticket.
     */
    public function replyTicket(int $ticketId, Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'message' => 'required|string|max:10000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()->toArray(),
            ], 422);
        }

        TicketObserver::$suppressEvents = true;
        try {
            $result = $this->connectorService->replyToTicket(
                $ticketId,
                $request->input('message'),
            );
        } finally {
            TicketObserver::$suppressEvents = false;
        }

        $status = ($result['success'] ?? false) ? 200 : 500;
        return response()->json($result, $status);
    }

    /**
     * GET /api/v1/ai-connector/ticket/{ticket_id}
     *
     * Gets a ticket with all messages.
     */
    public function getTicket(int $ticketId): JsonResponse
    {
        $ticket = Ticket::with(['messages' => function ($q) {
            $q->orderBy('created_at', 'asc');
        }])->find($ticketId);

        if (!$ticket) {
            return response()->json(['error' => 'Ticket not found'], 404);
        }

        $messages = $ticket->messages->map(fn(TicketMessage $msg) => [
            'id' => $msg->id,
            'user_id' => $msg->user_id,
            'role' => $msg->user_id === $ticket->user_id ? 'user' : 'admin',
            'message' => $msg->message,
            'created_at' => $msg->created_at,
        ])->toArray();

        return response()->json([
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'level' => $ticket->level,
            'status' => $ticket->status,
            'reply_status' => $ticket->reply_status,
            'user_id' => $ticket->user_id,
            'created_at' => $ticket->created_at,
            'updated_at' => $ticket->updated_at,
            'messages' => $messages,
        ]);
    }

    /**
     * GET /api/v1/ai-connector/tickets
     *
     * Lists tickets with optional filters.
     */
    public function listTickets(Request $request): JsonResponse
    {
        $query = Ticket::query();

        if ($request->has('status')) {
            $query->where('status', (int) $request->input('status'));
        }

        if ($request->has('user_id')) {
            $query->where('user_id', (int) $request->input('user_id'));
        }

        $perPage = min((int) $request->input('limit', 20), 100);

        $tickets = $query->orderByDesc('updated_at')
            ->paginate($perPage);

        $items = collect($tickets->items())->map(fn(Ticket $ticket) => [
            'id' => $ticket->id,
            'subject' => $ticket->subject,
            'level' => $ticket->level,
            'status' => $ticket->status,
            'reply_status' => $ticket->reply_status,
            'user_id' => $ticket->user_id,
            'created_at' => $ticket->created_at,
            'updated_at' => $ticket->updated_at,
        ])->toArray();

        return response()->json([
            'tickets' => $items,
            'total' => $tickets->total(),
            'page' => $tickets->currentPage(),
            'per_page' => $tickets->perPage(),
            'last_page' => $tickets->lastPage(),
        ]);
    }

    /**
     * GET /api/v1/ai-connector/knowledge
     *
     * Returns all visible knowledge base articles.
     */
    public function getKnowledge(): JsonResponse
    {
        $articles = Knowledge::where('show', true)
            ->orderByDesc('sort')
            ->get();

        $result = $articles->map(fn(Knowledge $article) => [
            'id' => $article->id,
            'title' => $article->title,
            'content' => $article->body,
            'category' => $article->category,
            'language' => $article->language,
            'sort' => $article->sort,
            'updated_at' => $article->updated_at,
        ])->toArray();

        return response()->json(['knowledge' => $result]);
    }

    /**
     * GET /api/v1/ai-connector/services/{user_id}
     *
     * Returns user's active services with plan and order info.
     */
    public function getUserServices(int $userId): JsonResponse
    {
        $user = User::with(['plan', 'orders' => function ($q) {
            $q->where('status', Order::STATUS_COMPLETED)
                ->orderByDesc('created_at')
                ->limit(10);
        }])->find($userId);

        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $orders = $user->orders->map(fn(Order $order) => [
            'id' => $order->id,
            'trade_no' => $order->trade_no,
            'plan_id' => $order->plan_id,
            'period' => $order->period,
            'total_amount' => $order->total_amount,
            'type_text' => Order::$typeMap[$order->type] ?? 'unknown',
            'created_at' => $order->created_at,
        ])->toArray();

        $service = [
            'user_id' => $user->id,
            'plan_id' => $user->plan_id,
            'plan_name' => $user->plan?->name,
            'status' => $user->isActive() ? 'active' : 'inactive',
            'expired_at' => $user->expired_at,
            'traffic_used' => $user->getTotalUsedTraffic(),
            'traffic_total' => $user->transfer_enable,
            'traffic_remaining' => $user->getRemainingTraffic(),
            'orders' => $orders,
        ];

        return response()->json(['services' => [$service]]);
    }

    /**
     * POST /api/v1/ai-connector/send-message
     *
     * Sends a message to a user via Telegram or email.
     */
    public function sendMessage(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|integer|exists:v2_user,id',
            'message' => 'required|string|max:5000',
            'channel' => 'required|string|in:telegram,email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()->toArray(),
            ], 422);
        }

        $user = User::find((int) $request->input('user_id'));
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $channel = $request->input('channel');
        $message = $request->input('message');

        try {
            if ($channel === 'telegram') {
                if (!$user->telegram_id) {
                    return response()->json([
                        'error' => 'User has no Telegram ID linked',
                        'sent' => false,
                    ], 422);
                }
                $telegramService = new TelegramService();
                $telegramService->sendMessage($user->telegram_id, $message);
            } elseif ($channel === 'email') {
                \App\Jobs\SendEmailJob::dispatch([
                    'email' => $user->email,
                    'subject' => admin_setting('app_name', 'Xboard') . ' - AI Support',
                    'template_name' => 'notify',
                    'template_value' => [
                        'name' => admin_setting('app_name', 'Xboard'),
                        'url' => admin_setting('app_url'),
                        'content' => $message,
                    ],
                ]);
            }

            return response()->json(['sent' => true]);
        } catch (\Throwable $e) {
            Log::error('AiSupport: Failed to send message', [
                'user_id' => $user->id,
                'channel' => $channel,
                'error' => $e->getMessage(),
            ]);
            return response()->json([
                'error' => 'Failed to send message',
                'sent' => false,
            ], 500);
        }
    }

    /**
     * POST /api/v1/ai-connector/tool/{tool_name}
     *
     * Executes a tool via the ConnectorService.
     */
    public function executeTool(string $toolName, Request $request): JsonResponse
    {
        $params = $request->all();

        $result = $this->connectorService->executeTool($toolName, $params);

        $status = ($result['success'] ?? false) ? 200 : 400;
        return response()->json($result, $status);
    }
}

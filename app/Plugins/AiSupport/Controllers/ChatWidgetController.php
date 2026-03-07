<?php

namespace App\Plugins\AiSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Services\AiApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Chat Widget Controller — serves the chat widget to authenticated users.
 *
 * This is a stub that will be fully implemented when Phase 09 (chat widget) is built.
 * For now, it provides the configuration endpoint the widget needs to initialize.
 */
class ChatWidgetController extends Controller
{
    /**
     * GET /api/v1/user/ai-support/widget-config
     *
     * Returns the chat widget configuration for the authenticated user.
     */
    public function widgetConfig(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json([
                'enabled' => false,
            ]);
        }

        $serviceUrl = AiSupportPlugin::config('service_url', '');

        return response()->json([
            'enabled' => true,
            'service_url' => $serviceUrl,
            'api_base_url' => '/api/v1/user/ai-support',
            'vendor_id' => AiSupportPlugin::config('vendor_id', ''),
            'app_name' => admin_setting('app_name', 'Xboard'),
            'enable_attachments' => false,
        ]);
    }

    /**
     * POST /api/v1/user/ai-support/chat
     *
     * Proxies a chat message from the widget to the central AI service.
     * The user is authenticated via Xboard's auth middleware.
     */
    public function chat(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }

        $user = $request->user();
        if (!$user) {
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $message = $request->input('message', '');
        if (empty(trim($message))) {
            return response()->json(['error' => 'Message is required'], 422);
        }

        $client = new \App\Plugins\AiSupport\Services\AiApiClient();
        $result = $client->chat(
            (string) $user->id,
            $message,
            'widget',
            [
                'email' => $user->email,
                'telegram_id' => $user->telegram_id,
            ]
        );

        return $this->proxyResponse($result);
    }

    /**
     * GET /api/v1/user/ai-support/history
     */
    public function history(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $client = new AiApiClient();
        $result = $client->getWidgetHistory((string) $user->id, $request->input('limit'));
        return $this->proxyResponse($result);
    }

    /**
     * GET /api/v1/user/ai-support/status
     */
    public function status(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $conversationId = $request->input('conversation_id');
        if (!$conversationId) return response()->json(['error' => 'conversation_id required'], 422);

        $client = new AiApiClient();
        $result = $client->getWidgetStatus($conversationId);
        return $this->proxyResponse($result);
    }

    /**
     * POST /api/v1/user/ai-support/feedback
     */
    public function feedback(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $client = new AiApiClient();
        $result = $client->submitFeedback(
            (int) $request->input('conversation_id'),
            (string) $user->id,
            (string) $request->input('feedback', ''),
            $request->input('is_helpful')
        );
        return $this->proxyResponse($result);
    }

    /**
     * POST /api/v1/user/ai-support/rating
     */
    public function rating(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $client = new AiApiClient();
        $result = $client->submitRating(
            (int) $request->input('conversation_id'),
            (string) $user->id,
            (int) $request->input('rating', 0),
            $request->input('comment')
        );
        return $this->proxyResponse($result);
    }

    /**
     * POST /api/v1/user/ai-support/attachment
     */
    public function attachment(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $client = new AiApiClient();
        $result = $client->checkAttachment(
            (int) $request->input('conversation_id'),
            (string) $user->id,
            (string) $request->input('filename', ''),
            (string) $request->input('content_type', ''),
            (int) $request->input('file_size', 0)
        );
        return $this->proxyResponse($result);
    }

    /**
     * POST /api/v1/user/ai-support/escalate
     */
    public function escalate(Request $request): JsonResponse
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json(['error' => 'AI Support is not enabled'], 503);
        }
        $user = $request->user();
        if (!$user) return response()->json(['error' => 'Unauthorized'], 401);

        $client = new AiApiClient();
        $result = $client->requestEscalation(
            (int) $request->input('conversation_id'),
            (string) $user->id,
            (string) $request->input('reason', 'User requested human support')
        );
        return $this->proxyResponse($result);
    }

    private function proxyResponse(array $result): JsonResponse
    {
        if (($result['success'] ?? null) === false) {
            return response()->json($result, (int) ($result['status'] ?? 502));
        }

        return response()->json($result, 200);
    }
}

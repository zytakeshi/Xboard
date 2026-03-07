<?php

use App\Plugins\AiSupport\Controllers\AdminController;
use App\Plugins\AiSupport\Controllers\ChatWidgetController;
use App\Plugins\AiSupport\Controllers\ConnectorController;
use Illuminate\Contracts\Routing\Registrar;

/**
 * AiSupport Plugin Routes
 *
 * Connector endpoints: /api/v1/ai-connector/*  (HMAC-authenticated)
 * Admin endpoints:     /api/v1/admin/ai-support/* (admin middleware)
 * User endpoints:      /api/v1/user/ai-support/*  (user auth)
 */
return function (Registrar $router) {
    // ─── Connector Callback Routes (called by the central AI service) ────
    $router->group([
        'prefix' => 'ai-connector',
        'middleware' => [\App\Plugins\AiSupport\Middleware\ConnectorAuth::class],
    ], function ($router) {
        $router->get('/user-context/{userId}', [ConnectorController::class, 'getUserContext']);
        $router->get('/server-status', [ConnectorController::class, 'getServerStatus']);
        $router->post('/create-ticket', [ConnectorController::class, 'createTicket']);
        $router->post('/reply-ticket/{ticketId}', [ConnectorController::class, 'replyTicket']);
        $router->get('/ticket/{ticketId}', [ConnectorController::class, 'getTicket']);
        $router->get('/tickets', [ConnectorController::class, 'listTickets']);
        $router->get('/knowledge', [ConnectorController::class, 'getKnowledge']);
        $router->get('/services/{userId}', [ConnectorController::class, 'getUserServices']);
        $router->post('/send-message', [ConnectorController::class, 'sendMessage']);
        $router->post('/tool/{toolName}', [ConnectorController::class, 'executeTool']);
    });

    // ─── Admin Config Routes ─────────────────────────────────────────────
    $router->group([
        'prefix' => 'admin/ai-support',
        'middleware' => ['admin'],
    ], function ($router) {
        $router->get('/settings', [AdminController::class, 'getSettings']);
        $router->post('/settings', [AdminController::class, 'saveSettings']);
        $router->post('/test-connection', [AdminController::class, 'testConnection']);
        $router->post('/reindex', [AdminController::class, 'reindex']);
        $router->post('/openai-key', [AdminController::class, 'setOpenAiKey']);
        $router->get('/stats', [AdminController::class, 'getStats']);
    });

    // ─── User-Facing Routes (chat widget) ────────────────────────────────
    $router->group([
        'prefix' => 'user/ai-support',
        'middleware' => ['user'],
    ], function ($router) {
        $router->get('/widget-config', [ChatWidgetController::class, 'widgetConfig']);
        $router->post('/chat', [ChatWidgetController::class, 'chat']);
        $router->get('/history', [ChatWidgetController::class, 'history']);
        $router->get('/status', [ChatWidgetController::class, 'status']);
        $router->post('/feedback', [ChatWidgetController::class, 'feedback']);
        $router->post('/rating', [ChatWidgetController::class, 'rating']);
        $router->post('/attachment', [ChatWidgetController::class, 'attachment']);
        $router->post('/escalate', [ChatWidgetController::class, 'escalate']);
    });
};

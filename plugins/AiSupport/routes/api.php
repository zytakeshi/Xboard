<?php

use Illuminate\Support\Facades\Route;
use Plugin\AiSupport\Controllers\AdminController;
use Plugin\AiSupport\Controllers\ChatWidgetController;
use Plugin\AiSupport\Controllers\ConnectorController;
use Plugin\AiSupport\Middleware\ConnectorAuth;

Route::prefix('api/v1')->group(function () {
    Route::prefix('ai-connector')
        ->middleware([ConnectorAuth::class])
        ->group(function () {
            Route::get('/user-context/{userId}', [ConnectorController::class, 'getUserContext']);
            Route::get('/server-status', [ConnectorController::class, 'getServerStatus']);
            Route::post('/create-ticket', [ConnectorController::class, 'createTicket']);
            Route::post('/reply-ticket/{ticketId}', [ConnectorController::class, 'replyTicket']);
            Route::get('/ticket/{ticketId}', [ConnectorController::class, 'getTicket']);
            Route::get('/tickets', [ConnectorController::class, 'listTickets']);
            Route::get('/knowledge', [ConnectorController::class, 'getKnowledge']);
            Route::get('/services/{userId}', [ConnectorController::class, 'getUserServices']);
            Route::post('/send-message', [ConnectorController::class, 'sendMessage']);
            Route::post('/tool/{toolName}', [ConnectorController::class, 'executeTool']);
        });

    Route::prefix('admin/ai-support')
        ->middleware(['admin'])
        ->group(function () {
            Route::get('/settings', [AdminController::class, 'getSettings']);
            Route::post('/settings', [AdminController::class, 'saveSettings']);
            Route::post('/test-connection', [AdminController::class, 'testConnection']);
            Route::post('/reindex', [AdminController::class, 'reindex']);
            Route::post('/openai-key', [AdminController::class, 'setOpenAiKey']);
            Route::get('/stats', [AdminController::class, 'getStats']);
        });

    Route::prefix('user/ai-support')
        ->middleware(['user'])
        ->group(function () {
            Route::get('/widget-config', [ChatWidgetController::class, 'widgetConfig']);
            Route::post('/chat', [ChatWidgetController::class, 'chat']);
            Route::get('/history', [ChatWidgetController::class, 'history']);
            Route::get('/status', [ChatWidgetController::class, 'status']);
            Route::post('/feedback', [ChatWidgetController::class, 'feedback']);
            Route::post('/rating', [ChatWidgetController::class, 'rating']);
            Route::post('/attachment', [ChatWidgetController::class, 'attachment']);
            Route::post('/escalate', [ChatWidgetController::class, 'escalate']);
        });
});

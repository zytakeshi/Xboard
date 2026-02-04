<?php
namespace App\Http\Routes\V1;

use App\Http\Controllers\V1\Guest\ApiPathController;
use App\Http\Controllers\V1\Guest\CommController;
use App\Http\Controllers\V1\Guest\PaymentController;
use App\Http\Controllers\V1\Guest\PlanController;
use App\Http\Controllers\V1\Guest\RevenueCatController;
use App\Http\Controllers\V1\Guest\TelegramController;
use Illuminate\Contracts\Routing\Registrar;

class GuestRoute
{
    public function map(Registrar $router)
    {
        $router->group([
            'prefix' => 'guest'
        ], function ($router) {
            // Plan
            $router->get('/plan/fetch', [PlanController::class, 'fetch']);
            // Telegram
            $router->post('/telegram/webhook', [TelegramController::class, 'webhook']);
            // Payment
            $router->match(['get', 'post'], '/payment/notify/{method}/{uuid}', [PaymentController::class, 'notify']);
            // RevenueCat webhook
            $router->post('/revenuecat/webhook', [RevenueCatController::class, 'webhook']);
            // Comm
            $router->get('/comm/config', [CommController::class, 'config']);
            $router->get('/comm/api-domains', [ApiPathController::class, 'getDomains']);
            $router->options('/comm/api-domains', [ApiPathController::class, 'options']);
        });
    }
}

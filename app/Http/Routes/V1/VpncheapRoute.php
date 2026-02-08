<?php

namespace App\Http\Routes\V1;

use App\Http\Controllers\V1\User\InviteController;
use App\Http\Controllers\V1\User\OrderController;
use App\Http\Controllers\V1\User\PlanController;
use App\Http\Controllers\V1\User\TicketController;
use App\Http\Controllers\V1\User\UserController;
use Illuminate\Contracts\Routing\Registrar;

class VpncheapRoute
{
    public function map(Registrar $router)
    {
        $router->group([
            'prefix' => 'vpncheap',
            'middleware' => 'user'
        ], function ($router) {
            // User
            $router->get('/info', [UserController::class, 'info']);
            $router->post('/transfer', [UserController::class, 'transfer']);
            $router->get('/getActiveSession', [UserController::class, 'getActiveSession']);
            $router->post('/removeActiveSession', [UserController::class, 'removeActiveSession']);
            $router->post('/deactivateAccount', [UserController::class, 'deactivateAccount']);

            // Order
            $router->post('/order/save', [OrderController::class, 'save']);
            $router->post('/order/checkout', [OrderController::class, 'checkout']);
            $router->get('/order/check', [OrderController::class, 'check']);
            $router->get('/order/fetch', [OrderController::class, 'fetch']);
            $router->get('/order/getPaymentMethod', [OrderController::class, 'getPaymentMethod']);
            $router->post('/order/cancel', [OrderController::class, 'cancel']);

            // Plan
            $router->get('/plan/fetch', [PlanController::class, 'fetch']);

            // Invite
            $router->get('/invite/save', [InviteController::class, 'save']);
            $router->get('/invite/fetch', [InviteController::class, 'fetch']);
            $router->get('/invite/withdrawConfig', [InviteController::class, 'withdrawConfig']);

            // Ticket
            $router->post('/ticket/reply', [TicketController::class, 'reply']);
            $router->post('/ticket/close', [TicketController::class, 'close']);
            $router->post('/ticket/save', [TicketController::class, 'save']);
            $router->get('/ticket/fetch', [TicketController::class, 'fetch']);
            $router->post('/ticket/withdraw', [TicketController::class, 'withdraw']);
        });
    }
}


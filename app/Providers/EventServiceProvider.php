<?php

namespace App\Providers;

use App\Models\User;
use App\Observers\UserObserver;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use Illuminate\Support\Facades\Event;

class EventServiceProvider extends ServiceProvider
{
    /**
     * 事件监听器映射
     * @var array<string, array<int, class-string>>
     */
    protected $listen = [
    ];

    /**
     * 注册任何事件
     * @return void
     */
    public function boot()
    {
        parent::boot();

        // 注册用户模型观察者
        User::observe(UserObserver::class);

        // Register AiSupport observers if plugin is available and enabled
        if (class_exists(\App\Plugins\AiSupport\AiSupportPlugin::class) && \App\Plugins\AiSupport\AiSupportPlugin::isEnabled()) {
            \App\Models\Ticket::observe(\App\Plugins\AiSupport\Observers\TicketObserver::class);
            \App\Models\TicketMessage::observe(\App\Plugins\AiSupport\Observers\TicketMessageObserver::class);
            \App\Models\Knowledge::observe(\App\Plugins\AiSupport\Observers\KnowledgeObserver::class);
        }
    }
}

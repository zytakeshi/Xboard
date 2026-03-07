<?php

namespace Plugin\AiSupport\Providers;

use App\Models\Knowledge;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Support\ServiceProvider;
use Plugin\AiSupport\Commands\ConnectorSmokeTest;
use Plugin\AiSupport\Observers\KnowledgeObserver;
use Plugin\AiSupport\Observers\TicketMessageObserver;
use Plugin\AiSupport\Observers\TicketObserver;
use Plugin\AiSupport\Services\ThemeBootstrapManager;

class PluginServiceProvider extends ServiceProvider
{
    protected static bool $observersRegistered = false;

    public function boot(): void
    {
        $this->commands([
            ConnectorSmokeTest::class,
        ]);

        if (!self::$observersRegistered) {
            Ticket::observe(TicketObserver::class);
            TicketMessage::observe(TicketMessageObserver::class);
            Knowledge::observe(KnowledgeObserver::class);
            self::$observersRegistered = true;
        }

        ThemeBootstrapManager::sync();
    }
}

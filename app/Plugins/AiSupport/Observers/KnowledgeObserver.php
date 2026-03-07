<?php

namespace App\Plugins\AiSupport\Observers;

use App\Models\Knowledge;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Jobs\SyncKnowledgeJob;

/**
 * KnowledgeObserver — watches for knowledge base changes and triggers
 * synchronization with the central AI service.
 *
 * Register in EventServiceProvider:
 *   Knowledge::observe(KnowledgeObserver::class);
 */
class KnowledgeObserver
{
    public function created(Knowledge $knowledge): void
    {
        if (!AiSupportPlugin::isEnabled()) {
            return;
        }

        SyncKnowledgeJob::dispatch($knowledge->id, 'create');
    }

    public function updated(Knowledge $knowledge): void
    {
        if (!AiSupportPlugin::isEnabled()) {
            return;
        }

        SyncKnowledgeJob::dispatch($knowledge->id, 'update');
    }

    public function deleted(Knowledge $knowledge): void
    {
        if (!AiSupportPlugin::isEnabled()) {
            return;
        }

        SyncKnowledgeJob::dispatch($knowledge->id, 'delete');
    }
}

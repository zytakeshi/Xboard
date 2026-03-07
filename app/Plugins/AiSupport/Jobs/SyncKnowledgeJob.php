<?php

namespace App\Plugins\AiSupport\Jobs;

use App\Models\Knowledge;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Services\AiApiClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * SyncKnowledgeJob — pushes knowledge base changes to the central AI service.
 *
 * Supports create, update, and delete operations.
 */
class SyncKnowledgeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    private int $knowledgeId;
    private string $action;

    /**
     * @param int    $knowledgeId Knowledge article ID
     * @param string $action      One of: create, update, delete
     */
    public function __construct(int $knowledgeId, string $action)
    {
        $this->onQueue('ai_sync');
        $this->knowledgeId = $knowledgeId;
        $this->action = $action;
    }

    public function handle(): void
    {
        if (!AiSupportPlugin::isEnabled()) {
            return;
        }

        $client = new AiApiClient();

        try {
            if ($this->action === 'delete') {
                $result = $client->removeKnowledge((string) $this->knowledgeId);
            } else {
                // For create and update, fetch the article data
                $article = Knowledge::find($this->knowledgeId);
                if (!$article) {
                    Log::warning('AiSupport: Knowledge article not found for sync', [
                        'knowledge_id' => $this->knowledgeId,
                        'action' => $this->action,
                    ]);
                    return;
                }

                $result = $client->syncKnowledge([
                    'external_id' => (string) $article->id,
                    'title' => $article->title,
                    'content' => $article->body,
                    'category' => $article->category,
                    'language' => $article->language,
                    'show' => $article->show,
                    'updated_at' => $article->updated_at,
                    'action' => $this->action,
                ]);
            }

            if (!($result['success'] ?? false)) {
                Log::warning('AiSupport: Knowledge sync failed', [
                    'knowledge_id' => $this->knowledgeId,
                    'action' => $this->action,
                    'error' => $result['error'] ?? 'unknown',
                ]);
            }
        } catch (\Throwable $e) {
            Log::error('AiSupport: Knowledge sync exception', [
                'knowledge_id' => $this->knowledgeId,
                'action' => $this->action,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

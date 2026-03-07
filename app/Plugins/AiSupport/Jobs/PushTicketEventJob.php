<?php

namespace App\Plugins\AiSupport\Jobs;

use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Services\AiApiClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class PushTicketEventJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 30;

    private string $eventType;
    private string $ticketId;
    private ?string $userId;
    private array $payload;

    public function __construct(string $eventType, string $ticketId, ?string $userId, array $payload = [])
    {
        $this->onQueue('ai_sync');
        $this->eventType = $eventType;
        $this->ticketId = $ticketId;
        $this->userId = $userId;
        $this->payload = $payload;
    }

    public function handle(): void
    {
        if (!AiSupportPlugin::isEnabled()) return;

        $client = new AiApiClient();
        try {
            $result = $client->pushTicketEvent($this->eventType, $this->ticketId, $this->userId, $this->payload);
            if (isset($result['status']) && $result['status'] === 409) {
                Log::debug('AiSupport: Duplicate ticket event ignored', [
                    'event_type' => $this->eventType,
                    'ticket_id' => $this->ticketId,
                ]);
                return;
            }
            if (!($result['success'] ?? true) && !isset($result['id'])) {
                Log::warning('AiSupport: Ticket event push failed', [
                    'event_type' => $this->eventType,
                    'ticket_id' => $this->ticketId,
                    'error' => $result['error'] ?? 'unknown',
                ]);
                throw new \RuntimeException('Ticket event push failed: ' . ($result['error'] ?? 'unknown'));
            }
        } catch (\Throwable $e) {
            Log::error('AiSupport: Ticket event push exception', [
                'event_type' => $this->eventType,
                'ticket_id' => $this->ticketId,
                'error' => $e->getMessage(),
            ]);
            throw $e;
        }
    }
}

<?php

namespace Plugin\AiSupport\Services;

use Plugin\AiSupport\AiSupportPlugin;
use Carbon\Carbon;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * HTTP client for communicating with the central AI service.
 *
 * All outbound requests are HMAC-SHA256 signed.
 * Signature format: HMAC-SHA256("{timestamp}:{method}:{path}:{body}", api_secret)
 */
class AiApiClient
{
    private string $baseUrl;
    private string $apiKey;
    private string $apiSecret;
    private int $timeout;
    private int $retries;

    public function __construct()
    {
        $this->baseUrl = rtrim(AiSupportPlugin::config('service_url', ''), '/');
        $this->apiKey = AiSupportPlugin::config('api_key', '');
        $this->apiSecret = AiSupportPlugin::config('api_secret', '');
        $this->timeout = (int) AiSupportPlugin::config('http_timeout', 30);
        $this->retries = (int) AiSupportPlugin::config('http_retries', 2);
    }

    /**
     * Send a chat message to the AI service.
     *
     * @param array<string, mixed> $extra Additional context
     * @return array AI service response
     */
    public function chat(string $userId, string $message, string $channel, array $extra = []): array
    {
        return $this->signedRequest('POST', '/api/v1/chat', [
            'external_user_id' => $userId,
            'user_id' => $userId,
            'message' => $message,
            'channel' => $channel,
            'extra' => $extra,
        ]);
    }

    /**
     * Sync a knowledge base article to the AI service.
     *
     * @param array<string, mixed> $article Article data
     * @return array Sync result
     */
    public function syncKnowledge(array $article): array
    {
        return $this->signedRequest('POST', '/api/v1/knowledge/sync', $article);
    }

    /**
     * Remove a knowledge base article from the AI service.
     */
    public function removeKnowledge(string $externalId): array
    {
        return $this->signedRequest('DELETE', "/api/v1/knowledge/{$externalId}");
    }

    /**
     * Request a full reindex of the knowledge base.
     */
    public function reindexAll(): array
    {
        return $this->signedRequest('POST', '/api/v1/knowledge/reindex-all');
    }

    /**
     * Import the current panel knowledge base into the AI service immediately.
     */
    public function importKnowledgeFromPanel(): array
    {
        return $this->signedRequest('POST', '/api/v1/knowledge/import-from-panel');
    }

    /**
     * Get vendor configuration from the AI service.
     */
    public function getConfig(): array
    {
        return $this->signedRequest('GET', '/api/v1/vendors/config');
    }

    /**
     * Update vendor configuration on the AI service.
     *
     * @param array<string, mixed> $settings
     */
    public function updateConfig(array $settings): array
    {
        return $this->signedRequest('PUT', '/api/v1/vendors/config', $settings);
    }

    /**
     * Test connectivity with the central AI service.
     */
    public function testConnection(): array
    {
        return $this->signedRequest('GET', '/api/v1/health');
    }

    /**
     * Get usage statistics from the AI service.
     */
    public function getStats(): array
    {
        $end = Carbon::now()->toDateString();
        $start = Carbon::now()->subDays(29)->toDateString();
        return $this->signedRequest('GET', "/api/v1/stats?start_date={$start}&end_date={$end}");
    }

    /**
     * Set the BYOK OpenAI key on the central AI service.
     */
    public function setOpenAiKey(string $key): array
    {
        return $this->signedRequest('PUT', '/api/v1/vendors/openai-key', [
            'openai_key' => $key,
        ]);
    }

    /**
     * Push a ticket lifecycle event to the AI service.
     */
    public function pushTicketEvent(string $eventType, string $ticketId, ?string $userId, array $payload = []): array
    {
        return $this->signedRequest('POST', '/api/v1/events/ticket', [
            'event_type' => $eventType,
            'external_ticket_id' => $ticketId,
            'external_user_id' => $userId,
            'payload' => $payload,
            'dedupe_key' => $this->buildTicketEventDedupeKey($eventType, $ticketId, $payload),
        ]);
    }

    // ─── Widget Proxy Methods ────────────────────────────────────────────

    /**
     * Get conversation history for a user.
     */
    public function getWidgetHistory(string $externalUserId, ?int $limit = null): array
    {
        $query = "?external_user_id={$externalUserId}";
        if ($limit) $query .= "&limit={$limit}";
        return $this->signedRequest('GET', "/api/v1/widget/history{$query}");
    }

    /**
     * Get conversation status.
     */
    public function getWidgetStatus(int $conversationId): array
    {
        return $this->signedRequest('GET', "/api/v1/widget/status?conversation_id={$conversationId}");
    }

    /**
     * Submit feedback on a conversation.
     */
    public function submitFeedback(int $conversationId, string $externalUserId, string $feedback, ?bool $isHelpful = null): array
    {
        $body = [
            'conversation_id' => $conversationId,
            'external_user_id' => $externalUserId,
            'feedback' => $feedback,
        ];
        if ($isHelpful !== null) $body['is_helpful'] = $isHelpful;
        return $this->signedRequest('POST', '/api/v1/widget/feedback', $body);
    }

    /**
     * Submit a satisfaction rating.
     */
    public function submitRating(int $conversationId, string $externalUserId, int $rating, ?string $comment = null): array
    {
        $body = [
            'conversation_id' => $conversationId,
            'external_user_id' => $externalUserId,
            'rating' => $rating,
        ];
        if ($comment) $body['comment'] = $comment;
        return $this->signedRequest('POST', '/api/v1/widget/rating', $body);
    }

    /**
     * Check attachment upload eligibility.
     */
    public function checkAttachment(int $conversationId, string $externalUserId, string $filename, string $contentType, int $fileSize): array
    {
        return $this->signedRequest('POST', '/api/v1/widget/attachment', [
            'conversation_id' => $conversationId,
            'external_user_id' => $externalUserId,
            'filename' => $filename,
            'content_type' => $contentType,
            'file_size' => $fileSize,
        ]);
    }

    /**
     * Request escalation to human support.
     */
    public function requestEscalation(int $conversationId, string $externalUserId, string $reason): array
    {
        return $this->signedRequest('POST', '/api/v1/widget/escalate', [
            'conversation_id' => $conversationId,
            'external_user_id' => $externalUserId,
            'reason' => $reason,
        ]);
    }

    /**
     * Send a signed HTTP request to the central AI service.
     *
     * @param array<string, mixed> $body Request body (for POST/PUT/PATCH)
     * @return array Decoded response or error array
     */
    private function signedRequest(string $method, string $path, array $body = []): array
    {
        if (empty($this->baseUrl)) {
            return ['error' => 'AI service URL not configured', 'success' => false];
        }

        $url = $this->baseUrl . $path;
        $timestamp = (string) time();
        $bodyJson = !empty($body) ? json_encode($body) : '';

        // Build HMAC signature
        $payload = "{$timestamp}:{$method}:{$path}:{$bodyJson}";
        $signature = hash_hmac('sha256', $payload, $this->apiSecret);

        $headers = [
            'X-Connector-Key' => $this->apiKey,
            'X-Connector-Signature' => $signature,
            'X-Timestamp' => $timestamp,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
        ];

        try {
            $http = Http::withHeaders($headers)
                ->timeout($this->timeout)
                ->retry($this->retries, 500);

            $response = match (strtoupper($method)) {
                'GET' => $http->get($url),
                'POST' => $http->withBody($bodyJson, 'application/json')->post($url),
                'PUT' => $http->withBody($bodyJson, 'application/json')->put($url),
                'PATCH' => $http->withBody($bodyJson, 'application/json')->patch($url),
                'DELETE' => $http->delete($url),
                default => throw new \InvalidArgumentException("Unsupported HTTP method: {$method}"),
            };

            if ($response->successful()) {
                return $response->json() ?? ['success' => true];
            }

            Log::warning('AiSupport: AI service request failed', [
                'method' => $method,
                'path' => $path,
                'status' => $response->status(),
                'body' => $response->body(),
            ]);

            return [
                'error' => 'AI service returned error',
                'status' => $response->status(),
                'message' => $response->json('error') ?? $response->body(),
                'success' => false,
            ];
        } catch (\Throwable $e) {
            Log::error('AiSupport: AI service request exception', [
                'method' => $method,
                'path' => $path,
                'error' => $e->getMessage(),
            ]);

            return [
                'error' => 'Failed to connect to AI service',
                'message' => $e->getMessage(),
                'success' => false,
            ];
        }
    }

    private function buildTicketEventDedupeKey(string $eventType, string $ticketId, array $payload): string
    {
        $vendorScope = AiSupportPlugin::config('vendor_id', '');
        if ($vendorScope === '') {
            $vendorScope = substr(sha1($this->apiKey), 0, 12);
        }

        $suffix = '';

        if (!empty($payload['reply_id'])) {
            $suffix = (string) $payload['reply_id'];
        } elseif (!empty($payload['timestamp'])) {
            $suffix = (string) $payload['timestamp'];
        } else {
            $suffix = $eventType;
        }

        return "xboard:{$vendorScope}:{$ticketId}:{$eventType}:{$suffix}";
    }
}

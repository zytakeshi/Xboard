<?php

namespace Plugin\AiSupport;

use App\Models\Plugin as PluginModel;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Plugin\AiSupport\Services\ThemeBootstrapManager;

/**
 * Static helper facade for the installable AiSupport plugin package.
 */
class AiSupportPlugin
{
    public const CODE = 'ai_support';
    public const VERSION = '1.2.1';
    public const NAME = 'AiSupport';
    protected static bool $pairAttemptInProgress = false;
    protected static string $lastPairUrl = '';
    protected static int $lastPairAttemptAt = 0;
    protected static bool $knowledgeImportAttemptInProgress = false;
    protected static string $lastKnowledgeImportScope = '';
    protected static int $lastKnowledgeImportAttemptAt = 0;

    public static function isInstalled(): bool
    {
        return self::pluginRecord() !== null;
    }

    public static function isEnabled(): bool
    {
        return (bool) (self::pluginRecord()?->is_enabled ?? false);
    }

    public static function config(string $key, mixed $default = null): mixed
    {
        self::ensurePaired();
        $config = self::allConfig();
        return array_key_exists($key, $config) ? $config[$key] : $default;
    }

    /**
     * @return array<string, mixed>
     */
    public static function allConfig(): array
    {
        self::ensurePaired();
        return array_merge(self::defaults(), self::rawConfig());
    }

    /**
     * @param array<string, mixed> $values
     */
    public static function saveConfig(array $values): void
    {
        $plugin = self::pluginRecord();
        if (!$plugin) {
            return;
        }

        $config = array_merge(self::rawConfig(), $values);
        $plugin->config = json_encode($config, JSON_UNESCAPED_UNICODE);
        $plugin->save();

        ThemeBootstrapManager::sync();
    }

    public static function ensurePaired(): void
    {
        if (!self::isInstalled() || !self::isEnabled()) {
            return;
        }

        $config = array_merge(self::defaults(), self::rawConfig());
        $connectUrl = trim((string) ($config['connect_url'] ?? ''));
        $hasCredentials = trim((string) ($config['service_url'] ?? '')) !== ''
            && trim((string) ($config['vendor_id'] ?? '')) !== ''
            && trim((string) ($config['api_key'] ?? '')) !== ''
            && trim((string) ($config['api_secret'] ?? '')) !== ''
            && trim((string) ($config['connector_key'] ?? '')) !== ''
            && trim((string) ($config['connector_secret'] ?? '')) !== '';

        if ($connectUrl === '' || $hasCredentials) {
            return;
        }

        $now = time();
        if (
            self::$pairAttemptInProgress
            || (self::$lastPairUrl === $connectUrl && ($now - self::$lastPairAttemptAt) < 30)
        ) {
            return;
        }

        self::$pairAttemptInProgress = true;
        self::$lastPairUrl = $connectUrl;
        self::$lastPairAttemptAt = $now;

        try {
            $panelUrl = rtrim((string) admin_setting('app_url', ''), '/');
            $callbackUrl = $panelUrl !== '' ? $panelUrl . '/api/v1' : '';
            if ($callbackUrl === '') {
                self::saveConfig(['pairing_error' => 'Xboard app_url is not configured']);
                return;
            }

            $response = Http::acceptJson()
                ->timeout(max(5, (int) ($config['http_timeout'] ?? 30)))
                ->post($connectUrl, [
                    'callback_url' => $callbackUrl,
                    'panel_url' => $panelUrl,
                    'plugin_version' => self::VERSION,
                ]);

            if (!$response->successful()) {
                self::saveConfig([
                    'pairing_error' => 'Pairing failed: HTTP ' . $response->status(),
                ]);
                return;
            }

            $body = $response->json();
            if (!is_array($body)) {
                self::saveConfig(['pairing_error' => 'Pairing failed: invalid response']);
                return;
            }

            $serviceUrl = trim((string) ($body['service_url'] ?? ''));
            $vendorId = trim((string) ($body['vendor_id'] ?? ''));
            $apiKey = trim((string) ($body['api_key'] ?? ''));
            $apiSecret = trim((string) ($body['api_secret'] ?? ''));
            $connectorKey = trim((string) ($body['connector_key'] ?? $apiKey));
            $connectorSecret = trim((string) ($body['connector_secret'] ?? $apiSecret));

            if (
                $serviceUrl === ''
                || $vendorId === ''
                || $apiKey === ''
                || $apiSecret === ''
                || $connectorKey === ''
                || $connectorSecret === ''
            ) {
                self::saveConfig(['pairing_error' => 'Pairing failed: incomplete response']);
                return;
            }

            self::saveConfig([
                'connect_url' => '',
                'service_url' => $serviceUrl,
                'vendor_id' => $vendorId,
                'api_key' => $apiKey,
                'api_secret' => $apiSecret,
                'connector_key' => $connectorKey,
                'connector_secret' => $connectorSecret,
                'paired_at' => now()->toIso8601String(),
                'pairing_error' => null,
                'knowledge_imported_at' => null,
                'knowledge_import_error' => null,
                'knowledge_import_last_result' => null,
            ]);
            self::ensureKnowledgeImported();
        } catch (\Throwable $e) {
            Log::warning('AiSupport pairing failed', ['error' => $e->getMessage()]);
            self::saveConfig([
                'pairing_error' => 'Pairing failed: ' . $e->getMessage(),
            ]);
        } finally {
            self::$pairAttemptInProgress = false;
        }
    }

    public static function removeThemeBootstrap(): void
    {
        ThemeBootstrapManager::remove();
    }

    public static function ensureKnowledgeImported(): void
    {
        if (!self::isInstalled() || !self::isEnabled()) {
            return;
        }

        $config = array_merge(self::defaults(), self::rawConfig());
        $serviceUrl = trim((string) ($config['service_url'] ?? ''));
        $apiKey = trim((string) ($config['api_key'] ?? ''));
        $apiSecret = trim((string) ($config['api_secret'] ?? ''));

        if ($serviceUrl === '' || $apiKey === '' || $apiSecret === '') {
            return;
        }

        if (!empty($config['knowledge_imported_at']) || !empty($config['knowledge_import_error'])) {
            return;
        }

        $scope = $serviceUrl . '|' . $apiKey;
        $now = time();

        if (
            self::$knowledgeImportAttemptInProgress
            || (self::$lastKnowledgeImportScope === $scope && ($now - self::$lastKnowledgeImportAttemptAt) < 60)
        ) {
            return;
        }

        self::$knowledgeImportAttemptInProgress = true;
        self::$lastKnowledgeImportScope = $scope;
        self::$lastKnowledgeImportAttemptAt = $now;

        try {
            $path = '/api/v1/knowledge/import-from-panel';
            $timestamp = (string) $now;
            $signature = hash_hmac('sha256', "{$timestamp}:POST:{$path}:", $apiSecret);

            $response = Http::acceptJson()
                ->withHeaders([
                    'X-Connector-Key' => $apiKey,
                    'X-Connector-Signature' => $signature,
                    'X-Timestamp' => $timestamp,
                    'Content-Type' => 'application/json',
                ])
                ->timeout(max(5, (int) ($config['http_timeout'] ?? 30)))
                ->withBody('', 'application/json')
                ->post(rtrim($serviceUrl, '/') . $path);

            if (!$response->successful()) {
                self::saveConfig([
                    'knowledge_import_error' => 'Initial knowledge import failed: HTTP ' . $response->status(),
                    'knowledge_import_last_result' => [
                        'status' => $response->status(),
                        'body' => $response->json() ?? $response->body(),
                    ],
                ]);
                return;
            }

            $body = $response->json();
            self::saveConfig([
                'knowledge_imported_at' => now()->toIso8601String(),
                'knowledge_import_error' => null,
                'knowledge_import_last_result' => is_array($body) ? $body : [],
            ]);
        } catch (\Throwable $e) {
            Log::warning('AiSupport initial knowledge import failed', ['error' => $e->getMessage()]);
            self::saveConfig([
                'knowledge_import_error' => 'Initial knowledge import failed: ' . $e->getMessage(),
            ]);
        } finally {
            self::$knowledgeImportAttemptInProgress = false;
        }
    }

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return require __DIR__ . '/config.php';
    }

    /**
     * @return array<string, mixed>
     */
    public static function rawConfig(): array
    {
        $plugin = self::pluginRecord();
        if (!$plugin || empty($plugin->config)) {
            return [];
        }

        $decoded = json_decode($plugin->config, true);
        return is_array($decoded) ? $decoded : [];
    }

    protected static function pluginRecord(): ?PluginModel
    {
        return PluginModel::query()
            ->where('code', self::CODE)
            ->first();
    }
}

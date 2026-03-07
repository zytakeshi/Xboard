<?php

namespace Plugin\AiSupport\Commands;

use Plugin\AiSupport\AiSupportPlugin;
use Plugin\AiSupport\Services\AiApiClient;
use Illuminate\Console\Command;

class ConnectorSmokeTest extends Command
{
    protected $signature = 'ai-support:smoke-test';
    protected $description = 'Run smoke tests against the central AI service';

    public function handle(): int
    {
        if (!AiSupportPlugin::isEnabled()) {
            $this->error('AI Support plugin is not enabled.');
            return self::FAILURE;
        }

        $client = new AiApiClient();
        $passed = 0;
        $failed = 0;

        // Test 1: Health check
        $this->info('Testing health check (testConnection)...');
        try {
            $result = $client->testConnection();
            if (($result['success'] ?? false) || isset($result['status']) && $result['status'] !== 'error') {
                $this->info('  [PASS] Health check');
                $passed++;
            } else {
                $this->error('  [FAIL] Health check: ' . ($result['error'] ?? 'unknown error'));
                $failed++;
            }
        } catch (\Throwable $e) {
            $this->error('  [FAIL] Health check: ' . $e->getMessage());
            $failed++;
        }

        // Test 2: Get config
        $this->info('Testing getConfig...');
        try {
            $result = $client->getConfig();
            if (!isset($result['error']) || ($result['success'] ?? false)) {
                $this->info('  [PASS] getConfig');
                $passed++;
            } else {
                $this->error('  [FAIL] getConfig: ' . ($result['error'] ?? 'unknown error'));
                $failed++;
            }
        } catch (\Throwable $e) {
            $this->error('  [FAIL] getConfig: ' . $e->getMessage());
            $failed++;
        }

        // Test 3: Get stats
        $this->info('Testing getStats...');
        try {
            $result = $client->getStats();
            if (!isset($result['error']) || ($result['success'] ?? false)) {
                $this->info('  [PASS] getStats');
                $passed++;
            } else {
                $this->error('  [FAIL] getStats: ' . ($result['error'] ?? 'unknown error'));
                $failed++;
            }
        } catch (\Throwable $e) {
            $this->error('  [FAIL] getStats: ' . $e->getMessage());
            $failed++;
        }

        $this->newLine();
        $this->info("Results: {$passed} passed, {$failed} failed");

        return $failed > 0 ? self::FAILURE : self::SUCCESS;
    }
}

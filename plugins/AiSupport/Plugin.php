<?php

namespace Plugin\AiSupport;

use App\Services\Plugin\AbstractPlugin;
use Illuminate\Support\Facades\File;
use Plugin\AiSupport\Services\ThemeBootstrapManager;

class Plugin extends AbstractPlugin
{
    public function boot(): void
    {
        $this->syncWidgetAssets();
        AiSupportPlugin::ensurePaired();
        AiSupportPlugin::ensureKnowledgeImported();
        ThemeBootstrapManager::sync();
    }

    public function install(): void
    {
        $this->syncWidgetAssets();
        ThemeBootstrapManager::sync();
    }

    public function cleanup(): void
    {
        ThemeBootstrapManager::remove();

        $publicAssets = public_path('plugins/' . AiSupportPlugin::CODE);
        if (File::exists($publicAssets)) {
            File::deleteDirectory($publicAssets);
        }
    }

    /**
     * @param array<string, mixed> $newConfig
     * @param array<string, mixed> $oldConfig
     */
    public function onConfigUpdated(array $newConfig, array $oldConfig = []): void
    {
        $this->syncWidgetAssets();
        AiSupportPlugin::ensurePaired();
        AiSupportPlugin::ensureKnowledgeImported();
        ThemeBootstrapManager::sync();
    }

    private function syncWidgetAssets(): void
    {
        $sourcePath = $this->getBasePath() . '/resources/widget';
        if (!File::exists($sourcePath)) {
            return;
        }

        $publishPath = public_path('plugins/' . AiSupportPlugin::CODE . '/widget');
        File::ensureDirectoryExists($publishPath);
        File::copyDirectory($sourcePath, $publishPath);
    }
}

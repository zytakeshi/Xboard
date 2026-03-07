<?php

namespace App\Plugins\AiSupport;

/**
 * AiSupport Plugin Bootstrap
 *
 * Provides AI-powered customer support integration for Xboard panels.
 * This plugin implements the AirPilot Connector Interface, enabling the
 * central AI service to access Xboard user data, tickets, and knowledge base.
 */
class AiSupportPlugin
{
    /**
     * Plugin version.
     */
    public const VERSION = '1.0.0';

    /**
     * Plugin name.
     */
    public const NAME = 'AiSupport';

    /**
     * Whether the plugin is enabled.
     */
    public static function isEnabled(): bool
    {
        return (bool) admin_setting('ai_support_enabled', false);
    }

    /**
     * Get plugin configuration value.
     */
    public static function config(string $key, mixed $default = null): mixed
    {
        return admin_setting("ai_support_{$key}", $default);
    }

    /**
     * Get all plugin configuration values.
     *
     * @return array<string, mixed>
     */
    public static function allConfig(): array
    {
        $defaults = require __DIR__ . '/config.php';
        $config = [];

        foreach ($defaults as $key => $default) {
            $config[$key] = admin_setting("ai_support_{$key}", $default);
        }

        return $config;
    }

    /**
     * Save plugin configuration values.
     *
     * @param array<string, mixed> $values
     */
    public static function saveConfig(array $values): void
    {
        $settings = [];
        foreach ($values as $key => $value) {
            $settings["ai_support_{$key}"] = $value;
        }

        admin_setting($settings);
    }
}

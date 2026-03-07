<?php

namespace Plugin\AiSupport\Services;

use App\Services\ThemeService;
use Plugin\AiSupport\AiSupportPlugin;

class ThemeBootstrapManager
{
    private const MARKER_START = '<!-- AIRPILOT_WIDGET_BOOTSTRAP_START -->';
    private const MARKER_END = '<!-- AIRPILOT_WIDGET_BOOTSTRAP_END -->';

    public static function sync(): void
    {
        $theme = admin_setting('frontend_theme', 'Xboard');
        $themeService = app(ThemeService::class);
        $themeConfig = $themeService->getConfig($theme) ?? [];
        $currentHtml = (string) ($themeConfig['custom_html'] ?? '');
        $cleanHtml = self::stripManagedSnippet($currentHtml);

        if (!self::shouldInject()) {
            if ($currentHtml !== $cleanHtml) {
                $themeService->updateConfig($theme, ['custom_html' => $cleanHtml]);
            }
            return;
        }

        $snippet = self::managedSnippet();
        $combined = trim($cleanHtml) === '' ? $snippet : rtrim($cleanHtml) . "\n" . $snippet;
        if ($currentHtml === $combined) {
            return;
        }
        $themeService->updateConfig($theme, ['custom_html' => $combined]);
    }

    public static function remove(): void
    {
        $theme = admin_setting('frontend_theme', 'Xboard');
        $themeService = app(ThemeService::class);
        $themeConfig = $themeService->getConfig($theme) ?? [];
        $currentHtml = (string) ($themeConfig['custom_html'] ?? '');
        $cleanHtml = self::stripManagedSnippet($currentHtml);

        if ($currentHtml !== $cleanHtml) {
            $themeService->updateConfig($theme, ['custom_html' => $cleanHtml]);
        }
    }

    private static function shouldInject(): bool
    {
        return AiSupportPlugin::isEnabled()
            && (bool) AiSupportPlugin::config('widget_enabled', true)
            && trim((string) AiSupportPlugin::config('service_url', '')) !== ''
            && trim((string) AiSupportPlugin::config('api_key', '')) !== ''
            && trim((string) AiSupportPlugin::config('api_secret', '')) !== ''
            && trim((string) AiSupportPlugin::config('vendor_id', '')) !== '';
    }

    private static function managedSnippet(): string
    {
        $widgetUrl = '/plugins/ai_support/widget/airpilot-widget.js?v=' . rawurlencode(AiSupportPlugin::VERSION);

        return self::MARKER_START . "\n" . str_replace('__AIRPILOT_WIDGET_URL__', $widgetUrl, <<<'HTML'
<script>
(function () {
  if (window.__airpilotBootstrapInstalled) return;
  window.__airpilotBootstrapInstalled = true;

  var widgetScriptLoaded = false;
  var widgetStarted = false;

  function getAuthToken() {
    try {
      var raw = window.localStorage.getItem('authorization');
      if (!raw) return '';
      if (raw.indexOf('{') === 0) {
        var parsed = JSON.parse(raw);
        return parsed && parsed.value ? String(parsed.value).replace(/^Bearer\s+/i, '') : '';
      }
      return String(raw).replace(/^Bearer\s+/i, '');
    } catch (e) {
      return '';
    }
  }

  function currentHash() {
    return (window.location.hash || '').toLowerCase();
  }

  function shouldStart() {
    var hash = currentHash();
    if (!hash || hash === '#/' || hash.indexOf('#/dashboard') === 0) return true;
    if (hash.indexOf('#/login') === 0 || hash.indexOf('#/register') === 0 || hash.indexOf('#/forget') === 0) {
      return false;
    }
    return true;
  }

  function initWidget() {
    if (widgetStarted || !window.AirPilot || !window.AirPilot.init) return;
    var token = getAuthToken();
    if (!token || !shouldStart()) return;

    widgetStarted = true;
    window.AirPilot.init({
      apiBaseUrl: '/api/v1/user/ai-support',
      authToken: token,
      locale: (window.localStorage.getItem('i18nextLng') || 'zh-CN'),
      theme: 'auto',
      widgetName: 'AI 客服',
      aiNickname: 'AirPilot',
      enableEscalation: true,
      enableAttachments: false
    });
  }

  function ensureScript() {
    if (widgetScriptLoaded) {
      initWidget();
      return;
    }
    widgetScriptLoaded = true;
    var script = document.createElement('script');
    script.src = '__AIRPILOT_WIDGET_URL__';
    script.async = true;
    script.onload = initWidget;
    document.head.appendChild(script);
  }

  function tick() {
    if (widgetStarted) return;
    if (!getAuthToken() || !shouldStart()) return;
    ensureScript();
  }

  setInterval(tick, 1000);
  window.addEventListener('hashchange', tick);
  window.addEventListener('load', tick);
  tick();
})();
</script>
HTML)
        . "\n" . self::MARKER_END;
    }

    private static function stripManagedSnippet(string $html): string
    {
        $pattern = '/' . preg_quote(self::MARKER_START, '/') . '.*?' . preg_quote(self::MARKER_END, '/') . '\s*/s';
        return trim((string) preg_replace($pattern, '', $html));
    }
}

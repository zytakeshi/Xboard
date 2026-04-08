<?php

namespace App\Http\Controllers\V1\Guest;

use App\Http\Controllers\Controller;
use App\Services\Plugin\HookManager;
use App\Utils\Dict;
use App\Utils\Helper;
use Illuminate\Support\Facades\Http;

class CommController extends Controller
{
    public function config()
    {
        $data = ['app_name'=>'VPNCheap',
            'tos_url' => admin_setting('tos_url'),
            'is_email_verify' => (int) admin_setting('email_verify', 0) ? 1 : 0,
            'is_invite_force' => (int) admin_setting('invite_force', 0) ? 1 : 0,
            'email_whitelist_suffix' => (int) admin_setting('email_whitelist_enable', 0)
                ? Helper::getEmailSuffix()
                : 0,
            'is_captcha' => (int) admin_setting('captcha_enable', 0) ? 1 : 0,
            'captcha_type' => admin_setting('captcha_type', 'recaptcha'),
            'recaptcha_site_key' => admin_setting('recaptcha_site_key'),
            'recaptcha_v3_site_key' => admin_setting('recaptcha_v3_site_key'),
            'recaptcha_v3_score_threshold' => admin_setting('recaptcha_v3_score_threshold', 0.5),
            'turnstile_site_key' => admin_setting('turnstile_site_key'),
            'app_description' => admin_setting('app_description'),
            'app_url' => admin_setting('app_url'),
            'logo' => admin_setting('logo'),
            // 保持向后兼容
            'is_recaptcha' => (int) admin_setting('captcha_enable', 0) ? 1 : 0,
            // Payment visibility configuration for H5 payments
            'payment_config' => $this->getPaymentConfig(),
            // Server-controlled 专线/直连 route filter toggle. Absent or
            // false → clients merge transit and direct nodes into a
            // single premium list (mix mode). Set to true to restore the
            // legacy tabbed behavior.
            'node_filter_config' => $this->getNodeFilterConfig(),
        ];

        $data = HookManager::filter('guest_comm_config', $data);

        return $this->success($data);
    }

    /**
     * Get payment visibility configuration for H5 payments
     * 
     * @return array Payment configuration settings
     */
    private function getPaymentConfig()
    {
        $configPath = storage_path('app/payment_visibility.json');
        $defaultConfig = [
            'h5_payment_enabled' => 1,
            'h5_payment_regions' => ['US'],
            'h5_payment_blocked_regions' => [],
            'config_version' => '1.0.0',
            'fallback_behavior' => 'hide'
        ];
        
        if (file_exists($configPath)) {
            $fileContent = file_get_contents($configPath);
            $config = json_decode($fileContent, true);
            if ($config && is_array($config)) {
                return array_merge($defaultConfig, $config);
            }
        }

        return $defaultConfig;
    }

    /**
     * Get server-controlled node route filter configuration.
     *
     * Absent field or `route_filter_enabled = false` → mix mode (clients
     * merge 专线/直连 into one flat premium list). `true` → legacy
     * tabbed behavior. Mirrors the IAP/H5-payment visibility pattern.
     *
     * @return array Node filter configuration settings
     */
    private function getNodeFilterConfig()
    {
        $configPath = storage_path('app/node_filter_config.json');
        $defaultConfig = [
            'route_filter_enabled' => false,
            'config_version' => '1.0.0',
        ];

        if (file_exists($configPath)) {
            $fileContent = file_get_contents($configPath);
            $config = json_decode($fileContent, true);
            if ($config && is_array($config)) {
                return array_merge($defaultConfig, $config);
            }
        }

        return $defaultConfig;
    }
}

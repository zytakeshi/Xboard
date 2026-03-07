<?php

namespace App\Plugins\AiSupport\Controllers;

use App\Http\Controllers\Controller;
use App\Plugins\AiSupport\AiSupportPlugin;
use App\Plugins\AiSupport\Services\AiApiClient;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

/**
 * Admin Controller — configuration pages for the AiSupport plugin.
 *
 * Routes are protected by the 'admin' middleware.
 */
class AdminController extends Controller
{
    /**
     * GET /api/v1/admin/ai-support/settings
     *
     * Returns current plugin settings.
     */
    public function getSettings(): JsonResponse
    {
        $config = AiSupportPlugin::allConfig();

        // Mask sensitive values for display
        $masked = $config;
        foreach (['api_secret', 'connector_secret', 'openai_key'] as $key) {
            if (!empty($masked[$key])) {
                $masked[$key] = str_repeat('*', min(strlen($masked[$key]), 8))
                    . substr($masked[$key], -4);
            }
        }

        return response()->json([
            'settings' => $masked,
            'version' => AiSupportPlugin::VERSION,
        ]);
    }

    /**
     * POST /api/v1/admin/ai-support/settings
     *
     * Updates plugin settings.
     */
    public function saveSettings(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'enabled' => 'sometimes|boolean',
            'service_url' => 'sometimes|nullable|url',
            'api_key' => 'sometimes|nullable|string|max:255',
            'api_secret' => 'sometimes|nullable|string|max:255',
            'connector_key' => 'sometimes|nullable|string|max:255',
            'connector_secret' => 'sometimes|nullable|string|max:255',
            'vendor_id' => 'sometimes|nullable|string|max:100',
            'hmac_timestamp_tolerance' => 'sometimes|integer|min:60|max:600',
            'http_timeout' => 'sometimes|integer|min:5|max:120',
            'http_retries' => 'sometimes|integer|min:0|max:5',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()->toArray(),
            ], 422);
        }

        $defaults = require base_path('app/Plugins/AiSupport/config.php');
        $validKeys = array_keys($defaults);

        $values = [];
        foreach ($request->all() as $key => $value) {
            if (in_array($key, $validKeys, true)) {
                $values[$key] = $value;
            }
        }

        if (!empty($values)) {
            AiSupportPlugin::saveConfig($values);
        }

        return response()->json(['success' => true]);
    }

    /**
     * POST /api/v1/admin/ai-support/test-connection
     *
     * Tests connectivity with the central AI service.
     */
    public function testConnection(): JsonResponse
    {
        $client = new AiApiClient();
        $result = $client->testConnection();

        if ($result['success'] ?? false) {
            return response()->json([
                'connected' => true,
                'message' => 'Connection successful',
                'response' => $result,
            ]);
        }

        return response()->json([
            'connected' => false,
            'message' => $result['error'] ?? 'Connection failed',
            'details' => $result,
        ], 502);
    }

    /**
     * POST /api/v1/admin/ai-support/reindex
     *
     * Triggers a full knowledge base reindex on the central AI service.
     */
    public function reindex(): JsonResponse
    {
        $client = new AiApiClient();
        $result = $client->reindexAll();

        if ($result['success'] ?? false) {
            return response()->json([
                'success' => true,
                'message' => 'Reindex triggered successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => $result['error'] ?? 'Reindex failed',
        ], 500);
    }

    /**
     * POST /api/v1/admin/ai-support/openai-key
     *
     * Sets the BYOK OpenAI key.
     */
    public function setOpenAiKey(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'openai_key' => 'required|string|min:10|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'error' => 'Validation failed',
                'details' => $validator->errors()->toArray(),
            ], 422);
        }

        $key = $request->input('openai_key');

        // Store locally
        AiSupportPlugin::saveConfig(['openai_key' => $key]);

        // Push to central AI service
        $client = new AiApiClient();
        $result = $client->setOpenAiKey($key);

        if ($result['success'] ?? false) {
            return response()->json([
                'success' => true,
                'message' => 'OpenAI key set successfully',
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Key saved locally but failed to sync with AI service',
            'details' => $result,
        ], 500);
    }

    /**
     * GET /api/v1/admin/ai-support/stats
     *
     * Gets usage statistics from the central AI service.
     */
    public function getStats(): JsonResponse
    {
        $client = new AiApiClient();
        $result = $client->getStats();

        return response()->json($result);
    }
}

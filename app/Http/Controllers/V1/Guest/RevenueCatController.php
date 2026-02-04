<?php

namespace App\Http\Controllers\V1\Guest;

use App\Http\Controllers\Controller;
use App\Services\RevenueCatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class RevenueCatController extends Controller
{
    protected RevenueCatService $revenueCatService;

    public function __construct(RevenueCatService $revenueCatService)
    {
        $this->revenueCatService = $revenueCatService;
    }

    public function webhook(Request $request): JsonResponse
    {
        $authHeader = $request->header('Authorization');
        $expectedSecret = config('revenuecat.webhook_secret');

        if (!$expectedSecret) {
            Log::error('RevenueCat: Webhook secret not configured');
            return response()->json(['error' => 'Server configuration error'], 500);
        }

        $expectedSecret = trim($expectedSecret);
        $expectedBearer = Str::startsWith($expectedSecret, 'Bearer ')
            ? $expectedSecret
            : "Bearer {$expectedSecret}";
        $expectedRaw = Str::startsWith($expectedSecret, 'Bearer ')
            ? substr($expectedSecret, strlen('Bearer '))
            : $expectedSecret;

        if ($authHeader !== $expectedBearer && $authHeader !== $expectedRaw) {
            Log::warning('RevenueCat: Invalid authorization header', [
                'ip' => $request->ip(),
            ]);
            return response()->json(['error' => 'Unauthorized'], 401);
        }

        $payload = $request->all();
        if (empty($payload)) {
            return response()->json(['error' => 'Empty payload'], 400);
        }

        Log::info('RevenueCat: Webhook received', [
            'type' => $payload['event']['type'] ?? 'unknown',
            'app_user_id' => $payload['event']['app_user_id'] ?? 'unknown',
        ]);

        try {
            $result = $this->revenueCatService->processWebhook($payload);

            if ($result['success']) {
                return response()->json(['status' => 'ok'], 200);
            }

            return response()->json([
                'error' => $result['error'] ?? 'Processing failed',
            ], 422);
        } catch (\Exception $e) {
            Log::error('RevenueCat: Webhook processing exception', [
                'error' => $e->getMessage(),
            ]);

            return response()->json(['error' => 'Internal error'], 500);
        }
    }
}

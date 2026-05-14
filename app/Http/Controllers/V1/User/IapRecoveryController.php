<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Services\RevenueCatService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IapRecoveryController extends Controller
{
    /**
     * Forward an unreconciled App Store transaction ID to the server so it can
     * attempt to attribute the underlying RevenueCat receipt to the
     * authenticated xboard user and replay the original webhook side-effects
     * (order creation, plan grant, etc.).
     *
     * Used by the iOS client post-signup / post-login to recover IAPs that
     * fired their RC webhook before the user finished provisioning on xboard.
     *
     * Response shapes match the recovery contract documented by the team
     * lead — flat `{ "message": ... }` for error cases and `{ "data": {...} }`
     * for success — so they intentionally bypass the project's
     * `ApiResponse::success()` / `::fail()` envelope, which would wrap them in
     * `{ status, message, data, error }` and break the iOS client parser.
     */
    public function recoverReceipt(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'transaction_id' => 'required|string|max:128',
            'app_user_id' => 'nullable|string|max:255',
            'product_id' => 'nullable|string|max:128',
        ]);

        $authUser = $request->user();
        if (!$authUser) {
            // Laravel auth middleware should already 401 before us, but
            // defend against misconfiguration so we never call the service
            // with a null user.
            return response()->json(['message' => 'unauthenticated'], 401);
        }

        $transactionId = $validated['transaction_id'];
        $appUserId = $validated['app_user_id'] ?? null;

        try {
            $result = app(RevenueCatService::class)->recoverByTransactionId(
                $transactionId,
                $appUserId,
                $authUser
            );
        } catch (\Throwable $e) {
            \Log::error('IAP receipt recovery threw unexpected exception', [
                'user_id' => $authUser->id,
                'transaction_id' => $transactionId,
                'app_user_id' => $appUserId,
                'product_id' => $validated['product_id'] ?? null,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'internal_error'], 500);
        }

        $success = (bool) ($result['success'] ?? false);
        $message = (string) ($result['message'] ?? 'replay_failed');
        $orderId = $result['order_id'] ?? null;
        $eventId = $result['event_id'] ?? null;

        if ($success) {
            // 'recovered' and 'already_processed' both surface as 200 with a
            // data envelope so the client can branch on `message`.
            return response()->json([
                'data' => [
                    'order_id' => $orderId,
                    'event_id' => $eventId,
                    'message' => $message,
                ],
            ], 200);
        }

        switch ($message) {
            case 'transaction_not_found':
                return response()->json(['message' => 'transaction_not_found'], 404);

            case 'ownership_mismatch':
                return response()->json(['message' => 'ownership_mismatch'], 403);

            case 'replay_failed':
                return response()->json([
                    'message' => 'replay_failed',
                    'event_id' => $eventId,
                ], 500);

            default:
                // Defensive: service returned an unknown failure code. Log
                // it loudly so we can extend the contract, then fall back
                // to a generic 500 rather than leaking the internal label.
                \Log::error('IAP receipt recovery returned unknown failure message', [
                    'user_id' => $authUser->id,
                    'transaction_id' => $transactionId,
                    'message' => $message,
                    'event_id' => $eventId,
                    'order_id' => $orderId,
                ]);
                return response()->json([
                    'message' => 'replay_failed',
                    'event_id' => $eventId,
                ], 500);
        }
    }
}

<?php

namespace Plugin\AiSupport\Middleware;

use Plugin\AiSupport\AiSupportPlugin;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * HMAC-SHA256 authentication middleware for connector callbacks.
 *
 * Validates that incoming requests from the central AI service
 * are properly signed and within the allowed timestamp window.
 *
 * Signature format: HMAC-SHA256("{timestamp}:{method}:{path}:{body}", connector_secret)
 */
class ConnectorAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!AiSupportPlugin::isEnabled()) {
            return response()->json([
                'error' => 'AI Support plugin is not enabled',
            ], 503);
        }

        $apiKey = $request->header('X-Connector-Key');
        $signature = $request->header('X-Connector-Signature');
        $timestamp = $request->header('X-Timestamp');

        // Validate required headers are present
        if (!$apiKey || !$signature || !$timestamp) {
            return response()->json([
                'error' => 'Missing authentication headers',
            ], 401);
        }

        // Validate API key matches
        $storedKey = AiSupportPlugin::config('connector_key', '');
        if (!hash_equals($storedKey, $apiKey)) {
            return response()->json([
                'error' => 'Invalid API key',
            ], 401);
        }

        // Validate timestamp is within tolerance window
        $tolerance = (int) AiSupportPlugin::config('hmac_timestamp_tolerance', 300);
        $timestampInt = (int) $timestamp;
        $now = time();

        if (abs($now - $timestampInt) > $tolerance) {
            return response()->json([
                'error' => 'Request timestamp expired',
            ], 401);
        }

        // Reconstruct and verify HMAC signature
        $method = strtoupper($request->method());
        $path = '/' . ltrim($request->path(), '/');
        $query = (string) $request->server->get('QUERY_STRING', '');
        if (!empty($query)) {
            $path .= '?' . $query;
        }
        $body = $request->getContent() ?: '';

        $payload = "{$timestamp}:{$method}:{$path}:{$body}";
        $secret = AiSupportPlugin::config('connector_secret', '');
        $expectedSignature = hash_hmac('sha256', $payload, $secret);

        if (!hash_equals($expectedSignature, $signature)) {
            return response()->json([
                'error' => 'Invalid signature',
            ], 401);
        }

        return $next($request);
    }
}

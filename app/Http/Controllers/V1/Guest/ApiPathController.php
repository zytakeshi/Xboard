<?php

namespace App\Http\Controllers\V1\Guest;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class ApiPathController extends Controller
{
    private const FILENAME = 'api_failover_domains.txt';
    private const CACHE_KEY = 'api_failover_domains';
    private const CACHE_TTL = 300; // 5 minutes
    
    private $defaultDomains = [
        'https://isoxmkyga-sjkzmlsmckajdnkn.cc',

    ];
    
    /**
     * Get the list of configured API domains
     * 
     * This endpoint is publicly accessible and provides failover domains
     * for client applications to use when the primary domain is blocked
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function getDomains(Request $request): JsonResponse
    {
        try {
            // Try to get from cache first
            $domains = Cache::remember(self::CACHE_KEY, self::CACHE_TTL, function () {
                return $this->loadDomainsFromFile();
            });
            
            // Return with CORS headers for cross-origin access
            return response()->json([
                'status' => true,
                'domains' => $domains
            ])->header('Access-Control-Allow-Origin', '*')
              ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
              ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
            
        } catch (\Throwable $e) {
            // Log error and return default domains
            Log::error('ApiPath error: ' . $e->getMessage());
            
            return response()->json([
                'status' => false,
                'message' => 'Failed to fetch domains',
                'domains' => $this->defaultDomains
            ], 500)->header('Access-Control-Allow-Origin', '*');
        }
    }
    
    /**
     * Load domains from file
     * 
     * @return array
     */
    private function loadDomainsFromFile(): array
    {
        // Check if file exists, create with defaults if not
        if (!Storage::disk('local')->exists(self::FILENAME)) {
            Storage::disk('local')->put(self::FILENAME, implode("\n", $this->defaultDomains));
            return $this->defaultDomains;
        }
        
        // Read domains from file
        $content = Storage::disk('local')->get(self::FILENAME);
        
        if (empty($content)) {
            return $this->defaultDomains;
        }
        
        // Parse domains (one per line)
        $domains = array_filter(array_map('trim', explode("\n", $content)));
        
        // Validate URLs
        $validDomains = array_values(array_filter($domains, function($domain) {
            return filter_var($domain, FILTER_VALIDATE_URL);
        }));
        
        // Use default if no valid domains
        if (empty($validDomains)) {
            return $this->defaultDomains;
        }
        
        return $validDomains;
    }
    
    /**
     * Handle OPTIONS request for CORS preflight
     * 
     * @param Request $request
     * @return JsonResponse
     */
    public function options(Request $request): JsonResponse
    {
        return response()->json(['status' => 'ok'])
            ->header('Access-Control-Allow-Origin', '*')
            ->header('Access-Control-Allow-Methods', 'GET, OPTIONS')
            ->header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    
    /**
     * Clear cache when domains are updated
     * Called internally when admin updates domains
     */
    public static function clearCache(): void
    {
        Cache::forget(self::CACHE_KEY);
    }
}
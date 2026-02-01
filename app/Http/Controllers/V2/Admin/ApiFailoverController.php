<?php

namespace App\Http\Controllers\V2\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class ApiFailoverController extends Controller
{
    private const FILENAME = 'api_failover_domains.txt';
    
    private $defaultDomains = [
        'https://ssrcloud.net',
        'https://api.ssrcloud.net',
        'https://backup.ssrcloud.net'
    ];
    
    /**
     * Fetch current API failover domains
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetch()
    {
        try {
            // Check if file exists, create with defaults if not
            if (!Storage::disk('local')->exists(self::FILENAME)) {
                Storage::disk('local')->put(self::FILENAME, implode("\n", $this->defaultDomains));
            }
            
            // Read domains from file
            $content = Storage::disk('local')->get(self::FILENAME);
            $domains = array_filter(array_map('trim', explode("\n", $content)));
            
            // If file is empty, use defaults
            if (empty($domains)) {
                $domains = $this->defaultDomains;
            }
            
            return $this->success([
                'domains' => array_values($domains),
                'file_path' => storage_path('app/' . self::FILENAME)
            ]);
            
        } catch (\Exception $e) {
            return $this->fail([500, 'Failed to fetch domains: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Save API failover domains
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function save(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domains' => 'required|array|min:1',
            'domains.*' => 'required|url'
        ]);
        
        if ($validator->fails()) {
            return $this->fail([422, $validator->errors()->first()]);
        }
        
        try {
            $domains = $request->input('domains');
            
            // Validate each URL
            $validDomains = [];
            foreach ($domains as $domain) {
                $domain = trim($domain);
                if (filter_var($domain, FILTER_VALIDATE_URL)) {
                    $validDomains[] = $domain;
                }
            }
            
            if (empty($validDomains)) {
                return $this->fail([422, 'No valid domains provided']);
            }
            
            // Write to file
            $content = implode("\n", $validDomains);
            Storage::disk('local')->put(self::FILENAME, $content);
            
            // Clear cache in ApiPathController
            \App\Http\Controllers\V1\Guest\ApiPathController::clearCache();
            
            return $this->success([
                'message' => 'Domains saved successfully',
                'count' => count($validDomains),
                'domains' => $validDomains
            ]);
            
        } catch (\Exception $e) {
            return $this->fail([500, 'Failed to save domains: ' . $e->getMessage()]);
        }
    }
    
    /**
     * Test domain connectivity (optional)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function test(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'domain' => 'required|url'
        ]);
        
        if ($validator->fails()) {
            return $this->fail([422, $validator->errors()->first()]);
        }
        
        $domain = $request->input('domain');
        
        try {
            // Test connectivity with curl
            $ch = curl_init($domain);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_NOBODY, true);
            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
            
            curl_exec($ch);
            $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            $error = curl_error($ch);
            curl_close($ch);
            
            if ($error) {
                return $this->success([
                    'domain' => $domain,
                    'status' => 'failed',
                    'message' => $error
                ]);
            }
            
            return $this->success([
                'domain' => $domain,
                'status' => 'success',
                'http_code' => $httpCode,
                'reachable' => $httpCode > 0
            ]);
            
        } catch (\Exception $e) {
            return $this->fail([500, 'Test failed: ' . $e->getMessage()]);
        }
    }
}
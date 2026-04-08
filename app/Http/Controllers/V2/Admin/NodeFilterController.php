<?php

namespace App\Http\Controllers\V2\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class NodeFilterController extends Controller
{
    private const FILENAME = 'node_filter_config.json';

    private $defaultConfig = [
        'route_filter_enabled' => false,
        'config_version' => '1.0.0',
    ];

    /**
     * Fetch current node filter configuration.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function fetch()
    {
        try {
            // Create the default file if it doesn't exist yet.
            if (!Storage::disk('local')->exists(self::FILENAME)) {
                Storage::disk('local')->put(
                    self::FILENAME,
                    json_encode($this->defaultConfig, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
                );
            }

            $content = Storage::disk('local')->get(self::FILENAME);
            $config = json_decode($content, true);

            if (!is_array($config)) {
                $config = $this->defaultConfig;
            }

            // Merge with defaults so missing keys are always present.
            $config = array_merge($this->defaultConfig, $config);

            return $this->success([
                'config' => $config,
                'file_path' => storage_path('app/' . self::FILENAME),
            ]);

        } catch (\Exception $e) {
            return $this->fail([500, 'Failed to fetch node filter config: ' . $e->getMessage()]);
        }
    }

    /**
     * Persist node filter configuration.
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function configure(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'route_filter_enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->fail([422, $validator->errors()->first()]);
        }

        try {
            // Start from the current on-disk config (or defaults if missing/invalid)
            // so we preserve any extra keys operators might have added manually.
            $existing = $this->defaultConfig;
            if (Storage::disk('local')->exists(self::FILENAME)) {
                $decoded = json_decode(Storage::disk('local')->get(self::FILENAME), true);
                if (is_array($decoded)) {
                    $existing = array_merge($this->defaultConfig, $decoded);
                }
            }

            $merged = array_merge($existing, [
                'route_filter_enabled' => (bool) $request->input('route_filter_enabled'),
            ]);

            Storage::disk('local')->put(
                self::FILENAME,
                json_encode($merged, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES)
            );

            return $this->success([
                'message' => 'Node filter configuration saved successfully',
                'config' => $merged,
            ]);

        } catch (\Exception $e) {
            return $this->fail([500, 'Failed to save node filter config: ' . $e->getMessage()]);
        }
    }
}

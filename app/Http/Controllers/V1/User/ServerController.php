<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Http\Resources\NodeResource;
use App\Models\User;
use App\Services\ServerService;
use App\Services\UserService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ServerController extends Controller
{
    public function fetch(Request $request)
    {
        $user = User::find($request->user()->id);
        if (!$user) {
            return $this->fail([400, __('The user does not exist')]);
        }

        $requestId = (string) Str::uuid();
        $servers = [];
        $userService = new UserService();
        $diagnostic = ServerService::getNodeDiagnostic($user);
        if ($userService->isAvailable($user)) {
            $servers = ServerService::getAvailableServers($user);
        }
        $eTag = sha1(json_encode([
            'reason_code' => $diagnostic['reason_code'] ?? null,
            'cache_keys' => array_column($servers, 'cache_key'),
        ]));
        if (strpos($request->header('If-None-Match', ''), $eTag) !== false ) {
            return response(null,304);
        }
        $data = NodeResource::collection($servers);
        return response([
            'data' => $data,
            'meta' => [
                'diagnostic_version' => $diagnostic['diagnostic_version'] ?? 1,
                'available' => $diagnostic['available'] ?? false,
                'reason_code' => $diagnostic['reason_code'] ?? UserService::DIAG_AVAILABLE,
                'reason_detail' => $diagnostic['reason_detail'] ?? null,
                'request_id' => $requestId,
                'server_count' => count($servers),
                'checks' => $diagnostic['checks'] ?? [],
            ],
        ])->header('ETag', "\"{$eTag}\"");
    }
}

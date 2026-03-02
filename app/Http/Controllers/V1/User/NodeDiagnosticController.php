<?php

namespace App\Http\Controllers\V1\User;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\ServerService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class NodeDiagnosticController extends Controller
{
    public function diagnose(Request $request)
    {
        $user = User::find($request->user()->id);
        if (!$user) {
            return $this->fail([400, __('The user does not exist')]);
        }

        $diagnostic = ServerService::getNodeDiagnostic($user);

        return $this->success(array_merge($diagnostic, [
            'request_id' => (string) Str::uuid(),
        ]));
    }
}

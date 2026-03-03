<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Laravel\Sanctum\PersonalAccessToken;

class AuthService
{
    private User $user;

    public function __construct(User $user)
    {
        $this->user = $user;
    }

    public function generateAuthData(?string $sessionName = null): array
    {
        return DB::transaction(function () use ($sessionName) {
            // Lock user row to serialize concurrent logins
            $user = User::query()
                ->with('plan:id,device_limit')
                ->whereKey($this->user->id)
                ->lockForUpdate()
                ->firstOrFail();

            $kickResult = $this->enforceSessionLimit($user);
            $tokenName = $this->normalizeSessionName($sessionName);

            $token = $user->createToken(
                $tokenName,
                ['*'],
                now()->addYear()
            );

            // Format token: remove ID prefix and add Bearer
            $tokenParts = explode('|', $token->plainTextToken);
            $formattedToken = 'Bearer ' . ($tokenParts[1] ?? $tokenParts[0]);

            return [
                'user_id' => $user->id,
                'token' => $user->token,
                'auth_data' => $formattedToken,
                'is_admin' => $user->is_admin,
                'device_limit' => $kickResult['device_limit'],
                'sessions_kicked' => $kickResult['kicked_count'],
            ];
        });
    }

    /**
     * Enforce session/device limit by removing oldest tokens when over limit.
     */
    private function enforceSessionLimit(User $user): array
    {
        $limit = $user->device_limit ?? $user->plan?->device_limit ?? 0;

        if ($limit <= 0) {
            return ['device_limit' => $limit, 'kicked_count' => 0, 'kicked_ids' => []];
        }

        $activeTokens = $user->tokens()
            ->where(function ($query) {
                $query->whereNull('expires_at')
                    ->orWhere('expires_at', '>', now());
            })
            ->orderByRaw('COALESCE(last_used_at, created_at) ASC')
            ->get();

        $count = $activeTokens->count();

        // Need room for the new token about to be created
        if ($count < $limit) {
            return ['device_limit' => $limit, 'kicked_count' => 0, 'kicked_ids' => []];
        }

        $toKick = $count - $limit + 1;
        $kickTargets = $activeTokens->take($toKick);
        $kickedIds = $kickTargets->pluck('id')->toArray();

        $user->tokens()->whereIn('id', $kickedIds)->delete();

        return [
            'device_limit' => $limit,
            'kicked_count' => count($kickedIds),
            'kicked_ids' => $kickedIds,
        ];
    }

    /**
     * Sanitize session name input. Falls back to web_XXXXXXXX if invalid.
     */
    private function normalizeSessionName(?string $sessionName): string
    {
        if ($sessionName !== null && preg_match('/^[a-zA-Z0-9_.\-]{1,100}$/', $sessionName)) {
            return $sessionName;
        }

        return 'web_' . Str::random(8);
    }

    public function getSessions(?int $currentSessionId = null): array
    {
        return $this->user->tokens()
            ->get()
            ->map(function ($token) use ($currentSessionId) {
                $session = $token->toArray();
                $session['is_current_session'] = $currentSessionId !== null
                    && (int) $token->id === (int) $currentSessionId;
                return $session;
            })
            ->values()
            ->toArray();
    }

    public function removeSession(string $sessionId, ?int $currentSessionId = null): bool
    {
        if (
            $currentSessionId !== null
            && (string) $currentSessionId === (string) $sessionId
        ) {
            // Keep backward-compatible behavior: removing current session is a no-op.
            return true;
        }

        $this->user->tokens()->where('id', $sessionId)->delete();
        return true;
    }

    public function removeAllSessions(): bool
    {
        $this->user->tokens()->delete();
        return true;
    }

    public static function findUserByBearerToken(string $bearerToken): ?User
    {
        $token = str_replace('Bearer ', '', $bearerToken);
        
        $accessToken = PersonalAccessToken::findToken($token);
        
        $tokenable = $accessToken?->tokenable;
        
        return $tokenable instanceof User ? $tokenable : null;
    }

    /**
     * 解密认证数据
     *
     * @param string $authorization
     * @return array|null 用户数据或null
     */
    public static function decryptAuthData(string $authorization): ?array
    {
        $user = self::findUserByBearerToken($authorization);
        
        if (!$user) {
            return null;
        }
        
        return [
            'id' => $user->id,
            'email' => $user->email,
            'is_admin' => (bool)$user->is_admin,
            'is_staff' => (bool)$user->is_staff
        ];
    }
}

<?php

namespace App\Services;

use App\Models\Plan;
use App\Models\Server;
use App\Models\ServerRoute;
use App\Models\User;
use App\Utils\Helper;
use Illuminate\Support\Collection;

class ServerService
{
    public const DIAG_PLAN_GROUP_MISMATCH = 'PLAN_GROUP_MISMATCH';
    public const DIAG_GROUP_ID_MISMATCH = 'GROUP_ID_MISMATCH';
    public const DIAG_NO_SERVERS_FOR_GROUP = 'NO_SERVERS_FOR_GROUP';
    public const DIAG_NO_VISIBLE_SERVERS = 'NO_VISIBLE_SERVERS';
    public const DIAG_NO_PLAN = 'NO_PLAN';


    /**
     * 获取所有服务器列表
     * @return Collection
     */
    public static function getAllServers(): Collection
    {
        $query = Server::orderBy('sort', 'ASC');

        return $query->get()->append([
            'last_check_at',
            'last_push_at',
            'online',
            'is_online',
            'available_status',
            'cache_key',
            'load_status'
        ]);
    }

    /**
     * 获取指定用户可用的服务器列表
     * @param User $user
     * @return array
     */
    public static function getAvailableServers(User $user): array
    {
        $servers = Server::whereJsonContains('group_ids', (string) $user->group_id)
            ->where('show', true)
            ->orderBy('sort', 'ASC')
            ->get()
            ->append(['last_check_at', 'last_push_at', 'online', 'is_online', 'available_status', 'cache_key', 'server_key']);

        $servers = collect($servers)->map(function ($server) use ($user) {
            // 判断动态端口
            if (str_contains($server->port, '-')) {
                $port = $server->port;
                $server->port = (int) Helper::randomPort($port);
                $server->ports = $port;
            } else {
                $server->port = (int) $server->port;
            }
            $server->password = $server->generateServerPassword($user);
            return $server;
        })->toArray();

        return $servers;
    }

    public static function countServersForGroup(?int $groupId): int
    {
        if ($groupId === null) {
            return 0;
        }

        return Server::whereJsonContains('group_ids', (string) $groupId)->count();
    }

    public static function countVisibleServersForGroup(?int $groupId): int
    {
        if ($groupId === null) {
            return 0;
        }

        return Server::whereJsonContains('group_ids', (string) $groupId)
            ->where('show', true)
            ->count();
    }

    public static function getNodeDiagnostic(User $user): array
    {
        $userService = app(UserService::class);
        $availability = $userService->getAvailabilityDiagnostic($user);
        $availabilityReason = $availability['reason_code'] ?? UserService::DIAG_AVAILABLE;

        $plan = null;
        if ($user->plan_id) {
            $plan = Plan::find($user->plan_id);
        }

        $userGroupId = $user->group_id !== null ? (int) $user->group_id : null;
        $planGroupId = $plan && $plan->group_id !== null ? (int) $plan->group_id : null;

        $serversForGroup = self::countServersForGroup($userGroupId);
        $visibleServersForGroup = self::countVisibleServersForGroup($userGroupId);

        $reasonCode = $availabilityReason;
        if ($availability['available']) {
            if (!$user->plan_id || !$plan) {
                $reasonCode = self::DIAG_NO_PLAN;
            } elseif ($planGroupId !== null && $userGroupId !== null && $planGroupId !== $userGroupId) {
                $reasonCode = self::DIAG_PLAN_GROUP_MISMATCH;
            } elseif ($userGroupId === null) {
                $reasonCode = self::DIAG_GROUP_ID_MISMATCH;
            } elseif ($serversForGroup <= 0) {
                $reasonCode = self::DIAG_NO_SERVERS_FOR_GROUP;
            } elseif ($visibleServersForGroup <= 0) {
                $reasonCode = self::DIAG_NO_VISIBLE_SERVERS;
            } else {
                $reasonCode = $availabilityReason === UserService::DIAG_TRANSFER_EXHAUSTED
                    ? UserService::DIAG_TRANSFER_EXHAUSTED
                    : UserService::DIAG_AVAILABLE;
            }
        }

        return [
            'diagnostic_version' => 1,
            'available' => $reasonCode === UserService::DIAG_AVAILABLE,
            'reason_code' => $reasonCode,
            'reason_detail' => self::buildReasonDetail(
                $reasonCode,
                $userGroupId,
                $planGroupId,
                $serversForGroup,
                $visibleServersForGroup
            ),
            'checks' => array_merge($availability['checks'], [
                'plan_exists' => $plan !== null,
                'plan_id' => $user->plan_id,
                'plan_group_id' => $planGroupId,
                'user_group_id' => $userGroupId,
                'servers_for_group' => $serversForGroup,
                'visible_servers_for_group' => $visibleServersForGroup,
            ]),
        ];
    }

    private static function buildReasonDetail(
        string $reasonCode,
        ?int $userGroupId,
        ?int $planGroupId,
        int $serversForGroup,
        int $visibleServersForGroup
    ): string {
        return match ($reasonCode) {
            self::DIAG_NO_PLAN =>
                'user has no valid plan',
            self::DIAG_PLAN_GROUP_MISMATCH =>
                "plan_group_id={$planGroupId}, user_group_id={$userGroupId}",
            self::DIAG_GROUP_ID_MISMATCH =>
                'user_group_id is null',
            self::DIAG_NO_SERVERS_FOR_GROUP =>
                "user_group_id={$userGroupId}, matched_servers={$serversForGroup}",
            self::DIAG_NO_VISIBLE_SERVERS =>
                "user_group_id={$userGroupId}, visible_servers={$visibleServersForGroup}",
            UserService::DIAG_USER_BANNED =>
                'user is banned',
            UserService::DIAG_NO_TRANSFER_ENABLE =>
                'transfer_enable <= 0',
            UserService::DIAG_SUBSCRIPTION_EXPIRED =>
                'expired_at <= now',
            UserService::DIAG_TRANSFER_EXHAUSTED =>
                'used traffic reached transfer_enable',
            default =>
                'node diagnostic resolved',
        };
    }

    /**
     * 根据权限组获取可用的用户列表
     * @param array $groupIds
     * @return Collection
     */
    public static function getAvailableUsers(array $groupIds)
    {
        return User::toBase()
            ->whereIn('group_id', $groupIds)
            ->whereRaw('u + d < transfer_enable')
            ->where(function ($query) {
                $query->where('expired_at', '>=', time())
                    ->orWhere('expired_at', NULL);
            })
            ->where('banned', 0)
            ->select([
                'id',
                'uuid',
                'speed_limit',
                'device_limit'
            ])
            ->get();
    }

    // 获取路由规则
    public static function getRoutes(array $routeIds)
    {
        $routes = ServerRoute::select(['id', 'match', 'action', 'action_value'])->whereIn('id', $routeIds)->get();
        return $routes;
    }

    /**
     * 根据协议类型和标识获取服务器
     * @param int $serverId
     * @param string $serverType
     * @return Server|null
     */
    public static function getServer($serverId, $serverType)
    {
        return Server::query()
            ->where('type', Server::normalizeType($serverType))
            ->where(function ($query) use ($serverId) {
                $query->where('code', $serverId)
                    ->orWhere('id', $serverId);
            })
            ->orderByRaw('CASE WHEN code = ? THEN 0 ELSE 1 END', [$serverId])
            ->first();
    }
}

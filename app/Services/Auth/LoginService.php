<?php

namespace App\Services\Auth;

use App\Models\User;
use App\Services\Plugin\HookManager;
use App\Utils\CacheKey;
use App\Utils\Helper;
use Illuminate\Support\Facades\Cache;

class LoginService
{
    private const PASSWORD_ERROR_DEDUPE_SECONDS = 2;

    /**
     * 处理用户登录
     *
     * @param string $email 用户邮箱
     * @param string $password 用户密码
     * @return array [成功状态, 用户对象或错误信息]
     */
    public function login(string $email, string $password): array
    {
        $passwordLimitKey = $this->passwordErrorLimitKey($email);

        // 检查密码错误限制
        if ((int) admin_setting('password_limit_enable', true)) {
            $passwordErrorCount = (int) Cache::get($passwordLimitKey, 0);
            if ($passwordErrorCount >= $this->passwordLimitCount()) {
                return [
                    false,
                    [
                        429,
                        __('There are too many password errors, please try again after :minute minutes.', [
                            'minute' => $this->passwordLimitMinutes()
                        ])
                    ]
                ];
            }
        }

        // 查找用户
        $user = User::where('email', $email)->first();
        if (!$user) {
            return [false, [400, __('Incorrect email or password')]];
        }

        // 验证密码
        if (
            !Helper::multiPasswordVerify(
                $user->password_algo,
                $user->password_salt,
                $password,
                $user->password
            )
        ) {
            // 增加密码错误计数
            if ((int) admin_setting('password_limit_enable', true)) {
                $this->recordPasswordError($email, $password, $passwordLimitKey);
            }
            return [false, [400, __('Incorrect email or password')]];
        }

        // 检查账户状态
        if ($user->banned) {
            return [false, [400, __('Your account has been suspended')]];
        }

        // 更新最后登录时间
        $user->last_login_at = time();
        $user->save();

        HookManager::call('user.login.after', $user);
        return [true, $user];
    }

    private function recordPasswordError(string $email, string $password, string $passwordLimitKey): void
    {
        $dedupeKey = $this->passwordErrorDedupeKey($email, $password);
        if (!Cache::add($dedupeKey, 1, self::PASSWORD_ERROR_DEDUPE_SECONDS)) {
            return;
        }

        $passwordErrorCount = (int) Cache::get($passwordLimitKey, 0);
        Cache::put(
            $passwordLimitKey,
            $passwordErrorCount + 1,
            $this->passwordLimitSeconds()
        );
    }

    private function passwordLimitCount(): int
    {
        return max(1, (int) admin_setting('password_limit_count', 5));
    }

    private function passwordLimitMinutes(): int
    {
        return max(1, (int) admin_setting('password_limit_expire', 60));
    }

    private function passwordLimitSeconds(): int
    {
        return 60 * $this->passwordLimitMinutes();
    }

    private function passwordErrorLimitKey(string $email): string
    {
        return CacheKey::get('PASSWORD_ERROR_LIMIT', $this->normalizeEmailForLimit($email));
    }

    private function passwordErrorDedupeKey(string $email, string $password): string
    {
        return CacheKey::get(
            'PASSWORD_ERROR_DEDUPE',
            self::credentialFingerprint($email, $password)
        );
    }

    public static function loginResponseLockKey(string $email, string $password): string
    {
        return CacheKey::get(
            'LOGIN_RESPONSE_LOCK',
            self::credentialFingerprint($email, $password)
        );
    }

    private static function credentialFingerprint(string $email, string $password): string
    {
        return hash_hmac(
            'sha256',
            self::normalizeEmailForLimit($email) . "\n" . $password,
            (string) config('app.key')
        );
    }

    private static function normalizeEmailForLimit(string $email): string
    {
        return strtolower(trim($email));
    }

    /**
     * 处理密码重置
     *
     * @param string $email 用户邮箱
     * @param string $emailCode 邮箱验证码
     * @param string $password 新密码
     * @return array [成功状态, 结果或错误信息]
     */
    public function resetPassword(string $email, string $emailCode, string $password): array
    {
        // 检查重置请求限制
        $forgetRequestLimitKey = CacheKey::get('FORGET_REQUEST_LIMIT', $email);
        $forgetRequestLimit = (int) Cache::get($forgetRequestLimitKey);
        if ($forgetRequestLimit >= 3) {
            return [false, [429, __('Reset failed, Please try again later')]];
        }

        // 验证邮箱验证码
        $cachedEmailCode = Cache::get(CacheKey::get('EMAIL_VERIFY_CODE', $email));
        if ($cachedEmailCode === null || !hash_equals((string) $cachedEmailCode, $emailCode)) {
            Cache::put($forgetRequestLimitKey, $forgetRequestLimit ? $forgetRequestLimit + 1 : 1, 300);
            return [false, [400, __('Incorrect email verification code')]];
        }

        // 查找用户
        $user = User::where('email', $email)->first();
        if (!$user) {
            return [false, [400, __('This email is not registered in the system')]];
        }

        // 更新密码
        $user->password = password_hash($password, PASSWORD_DEFAULT);
        $user->password_algo = NULL;
        $user->password_salt = NULL;

        if (!$user->save()) {
            return [false, [500, __('Reset failed')]];
        }

        HookManager::call('user.password.reset.after', $user);

        // 清除邮箱验证码
        Cache::forget(CacheKey::get('EMAIL_VERIFY_CODE', $email));

        return [true, true];
    }


    /**
     * 生成临时登录令牌和快速登录URL
     *
     * @param User $user 用户对象
     * @param string $redirect 重定向路径
     * @return string|null 快速登录URL
     */
    public function generateQuickLoginUrl(User $user, ?string $redirect = null): ?string
    {
        if (!$user || !$user->exists) {
            return null;
        }

        $code = Helper::guid();
        $key = CacheKey::get('TEMP_TOKEN', $code);

        Cache::put($key, $user->id, 60);

        $redirect = $redirect ?: 'dashboard';
        $loginRedirect = '/#/login?verify=' . $code . '&redirect=' . rawurlencode($redirect);

        if (admin_setting('app_url')) {
            $url = admin_setting('app_url') . $loginRedirect;
        } else {
            $url = url($loginRedirect);
        }

        return $url;
    }
}

<?php

namespace App\Http\Controllers\V1\Passport;

use App\Http\Controllers\Controller;
use App\Http\Requests\Passport\CommSendEmailVerify;
use App\Jobs\SendEmailJob;
use App\Models\InviteCode;
use App\Models\User;
use App\Services\CaptchaService;
use App\Utils\CacheKey;
use App\Utils\Helper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class CommController extends Controller
{
    public function startCaptchaSession(Request $request)
    {
        $captchaService = app(CaptchaService::class);
        if (!$captchaService->isCaptchaEnabled()) {
            return $this->success([
                'enabled' => false,
                'session_id' => null,
                'challenge_url' => null,
            ]);
        }

        $session = $captchaService->createSession($request, $request->input('action'));
        $apiVersionPrefix = $this->getApiVersionPrefix($request);
        $host = rtrim($request->getSchemeAndHttpHost(), '/');

        return $this->success([
            'enabled' => true,
            'session_id' => $session['session_id'],
            'captcha_type' => $session['captcha_type'],
            'challenge_url' => $host . $apiVersionPrefix . '/passport/comm/captcha/challenge?session_id=' . urlencode($session['session_id']),
            'expires_at' => $session['expires_at'],
            'expires_in' => max(0, (int) $session['expires_at'] - time()),
        ]);
    }

    public function captchaSessionStatus(Request $request)
    {
        $sessionId = (string) $request->query('session_id', '');
        if ($sessionId === '') {
            return $this->fail([400, __('Invalid code is incorrect')]);
        }

        $captchaService = app(CaptchaService::class);
        $status = $captchaService->getSessionStatus($sessionId, $request->ip());
        if (!$status) {
            return $this->fail([400, __('Captcha session has expired')]);
        }

        return $this->success($status);
    }

    public function verifyCaptchaSession(Request $request)
    {
        $captchaService = app(CaptchaService::class);
        [$valid, $result] = $captchaService->verifySessionChallenge($request);
        if (!$valid) {
            return $this->fail($result);
        }

        return $this->success($result);
    }

    public function captchaChallenge(Request $request)
    {
        $sessionId = (string) $request->query('session_id', '');
        if ($sessionId === '') {
            return response('Invalid captcha session', 400);
        }

        $captchaService = app(CaptchaService::class);
        $challengeConfig = $captchaService->getChallengeConfig($sessionId, $request->ip());
        if (!$challengeConfig) {
            return response('Captcha session unavailable', 400);
        }

        $apiVersionPrefix = $this->getApiVersionPrefix($request);
        $host = rtrim($request->getSchemeAndHttpHost(), '/');

        return response()
            ->view('captcha.challenge', [
                'sessionId' => $sessionId,
                'captchaType' => $challengeConfig['captcha_type'],
                'siteKey' => $challengeConfig['site_key'],
                'verifyEndpoint' => $host . $apiVersionPrefix . '/passport/comm/captcha/session/verify',
            ])
            ->header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    }

    public function sendEmailVerify(CommSendEmailVerify $request)
    {
        // 验证人机验证码
        $captchaService = app(CaptchaService::class);
        [$captchaValid, $captchaError] = $captchaService->verify($request);
        if (!$captchaValid) {
            return $this->fail($captchaError);
        }

        $email = $request->input('email');

        // 检查白名单后缀限制
        if ((int) admin_setting('email_whitelist_enable', 0)) {
            $isRegisteredEmail = User::where('email', $email)->exists();
            if (!$isRegisteredEmail) {
                $allowedSuffixes = Helper::getEmailSuffix();
                $emailSuffix = substr(strrchr($email, '@'), 1);

                if (!in_array($emailSuffix, $allowedSuffixes)) {
                    return $this->fail([400, __('Email suffix is not in whitelist')]);
                }
            }
        }

        if (Cache::get(CacheKey::get('LAST_SEND_EMAIL_VERIFY_TIMESTAMP', $email))) {
            return $this->fail([400, __('Email verification code has been sent, please request again later')]);
        }
        $code = rand(100000, 999999);
        $subject = admin_setting('app_name', 'XBoard') . __('Email verification code');

        SendEmailJob::dispatch([
            'email' => $email,
            'subject' => $subject,
            'template_name' => 'verify',
            'template_value' => [
                'name' => admin_setting('app_name', 'XBoard'),
                'code' => $code,
                'url' => admin_setting('app_url')
            ]
        ]);

        Cache::put(CacheKey::get('EMAIL_VERIFY_CODE', $email), $code, 300);
        Cache::put(CacheKey::get('LAST_SEND_EMAIL_VERIFY_TIMESTAMP', $email), time(), 60);
        return $this->success(true);
    }

    public function pv(Request $request)
    {
        $inviteCode = InviteCode::where('code', $request->input('invite_code'))->first();
        if ($inviteCode) {
            $inviteCode->pv = $inviteCode->pv + 1;
            $inviteCode->save();
        }

        return $this->success(true);
    }

    private function getApiVersionPrefix(Request $request): string
    {
        $path = ltrim($request->path(), '/');
        if (str_starts_with($path, 'api/v2/')) {
            return '/api/v2';
        }
        return '/api/v1';
    }

}

<?php

namespace App\Services;

use App\Utils\CacheKey;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use ReCaptcha\ReCaptcha;

class CaptchaService
{
    private const CAPTCHA_SESSION_TTL_SECONDS = 300;

    /**
     * 验证人机验证码
     *
     * @param Request $request 请求对象
     * @return array [是否通过, 错误消息]
     */
    public function verify(Request $request): array
    {
        if (!$this->isCaptchaEnabled()) {
            return [true, null];
        }

        $sessionId = (string) $request->input('captcha_session_id', '');
        $sessionProof = (string) $request->input('captcha_proof', '');

        if ($sessionId !== '' || $sessionProof !== '') {
            return $this->verifySessionProof($sessionId, $sessionProof, $request->ip());
        }

        $captchaType = $this->getCaptchaType();

        return $this->verifyByTypeFromRequest($captchaType, $request);
    }

    public function isCaptchaEnabled(): bool
    {
        return (int) admin_setting('captcha_enable', 0) === 1;
    }

    public function getCaptchaType(): string
    {
        return admin_setting('captcha_type', 'recaptcha');
    }

    public function createSession(Request $request, ?string $action = null): array
    {
        $now = time();
        $session = [
            'session_id' => (string) Str::uuid(),
            'action' => $action,
            'captcha_type' => $this->getCaptchaType(),
            'status' => 'pending',
            'proof' => null,
            'used' => false,
            'created_at' => $now,
            'verified_at' => null,
            'used_at' => null,
            'expires_at' => $now + self::CAPTCHA_SESSION_TTL_SECONDS,
            'ip' => $request->ip(),
        ];

        $this->persistSession($session);

        return $session;
    }

    public function getSessionStatus(string $sessionId, ?string $requestIp = null): ?array
    {
        $session = $this->getSession($sessionId);
        if (!$session) {
            return null;
        }

        if ($this->isSessionExpired($session)) {
            Cache::forget($this->sessionCacheKey($sessionId));
            return null;
        }

        if (!$this->isSessionIpAllowed($session, $requestIp)) {
            return null;
        }

        return $this->buildSessionStatusData($session);
    }

    public function getChallengeConfig(string $sessionId, ?string $requestIp = null): ?array
    {
        $session = $this->getSession($sessionId);
        if (!$session) {
            return null;
        }

        if ($this->isSessionExpired($session)) {
            Cache::forget($this->sessionCacheKey($sessionId));
            return null;
        }

        if (!$this->isSessionIpAllowed($session, $requestIp)) {
            return null;
        }

        $captchaType = $session['captcha_type'] ?? $this->getCaptchaType();
        $siteKey = $this->getSiteKeyByType($captchaType);
        if (!$siteKey) {
            return null;
        }

        return [
            'session' => $session,
            'captcha_type' => $captchaType,
            'site_key' => $siteKey,
        ];
    }

    public function verifySessionChallenge(Request $request): array
    {
        if (!$this->isCaptchaEnabled()) {
            return [true, ['enabled' => false]];
        }

        $sessionId = (string) $request->input('session_id', '');
        if ($sessionId === '') {
            return [false, $this->invalidCodeError()];
        }

        $session = $this->getSession($sessionId);
        if (!$session) {
            return [false, $this->invalidCodeError()];
        }

        if ($this->isSessionExpired($session)) {
            Cache::forget($this->sessionCacheKey($sessionId));
            return [false, [400, __('Captcha session has expired')]];
        }

        if (!$this->isSessionIpAllowed($session, $request->ip())) {
            return [false, $this->invalidCodeError()];
        }

        if (($session['status'] ?? null) === 'verified' && !($session['used'] ?? false)) {
            return [true, $this->buildSessionStatusData($session)];
        }

        $captchaType = $session['captcha_type'] ?? $this->getCaptchaType();
        $token = $this->getTokenFromRequestByType($captchaType, $request);
        if (!$token) {
            return [false, $this->invalidCodeError()];
        }

        [$valid, $error] = $this->verifyTokenByType($captchaType, $token, $request->ip());
        if (!$valid) {
            return [false, $error];
        }

        $session['status'] = 'verified';
        $session['proof'] = Str::random(96);
        $session['verified_at'] = time();
        $session['used'] = false;
        $session['used_at'] = null;

        $this->persistSession($session);

        return [true, $this->buildSessionStatusData($session)];
    }

    private function verifySessionProof(string $sessionId, string $sessionProof, string $requestIp): array
    {
        if ($sessionId === '' || $sessionProof === '') {
            return [false, $this->invalidCodeError()];
        }

        $session = $this->getSession($sessionId);
        if (!$session) {
            return [false, $this->invalidCodeError()];
        }

        if ($this->isSessionExpired($session)) {
            Cache::forget($this->sessionCacheKey($sessionId));
            return [false, [400, __('Captcha session has expired')]];
        }

        if (!$this->isSessionIpAllowed($session, $requestIp)) {
            return [false, $this->invalidCodeError()];
        }

        if (($session['status'] ?? null) !== 'verified') {
            return [false, $this->invalidCodeError()];
        }

        if (($session['used'] ?? false) === true) {
            return [false, [400, __('Captcha session has already been used')]];
        }

        if (!hash_equals((string) ($session['proof'] ?? ''), $sessionProof)) {
            return [false, $this->invalidCodeError()];
        }

        $session['status'] = 'consumed';
        $session['used'] = true;
        $session['used_at'] = time();
        $session['proof'] = null;

        $this->persistSession($session);

        return [true, null];
    }

    private function verifyByTypeFromRequest(string $captchaType, Request $request): array
    {
        return match ($captchaType) {
            'turnstile' => $this->verifyTurnstile($request),
            'recaptcha-v3' => $this->verifyRecaptchaV3($request),
            'recaptcha' => $this->verifyRecaptcha($request),
            default => [false, [400, __('Invalid captcha type')]],
        };
    }

    /**
     * 验证 Cloudflare Turnstile
     */
    private function verifyTurnstile(Request $request): array
    {
        $turnstileToken = (string) $request->input('turnstile_token', '');
        if ($turnstileToken === '') {
            return [false, $this->invalidCodeError()];
        }

        return $this->verifyTurnstileToken($turnstileToken, $request->ip());
    }

    /**
     * 验证 Google reCAPTCHA v3
     */
    private function verifyRecaptchaV3(Request $request): array
    {
        $recaptchaV3Token = (string) $request->input('recaptcha_v3_token', '');
        if ($recaptchaV3Token === '') {
            return [false, $this->invalidCodeError()];
        }

        return $this->verifyRecaptchaV3Token($recaptchaV3Token, $request->ip());
    }

    /**
     * 验证 Google reCAPTCHA v2
     */
    private function verifyRecaptcha(Request $request): array
    {
        $recaptchaData = (string) $request->input('recaptcha_data', '');
        if ($recaptchaData === '') {
            return [false, $this->invalidCodeError()];
        }

        return $this->verifyRecaptchaToken($recaptchaData);
    }

    private function verifyTokenByType(string $captchaType, string $token, string $ip): array
    {
        return match ($captchaType) {
            'turnstile' => $this->verifyTurnstileToken($token, $ip),
            'recaptcha-v3' => $this->verifyRecaptchaV3Token($token, $ip),
            'recaptcha' => $this->verifyRecaptchaToken($token),
            default => [false, [400, __('Invalid captcha type')]],
        };
    }

    private function verifyTurnstileToken(string $token, string $ip): array
    {
        $secret = (string) admin_setting('turnstile_secret_key', '');
        if ($secret === '') {
            return [false, [500, __('Turnstile is not configured')]];
        }

        $response = Http::post('https://challenges.cloudflare.com/turnstile/v0/siteverify', [
            'secret' => $secret,
            'response' => $token,
            'remoteip' => $ip,
        ]);

        $result = $response->json();
        if (!is_array($result) || !($result['success'] ?? false)) {
            return [false, $this->invalidCodeError()];
        }

        return [true, null];
    }

    private function verifyRecaptchaV3Token(string $token, string $ip): array
    {
        $secret = (string) admin_setting('recaptcha_v3_secret_key', '');
        if ($secret === '') {
            return [false, [500, __('reCAPTCHA v3 is not configured')]];
        }

        $recaptcha = new ReCaptcha($secret);
        $recaptchaResp = $recaptcha->verify($token, $ip);

        if (!$recaptchaResp->isSuccess()) {
            return [false, $this->invalidCodeError()];
        }

        $score = $recaptchaResp->getScore();
        $threshold = (float) admin_setting('recaptcha_v3_score_threshold', 0.5);
        if ($score < $threshold) {
            return [false, $this->invalidCodeError()];
        }

        return [true, null];
    }

    private function verifyRecaptchaToken(string $token): array
    {
        $secret = (string) admin_setting('recaptcha_key', '');
        if ($secret === '') {
            return [false, [500, __('reCAPTCHA is not configured')]];
        }

        $recaptcha = new ReCaptcha($secret);
        $recaptchaResp = $recaptcha->verify($token);

        if (!$recaptchaResp->isSuccess()) {
            return [false, $this->invalidCodeError()];
        }

        return [true, null];
    }

    private function getTokenFromRequestByType(string $captchaType, Request $request): ?string
    {
        $field = $this->getTokenFieldNameByType($captchaType);
        if (!$field) {
            return null;
        }

        $value = (string) $request->input($field, '');
        return $value === '' ? null : $value;
    }

    private function getTokenFieldNameByType(string $captchaType): ?string
    {
        return match ($captchaType) {
            'turnstile' => 'turnstile_token',
            'recaptcha-v3' => 'recaptcha_v3_token',
            'recaptcha' => 'recaptcha_data',
            default => null,
        };
    }

    private function getSiteKeyByType(string $captchaType): ?string
    {
        return match ($captchaType) {
            'turnstile' => admin_setting('turnstile_site_key'),
            'recaptcha-v3' => admin_setting('recaptcha_v3_site_key'),
            'recaptcha' => admin_setting('recaptcha_site_key'),
            default => null,
        };
    }

    private function getSession(string $sessionId): ?array
    {
        $session = Cache::get($this->sessionCacheKey($sessionId));
        return is_array($session) ? $session : null;
    }

    private function persistSession(array $session): void
    {
        $sessionId = (string) ($session['session_id'] ?? '');
        if ($sessionId === '') {
            return;
        }

        Cache::put($this->sessionCacheKey($sessionId), $session, $this->getRemainingTtl($session));
    }

    private function buildSessionStatusData(array $session): array
    {
        $verified = ($session['status'] ?? null) === 'verified' && !($session['used'] ?? false);

        return [
            'session_id' => $session['session_id'] ?? null,
            'captcha_type' => $session['captcha_type'] ?? null,
            'action' => $session['action'] ?? null,
            'status' => $session['status'] ?? 'pending',
            'verified' => $verified,
            'used' => (bool) ($session['used'] ?? false),
            'expires_at' => $session['expires_at'] ?? 0,
            'expires_in' => max(0, (int) ($session['expires_at'] ?? 0) - time()),
            'proof' => $verified ? ($session['proof'] ?? null) : null,
        ];
    }

    private function isSessionExpired(array $session): bool
    {
        return (int) ($session['expires_at'] ?? 0) <= time();
    }

    private function getRemainingTtl(array $session): int
    {
        $expiresAt = (int) ($session['expires_at'] ?? 0);
        $remaining = $expiresAt - time();
        return max(1, $remaining);
    }

    private function sessionCacheKey(string $sessionId): string
    {
        return CacheKey::get('CAPTCHA_SESSION', $sessionId);
    }

    private function isSessionIpAllowed(array $session, ?string $requestIp): bool
    {
        if ($requestIp === null || $requestIp === '') {
            return true;
        }

        $sessionIp = (string) ($session['ip'] ?? '');
        if ($sessionIp === '') {
            return true;
        }

        return hash_equals($sessionIp, $requestIp);
    }

    private function invalidCodeError(): array
    {
        return [400, __('Invalid code is incorrect')];
    }
}

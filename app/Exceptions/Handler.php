<?php

namespace App\Exceptions;

use App\Helpers\ApiResponse;
use App\Services\Plugin\InterceptResponseException;
use App\Services\TelegramService;
use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;
use Illuminate\View\ViewException;
use Throwable;

class Handler extends ExceptionHandler
{
    use ApiResponse;

    /**
     * A list of the exception types that are not reported.
     *
     * @var array<int, class-string<Throwable>>
     */
    protected $dontReport = [
        ApiException::class,
        InterceptResponseException::class
    ];

    /**
     * A list of the inputs that are never flashed for validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'password',
        'password_confirmation',
    ];

    /**
     * Report or log an exception.
     *
     * @param  \Throwable  $exception
     * @return void
     *
     * @throws \Throwable
     */
    public function report(Throwable $exception)
    {
        parent::report($exception);
        $this->notifyExceptionToTelegram($exception);
    }

    /**
     * Render an exception into an HTTP response.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Throwable  $exception
     * @return \Symfony\Component\HttpFoundation\Response
     *
     * @throws \Throwable
     */
    public function render($request, Throwable $exception)
    {
        if ($exception instanceof ViewException) {
            return $this->fail([500, '主题渲染失败。如更新主题，参数可能发生变化请重新配置主题后再试。']);
        }
        // ApiException主动抛出错误
        if ($exception instanceof ApiException) {
            $code = $exception->getCode();
            $message = $exception->getMessage();
            $errors = $exception->errors();
            return $this->fail([$code, $message],null,$errors);
        }
        return parent::render($request, $exception);
    }

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });

        $this->renderable(function (InterceptResponseException $e) {
            return $e->getResponse();
        });
    }

    protected function convertExceptionToArray(Throwable $e)
    {
        return config('app.debug') ? [
            'message' => $e->getMessage(),
            'exception' => get_class($e),
            'file' => $e->getFile(),
            'line' => $e->getLine(),
            'trace' => collect($e->getTrace())->map(function ($trace) {
                return Arr::except($trace, ['args']);
            })->all(),
        ] : [
            'message' => $this->isHttpException($e) ? $e->getMessage() : __("Uh-oh, we've had some problems, we're working on it."),
        ];
    }

    protected function notifyExceptionToTelegram(Throwable $exception): void
    {
        $dedupeKey = null;
        $debounceKey = null;

        try {
            if (!$this->shouldReport($exception)) {
                return;
            }
            if (!(bool) config('services.telegram_error_alert.enabled', false)) {
                return;
            }

            $debounceSeconds = max((int) config('services.telegram_error_alert.debounce_seconds', 60), 1);
            $dedupeSeconds = max((int) config('services.telegram_error_alert.dedupe_seconds', 600), $debounceSeconds);
            $fingerprint = $this->getExceptionFingerprint($exception);
            $dedupeKey = sprintf('telegram:error_alert:dedupe:%s', $fingerprint);
            $debounceKey = 'telegram:error_alert:debounce';

            // 1) Dedupe same exception fingerprint
            if (!Cache::add($dedupeKey, 1, $dedupeSeconds)) {
                return;
            }
            // 2) Debounce globally to prevent burst spam across different exceptions
            if (!Cache::add($debounceKey, 1, $debounceSeconds)) {
                Cache::forget($dedupeKey);
                return;
            }

            $message = $this->buildTelegramExceptionMessage($exception, $fingerprint);
            $chatId = $this->resolveTelegramAlertChatId();
            $token = (string) config('services.telegram_error_alert.bot_token', '');
            $telegramService = new TelegramService($token);
            if ($chatId !== null) {
                $telegramService->sendMessage($chatId, $message);
                return;
            }
            $adminTelegramIds = \App\Models\User::query()
                ->where(function ($query) {
                    $query->where('is_admin', 1)
                        ->orWhere('is_staff', 1);
                })
                ->whereNotNull('telegram_id')
                ->pluck('telegram_id')
                ->unique()
                ->values();
            foreach ($adminTelegramIds as $telegramId) {
                $telegramService->sendMessage((int) $telegramId, $message);
            }
        } catch (Throwable $e) {
            // Alerting failures must never affect request handling.
            if ($dedupeKey !== null) {
                Cache::forget($dedupeKey);
            }
            if ($debounceKey !== null) {
                Cache::forget($debounceKey);
            }
        }
    }

    protected function resolveTelegramAlertChatId(): ?int
    {
        $chatId = config('services.telegram_error_alert.chat_id');
        if ($chatId === null || $chatId === '') {
            $chatId = admin_setting('telegram_channel_id') ?: admin_setting('telegram_discuss_id');
        }
        if ($chatId === null || $chatId === '') {
            return null;
        }
        return (int) $chatId;
    }

    protected function getExceptionFingerprint(Throwable $exception): string
    {
        $request = request();
        $requestSignature = $request
            ? sprintf('%s %s', $request->getMethod(), $request->path())
            : 'CLI';
        $raw = implode('|', [
            get_class($exception),
            $exception->getMessage(),
            $exception->getFile(),
            (string) $exception->getLine(),
            $requestSignature
        ]);
        return sha1($raw);
    }

    protected function buildTelegramExceptionMessage(Throwable $exception, string $fingerprint): string
    {
        $request = request();
        $url = $request ? $request->fullUrl() : 'CLI';
        $ip = $request ? ($request->ip() ?: 'N/A') : 'N/A';
        $lines = [
            '[XBoard Error Alert]',
            'App: ' . config('app.name'),
            'Env: ' . config('app.env'),
            'Type: ' . get_class($exception),
            'Message: ' . Str::limit($exception->getMessage(), 800),
            'File: ' . $exception->getFile() . ':' . $exception->getLine(),
            'Request: ' . $url,
            'IP: ' . $ip,
            'Fingerprint: ' . substr($fingerprint, 0, 16),
            'At: ' . date('Y-m-d H:i:s')
        ];
        return Str::limit(implode("\n", $lines), 3800);
    }
}

<?php

namespace App\Jobs;

use App\Services\MailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use RuntimeException;
use Throwable;

class SendEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    protected $params;

    public $tries = 3;
    public $timeout = 10;
    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct($params, $queue = 'send_email')
    {
        $this->onQueue($queue);
        $this->params = $params;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $mailLog = MailService::sendEmail($this->params);
        if (!empty($mailLog['error'])) {
            // Throwing surfaces the real send error to the queue worker:
            // Laravel retries on exception ($tries=3) and, when retries are
            // exhausted, calls failed() with this exception instead of the
            // generic MaxAttemptsExceededException.
            throw new RuntimeException((string) $mailLog['error']);
        }
    }

    public function failed(Throwable $e): void
    {
        Log::error('SendEmailJob failed', [
            'to' => $this->params['email'] ?? null,
            'subject' => $this->params['subject'] ?? null,
            'template' => $this->params['template_name'] ?? null,
            'error' => $e->getMessage(),
        ]);
    }
}

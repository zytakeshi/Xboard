<?php

namespace App\Console\Commands;

use App\Services\RevenueCatService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;

class RevenueCatOrphanReconciler extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'revenuecat:reconcile-orphans {--within=10080}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Replay RevenueCat orphan events that can now resolve to xboard users via RC REST.';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle(RevenueCatService $service): int
    {
        $within = (int) $this->option('within');
        $r = $service->reconcileOrphans($within);

        $this->info(sprintf(
            'Scanned %d, recovered %d, still pending %d.',
            $r['scanned'],
            $r['recovered'],
            $r['still_pending']
        ));

        if (!empty($r['errors'])) {
            foreach ($r['errors'] as $e) {
                $this->warn($e);
            }
            Log::warning('revenuecat:reconcile-orphans had errors', ['errors' => $r['errors']]);
            return self::FAILURE; // exit 1 so cron alerts surface
        }

        return self::SUCCESS;
    }
}

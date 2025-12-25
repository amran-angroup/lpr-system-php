<?php

namespace App\Jobs;

use App\Services\AlarmSyncService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class SyncAlarmsJob implements ShouldQueue
{
    use Queueable;

    /**
     * Create a new job instance.
     */
    public function __construct()
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(AlarmSyncService $syncService): void
    {
        $syncService->syncAlarms();
        
        // Schedule the next run in 15 seconds
        self::dispatch()->delay(now()->addSeconds(15));
    }
}

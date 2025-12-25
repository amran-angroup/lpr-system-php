<?php

namespace App\Console\Commands;

use App\Services\AlarmSyncService;
use Illuminate\Console\Command;

class SyncAlarmsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'alarms:sync';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Sync alarms from EZVIZ API';

    /**
     * Execute the console command.
     */
    public function handle(AlarmSyncService $syncService)
    {
        $this->info('Starting alarm sync...');
        
        $result = $syncService->syncAlarms();
        
        if ($result['success']) {
            $this->info("Sync completed: {$result['stored']} stored, {$result['skipped']} skipped, {$result['total']} total");
        } else {
            $this->error("Sync failed: {$result['message']}");
            return 1;
        }
        
        return 0;
    }
}

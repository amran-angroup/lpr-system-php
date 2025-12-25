<?php

use App\Jobs\SyncAlarmsJob;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Schedule alarm sync - the job will reschedule itself every 15 seconds
// This ensures the job starts when scheduler runs
Schedule::call(function () {
    // Only dispatch if no job is already queued to avoid duplicates
    $pendingJobs = \Illuminate\Support\Facades\DB::table('jobs')
        ->where('queue', 'default')
        ->where('payload', 'like', '%SyncAlarmsJob%')
        ->count();
    
    if ($pendingJobs === 0) {
        SyncAlarmsJob::dispatch();
    }
})->everyMinute();

<?php

namespace Database\Seeders;

use App\Models\Alarms;
use App\Models\VehicleLog;
use App\Services\ImageProcessingService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class UpdateVehicleLog extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $imageProcessingService = app(ImageProcessingService::class);
        
        // Start from alarm ID 269 (resuming processing)
        $startFromId = 818;
        
        $this->command->info("Resuming processing from Alarm ID: {$startFromId}");
        $this->command->info("Note: Not clearing existing vehicle_logs table (resuming mode)");
        $this->command->newLine();
        
        // Get all alarms that have an alarm_pic_url and ID >= startFromId
        $alarms = Alarms::whereNotNull('alarm_pic_url')
            ->where('alarm_pic_url', '!=', '')
            ->where('id', '>=', $startFromId)
            ->orderBy('id', 'asc')
            ->get();
        
        $total = $alarms->count();
        $processed = 0;
        $skipped = 0;
        $failed = 0;
        $created = 0;
        $updated = 0;
        
        $this->command->info("Found {$total} alarms to process.");
        $this->command->newLine();
        
        foreach ($alarms as $index => $alarm) {
            $current = $index + 1;
            $this->command->info("[{$current}/{$total}] Processing Alarm ID: {$alarm->id} (AlarmId: {$alarm->alarmId})");
            
            try {
                // Process the image from alarm
                $result = $imageProcessingService->processImageFromUrl($alarm->alarm_pic_url);
                
                if (!$result) {
                    $this->command->warn("  ⚠ Failed to process image for Alarm ID: {$alarm->id}");
                    $this->command->line("     Check logs for details: storage/logs/laravel.log");
                    $failed++;
                    continue;
                }
                
                // Check if plate was detected
                if (!isset($result['success']) || !$result['success']) {
                    $message = $result['message'] ?? 'Unknown error';
                    $this->command->warn("  ⚠ No plate detected for Alarm ID: {$alarm->id} - {$message}");
                    $this->command->line("     Check logs for Roboflow API response details");
                    $skipped++;
                    continue;
                }
                
                // Log if cropped image is null but plate was detected
                if (empty($result['plate_image_base64'])) {
                    $this->command->warn("  ⚠ Cropped plate image is null for Alarm ID: {$alarm->id}, but saving detection data anyway");
                }
                
                // Convert alarm_time from milliseconds to datetime
                $timestamp = $alarm->alarm_time
                    ? \Carbon\Carbon::createFromTimestampMs($alarm->alarm_time)
                    : now();
                
                // Check if vehicle log already exists for this alarm
                $vehicleLog = VehicleLog::where('alarm_id', $alarm->id)->first();
                
                // Prepare vehicle log data
                $vehicleLogData = [
                    'alarm_id' => $alarm->id,
                    'gate_id' => $vehicleLog->gate_id ?? null,
                    'timestamp' => $timestamp,
                    'image_path' => $alarm->alarm_pic_url,
                    'direction' => $vehicleLog->direction ?? 'in',
                ];
                
                // Add processing results
                if (isset($result['confidence'])) {
                    $vehicleLogData['confidence'] = $result['confidence'];
                }
                
                if (isset($result['license_plate_coords'])) {
                    $vehicleLogData['license_plate_coords'] = $result['license_plate_coords'];
                }
                
                if (isset($result['plate_text']) && !empty($result['plate_text'])) {
                    $vehicleLogData['plate_text'] = $result['plate_text'];
                }
                
                if (isset($result['plate_image_base64'])) {
                    $vehicleLogData['plate_image_base64'] = $result['plate_image_base64'];
                }
                
                if (isset($result['cropped_image_path']) && !empty($result['cropped_image_path'])) {
                    $vehicleLogData['cropped_image_path'] = $result['cropped_image_path'];
                }
                
                // Update or create vehicle log
                if ($vehicleLog) {
                    $vehicleLog->update($vehicleLogData);
                    $action = 'Updated';
                    $updated++;
                } else {
                    VehicleLog::create($vehicleLogData);
                    $action = 'Created';
                    $created++;
                }
                
                $plateText = $vehicleLogData['plate_text'] ?? 'N/A';
                $confidence = $vehicleLogData['confidence'] ?? 'N/A';
                $this->command->line("  ✓ {$action} VehicleLog for Alarm ID: {$alarm->id} - Plate: {$plateText}, Confidence: {$confidence}");
                $processed++;
                
            } catch (\Exception $e) {
                Log::error('Failed to process alarm image', [
                    'alarm_id' => $alarm->id,
                    'alarmId' => $alarm->alarmId,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                
                $this->command->error("  ✗ Error processing Alarm ID: {$alarm->id} - {$e->getMessage()}");
                $failed++;
            }
            
            // Add a small delay after each request to avoid overwhelming the API
            // This gives Roboflow time to process and prevents rate limiting
            sleep(1); // 1 second delay between each image processing
            
            // Show progress every 10 records
            if (($index + 1) % 10 === 0) {
                $this->command->newLine();
                $this->command->info("Progress: {$processed} processed ({$created} created, {$updated} updated), {$skipped} skipped, {$failed} failed");
                $this->command->newLine();
            }
        }
        
        $this->command->newLine();
        $this->command->info("=== Processing Complete ===");
        $this->command->info("Total alarms: {$total}");
        $this->command->info("Processed: {$processed} ({$created} created, {$updated} updated)");
        $this->command->info("Skipped: {$skipped}");
        $this->command->info("Failed: {$failed}");
    }
}

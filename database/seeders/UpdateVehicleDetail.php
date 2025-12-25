<?php

namespace Database\Seeders;

use App\Models\VehicleLog;
use App\Services\ImageProcessingService;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class UpdateVehicleDetail extends Seeder
{
    /**
     * Run the database seeds.
     * Updates existing vehicle_logs records with OCR text and cropped images
     */
    public function run(): void
    {
        $imageProcessingService = app(ImageProcessingService::class);
        
        // Get all vehicle logs that have an image_path to re-process
        // Prioritize logs with cropped_image_path (for OCR) first, then others
        $vehicleLogs = VehicleLog::whereNotNull('image_path')
            ->where('image_path', '!=', '')
            ->orderByRaw('CASE WHEN cropped_image_path IS NOT NULL AND cropped_image_path != "" THEN 0 ELSE 1 END')
            ->orderBy('id', 'asc')
            ->get();
        
        $total = $vehicleLogs->count();
        $processed = 0;
        $skipped = 0;
        $failed = 0;
        $updated = 0;
        
        $this->command->info("Found {$total} vehicle logs to process.");
        $this->command->newLine();
        
        foreach ($vehicleLogs as $index => $vehicleLog) {
            $current = $index + 1;
            $this->command->info("[{$current}/{$total}] Processing VehicleLog ID: {$vehicleLog->id}");
            
            try {
                // Use cropped plate image for OCR if available, otherwise process full image
                if (!empty($vehicleLog->cropped_image_path)) {
                    $this->command->line("  → Using cropped plate image for OCR: {$vehicleLog->cropped_image_path}");
                    $result = $imageProcessingService->processCroppedImage($vehicleLog->cropped_image_path);
                } else {
                    $this->command->line("  → Processing full image from URL");
                    $result = $imageProcessingService->processImageFromUrl($vehicleLog->image_path);
                }
                
                if (!$result) {
                    $this->command->warn("  ⚠ Failed to process image for VehicleLog ID: {$vehicleLog->id}");
                    $this->command->line("     Check logs for details: storage/logs/laravel.log");
                    $failed++;
                    continue;
                }
                
                // Check if plate was detected
                if (!isset($result['success']) || !$result['success']) {
                    $message = $result['message'] ?? 'Unknown error';
                    $this->command->warn("  ⚠ No plate detected for VehicleLog ID: {$vehicleLog->id} - {$message}");
                    $skipped++;
                    continue;
                }
                
                // Prepare update data
                $updateData = [];
                
                // Update confidence if available
                if (isset($result['confidence'])) {
                    $updateData['confidence'] = $result['confidence'];
                }
                
                // Update license plate coordinates if available
                if (isset($result['license_plate_coords'])) {
                    $updateData['license_plate_coords'] = $result['license_plate_coords'];
                }
                
                // Update plate text if extracted
                if (isset($result['plate_text'])) {
                    $plateText = trim($result['plate_text']);
                    if (!empty($plateText)) {
                        $updateData['plate_text'] = $plateText;
                        // Also update license_plate field if it's empty
                        if (empty($vehicleLog->license_plate)) {
                            $updateData['license_plate'] = $plateText;
                        }
                    } else {
                        $this->command->warn("  ⚠ Plate text is empty for VehicleLog ID: {$vehicleLog->id}");
                    }
                } else {
                    $this->command->warn("  ⚠ No plate_text in result for VehicleLog ID: {$vehicleLog->id}");
                }
                
                // Update plate image base64 if available
                if (isset($result['plate_image_base64'])) {
                    $updateData['plate_image_base64'] = $result['plate_image_base64'];
                }
                
                // Update cropped image path if available
                if (isset($result['cropped_image_path']) && !empty($result['cropped_image_path'])) {
                    $updateData['cropped_image_path'] = $result['cropped_image_path'];
                }
                
                // Only update if we have new data
                if (!empty($updateData)) {
                    $vehicleLog->update($updateData);
                    $updated++;
                    
                    // Get the plate text from update data, existing data, or result
                    $plateText = $updateData['plate_text'] 
                        ?? $result['plate_text'] 
                        ?? $vehicleLog->plate_text 
                        ?? 'N/A';
                    $confidence = $updateData['confidence'] 
                        ?? $result['confidence'] 
                        ?? $vehicleLog->confidence 
                        ?? 'N/A';
                    
                    $this->command->line("  ✓ Updated VehicleLog ID: {$vehicleLog->id} - Plate: {$plateText}, Confidence: {$confidence}");
                    $processed++;
                } else {
                    $this->command->warn("  ⚠ No new data to update for VehicleLog ID: {$vehicleLog->id}");
                    $this->command->line("     Result keys: " . implode(', ', array_keys($result ?? [])));
                    $skipped++;
                }
                
            } catch (\Exception $e) {
                Log::error('Failed to process vehicle log image', [
                    'vehicle_log_id' => $vehicleLog->id,
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                
                $this->command->error("  ✗ Error processing VehicleLog ID: {$vehicleLog->id} - {$e->getMessage()}");
                $failed++;
            }
            
            // Add a small delay after each request to avoid overwhelming the API
            sleep(1); // 1 second delay between each image processing
            
            // Show progress every 10 records
            if (($index + 1) % 10 === 0) {
                $this->command->newLine();
                $this->command->info("Progress: {$processed} processed ({$updated} updated), {$skipped} skipped, {$failed} failed");
                $this->command->newLine();
            }
        }
        
        $this->command->newLine();
        $this->command->info("=== Processing Complete ===");
        $this->command->info("Total vehicle logs: {$total}");
        $this->command->info("Processed: {$processed} ({$updated} updated)");
        $this->command->info("Skipped: {$skipped}");
        $this->command->info("Failed: {$failed}");
    }
}

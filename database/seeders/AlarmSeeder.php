<?php

namespace Database\Seeders;

use App\Models\Alarms;
use App\Models\VehicleLog;
use App\Services\ImageProcessingService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AlarmSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * 
     * Fetches alarms from EZVIZ API for a specific date range
     * and processes images automatically.
     * 
     * Usage: php artisan db:seed --class=AlarmSeeder
     */
    public function run(): void
    {
        $accessToken = env('EZVIZ_TOKEN');
        $deviceSerial = env('DEVICE_SERIAL');
        $apiUrl = "https://isgpopen.ezvizlife.com/api/lapp/alarm/device/list";

        // Set timezone to Malaysia (Asia/Kuala_Lumpur)
        $malaysiaTimezone = new \DateTimeZone('Asia/Kuala_Lumpur');

        // Date range: From December 22, 2024 00:00:00 to now
        // You can adjust these dates to fetch more historical data
        $startDate = new \DateTime('2024-12-22 00:00:00', $malaysiaTimezone);
        $endDate = new \DateTime('now', $malaysiaTimezone);

        $startTime = $startDate->getTimestamp() * 1000; // Convert to milliseconds
        $endTime = $endDate->getTimestamp() * 1000;

        $pageSize = 50;
        $pageStart = 0; // API uses offset (0, 50, 100, etc.)
        $totalItems = null; // Will be set from API response

        $this->command->info("Fetching alarms from {$startDate->format('Y-m-d H:i:s')} to {$endDate->format('Y-m-d H:i:s')}");

        $totalStored = 0;
        $totalSkipped = 0;
        $totalProcessed = 0;
        $hasMoreData = true;
        $pageNumber = 1;

        while ($hasMoreData) {
            try {
                $this->command->info("Fetching page {$pageNumber} (pageStart: {$pageStart})...");

                /** @var \Illuminate\Http\Client\Response $response */
                // Try using page number instead of offset - API might expect 1, 2, 3 instead of 0, 50, 100
                $response = Http::withoutVerifying()
                    ->timeout(60)
                    ->asForm()
                    ->post($apiUrl, [
                        'accessToken' => $accessToken,
                        'deviceSerial' => $deviceSerial,
                        'pageSize' => $pageSize,
                        'pageStart' => $pageNumber, // Try page number (1, 2, 3) instead of offset
                        'startTime' => $startTime,
                        'endTime' => $endTime,
                    ]);

                $data = $response->json();

                // Check if API call was successful
                if (!isset($data['code']) || $data['code'] !== '200') {
                    $this->command->error("API request failed: " . ($data['msg'] ?? 'Unknown error'));
                    $this->command->error("Response: " . json_encode($data));
                    break;
                }

                // Get total items from pagination info
                if (isset($data['page']['total'])) {
                    $totalItems = $data['page']['total'];
                    if ($pageNumber === 1) {
                        $this->command->info("Total items available: {$totalItems}");
                    }
                }

                if (!isset($data['data']) || !is_array($data['data']) || count($data['data']) === 0) {
                    $this->command->info("No more alarms to fetch.");
                    $hasMoreData = false;
                    break;
                }

                $itemsCount = count($data['data']);
                $this->command->info("Processing {$itemsCount} alarms from page {$pageNumber}...");

                foreach ($data['data'] as $alarm) {
                    // Check if alarm already exists (avoid duplicates)
                    $existingAlarm = Alarms::where('alarmId', $alarm['alarmId'])->first();

                    if ($existingAlarm) {
                        $totalSkipped++;
                        continue;
                    }

                    // Map API response to database fields
                    $createdAlarm = Alarms::create([
                        'alarmId' => $alarm['alarmId'],
                        'alarm_name' => $alarm['alarmName'] ?? null,
                        'alarm_type' => $alarm['alarmType'] ?? null,
                        'alarm_time' => $alarm['alarmTime'] ?? null,
                        'channel_no' => $alarm['channelNo'] ?? null,
                        'is_encrypt' => $alarm['isEncrypt'] ?? 0,
                        'is_checked' => $alarm['isChecked'] ?? 0,
                        'pre_time' => $alarm['preTime'] ?? null,
                        'delay_time' => $alarm['delayTime'] ?? null,
                        'device_serial' => $alarm['deviceSerial'] ?? null,
                        'rec_state' => $alarm['recState'] ?? 0,
                        'alarm_pic_url' => $alarm['alarmPicUrl'] ?? null,
                        'relation_alarms' => isset($alarm['relationAlarms']) && is_array($alarm['relationAlarms']) && count($alarm['relationAlarms']) > 0 ? json_encode($alarm['relationAlarms']) : null,
                        'customer_type' => $alarm['customerType'] ?? null,
                        'customer_info' => isset($alarm['customerInfo']) && !empty($alarm['customerInfo']) ? json_encode($alarm['customerInfo']) : null,
                    ]);

                    $totalStored++;

                    // Process image if available
                    if (!empty($alarm['alarmPicUrl'])) {
                        $this->processAlarmImage($createdAlarm);
                        $totalProcessed++;
                    }
                }

                // Check if we've fetched all items or if this is the last page
                $fetchedSoFar = $pageStart + $itemsCount;
                if ($totalItems !== null && $fetchedSoFar >= $totalItems) {
                    $this->command->info("All items fetched ({$fetchedSoFar} of {$totalItems}).");
                    $hasMoreData = false;
                } elseif ($itemsCount < $pageSize) {
                    $this->command->info("Last page reached ({$itemsCount} items < {$pageSize} page size).");
                    $hasMoreData = false;
                } else {
                    // Move to next page (increment page number)
                    $pageNumber++;
                    $pageStart = ($pageNumber - 1) * $pageSize; // Keep track of offset for display
                    $this->command->info("Moving to next page (page {$pageNumber}, offset: {$pageStart})...");
                    
                    // Small delay to avoid rate limiting
                    usleep(500000); // 0.5 seconds
                }

            } catch (\Exception $e) {
                $this->command->error("Error: " . $e->getMessage());
                Log::error('Alarm seeder error', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                $hasMoreData = false;
                break;
            }
        }

        $this->command->info("\n=== Seeding Complete ===");
        $this->command->info("Total stored: {$totalStored}");
        $this->command->info("Total skipped (duplicates): {$totalSkipped}");
        $this->command->info("Total images processed: {$totalProcessed}");
    }

    /**
     * Process alarm image through image processing API and create vehicle log
     */
    private function processAlarmImage(Alarms $alarm): void
    {
        try {
            $imageProcessingService = app(ImageProcessingService::class);
            $result = $imageProcessingService->processImageFromUrl($alarm->alarm_pic_url);

            if ($result && isset($result['success']) && $result['success']) {
                // Convert alarm_time from milliseconds to datetime
                $timestamp = $alarm->alarm_time
                    ? \Carbon\Carbon::createFromTimestampMs($alarm->alarm_time)
                    : now();

                // Create vehicle log entry
                $vehicleLogData = [
                    'alarm_id' => $alarm->id,
                    'gate_id' => null,
                    'timestamp' => $timestamp,
                    'image_path' => $alarm->alarm_pic_url,
                    'direction' => 'in',
                ];

                if (isset($result['vehicle_type'])) {
                    $vehicleLogData['vehicle_type'] = $result['vehicle_type'];
                }
                if (isset($result['vehicle_color'])) {
                    $vehicleLogData['vehicle_color'] = $result['vehicle_color'];
                }
                if (isset($result['confidence'])) {
                    $vehicleLogData['confidence'] = $result['confidence'];
                }
                if (isset($result['license_plate']) && is_array($result['license_plate'])) {
                    $vehicleLogData['license_plate_coords'] = $result['license_plate'];
                }
                if (isset($result['plate_text'])) {
                    $vehicleLogData['plate_text'] = $result['plate_text'];
                }
                if (isset($result['plate_image_base64'])) {
                    $vehicleLogData['plate_image_base64'] = $result['plate_image_base64'];
                }

                VehicleLog::create($vehicleLogData);

                $this->command->line("  ✓ Processed image for alarm: {$alarm->alarmId}");
            } else {
                $this->command->warn("  ⚠ Image processing failed for alarm: {$alarm->alarmId}");
            }
        } catch (\Exception $e) {
            $this->command->error("  ✗ Error processing image for alarm {$alarm->alarmId}: " . $e->getMessage());
            Log::error('Failed to process alarm image in seeder', [
                'alarm_id' => $alarm->id,
                'error' => $e->getMessage(),
            ]);
        }
    }
}

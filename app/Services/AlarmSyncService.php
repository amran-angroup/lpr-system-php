<?php

namespace App\Services;

use App\Models\Alarms;
use App\Models\VehicleLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AlarmSyncService
{
    public function syncAlarms(): array
    {
        $accessToken = env('EZVIZ_TOKEN');
        $deviceSerial = env('DEVICE_SERIAL');
        $pageSize = 10;
        $pageStart = 1;

        try {
            /** @var \Illuminate\Http\Client\Response $response */
            $response = Http::asForm()->post(
                'https://isgpopen.ezvizlife.com/api/lapp/alarm/device/list',
                [
                    'accessToken'   => $accessToken,
                    'deviceSerial'  => $deviceSerial,
                    'pageSize'      => $pageSize,
                    'pageStart'     => $pageStart,
                ]
            );

            $data = $response->json();
            
            // Check if API call was successful
            if (!isset($data['code']) || $data['code'] !== '200') {
                Log::error('EZVIZ API request failed', [
                    'code' => $data['code'] ?? 'unknown',
                    'message' => $data['msg'] ?? 'API request failed'
                ]);
                return [
                    'success' => false,
                    'message' => $data['msg'] ?? 'API request failed',
                    'code' => $data['code'] ?? 'unknown'
                ];
            }
            
            if (!isset($data['data']) || !is_array($data['data'])) {
                Log::warning('No alarm data received from API');
                return [
                    'success' => false,
                    'message' => 'No alarm data received from API'
                ];
            }

            // Set timezone to Malaysia (Asia/Kuala_Lumpur)
            $malaysiaTimezone = new \DateTimeZone('Asia/Kuala_Lumpur');
            
            // Filter alarms from 22nd December 2024 00:00:00 Malaysia time
            $startDate = new \DateTime('2024-12-22 00:00:00', $malaysiaTimezone);
            $startTimestamp = $startDate->getTimestamp() * 1000; // Convert to milliseconds (alarmTime is in milliseconds)
            
            $storedCount = 0;
            $skippedCount = 0;
            $filteredCount = 0;

            foreach ($data['data'] as $index => $alarm) {
                $alarmId = $alarm['alarmId'] ?? 'unknown';
                $current = $index + 1;
                $total = count($data['data']);
                
                Log::info("[{$current}/{$total}] Processing Alarm ID: {$alarmId}");
                
                // Filter alarms from 22nd December 2024 onwards
                if (!isset($alarm['alarmTime']) || $alarm['alarmTime'] < $startTimestamp) {
                    $filteredCount++;
                    Log::info("  ⏭️  Alarm ID {$alarmId}: Filtered (before start date)");
                    continue;
                }
                
                // Check if alarm already exists (avoid duplicates)
                $existingAlarm = Alarms::where('alarmId', $alarm['alarmId'])->first();
                
                if ($existingAlarm) {
                    $skippedCount++;
                    Log::info("  ⏭️  Alarm ID {$alarmId}: Skipped (already exists)");
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

                Log::info("  ✓ Alarm ID {$alarmId}: Stored in database (ID: {$createdAlarm->id})");

                // Process image if available
                if (!empty($alarm['alarmPicUrl'])) {
                    Log::info("  📷 Alarm ID {$alarmId}: Processing image...");
                    $this->processAlarmImage($createdAlarm);
                } else {
                    Log::info("  ⚠️  Alarm ID {$alarmId}: No image URL available");
                }

                $storedCount++;
            }

            Log::info('Alarms synced successfully', [
                'stored' => $storedCount,
                'skipped' => $skippedCount,
                'filtered' => $filteredCount,
                'total' => count($data['data'])
            ]);

            return [
                'success' => true,
                'message' => 'Alarms processed successfully',
                'stored' => $storedCount,
                'skipped' => $skippedCount,
                'filtered' => $filteredCount,
                'total' => count($data['data'])
            ];
        } catch (\Exception $e) {
            Log::error('Failed to sync alarms', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return [
                'success' => false,
                'message' => 'Failed to fetch alarms from API: ' . $e->getMessage()
            ];
        }
    }

    /**
     * Process alarm image through image processing API and create vehicle log
     * Only saves vehicle log when license_plate.detected is true
     * 
     * @param Alarms $alarm
     * @return void
     */
    private function processAlarmImage(Alarms $alarm): void
    {
        try {
            Log::info("    → Alarm ID {$alarm->alarmId}: Downloading image from EZVIZ...");
            
            // Download image from EZVIZ
            $imageContent = $this->downloadImage($alarm->alarm_pic_url);
            
            if (!$imageContent) {
                Log::warning("    ✗ Alarm ID {$alarm->alarmId}: Failed to download image from EZVIZ");
                return;
            }

            Log::info("    ✓ Alarm ID {$alarm->alarmId}: Image downloaded successfully");

            // Save image to storage
            $imagePath = $this->saveImageToStorage($imageContent, $alarm->id);
            Log::info("    ✓ Alarm ID {$alarm->alarmId}: Image saved to storage: {$imagePath}");

            // Save image temporarily for API call
            $tempPath = storage_path('app/temp/' . uniqid('alarm_', true) . '.jpg');
            if (!is_dir(dirname($tempPath))) {
                mkdir(dirname($tempPath), 0755, true);
            }
            file_put_contents($tempPath, $imageContent);

            // Call image processing API
            $apiUrl = env('IMAGE_PROCESSING_API_URL', 'http://localhost:8080/api/image/process');
            Log::info("    → Alarm ID {$alarm->alarmId}: Sending image to processing API...");
            
            $response = Http::timeout(60)
                ->attach('image', file_get_contents($tempPath), 'image.jpg', ['Content-Type' => 'image/jpeg'])
                ->post($apiUrl);

            // Clean up temp file
            if (file_exists($tempPath)) {
                unlink($tempPath);
            }

            if (!$response->successful()) {
                Log::warning("    ✗ Alarm ID {$alarm->alarmId}: Image processing API failed (Status: {$response->status()})");
                return;
            }

            $result = $response->json();
            Log::info("    ✓ Alarm ID {$alarm->alarmId}: Image processed by API");

            // Only save vehicle log if license_plate.detected is true
            if (!isset($result['license_plate']['detected']) || $result['license_plate']['detected'] !== true) {
                Log::info("    ⏭️  Alarm ID {$alarm->alarmId}: License plate NOT detected - skipping vehicle log");
                return;
            }

            Log::info("    ✓ Alarm ID {$alarm->alarmId}: License plate DETECTED - creating vehicle log...");

            // Convert alarm_time from milliseconds to datetime
            $timestamp = $alarm->alarm_time 
                ? \Carbon\Carbon::createFromTimestampMs($alarm->alarm_time)
                : now();

            // Create vehicle log entry
            $vehicleLogData = [
                'alarm_id' => $alarm->id,
                'gate_id' => null,
                'timestamp' => $timestamp,
                'image_path' => $imagePath,
                'direction' => $result['direction'] ?? 'in',
            ];

            // Vehicle information
            if (isset($result['vehicle']['type'])) {
                $vehicleLogData['vehicle_type'] = $result['vehicle']['type'];
            }
            if (isset($result['vehicle']['color'])) {
                $vehicleLogData['vehicle_color'] = $result['vehicle']['color'];
            }
            if (isset($result['vehicle']['confidence'])) {
                $vehicleLogData['confidence'] = $result['vehicle']['confidence'];
            }

            // License plate information
            if (isset($result['license_plate']['text'])) {
                $vehicleLogData['plate_text'] = $result['license_plate']['text'];
            }
            if (isset($result['license_plate']['image_base64'])) {
                $vehicleLogData['plate_image_base64'] = $result['license_plate']['image_base64'];
            }
            if (isset($result['license_plate']['confidence'])) {
                $vehicleLogData['confidence'] = $result['license_plate']['confidence'];
            }

            VehicleLog::create($vehicleLogData);

            $plateText = $vehicleLogData['plate_text'] ?? 'N/A';
            $vehicleType = $vehicleLogData['vehicle_type'] ?? 'N/A';
            $vehicleColor = $vehicleLogData['vehicle_color'] ?? 'N/A';
            
            Log::info("    ✓✓ Alarm ID {$alarm->alarmId}: Vehicle log CREATED successfully", [
                'plate_text' => $plateText,
                'vehicle_type' => $vehicleType,
                'vehicle_color' => $vehicleColor,
            ]);
            
            Log::info("    ✅ Alarm ID {$alarm->alarmId}: COMPLETED - Plate: {$plateText}, Vehicle: {$vehicleType} ({$vehicleColor})");

        } catch (\Exception $e) {
            Log::error("    ✗✗ Alarm ID {$alarm->alarmId}: ERROR - {$e->getMessage()}", [
                'alarm_id' => $alarm->id,
                'alarmId' => $alarm->alarmId,
                'error' => $e->getMessage(),
            ]);
        }
    }

    /**
     * Download image from EZVIZ URL
     * 
     * @param string $url Image URL
     * @return string|null Image content or null on failure
     */
    private function downloadImage(string $url): ?string
    {
        try {
            $response = Http::withoutVerifying()
                ->timeout(30)
                ->get($url);
            
            if ($response->successful()) {
                return $response->body();
            }

            Log::warning('Failed to download image', [
                'url' => $url,
                'status' => $response->status(),
            ]);

            return null;

        } catch (\Exception $e) {
            Log::error('Image download error', [
                'error' => $e->getMessage(),
                'url' => $url,
            ]);
            return null;
        }
    }

    /**
     * Save image to storage
     * 
     * @param string $imageContent Image content
     * @param int $alarmId Alarm ID
     * @return string Storage path
     */
    private function saveImageToStorage(string $imageContent, int $alarmId): string
    {
        $filename = 'alarms/' . uniqid("alarm_{$alarmId}_", true) . '.jpg';
        Storage::disk('public')->put($filename, $imageContent);
        return $filename;
    }
}


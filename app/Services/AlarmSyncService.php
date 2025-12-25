<?php

namespace App\Services;

use App\Models\Alarms;
use App\Models\VehicleLog;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

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

            foreach ($data['data'] as $alarm) {
                // Filter alarms from 22nd December 2024 onwards
                if (!isset($alarm['alarmTime']) || $alarm['alarmTime'] < $startTimestamp) {
                    $filteredCount++;
                    continue;
                }
                
                // Check if alarm already exists (avoid duplicates)
                $existingAlarm = Alarms::where('alarmId', $alarm['alarmId'])->first();
                
                if ($existingAlarm) {
                    $skippedCount++;
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

                // Process image if available
                if (!empty($alarm['alarmPicUrl'])) {
                    $this->processAlarmImage($createdAlarm);
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
     * 
     * @param Alarms $alarm
     * @return void
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
                    'gate_id' => null, // Will be set when gates table is implemented
                    'timestamp' => $timestamp,
                    'image_path' => $alarm->alarm_pic_url,
                    'direction' => 'in', // Default to 'in', can implement smart IN/OUT logic later
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

                Log::info('Vehicle log created successfully', [
                    'alarm_id' => $alarm->id,
                    'alarmId' => $alarm->alarmId,
                    'vehicle_type' => $result['vehicle_type'] ?? null,
                    'plate_text' => $result['plate_text'] ?? null,
                ]);
            } else {
                Log::warning('Image processing returned unsuccessful result', [
                    'alarm_id' => $alarm->id,
                    'alarmId' => $alarm->alarmId,
                    'result' => $result,
                ]);
            }
        } catch (\Exception $e) {
            Log::error('Failed to process alarm image', [
                'alarm_id' => $alarm->id,
                'alarmId' => $alarm->alarmId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }
}


<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;
use App\Models\VehicleLog;

class FixVehicleLog extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $logs = VehicleLog::where('image_path', 'like', '%https://%')->get();

        foreach ($logs as $log) {

            echo "Processing ID: {$log->id}\n";

            try {
                // 1. Download image
                $tempFile = storage_path('app/temp_' . Str::uuid() . '.jpg');
                file_put_contents($tempFile, file_get_contents($log->image_path));

                // 2. Send to API
                $response = Http::attach(
                    'image',
                    file_get_contents($tempFile),
                    basename($tempFile)
                )->post('http://localhost:8080/api/image/process');

                if (!$response->successful()) {
                    echo "API failed for ID {$log->id}\n";
                    unlink($tempFile);
                    continue;
                }

                $result = $response->json();

                // 3. Check if original_image_base64 exists in response
                if (!isset($result['original_image_base64'])) {
                    echo "Missing original_image_base64 in API response for ID {$log->id}\n";
                    unlink($tempFile);
                    continue;
                }

                // 4. Update DB using direct DB query (bypasses Eloquent events)
                $updateData = [
                    'image_path'     => $result['original_image_base64'],
                    'license_plate'  => $result['license_plate']['text'] ?? null,
                    'plate_text'     => $result['license_plate']['text'] ?? null,
                    'confidence'     => $result['license_plate']['confidence'] ?? null,
                    'direction'      => $result['direction'] ?? null,
                    'vehicle_type'   => $result['vehicle']['type'] ?? null,
                    'vehicle_color'  => $result['vehicle']['color'] ?? null,
                    'updated_at'     => now(),
                ];

                $updated = DB::table('vehicle_logs')
                    ->where('id', $log->id)
                    ->update($updateData);

                if ($updated) {
                    echo "Successfully updated ID: {$log->id}\n";
                } else {
                    echo "Failed to update ID: {$log->id}\n";
                }

                unlink($tempFile);
            } catch (\Throwable $e) {
                // Sanitize error message to prevent base64 output
                $errorMsg = substr($e->getMessage(), 0, 200); // Limit length
                echo "Error ID {$log->id}: {$errorMsg}\n";
            }
        }
    }
}

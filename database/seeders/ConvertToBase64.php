<?php

namespace Database\Seeders;

use App\Models\VehicleLog;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class ConvertToBase64 extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // YWxhcm1zL2FsYXJtXzE3NTFfNjk0ZTUyZWMwMWI1ODIuOTM3Njc3MzEuanBn
        // $vehicleLogs = VehicleLog::where('image_path', 'like', '%alarms%')->get();

        // foreach ($vehicleLogs as $vehicleLog) {
        //     $vehicleLog->image_path = base64_encode($vehicleLog->image_path);
        //     $vehicleLog->save();

        //     $vehicleLog->plate_image_base64 = base64_encode($vehicleLog->plate_image_base64);
        //     $vehicleLog->save();
        // }
        // dd('done');


        $vehicleLogs = VehicleLog::where('image_path', 'like', 'YWxhcm1zL2FsYXJtXz%')->get();

        foreach ($vehicleLogs as $item) {

            // Decode Base64 to get the original path
            $originalPath = base64_decode($item->image_path);

            // Restore the path
            $item->image_path = $originalPath;

            // Convert actual file content to Base64 for a new column
            $fullPath = storage_path('app/public/' . $originalPath);

            if (file_exists($fullPath)) {
                $item->image_base64 = base64_encode(file_get_contents($fullPath));
            }

            $item->save();
        }

        dd('Accidental rows fixed!');
    }
}

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
        $vehicleLogs = VehicleLog::where('image_path', 'like', '%alarms%')->get();

        foreach ($vehicleLogs as $vehicleLog) {
            $vehicleLog->image_path = base64_encode($vehicleLog->image_path);
            $vehicleLog->save();

            $vehicleLog->plate_image_base64 = base64_encode($vehicleLog->plate_image_base64);
            $vehicleLog->save();
        }
        dd('done');

    }
}

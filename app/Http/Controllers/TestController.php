<?php

namespace App\Http\Controllers;

use App\Models\VehicleLog;
use Illuminate\Http\Request;

class TestController extends Controller
{
    public function index()
    {

        $vehicleLogs = VehicleLog::where('image_path', 'like', '%https://%')->get();

        $data = [];

        foreach ($vehicleLogs as $vehicleLog) {

            $data[] = [
                'id' => $vehicleLog->id,
                'image_path' => $vehicleLog->image_path,
                'license_plate' => $vehicleLog->license_plate,
                'plate_text' => $vehicleLog->plate_text,
                'vehicle_type' => $vehicleLog->vehicle_type,
                'vehicle_color' => $vehicleLog->vehicle_color,
                'direction' => $vehicleLog->direction,
            ];
        }


        return response()->json([
            'data' => $data
        ]);
    }
}

<?php

namespace App\Http\Controllers;

use App\Models\VehicleLog;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleLogsController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->get('per_page', 30);
        $query = VehicleLog::with('alarm')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234', 'N/A'])
            ->where('confidence', '>', 0.5);

        // Search functionality
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('license_plate', 'like', "%{$search}%")
                  ->orWhere('plate_text', 'like', "%{$search}%")
                  ->orWhere('vehicle_type', 'like', "%{$search}%")
                  ->orWhere('vehicle_color', 'like', "%{$search}%");
            });
        }

        // Date filtering
        if ($request->has('date_start') && $request->get('date_start')) {
            $query->where('timestamp', '>=', $request->get('date_start'));
        }

        if ($request->has('date_end') && $request->get('date_end')) {
            $query->where('timestamp', '<=', $request->get('date_end'));
        }

        $vehicleLogs = $query->orderBy('timestamp', 'desc')
            ->paginate($perPage)
            ->appends($request->query());

        return Inertia::render('vehicle-logs/index', [
            'vehicleLogs' => $vehicleLogs,
        ]);
    }

    public function show($id)
    {
        $vehicleLog = VehicleLog::with('alarm')->findOrFail($id);

        return Inertia::render('vehicle-logs/show', [
            'vehicleLog' => $vehicleLog,
        ]);
    }
}

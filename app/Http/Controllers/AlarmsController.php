<?php

namespace App\Http\Controllers;

use App\Models\Alarms;
use App\Services\AlarmSyncService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AlarmsController extends Controller
{
    public function index(AlarmSyncService $syncService)
    {
        $result = $syncService->syncAlarms();
        
        if (isset($result['success']) && $result['success']) {
            return redirect()->route('alarms.index')->with('success', $result);
        } else {
            return redirect()->route('alarms.index')->with('error', $result);
        }
    }

    public function list(Request $request)
    {
        $perPage = $request->get('per_page', 150);
        $query = Alarms::query();

        // Search functionality
        if ($request->has('search') && $request->get('search')) {
            $search = $request->get('search');
            $query->where(function ($q) use ($search) {
                $q->where('alarmId', 'like', "%{$search}%")
                  ->orWhere('alarm_name', 'like', "%{$search}%")
                  ->orWhere('device_serial', 'like', "%{$search}%");
            });
        }

        // Date filtering (alarm_time is in milliseconds)
        if ($request->has('date_start') && $request->get('date_start')) {
            $startDate = \Carbon\Carbon::parse($request->get('date_start'))->timestamp * 1000;
            $query->where('alarm_time', '>=', $startDate);
        }

        if ($request->has('date_end') && $request->get('date_end')) {
            $endDate = \Carbon\Carbon::parse($request->get('date_end'))->timestamp * 1000;
            $query->where('alarm_time', '<=', $endDate);
        }

        $alarms = $query->orderBy('alarm_time', 'desc')->paginate($perPage)->appends($request->query());
        
        return Inertia::render('alarms/index', [
            'alarms' => $alarms,
            'success' => $request->session()->get('success'),
            'error' => $request->session()->get('error'),
        ]);
    }

    public function show($id)
    {
        $alarm = Alarms::findOrFail($id);
        
        return Inertia::render('alarms/show', [
            'alarm' => $alarm,
        ]);
    }
}

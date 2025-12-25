<?php

namespace App\Http\Controllers;

use App\Models\VehicleLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // Get date range from request or default to last 30 days
        $dateStart = $request->get('date_start', Carbon::now()->subDays(30)->format('Y-m-d'));
        $dateEnd = $request->get('date_end', Carbon::now()->format('Y-m-d'));

        // Unique plate numbers for in and out
        $uniquePlatesIn = VehicleLog::where('direction', 'in')
            ->whereNotNull('plate_text')
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        $uniquePlatesOut = VehicleLog::where('direction', 'out')
            ->whereNotNull('plate_text')
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        // Daily counts
        $dailyCounts = VehicleLog::select(
            DB::raw('DATE(timestamp) as date'),
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count')
        )
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Weekly counts (last 4 weeks)
        $weeklyCounts = VehicleLog::select(
            DB::raw('YEARWEEK(timestamp, 1) as week'),
            DB::raw('MIN(DATE(timestamp)) as week_start'),
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count')
        )
            ->whereBetween('timestamp', [Carbon::now()->subWeeks(4)->startOfWeek()->format('Y-m-d H:i:s'), $dateEnd . ' 23:59:59'])
            ->groupBy('week')
            ->orderBy('week', 'asc')
            ->get();

        // Monthly counts (last 6 months)
        $monthlyCounts = VehicleLog::select(
            DB::raw('DATE_FORMAT(timestamp, "%Y-%m") as month'),
            DB::raw('DATE_FORMAT(timestamp, "%b %Y") as month_label'),
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count')
        )
            ->whereBetween('timestamp', [Carbon::now()->subMonths(6)->startOfMonth()->format('Y-m-d H:i:s'), $dateEnd . ' 23:59:59'])
            ->groupBy('month', 'month_label')
            ->orderBy('month', 'asc')
            ->get();

        // Vehicle type category chart data
        $vehicleTypeData = VehicleLog::select(
            'vehicle_type',
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count'),
            DB::raw('COUNT(*) as total_count')
        )
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->whereNotNull('vehicle_type')
            ->groupBy('vehicle_type')
            ->orderBy('total_count', 'desc')
            ->get();

        // Total counts for the period
        $totalIn = VehicleLog::where('direction', 'in')
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->count();

        $totalOut = VehicleLog::where('direction', 'out')
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->count();

        return Inertia::render('dashboard', [
            'uniquePlates' => [
                'in' => $uniquePlatesIn,
                'out' => $uniquePlatesOut,
            ],
            'dailyCounts' => $dailyCounts,
            'weeklyCounts' => $weeklyCounts,
            'monthlyCounts' => $monthlyCounts,
            'vehicleTypeData' => $vehicleTypeData,
            'totalCounts' => [
                'in' => $totalIn,
                'out' => $totalOut,
            ],
            'dateRange' => [
                'start' => $dateStart,
                'end' => $dateEnd,
            ],
        ]);
    }
}


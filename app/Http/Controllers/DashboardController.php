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
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        $uniquePlatesOut = VehicleLog::where('direction', 'out')
            ->whereNotNull('plate_text')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        // Daily counts
        $dailyCounts = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select(
                DB::raw('DATE(timestamp) as date'),
                DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
                DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count')
            )
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->groupBy('date')
            ->orderBy('date', 'asc')
            ->get();

        // Weekly counts (last 4 weeks)
        $weeklyCounts = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [Carbon::now()->subWeeks(4)->startOfWeek()->format('Y-m-d H:i:s'), $dateEnd . ' 23:59:59'])
            ->select(
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
        $monthlyCounts = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [Carbon::now()->subMonths(6)->startOfMonth()->format('Y-m-d H:i:s'), $dateEnd . ' 23:59:59'])
            ->select(
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
        $vehicleTypeData = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select(
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
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->count();

        $totalOut = VehicleLog::where('direction', 'out')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->count();

        // Calculate period duration for comparison
        $startDate = Carbon::parse($dateStart);
        $endDate = Carbon::parse($dateEnd);
        $daysDiff = $startDate->diffInDays($endDate);

        // Previous period for comparison
        $prevDateStart = $startDate->copy()->subDays($daysDiff + 1)->format('Y-m-d');
        $prevDateEnd = $startDate->copy()->subDay()->format('Y-m-d');

        $prevUniquePlatesIn = VehicleLog::where('direction', 'in')
            ->whereNotNull('plate_text')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$prevDateStart . ' 00:00:00', $prevDateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        $prevUniquePlatesOut = VehicleLog::where('direction', 'out')
            ->whereNotNull('plate_text')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$prevDateStart . ' 00:00:00', $prevDateEnd . ' 23:59:59'])
            ->select('plate_text')
            ->distinct()
            ->count();

        $prevTotalIn = VehicleLog::where('direction', 'in')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$prevDateStart . ' 00:00:00', $prevDateEnd . ' 23:59:59'])
            ->count();

        $prevTotalOut = VehicleLog::where('direction', 'out')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$prevDateStart . ' 00:00:00', $prevDateEnd . ' 23:59:59'])
            ->count();

        // Calculate percentage changes
        $calculateChange = function ($current, $previous) {
            if ($previous == 0) return $current > 0 ? 100 : 0;
            return round((($current - $previous) / $previous) * 100);
        };

        // Hourly traffic pattern (for the selected date range)
        $hourlyCounts = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select(
            DB::raw('HOUR(timestamp) as hour'),
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count'),
            DB::raw('COUNT(*) as total_count')
        )
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->groupBy('hour')
            ->orderBy('hour', 'asc')
            ->get()
            ->map(function ($item) {
                return [
                    'hour' => (int) $item->hour,
                    'hour_label' => sprintf('%02d:00', $item->hour),
                    'in_count' => (int) $item->in_count,
                    'out_count' => (int) $item->out_count,
                    'total_count' => (int) $item->total_count,
                ];
            });

        // Top license plates (most frequent vehicles)
        $topLicensePlates = VehicleLog::whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->select(
            'plate_text',
            DB::raw('COUNT(*) as total_count'),
            DB::raw('COUNT(CASE WHEN direction = "in" THEN 1 END) as in_count'),
            DB::raw('COUNT(CASE WHEN direction = "out" THEN 1 END) as out_count'),
            DB::raw('MAX(timestamp) as last_seen')
        )
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->whereNotNull('plate_text')
            ->groupBy('plate_text')
            ->orderBy('total_count', 'desc')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'plate_text' => $item->plate_text,
                    'total_count' => (int) $item->total_count,
                    'in_count' => (int) $item->in_count,
                    'out_count' => (int) $item->out_count,
                    'last_seen' => $item->last_seen,
                ];
            });

        // Recent activity feed (last 20 entries)
        $recentActivity = VehicleLog::with('alarm')
            ->whereNotIn('plate_text', ['UNKNOWN', '1234'])
            ->whereBetween('timestamp', [$dateStart . ' 00:00:00', $dateEnd . ' 23:59:59'])
            ->whereNotNull('plate_text')
            ->orderBy('timestamp', 'desc')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'plate_text' => $item->plate_text,
                    'vehicle_type' => $item->vehicle_type,
                    'vehicle_color' => $item->vehicle_color,
                    'direction' => $item->direction,
                    'timestamp' => $item->timestamp->format('Y-m-d h:i:s A'),
                    'confidence' => $item->confidence ? (float) $item->confidence : null,
                    'gate_id' => $item->gate_id,
                ];
            });

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
            'changes' => [
                'uniquePlatesIn' => $calculateChange($uniquePlatesIn, $prevUniquePlatesIn),
                'uniquePlatesOut' => $calculateChange($uniquePlatesOut, $prevUniquePlatesOut),
                'totalCount' => $calculateChange($totalIn + $totalOut, $prevTotalIn + $prevTotalOut),
            ],
            'hourlyCounts' => $hourlyCounts,
            'topLicensePlates' => $topLicensePlates,
            'recentActivity' => $recentActivity,
        ]);
    }
}

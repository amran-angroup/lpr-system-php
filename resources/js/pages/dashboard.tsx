import { DailyChart } from '@/components/dashboard/daily-chart';
import { DateFilter } from '@/components/dashboard/date-filter';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { VehicleTypeChart } from '@/components/dashboard/vehicle-type-chart';
import { HourlyTrafficChart } from '@/components/dashboard/hourly-traffic-chart';
import { TopLicensePlatesTable } from '@/components/dashboard/top-license-plates-table';
import { RecentActivityFeed } from '@/components/dashboard/recent-activity-feed';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useMemo } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DailyCount {
    date: string;
    in_count: number;
    out_count: number;
}

interface WeeklyCount {
    week: number;
    week_start: string;
    in_count: number;
    out_count: number;
}

interface MonthlyCount {
    month: string;
    month_label: string;
    in_count: number;
    out_count: number;
}

interface VehicleTypeData {
    vehicle_type: string;
    in_count: number;
    out_count: number;
    total_count: number;
}

interface HourlyCount {
    hour: number;
    hour_label: string;
    in_count: number;
    out_count: number;
    total_count: number;
}

interface TopLicensePlate {
    plate_text: string;
    total_count: number;
    in_count: number;
    out_count: number;
    last_seen: string;
}

interface RecentActivityItem {
    id: number;
    plate_text: string | null;
    vehicle_type: string | null;
    vehicle_color: string | null;
    direction: 'in' | 'out';
    timestamp: string;
    confidence: number | null;
    gate_id: number | null;
}

interface DashboardProps {
    uniquePlates: {
        in: number;
        out: number;
    };
    dailyCounts: DailyCount[];
    weeklyCounts: WeeklyCount[];
    monthlyCounts: MonthlyCount[];
    vehicleTypeData: VehicleTypeData[];
    totalCounts: {
        in: number;
        out: number;
    };
    dateRange: {
        start: string;
        end: string;
    };
    changes?: {
        uniquePlatesIn: number;
        uniquePlatesOut: number;
        totalCount: number;
    };
    hourlyCounts?: HourlyCount[];
    topLicensePlates?: TopLicensePlate[];
    recentActivity?: RecentActivityItem[];
}

export default function Dashboard({
    uniquePlates,
    dailyCounts,
    weeklyCounts,
    monthlyCounts,
    vehicleTypeData,
    dateRange,
    changes,
    hourlyCounts = [],
    topLicensePlates = [],
    recentActivity = [],
}: DashboardProps) {
    // Calculate totals for daily, weekly, monthly
    const dailyTotals = useMemo(() => {
        return dailyCounts.reduce(
            (acc, curr) => ({
                in: acc.in + curr.in_count,
                out: acc.out + curr.out_count,
            }),
            { in: 0, out: 0 }
        );
    }, [dailyCounts]);

    const weeklyTotals = useMemo(() => {
        return weeklyCounts.reduce(
            (acc, curr) => ({
                in: acc.in + curr.in_count,
                out: acc.out + curr.out_count,
            }),
            { in: 0, out: 0 }
        );
    }, [weeklyCounts]);

    const monthlyTotals = useMemo(() => {
        return monthlyCounts.reduce(
            (acc, curr) => ({
                in: acc.in + curr.in_count,
                out: acc.out + curr.out_count,
            }),
            { in: 0, out: 0 }
        );
    }, [monthlyCounts]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - License Plate Recognition System" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto  p-6 ">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatsCards
                    uniquePlates={uniquePlates}
                    dailyCounts={dailyTotals}
                    weeklyCounts={weeklyTotals}
                    monthlyCounts={monthlyTotals}
                    changes={changes}
                />

                {/* Date Filter */}
                <DateFilter
                    dateStart={dateRange.start}
                    dateEnd={dateRange.end}
                />

                {/* Charts Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Daily Chart */}
                    <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <DailyChart data={dailyCounts} />
                    </div>

                    {/* Vehicle Type Chart */}
                    <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <VehicleTypeChart data={vehicleTypeData} />
                    </div>
                </div>

                {/* Hourly Traffic Chart */}
                {hourlyCounts.length > 0 && (
                    <div className="relative min-h-[400px] overflow-hidden rounded-xl bg-white border border-gray-200 shadow-sm dark:bg-gray-900 dark:border-gray-800">
                        <HourlyTrafficChart data={hourlyCounts} />
                    </div>
                )}

                {/* Top License Plates and Recent Activity Grid */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Top License Plates Table */}
                    <TopLicensePlatesTable data={topLicensePlates} />

                    {/* Recent Activity Feed */}
                    <RecentActivityFeed data={recentActivity} />
                </div>
            </div>
        </AppLayout>
    );
}

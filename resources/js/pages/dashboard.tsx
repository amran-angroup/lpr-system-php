import { DailyChart } from '@/components/dashboard/daily-chart';
import { DateFilter } from '@/components/dashboard/date-filter';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { VehicleTypeChart } from '@/components/dashboard/vehicle-type-chart';
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
}

export default function Dashboard({
    uniquePlates,
    dailyCounts,
    weeklyCounts,
    monthlyCounts,
    vehicleTypeData,
    totalCounts,
    dateRange,
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
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto bg-gray-50 p-6 dark:bg-gray-950">
                {/* Header Section */}
                <div className="flex flex-col gap-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Dashboard
                        </h1>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                            Monitor, analyze, and track vehicle entries and exits with ease.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button 
                            className="rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90"
                            style={{ backgroundColor: '#05aa9b' }}
                        >
                            Export Data
                        </button>
                        <button className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors">
                            Import Data
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <StatsCards
                    uniquePlates={uniquePlates}
                    totalCounts={totalCounts}
                    dailyCounts={dailyTotals}
                    weeklyCounts={weeklyTotals}
                    monthlyCounts={monthlyTotals}
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
            </div>
        </AppLayout>
    );
}

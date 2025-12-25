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
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Date Filter */}
                <DateFilter
                    dateStart={dateRange.start}
                    dateEnd={dateRange.end}
                />

                {/* Stats Cards */}
                <StatsCards
                    uniquePlates={uniquePlates}
                    totalCounts={totalCounts}
                    dailyCounts={dailyTotals}
                    weeklyCounts={weeklyTotals}
                    monthlyCounts={monthlyTotals}
                />

                {/* Daily Chart */}
                <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                    <DailyChart data={dailyCounts} />
                </div>

                {/* Vehicle Type Chart */}
                <VehicleTypeChart data={vehicleTypeData} />
            </div>
        </AppLayout>
    );
}

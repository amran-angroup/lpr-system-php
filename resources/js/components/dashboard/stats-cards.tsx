import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Car, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
    uniquePlates: {
        in: number;
        out: number;
    };
    totalCounts: {
        in: number;
        out: number;
    };
    dailyCounts: {
        in: number;
        out: number;
    };
    weeklyCounts: {
        in: number;
        out: number;
    };
    monthlyCounts: {
        in: number;
        out: number;
    };
}

export function StatsCards({
    uniquePlates,
    totalCounts,
    dailyCounts,
    weeklyCounts,
    monthlyCounts,
}: StatsCardsProps) {
    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Unique Plates In */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unique Plates (In)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <ArrowDownCircle className="h-4 w-4" style={{ color: '#05aa9b' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {uniquePlates.in}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-3 w-3" style={{ color: '#05aa9b' }} />
                        <span>Increased from last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Unique Plates Out */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Unique Plates (Out)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <ArrowUpCircle className="h-4 w-4" style={{ color: '#05aa9b' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {uniquePlates.out}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-3 w-3" style={{ color: '#05aa9b' }} />
                        <span>Increased from last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Daily Activity */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Daily Activity
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <Car className="h-4 w-4" style={{ color: '#05aa9b' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {dailyCounts.in + dailyCounts.out}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <TrendingUp className="h-3 w-3" style={{ color: '#05aa9b' }} />
                        <span>Increased from last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Total Counts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                        Total (Period)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <Car className="h-4 w-4" style={{ color: '#05aa9b' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white">
                        {totalCounts.in + totalCounts.out}
                    </div>
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="text-blue-600 dark:text-blue-400">
                            {totalCounts.in} in
                        </span>
                        {' / '}
                        <span className="text-orange-600 dark:text-orange-400">
                            {totalCounts.out} out
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}


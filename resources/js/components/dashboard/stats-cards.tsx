import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Car } from 'lucide-react';

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Unique Plates In */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Unique Plates (In)
                    </CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{uniquePlates.in}</div>
                    <p className="text-xs text-muted-foreground">
                        Distinct vehicles entered
                    </p>
                </CardContent>
            </Card>

            {/* Unique Plates Out */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Unique Plates (Out)
                    </CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{uniquePlates.out}</div>
                    <p className="text-xs text-muted-foreground">
                        Distinct vehicles exited
                    </p>
                </CardContent>
            </Card>

            {/* Daily Counts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Daily Activity
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {dailyCounts.in + dailyCounts.out}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">
                            {dailyCounts.in} in
                        </span>
                        {' / '}
                        <span className="text-orange-600 dark:text-orange-400">
                            {dailyCounts.out} out
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Weekly Counts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Weekly Activity
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {weeklyCounts.in + weeklyCounts.out}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">
                            {weeklyCounts.in} in
                        </span>
                        {' / '}
                        <span className="text-orange-600 dark:text-orange-400">
                            {weeklyCounts.out} out
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Monthly Counts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Monthly Activity
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {monthlyCounts.in + monthlyCounts.out}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        <span className="text-blue-600 dark:text-blue-400">
                            {monthlyCounts.in} in
                        </span>
                        {' / '}
                        <span className="text-orange-600 dark:text-orange-400">
                            {monthlyCounts.out} out
                        </span>
                    </p>
                </CardContent>
            </Card>

            {/* Total Counts */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total (Period)
                    </CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">
                        {totalCounts.in + totalCounts.out}
                    </div>
                    <p className="text-xs text-muted-foreground">
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


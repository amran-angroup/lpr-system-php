import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Car, TrendingUp, TrendingDown, Activity, Users } from 'lucide-react';

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
    changes?: {
        uniquePlatesIn: number;
        uniquePlatesOut: number;
        totalCount: number;
    };
}

export function StatsCards({
    uniquePlates,
    totalCounts,
    dailyCounts,
    weeklyCounts,
    monthlyCounts,
    changes,
}: StatsCardsProps) {
    const formatNumber = (num: number) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toLocaleString();
    };

    return (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {/* Unique Plates In */}
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <ArrowDownCircle className="h-5 w-5 text-primary" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {formatNumber(uniquePlates.in)}
                    </div>
                    <p className="text-base font-medium text-foreground">
                        Unique Plates (In)
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                        {changes && changes.uniquePlatesIn >= 0 ? (
                            <>
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="text-foreground">
                                    +{Math.abs(changes.uniquePlatesIn)}%
                                </span>
                            </>
                        ) : changes ? (
                            <>
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-foreground">
                                    {changes.uniquePlatesIn}%
                                </span>
                            </>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {/* Unique Plates Out */}
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-10 w-10 rounded-full bg-[#8f68cb]/10 flex items-center justify-center">
                        <ArrowUpCircle className="h-5 w-5 text-[#8f68cb]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {formatNumber(uniquePlates.out)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Unique Plates (Out)
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                        {changes && changes.uniquePlatesOut >= 0 ? (
                            <>
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="text-foreground">
                                    +{Math.abs(changes.uniquePlatesOut)}%
                                </span>
                            </>
                        ) : changes ? (
                            <>
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-foreground">
                                    {changes.uniquePlatesOut}%
                                </span>
                            </>
                        ) : null}
                    </div>

                </CardContent>
            </Card>

            {/* Total Vehicles */}
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-10 w-10 rounded-full bg-[#14bac4]/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-[#14bac4]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {formatNumber(totalCounts.in + totalCounts.out)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Total Vehicles
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                        {changes && changes.totalCount >= 0 ? (
                            <>
                                <TrendingUp className="h-3 w-3 text-primary" />
                                <span className="text-foreground">
                                    +{Math.abs(changes.totalCount)}%
                                </span>
                            </>
                        ) : changes ? (
                            <>
                                <TrendingDown className="h-3 w-3 text-destructive" />
                                <span className="text-foreground">
                                    {changes.totalCount}%
                                </span>
                            </>
                        ) : null}
                    </div>

                </CardContent>
            </Card>

            {/* Daily Activity */}
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-10 w-10 rounded-full bg-[#ccc072]/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-[#ccc072]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {formatNumber(dailyCounts.in + dailyCounts.out)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Daily Activity
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-foreground">Active</span>
                    </div>
                </CardContent>
            </Card>

            {/* Weekly Activity */}
            <Card className="bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="h-10 w-10 rounded-full bg-[#4d5f9c]/10 flex items-center justify-center">
                        <Car className="h-5 w-5 text-[#4d5f9c]" />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold text-foreground">
                        {formatNumber(weeklyCounts.in + weeklyCounts.out)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                        Weekly Activity
                    </p>
                    <div className="mt-3 flex items-center gap-1 text-xs">
                        <TrendingUp className="h-3 w-3 text-primary" />
                        <span className="text-foreground">Last 4 weeks</span>
                    </div>
                </CardContent>
            </Card>



        </div>
    );
}


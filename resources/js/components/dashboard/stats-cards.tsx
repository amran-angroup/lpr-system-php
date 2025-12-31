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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Vehicle Entries In */}
            <Card className='bg-[#024741]'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white dark:text-white">
                         Vehicle Entries (In)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <ArrowDownCircle className="h-5 w-5" style={{ color: '#ffffff' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-white dark:text-white">
                        {uniquePlates.in}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-white">
                        <TrendingUp className="h-4 w-4" style={{ color: '#ffffff' }} />
                        <span>Increased from last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Vehicle Entries Out */} 
            <Card className='bg-[#04786E]'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white dark:text-white">
                        Vehicle Entries (Out)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <ArrowUpCircle className="h-5 w-5" style={{ color: '#ffffff' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-white dark:text-white">
                        {uniquePlates.out}
                    </div>
                    <div className="mt-2 flex items-center gap-1 text-xs text-white">
                        <TrendingUp className="h-4 w-4" style={{ color: '#ffffff' }} />
                        <span>Increased from last month</span>
                    </div>
                </CardContent>
            </Card>

            {/* Daily Activity */} 
            

            {/* Total Counts */} 
            <Card className='bg-[#05AA9B]'>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-white dark:text-white">
                        Total (Period)
                    </CardTitle>
                    <div className="h-8 w-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(5, 170, 155, 0.1)' }}>
                        <Car className="h-5 w-5" style={{ color: '#ffffff' }} />
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="text-4xl font-bold text-white dark:text-white">
                        {totalCounts.in + totalCounts.out}
                    </div>
                    <p className="mt-2 text-xs text-white">
                        <span className="text-white">
                            {totalCounts.in} in
                        </span>
                        {' / '}
                        <span className="text-white">
                            {totalCounts.out} out
                        </span>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}


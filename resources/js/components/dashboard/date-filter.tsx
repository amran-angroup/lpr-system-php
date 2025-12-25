import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { router } from '@inertiajs/react';
import { Calendar, Filter } from 'lucide-react';
import { useState } from 'react';

interface DateFilterProps {
    dateStart: string;
    dateEnd: string;
}

export function DateFilter({ dateStart, dateEnd }: DateFilterProps) {
    const [startDate, setStartDate] = useState(dateStart);
    const [endDate, setEndDate] = useState(dateEnd);

    const handleFilter = () => {
        router.get(
            '/dashboard',
            {
                date_start: startDate,
                date_end: endDate,
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleQuickFilter = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);

        router.get(
            '/dashboard',
            {
                date_start: start.toISOString().split('T')[0],
                date_end: end.toISOString().split('T')[0],
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    return (
        <div className="flex flex-col gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <h3 className="font-semibold">Filter by Date Range</h3>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="start-date"
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            id="end-date"
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                </div>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(7)}
                >
                    Last 7 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(30)}
                >
                    Last 30 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(90)}
                >
                    Last 90 Days
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickFilter(180)}
                >
                    Last 6 Months
                </Button>
                <Button onClick={handleFilter} className="ml-auto">
                    Apply Filter
                </Button>
            </div>
        </div>
    );
}


"use client"

import * as React from "react"
import { ChevronDown, Filter, X, Check, ListFilter, ListFilterIcon, XIcon } from "lucide-react"
import { router } from '@inertiajs/react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'

interface DateFilterProps {
    dateStart: string;
    dateEnd: string;
}

type QuickFilterOption = {
    label: string;
    days: number;
}

const QUICK_FILTERS: QuickFilterOption[] = [
    { label: 'Last 7 Days', days: 7 },
    { label: 'Last 30 Days', days: 30 },
    { label: 'Last 90 Days', days: 90 },
    { label: 'Last 6 Months', days: 180 },
];

export function DateFilter({ dateStart, dateEnd }: DateFilterProps) {
    const [startDate, setStartDate] = React.useState<Date | undefined>(
        dateStart ? new Date(dateStart) : undefined
    );
    const [endDate, setEndDate] = React.useState<Date | undefined>(
        dateEnd ? new Date(dateEnd) : undefined
    );
    const [startOpen, setStartOpen] = React.useState(false)
    const [endOpen, setEndOpen] = React.useState(false)

    // Sync state with props when they change
    React.useEffect(() => {
        if (dateStart) {
            const newStart = new Date(dateStart);
            setStartDate(prev => {
                if (!prev || newStart.getTime() !== prev.getTime()) {
                    return newStart;
                }
                return prev;
            });
        } else {
            setStartDate(undefined);
        }
    }, [dateStart]);

    React.useEffect(() => {
        if (dateEnd) {
            const newEnd = new Date(dateEnd);
            setEndDate(prev => {
                if (!prev || newEnd.getTime() !== prev.getTime()) {
                    return newEnd;
                }
                return prev;
            });
        } else {
            setEndDate(undefined);
        }
    }, [dateEnd]);

    // Determine which quick filter is active
    const activeQuickFilter = React.useMemo(() => {
        if (!startDate || !endDate) return null;

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const endTime = endDate.getTime();
        const todayTime = today.getTime();
        
        // Check if end date is today (within 1 day difference)
        const isEndToday = Math.abs(todayTime - endTime) < 24 * 60 * 60 * 1000;

        if (!isEndToday) return null;

        const daysDiff = Math.floor((todayTime - startDate.getTime()) / (24 * 60 * 60 * 1000));
        
        const filter = QUICK_FILTERS.find(f => {
            // Allow some tolerance (±1 day) for the match
            return Math.abs(f.days - daysDiff) <= 1;
        });

        return filter ? filter.days : null;
    }, [startDate, endDate]);

    const formatDate = (date: Date): string => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    };

    const handleFilter = () => {
        if (!startDate || !endDate) return;
        
        // Validate date range
        if (startDate > endDate) {
            // Swap dates if start is after end
            router.get(
                '/dashboard',
                {
                    date_start: endDate.toISOString().split('T')[0],
                    date_end: startDate.toISOString().split('T')[0],
                },
                {
                    preserveState: true,
                    preserveScroll: true,
                }
            );
            return;
        }

        router.get(
            '/dashboard',
            {
                date_start: startDate.toISOString().split('T')[0],
                date_end: endDate.toISOString().split('T')[0],
            },
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const handleQuickFilter = (days: number) => {
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        const start = new Date();
        start.setDate(start.getDate() - days);
        start.setHours(0, 0, 0, 0);

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

    const handleClear = () => {
        router.get(
            '/dashboard',
            {},
            {
                preserveState: true,
                preserveScroll: true,
            }
        );
    };

    const isDateRangeValid = startDate && endDate && startDate <= endDate;

    return (
        <div className="flex flex-col gap-4 rounded-lg border border-border bg-background p-4">
            {/* Header */}
            <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <h3 className="text-sm font-medium">
                    Filter by Date Range
                </h3>
            </div>

            {/* Date Range */}
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                {/* Start Date */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="start-date" className="px-1">
                        Start Date
                    </Label>

                    <Popover open={startOpen} onOpenChange={setStartOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="start-date"
                                variant="outline"
                                className="justify-between font-normal"
                            >
                                {startDate
                                    ? formatDate(startDate)
                                    : "Select start date"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={startDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setStartDate(date)
                                    setStartOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* End Date */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="end-date" className="px-1">
                        End Date
                    </Label>

                    <Popover open={endOpen} onOpenChange={setEndOpen}>
                        <PopoverTrigger asChild>
                            <Button
                                id="end-date"
                                variant="outline"
                                className=" justify-between font-normal"
                            >
                                {endDate
                                    ? formatDate(endDate)
                                    : "Select end date"}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>

                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={endDate}
                                captionLayout="dropdown"
                                onSelect={(date) => {
                                    setEndDate(date)
                                    setEndOpen(false)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Apply & Clear */}
                <div className="flex items-end gap-2">
                    <Button
                        onClick={handleFilter}
                        disabled={!isDateRangeValid}
                        className="bg-[#05aa9b] text-white hover:bg-[#05aa9b]/90"
                    >
                        <ListFilterIcon />
                        Apply Filter
                    </Button>
                    {(startDate || endDate) && (
                        <Button
                            onClick={handleClear}
                            variant="outline"
                            className="shrink-0"
                        >
                            <XIcon />
                            Clear Filter
                        </Button>
                    )}
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
                {QUICK_FILTERS.map((filter) => {
                    const isActive = activeQuickFilter === filter.days;
                    return (
                        <Button
                            key={filter.days}
                            variant={isActive ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleQuickFilter(filter.days)}
                            className={isActive ? "bg-[#05aa9b] text-white hover:bg-[#05aa9b]/90" : ""}
                        >
                            {filter.label}
                        </Button>
                    );
                })}
            </div>
        </div>
    );

}


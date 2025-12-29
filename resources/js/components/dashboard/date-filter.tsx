"use client"

import * as React from "react"
import { ChevronDown, ChevronDownIcon, Filter } from "lucide-react"
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

export function DateFilter({ dateStart, dateEnd }: DateFilterProps) {
    const [startDate, setStartDate] = React.useState<Date | undefined>(
        dateStart ? new Date(dateStart) : undefined
    );
    const [endDate, setEndDate] = React.useState<Date | undefined>(
        dateEnd ? new Date(dateEnd) : undefined
    );
    const [startOpen, setStartOpen] = React.useState(false)
    const [endOpen, setEndOpen] = React.useState(false)

    const handleFilter = () => {
        router.get(
            '/dashboard',
            {
                date_start: startDate ? startDate.toISOString().split('T')[0] : '',
                date_end: endDate ? endDate.toISOString().split('T')[0] : '',
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
                                className="w-full justify-between font-normal"
                            >
                                {startDate
                                    ? startDate.toLocaleDateString()
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
                                className="w-full justify-between font-normal"
                            >
                                {endDate
                                    ? endDate.toLocaleDateString()
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

                {/* Apply */}
                <div className="flex items-end">
                    <Button
                        onClick={handleFilter}
                        disabled={!startDate || !endDate}
                        className="w-full bg-[#05aa9b] text-white hover:bg-[#05aa9b]/90"

                    >
                        Apply Filter
                    </Button>
                </div>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(7)}>
                    Last 7 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(30)}>
                    Last 30 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(90)}>
                    Last 90 Days
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleQuickFilter(180)}>
                    Last 6 Months
                </Button>
            </div>
        </div>
    );

}


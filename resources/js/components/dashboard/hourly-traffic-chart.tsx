'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface HourlyCount {
    hour: number;
    hour_label: string;
    in_count: number;
    out_count: number;
    total_count: number;
}

interface HourlyTrafficChartProps {
    data: HourlyCount[];
}

const chartConfig = {
    in: {
        label: 'In',
        color: 'var(--chart-2)',
    },
    out: {
        label: 'Out',
        color: 'var(--chart-1)',
    },
} satisfies ChartConfig;

export function HourlyTrafficChart({ data }: HourlyTrafficChartProps) {
    // Ensure all 24 hours are represented (fill missing hours with 0)
    const completeData = React.useMemo(() => {
        const hourMap = new Map(
            data.map((item) => [item.hour, item])
        );
        
        return Array.from({ length: 24 }, (_, hour) => {
            const existing = hourMap.get(hour);
            return existing || {
                hour,
                hour_label: `${hour.toString().padStart(2, '0')}:00`,
                in_count: 0,
                out_count: 0,
                total_count: 0,
            };
        });
    }, [data]);

    const chartData = React.useMemo(() => {
        return completeData.map((item) => ({
            hour: item.hour_label,
            in: item.in_count,
            out: item.out_count,
            total: item.total_count,
        }));
    }, [completeData]);

    const peakHour = React.useMemo(() => {
        return completeData.reduce((max, item) => 
            item.total_count > max.total_count ? item : max,
            completeData[0] || { hour_label: 'N/A', total_count: 0 }
        );
    }, [completeData]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col items-stretch border-b border-gray-200 dark:border-gray-800 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Hourly Traffic Pattern
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Vehicle activity by hour of day
                        {peakHour.total_count > 0 && (
                            <span className="ml-2 text-primary font-medium">
                                Peak: {peakHour.hour_label} ({peakHour.total_count} vehicles)
                            </span>
                        )}
                    </p>
                </div>
            </div>
            <div className="flex-1 px-2 sm:px-6 sm:py-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] w-full"
                >
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} strokeDasharray="3 3" />
                        <XAxis
                            dataKey="hour"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            angle={-45}
                            textAnchor="end"
                            height={60}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={{ opacity: 0.2 }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => `Hour: ${value}`}
                                />
                            }
                        />
                        <Bar
                            dataKey="in"
                            stackId="traffic"
                            fill="var(--color-in)"
                            radius={[0, 0, 0, 0]}
                        />
                        <Bar
                            dataKey="out"
                            stackId="traffic"
                            fill="var(--color-out)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 px-6 py-4">
                <div className="flex items-center justify-center gap-6">
                    {Object.entries(chartConfig).map(([key, config]) => (
                        <div
                            key={key}
                            className="flex items-center gap-2"
                        >
                            <div
                                className="h-3 w-3 shrink-0 rounded-sm"
                                style={{
                                    backgroundColor: config.color,
                                }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                {config.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}


'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface DailyCount {
    date: string;
    in_count: number;
    out_count: number;
}

interface DailyChartProps {
    data: DailyCount[];
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

export function DailyChart({ data }: DailyChartProps) {
    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            date: item.date,
            in: item.in_count,
            out: item.out_count,
        }));
    }, [data]);

    return (
        <div className="flex flex-col h-full">
            <div className="flex flex-col items-stretch border-b border-gray-200 dark:border-gray-800 sm:flex-row">
                <div className="flex flex-1 flex-col justify-center gap-1 px-6 pt-4 pb-3 sm:py-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Daily Vehicle Log
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Showing vehicle entries and exits by day
                    </p>
                </div>
            </div>
            <div className="flex-1 px-2 sm:px-6 sm:py-6">
                <ChartContainer
                    config={chartConfig}
                    className="aspect-auto h-[350px] w-full"
                >
                    <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            left: 12,
                            right: 12,
                            top: 12,
                            bottom: 12,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            minTickGap={32}
                            tickFormatter={(value) => {
                                const date = new Date(value);
                                return date.toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                });
                            }}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            cursor={{ strokeDasharray: '3 3' }}
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => {
                                        return new Date(value).toLocaleDateString(
                                            'en-US',
                                            {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            }
                                        );
                                    }}
                                />
                            }
                        />
                        <Line
                            dataKey="in"
                            type="monotone"
                            stroke="var(--color-in)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                        <Line
                            dataKey="out"
                            type="monotone"
                            stroke="var(--color-out)"
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                        />
                    </LineChart>
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


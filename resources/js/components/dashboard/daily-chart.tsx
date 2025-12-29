'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
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
        color: 'hsl(var(--chart-2))',
    },
    out: {
        label: 'Out',
        color: 'hsl(var(--chart-1))',
    },
} satisfies ChartConfig;

export function DailyChart({ data }: DailyChartProps) {
    const [activeChart, setActiveChart] =
        React.useState<keyof typeof chartConfig>('in');

    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            date: item.date,
            in: item.in_count,
            out: item.out_count,
        }));
    }, [data]);

    const total = React.useMemo(
        () => ({
            in: chartData.reduce((acc, curr) => acc + curr.in, 0),
            out: chartData.reduce((acc, curr) => acc + curr.out, 0),
        }),
        [chartData]
    );

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
                <div className="flex">
                    {['in', 'out'].map((key) => {
                        const chart = key as keyof typeof chartConfig;
                        const isActive = activeChart === chart;
                        return (
                            <button
                                key={chart}
                                onClick={() => setActiveChart(chart)}
                                className={`relative z-30 flex flex-1 flex-col justify-center gap-1 border-t border-gray-200 dark:border-gray-800 px-6 py-4 text-left transition-colors even:border-l sm:border-t-0 sm:border-l sm:px-8 sm:py-6 ${
                                    isActive 
                                        ? 'bg-gray-100 dark:bg-gray-800' 
                                        : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                                }`}
                            >
                                <span className="text-xs text-gray-600 dark:text-gray-400">
                                    {chartConfig[chart].label}
                                </span>
                                <span className="text-lg leading-none font-bold text-gray-900 dark:text-white sm:text-3xl">
                                    {total[chart].toLocaleString()}
                                </span>
                            </button>
                        );
                    })}
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
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    className="w-[150px]"
                                    nameKey="views"
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
                        <Bar
                            dataKey={activeChart}
                            fill={`var(--color-${activeChart})`}
                        />
                    </BarChart>
                </ChartContainer>
            </div>
        </div>
    );
}


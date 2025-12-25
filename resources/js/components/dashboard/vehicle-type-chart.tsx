'use client';

import * as React from 'react';
import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';

interface VehicleTypeData {
    vehicle_type: string;
    in_count: number;
    out_count: number;
    total_count: number;
}

interface VehicleTypeChartProps {
    data: VehicleTypeData[];
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

export function VehicleTypeChart({ data }: VehicleTypeChartProps) {
    const chartData = React.useMemo(() => {
        return data.map((item) => ({
            type: item.vehicle_type || 'Unknown',
            in: item.in_count,
            out: item.out_count,
        }));
    }, [data]);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Vehicle Type Distribution</CardTitle>
                <CardDescription>
                    Breakdown of vehicles by type category
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="h-[400px] w-full">
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
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="type"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            angle={-45}
                            textAnchor="end"
                            height={80}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => `Type: ${value}`}
                                />
                            }
                        />
                        <Legend />
                        <Bar
                            dataKey="in"
                            fill="var(--color-in)"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar
                            dataKey="out"
                            fill="var(--color-out)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}


'use client';

import * as React from 'react';
import { Cell, Pie, PieChart } from 'recharts';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    ChartLegend,
    ChartLegendContent,
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

const COLORS = [
    'oklch(0.646 0.222 41.116)',
    'oklch(0.6 0.118 184.704)',
    'oklch(0.398 0.07 227.392)',
    'oklch(0.828 0.189 84.429)',
    'oklch(0.769 0.188 70.08)',
];

const COLORS_DARK = [
    'oklch(0.488 0.243 264.376)',
    'oklch(0.696 0.17 162.48)',
    'oklch(0.769 0.188 70.08)',
    'oklch(0.627 0.265 303.9)',
    'oklch(0.645 0.246 16.439)',
];

const chartConfig = {} satisfies ChartConfig;

export function VehicleTypeChart({ data }: VehicleTypeChartProps) {
    const [isDark, setIsDark] = React.useState(false);
    
    React.useEffect(() => {
        const checkDarkMode = () => {
            setIsDark(document.documentElement.classList.contains('dark'));
        };
        checkDarkMode();
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class'],
        });
        return () => observer.disconnect();
    }, []);

    const colors = isDark ? COLORS_DARK : COLORS;
    const chartData = React.useMemo(() => {
        return data.map((item, index) => {
            const name = item.vehicle_type || 'Unknown';
            const key = `type-${index}`;
            return {
                name,
                key,
                value: item.total_count,
                fill: colors[index % colors.length],
            };
        });
    }, [data, colors]);

    const dynamicChartConfig = React.useMemo(() => {
        const config: ChartConfig = {};
        chartData.forEach((item) => {
            config[item.key] = {
                label: item.name,
                color: item.fill,
            };
        });
        return config;
    }, [chartData]);

    const renderLabel = React.useCallback((props: any) => {
        const { cx, cy, midAngle, innerRadius, outerRadius, name, percent } = props;
        const dataEntry = chartData.find((item) => item.name === name);
        const fill = dataEntry?.fill || colors[0];
        const RADIAN = Math.PI / 180;
        const labelRadius = outerRadius + 25;
        const x = cx + labelRadius * Math.cos(-midAngle * RADIAN);
        const y = cy + labelRadius * Math.sin(-midAngle * RADIAN);
        
        return (
            <text
                x={x}
                y={y}
                fill={fill}
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                fontSize={12}
                fontWeight={500}
                style={{ pointerEvents: 'none' }}
            >
                {`${name}: ${(percent * 100).toFixed(0)}%`}
            </text>
        );
    }, [chartData, colors]);

    return (
        <div className="flex flex-col h-full">
            <div className="px-6 pt-6 pb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Vehicle Type Distribution
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Breakdown of vehicles by type category
                </p>
            </div>
            <div className="flex-1 px-6 pb-6">
                <ChartContainer config={dynamicChartConfig} className="h-[400px] w-full">
                    <PieChart>
                        <ChartTooltip
                            content={
                                <ChartTooltipContent
                                    labelFormatter={(value) => `Type: ${value}`}
                                    formatter={(value) => [
                                        `${value} vehicles`,
                                        'Total',
                                    ]}
                                />
                            }
                        />
                        <Pie
                            data={chartData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            innerRadius={80}
                            outerRadius={140}
                            paddingAngle={2}
                            labelLine={{
                                stroke: '#888',
                                strokeWidth: 1,
                            }}
                            label={renderLabel}
                        >
                            {chartData.map((entry, index) => (
                                <Cell 
                                    key={`cell-${index}`} 
                                    fill={entry.fill}
                                />
                            ))}
                        </Pie>
                        <ChartLegend
                            content={<ChartLegendContent nameKey="name" />}
                            verticalAlign="bottom"
                        />
                    </PieChart>
                </ChartContainer>
            </div>
        </div>
    );
}


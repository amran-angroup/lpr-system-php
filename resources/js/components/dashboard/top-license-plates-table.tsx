'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface TopLicensePlate {
    plate_text: string;
    total_count: number;
    in_count: number;
    out_count: number;
    last_seen: string;
}

interface TopLicensePlatesTableProps {
    data: TopLicensePlate[];
}

export function TopLicensePlatesTable({ data }: TopLicensePlatesTableProps) {
    if (data.length === 0) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Top License Plates
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Most frequent vehicles in the selected period
                    </p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No data available
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card">
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Top License Plates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Most frequent vehicles in the selected period
                </p>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-200 dark:border-gray-800">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Rank
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    License Plate
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Total
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    In
                                </th>
                                <th className="text-center py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Out
                                </th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Last Seen
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((plate, index) => (
                                <tr
                                    key={plate.plate_text}
                                    className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                                >
                                    <td className="py-3 px-4">
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                            {index + 1}
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                            {plate.plate_text}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <span className="font-semibold text-gray-900 dark:text-white">
                                            {plate.total_count}
                                        </span>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <ArrowDownCircle className="h-4 w-4 text-primary" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {plate.in_count}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <ArrowUpCircle className="h-4 w-4 text-[#8f68cb]" />
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {plate.out_count}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">
                                            {formatDistanceToNow(new Date(plate.last_seen), {
                                                addSuffix: true,
                                            })}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </CardContent>
        </Card>
    );
}


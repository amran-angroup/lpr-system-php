'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ArrowDownCircle, ArrowUpCircle, Car, Clock } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';

interface RecentActivityItem {
    id: number;
    plate_text: string | null;
    vehicle_type: string | null;
    vehicle_color: string | null;
    direction: 'in' | 'out';
    timestamp: string;
    confidence: number | null;
    gate_id: number | null;
}

interface RecentActivityFeedProps {
    data: RecentActivityItem[];
}

export function RecentActivityFeed({ data }: RecentActivityFeedProps) {
    if (data.length === 0) {
        return (
            <Card className="bg-card">
                <CardHeader>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Recent Activity
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        Latest vehicle entries and exits
                    </p>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                        No recent activity
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="bg-card">
            <CardHeader>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Recent Activity
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Latest vehicle entries and exits
                </p>
            </CardHeader>
            <CardContent>
                <div className="space-y-3  overflow-y-auto">
                    {data.map((activity) => (
                        <div
                            key={activity.id}
                            className="flex items-start gap-4 p-3 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                        >
                            <div
                                className={`flex-shrink-0 mt-1 ${activity.direction === 'in'
                                        ? 'text-primary'
                                        : 'text-[#8f68cb]'
                                    }`}
                            >
                                {activity.direction === 'in' ? (
                                    <ArrowDownCircle className="h-5 w-5" />
                                ) : (
                                    <ArrowUpCircle className="h-5 w-5" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-mono font-semibold text-gray-900 dark:text-white">
                                        {activity.plate_text || 'Unknown'}
                                    </span>
                                    <span
                                        className={`px-2 py-0.5 rounded text-xs font-medium ${activity.direction === 'in'
                                                ? 'bg-primary/10 text-primary'
                                                : 'bg-[#8f68cb]/10 text-[#8f68cb]'
                                            }`}
                                    >
                                        {activity.direction.toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                    {activity.vehicle_type && (
                                        <div className="flex items-center gap-1">
                                            <Car className="h-3 w-3" />
                                            <span>{activity.vehicle_type}</span>
                                        </div>
                                    )}
                                    {activity.vehicle_color && (
                                        <span className="capitalize">
                                            {activity.vehicle_color}
                                        </span>
                                    )}
                                    {activity.confidence !== null && (
                                        <span className="text-xs">
                                            {activity.confidence.toFixed(0)}% confidence
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500 dark:text-gray-500">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                        {formatDistanceToNow(
                                            new Date(activity.timestamp),
                                            {
                                                addSuffix: true,
                                            }
                                        )}
                                    </span>
                                    <span className="mx-1">•</span>
                                    <span>
                                        {format(new Date(activity.timestamp), 'HH:mm:ss')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}


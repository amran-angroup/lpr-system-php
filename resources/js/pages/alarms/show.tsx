import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

interface Alarm {
    id: number;
    alarmId: string;
    alarm_name: string;
    alarm_type: number;
    alarm_time: number;
    channel_no: number;
    is_encrypt: number;
    is_checked: number;
    pre_time: number;
    delay_time: number;
    device_serial: string;
    rec_state: number;
    alarm_pic_url: string;
    relation_alarms: string | null;
    customer_type: string | null;
    customer_info: string | null;
    created_at: string;
    updated_at: string;
}

interface AlarmsShowProps {
    alarm: Alarm;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Alarms',
        href: '/alarms',
    },
    {
        title: 'Alarm Details',
        href: '#',
    },
];

export default function AlarmsShow({ alarm }: AlarmsShowProps) {
    const formatDate = (timestamp: number) => {
        // Convert timestamp (milliseconds) to Date and format in Malaysia timezone
        const date = new Date(timestamp);
        return date.toLocaleString('en-MY', {
            timeZone: 'Asia/Kuala_Lumpur',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Alarm ${alarm.alarmId}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Back Button */}
                <div>
                    <Link href="/alarms">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Alarms
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Alarm Image</h2>
                        {alarm.alarm_pic_url ? (
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                                <img
                                    src={alarm.alarm_pic_url}
                                    alt={`Alarm ${alarm.alarmId}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-muted/50">
                                <span className="text-muted-foreground">No image available</span>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Alarm Details</h2>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <div className="divide-y divide-sidebar-border/70">
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Alarm ID</div>
                                    <div className="mt-1 text-sm">{alarm.alarmId}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Name</div>
                                    <div className="mt-1 text-sm">{alarm.alarm_name}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Type</div>
                                    <div className="mt-1 text-sm">{alarm.alarm_type}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Time</div>
                                    <div className="mt-1 text-sm">{formatDate(alarm.alarm_time)}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Device Serial</div>
                                    <div className="mt-1 text-sm">{alarm.device_serial}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Channel No</div>
                                    <div className="mt-1 text-sm">{alarm.channel_no}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Status</div>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                alarm.is_checked
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                                    : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                            }`}
                                        >
                                            {alarm.is_checked ? 'Checked' : 'Unchecked'}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Pre Time</div>
                                    <div className="mt-1 text-sm">{alarm.pre_time} seconds</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Delay Time</div>
                                    <div className="mt-1 text-sm">{alarm.delay_time} seconds</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Recording State</div>
                                    <div className="mt-1 text-sm">{alarm.rec_state}</div>
                                </div>
                                {alarm.customer_type && (
                                    <div className="px-4 py-3">
                                        <div className="text-sm font-medium text-muted-foreground">Customer Type</div>
                                        <div className="mt-1 text-sm">{alarm.customer_type}</div>
                                    </div>
                                )}
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Created At</div>
                                    <div className="mt-1 text-sm">
                                        {new Date(alarm.created_at).toLocaleString('en-MY', {
                                            timeZone: 'Asia/Kuala_Lumpur',
                                            year: 'numeric',
                                            month: '2-digit',
                                            day: '2-digit',
                                            hour: '2-digit',
                                            minute: '2-digit',
                                            second: '2-digit',
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}


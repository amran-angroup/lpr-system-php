import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Form, Head, Link } from '@inertiajs/react';
import { AlertCircleIcon, CheckCircleIcon, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

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

interface PaginatedAlarms {
    data: Alarm[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: Array<{
        url: string | null;
        label: string;
        active: boolean;
    }>;
}

interface AlarmsIndexProps {
    alarms: PaginatedAlarms;
    success?: {
        message: string;
        stored?: number;
        skipped?: number;
        total?: number;
    };
    error?: {
        message: string;
        code?: string;
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Alarms',
        href: '/alarms',
    },
];

export default function AlarmsIndex({ alarms, success, error }: AlarmsIndexProps) {
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
            <Head title="Alarms" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Success Message */}
                {success && (
                    <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                        <CheckCircleIcon className="text-green-600 dark:text-green-400" />
                        <AlertTitle className="text-green-800 dark:text-green-200">Success</AlertTitle>
                        <AlertDescription className="text-green-700 dark:text-green-300">
                            <p>{success.message}</p>
                            {success.stored !== undefined && (
                                <p className="mt-1 text-sm">
                                    Stored: {success.stored} | Skipped: {success.skipped} | Total: {success.total}
                                </p>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Error Message */}
                {error && (
                    <Alert variant="destructive">
                        <AlertCircleIcon />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>
                            <p>{error.message}</p>
                            {error.code && <p className="mt-1 text-sm">Code: {error.code}</p>}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Header with Sync Button and Pagination Info */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {alarms.from} to {alarms.to} of {alarms.total} alarms
                    </div>
                    <Form action="/alarms/sync" method="post">
                        {({ processing }) => (
                            <Button type="submit" disabled={processing}>
                                {processing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                                {processing ? 'Syncing...' : 'Sync Alarms'}
                            </Button>
                        )}
                    </Form>
                </div>

                <DataTable
                    data={alarms.data}
                    columns={[
                        {
                            header: 'ID',
                            accessorKey: 'id',
                        },
                        {
                            header: 'Alarm ID',
                            accessorKey: 'alarmId',
                        },
                        {
                            header: 'Name',
                            accessorKey: 'alarm_name',
                        },
                        {
                            header: 'Type',
                            accessorKey: 'alarm_type',
                        },
                        {
                            header: 'Time',
                            accessorKey: 'alarm_time',
                            cell: (row) => formatDate(row.alarm_time),
                        },
                        {
                            header: 'Device',
                            accessorKey: 'device_serial',
                        },
                        {
                            header: 'Status',
                            accessorKey: 'is_checked',
                            cell: (row) => (
                                <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                        row.is_checked
                                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    }`}
                                >
                                    {row.is_checked ? 'Checked' : 'Unchecked'}
                                </span>
                            ),
                        },
                        {
                            header: 'Image',
                            accessorKey: 'alarm_pic_url',
                            cell: (row) =>
                                row.alarm_pic_url ? (
                                    <img
                                        src={row.alarm_pic_url}
                                        alt={`Alarm ${row.alarmId}`}
                                        className="h-16 w-16 rounded object-cover"
                                    />
                                ) : (
                                    <span className="text-muted-foreground">No image</span>
                                ),
                        },
                        {
                            header: 'Action',
                            accessorKey: 'id',
                            cell: (row) => (
                                <Link
                                    href={`/alarms/${row.id}`}
                                    className="text-primary hover:underline"
                                >
                                    View
                                </Link>
                            ),
                        },
                    ]}
                    searchPlaceholder="Search by Alarm ID, Name, or Device..."
                    searchKey="search"
                    dateFilterKey="date"
                    dateFilterLabel="Alarm Time"
                    emptyMessage="No alarms found"
                    baseUrl="/alarms"
                />

                {/* Pagination */}
                {alarms.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 pt-4">
                        <div className="text-sm text-muted-foreground">
                            Page {alarms.current_page} of {alarms.last_page}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            {alarms.links[0]?.url && (
                                <Link
                                    href={alarms.links[0].url}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="ml-1">Previous</span>
                                </Link>
                            )}

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {alarms.links.slice(1, -1).map((link, index) => {
                                    if (link.url === null) {
                                        return (
                                            <span
                                                key={index}
                                                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium"
                                                dangerouslySetInnerHTML={{ __html: link.label }}
                                            />
                                        );
                                    }
                                    return (
                                        <Link
                                            key={index}
                                            href={link.url || '#'}
                                            className={`inline-flex items-center justify-center rounded-md border border-input px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground ${
                                                link.active
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-background'
                                            }`}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Next Button */}
                            {alarms.links[alarms.links.length - 1]?.url && (
                                <Link
                                    href={alarms.links[alarms.links.length - 1].url || '#'}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <span className="mr-1">Next</span>
                                    <ChevronRight className="h-4 w-4" />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}


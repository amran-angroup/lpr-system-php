import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/data-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface VehicleLog {
    id: number;
    alarm_id: number | null;
    gate_id: number | null;
    timestamp: string;
    license_plate: string | null;
    vehicle_type: string | null;
    vehicle_color: string | null;
    direction: 'in' | 'out';
    image_path: string | null;
    confidence: number | null;
    license_plate_coords: {
        x: number;
        y: number;
        width: number;
        height: number;
    } | null;
    plate_text: string | null;
    plate_image_base64: string | null;
    created_at: string;
    updated_at: string;
    alarm?: {
        id: number;
        alarmId: string;
        alarm_name: string;
    } | null;
}

interface PaginatedVehicleLogs {
    data: VehicleLog[];
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

interface VehicleLogsIndexProps {
    vehicleLogs: PaginatedVehicleLogs;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicle Logs',
        href: '/vehicle-logs',
    },
];

export default function VehicleLogsIndex({ vehicleLogs }: VehicleLogsIndexProps) {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
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
            <Head title="Vehicle Logs" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                {/* Header with Pagination Info */}
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Showing {vehicleLogs.from} to {vehicleLogs.to} of {vehicleLogs.total} vehicle logs
                    </div>
                </div>

                <DataTable
                    data={vehicleLogs.data}
                    columns={[
                        {
                            header: 'ID',
                            accessorKey: 'id',
                        },
                        {
                            header: 'Timestamp',
                            accessorKey: 'timestamp',
                            cell: (row) => formatDate(row.timestamp),
                        },
                        {
                            header: 'License Plate',
                            accessorKey: 'plate_text',
                            cell: (row) =>
                                row.plate_text || (
                                    <span className="text-muted-foreground">N/A</span>
                                ),
                        },
                        {
                            header: 'Gate ID',
                            accessorKey: 'gate_id',
                            cell: (row) =>
                                row.gate_id || (
                                    <span className="text-muted-foreground">N/A</span>
                                ),
                        },
                        {
                            header: 'Alarm',
                            accessorKey: 'alarm',
                            cell: (row) =>
                                row.alarm ? (
                                    <Link
                                        href={`/alarms/${row.alarm.id}`}
                                        className="text-primary hover:underline"
                                    >
                                        {row.alarm.alarm_name}
                                    </Link>
                                ) : (
                                    <span className="text-muted-foreground">N/A</span>
                                ),
                        },
                        {
                            header: 'Image',
                            accessorKey: 'image_path',
                            cell: (row) => {
                                if (row.image_path) {
                                    return (
                                        <img
                                            src={`data:image/jpeg;base64,${row.image_path}`}
                                            alt={`Vehicle log ${row.id}`}
                                            className="h-16 w-16 rounded object-cover"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                            }}
                                        />
                                    );
                                }
                                if (row.plate_image_base64) {
                                    return (
                                        <img
                                            src={`data:image/png;base64,${row.plate_image_base64}`}
                                            alt={`Plate ${row.id}`}
                                            className="h-16 w-16 rounded object-cover"
                                        />
                                    );
                                }
                                return <span className="text-muted-foreground">No image</span>;
                            },
                        },
                        {
                            header: 'Action',
                            accessorKey: 'id',
                            cell: (row) => (
                                <Link
                                    href={`/vehicle-logs/${row.id}`}
                                    className="text-primary hover:underline"
                                >
                                    View
                                </Link>
                            ),
                        },
                    ]}
                    searchPlaceholder="Search by License Plate, Type, or Color..."
                    searchKey="search"
                    dateFilterKey="date"
                    dateFilterLabel="Timestamp"
                    emptyMessage="No vehicle logs found"
                    baseUrl="/vehicle-logs"
                />

                {/* Pagination */}
                {vehicleLogs.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-sidebar-border/70 pt-4">
                        <div className="text-sm text-muted-foreground">
                            Page {vehicleLogs.current_page} of {vehicleLogs.last_page}
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Previous Button */}
                            {vehicleLogs.links[0]?.url && (
                                <Link
                                    href={vehicleLogs.links[0].url}
                                    className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                    <span className="ml-1">Previous</span>
                                </Link>
                            )}

                            {/* Page Numbers */}
                            <div className="flex items-center gap-1">
                                {vehicleLogs.links.slice(1, -1).map((link, index) => {
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
                            {vehicleLogs.links[vehicleLogs.links.length - 1]?.url && (
                                <Link
                                    href={vehicleLogs.links[vehicleLogs.links.length - 1].url || '#'}
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

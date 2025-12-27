import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

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
    cropped_image_path: string | null;
    created_at: string;
    updated_at: string;
    alarm?: {
        id: number;
        alarmId: string;
        alarm_name: string;
    } | null;
}

interface VehicleLogsShowProps {
    vehicleLog: VehicleLog;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Vehicle Logs',
        href: '/vehicle-logs',
    },
    {
        title: 'Vehicle Log Details',
        href: '#',
    },
];

export default function VehicleLogsShow({ vehicleLog }: VehicleLogsShowProps) {
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

    const formatConfidence = (confidence: any): string => {
        if (confidence === null || confidence === undefined) {
            return 'N/A';
        }
        const num = typeof confidence === 'number' ? confidence : parseFloat(String(confidence));
        if (isNaN(num) || !isFinite(num)) {
            return 'N/A';
        }
        return `${num.toFixed(2)}%`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Vehicle Log ${vehicleLog.id}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                {/* Back Button */}
                <div>
                    <Link href="/vehicle-logs">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Vehicle Logs
                        </Button>
                    </Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    {/* Image Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Vehicle Image</h2>
                        {vehicleLog.image_path ? (
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                                <img
                                    src={
                                        // Check if image_path is base64 (long string without http/https)
                                        vehicleLog.image_path && !vehicleLog.image_path.startsWith('http') && !vehicleLog.image_path.startsWith('/')
                                            ? `data:image/jpeg;base64,${vehicleLog.image_path}`
                                            : vehicleLog.image_path
                                    }
                                    alt={`Vehicle log ${vehicleLog.id}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ) : vehicleLog.plate_image_base64 ? (
                            <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                                <img
                                    src={`data:image/png;base64,${vehicleLog.plate_image_base64}`}
                                    alt={`Plate ${vehicleLog.id}`}
                                    className="w-full h-auto object-contain"
                                />
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-muted/50">
                                <span className="text-muted-foreground">No image available</span>
                            </div>
                        )}
                        
                        {/* Cropped Plate Image */}
                        {vehicleLog.cropped_image_path && (
                            <div className="space-y-2">
                                <h3 className="text-md font-semibold">Cropped License Plate</h3>
                                <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border overflow-hidden">
                                    <img
                                        src={`/storage/${vehicleLog.cropped_image_path}`}
                                        alt={`Cropped plate ${vehicleLog.id}`}
                                        className="w-full h-auto object-contain"
                                        onError={(e) => {
                                            // Fallback to base64 if file doesn't exist
                                            if (vehicleLog.plate_image_base64) {
                                                (e.target as HTMLImageElement).src = `data:image/jpeg;base64,${vehicleLog.plate_image_base64}`;
                                            }
                                        }}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Details Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold">Vehicle Log Details</h2>
                        <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                            <div className="divide-y divide-sidebar-border/70">
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">ID</div>
                                    <div className="mt-1 text-sm">{vehicleLog.id}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Timestamp</div>
                                    <div className="mt-1 text-sm">{formatDate(vehicleLog.timestamp)}</div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">License Plate</div>
                                    <div className="mt-1 text-sm">
                                        {vehicleLog.license_plate || vehicleLog.plate_text || (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Vehicle Type</div>
                                    <div className="mt-1 text-sm">
                                        {vehicleLog.vehicle_type || (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Vehicle Color</div>
                                    <div className="mt-1 text-sm">
                                        {vehicleLog.vehicle_color || (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Direction</div>
                                    <div className="mt-1">
                                        <span
                                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                                                vehicleLog.direction === 'in'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                                                    : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                                            }`}
                                        >
                                            {vehicleLog.direction.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Confidence</div>
                                    <div className="mt-1 text-sm">
                                        {formatConfidence(vehicleLog.confidence) === 'N/A' ? (
                                            <span className="text-muted-foreground">N/A</span>
                                        ) : (
                                            <span>{formatConfidence(vehicleLog.confidence)}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Gate ID</div>
                                    <div className="mt-1 text-sm">
                                        {vehicleLog.gate_id || (
                                            <span className="text-muted-foreground">N/A</span>
                                        )}
                                    </div>
                                </div>
                                {vehicleLog.alarm && (
                                    <div className="px-4 py-3">
                                        <div className="text-sm font-medium text-muted-foreground">Related Alarm</div>
                                        <div className="mt-1 text-sm">
                                            <Link
                                                href={`/alarms/${vehicleLog.alarm.id}`}
                                                className="text-primary hover:underline"
                                            >
                                                {vehicleLog.alarm.alarm_name} ({vehicleLog.alarm.alarmId})
                                            </Link>
                                        </div>
                                    </div>
                                )}
                                {vehicleLog.license_plate_coords && (
                                    <div className="px-4 py-3">
                                        <div className="text-sm font-medium text-muted-foreground">License Plate Coordinates</div>
                                        <div className="mt-1 text-sm">
                                            X: {vehicleLog.license_plate_coords.x}, Y: {vehicleLog.license_plate_coords.y}
                                            <br />
                                            Width: {vehicleLog.license_plate_coords.width}, Height: {vehicleLog.license_plate_coords.height}
                                        </div>
                                    </div>
                                )}
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Created At</div>
                                    <div className="mt-1 text-sm">
                                        {formatDate(vehicleLog.created_at)}
                                    </div>
                                </div>
                                <div className="px-4 py-3">
                                    <div className="text-sm font-medium text-muted-foreground">Updated At</div>
                                    <div className="mt-1 text-sm">
                                        {formatDate(vehicleLog.updated_at)}
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


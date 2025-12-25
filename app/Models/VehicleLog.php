<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VehicleLog extends Model
{
    protected $fillable = [
        'alarm_id',
        'gate_id',
        'timestamp',
        'license_plate',
        'vehicle_type',
        'vehicle_color',
        'direction',
        'image_path',
        'confidence',
        'license_plate_coords',
        'plate_text',
        'plate_image_base64',
        'cropped_image_path',
    ];

    protected $casts = [
        'timestamp' => 'datetime',
        'license_plate_coords' => 'array',
        'confidence' => 'decimal:2',
    ];

    /**
     * Get the alarm that this vehicle log belongs to
     */
    public function alarm(): BelongsTo
    {
        return $this->belongsTo(Alarms::class, 'alarm_id');
    }
}

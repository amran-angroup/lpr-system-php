<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Alarms extends Model
{
    protected $table = 'alarms';
    protected $guarded = ['id', 'created_at', 'updated_at'];

    /**
     * Get the vehicle logs for this alarm
     */
    public function vehicleLogs(): HasMany
    {
        return $this->hasMany(VehicleLog::class, 'alarm_id');
    }
}

<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Device extends Model
{

    protected $table = 'Devices';

    protected $fillable = ['imei', 'vehicle_id', 'device_model', 'status'];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
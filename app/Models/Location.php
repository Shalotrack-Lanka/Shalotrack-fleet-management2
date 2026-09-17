<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Location extends Model
{
    
    protected $table = 'Locations';

    protected $fillable = ['vehicle_id', 'latitude', 'longitude', 'speed', 'ignition_on', 'heading', 'recorded_at'];

    // The $casts property is used to convert attributes to a specific data type when they are accessed or set. In this case, it ensures that the ignition_on attribute is treated as a boolean, and speed and heading are treated as floats.
    protected $casts = [
        'ignition_on' => 'boolean',
        'speed' => 'float',
        'heading' => 'float',
    ];

    public function vehicle()
    {
        return $this->belongsTo(Vehicle::class);
    }
}
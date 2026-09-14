<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Vehicle extends Model
{
    protected $fillable = ['plate_number', 'make', 'model', 'status'];

    public function locations()
    {
        return $this->hasMany(Location::class);
    }

    public function device()
    {
        return $this->hasOne(Device::class);
    }
}

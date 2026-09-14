<?php

namespace App\Http\Controllers;

use App\Models\Location;
use App\Models\Device;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    // Store a new location for a vehicle based on the device's IMEI
    public function store(Request $request)
    {
        $validated = $request->validate([
            'imei' => 'required|string|exists:devices,imei',
            'latitude' => 'required|numeric',
            'longitude' => 'required|numeric',
            'speed' => 'required|numeric',
            'ignition_on' => 'required|boolean',
            'heading' => 'required|numeric',
        ]);

        // Find the device by IMEI
        $device = Device::where('imei', $validated['imei'])->first();

        if (!$device->vehicle_id) {
            return response()->json(['success' => false, 'message' => 'Device not assigned to a vehicle.'], 400);
        }

        // Create a new location record for the vehicle associated with the device
        $location = Location::create([
            'vehicle_id' => $device->vehicle_id,
            'latitude' => $validated['latitude'],
            'longitude' => $validated['longitude'],
            'speed' => $validated['speed'],
            'ignition_on' => $validated['ignition_on'],
            'heading' => $validated['heading'],
            'recorded_at' => now(),
        ]);

        // Update the vehicle's status based on speed and ignition state
        $status = $validated['speed'] > 7 ? 'moving' : ($validated['ignition_on'] ? 'idle' : 'parked');
        $device->vehicle->update(['status' => $status]);

        return response()->json([
            'success' => true,
            'message' => 'Location updated.',
            'data' => $location
        ], 201);
    }
}
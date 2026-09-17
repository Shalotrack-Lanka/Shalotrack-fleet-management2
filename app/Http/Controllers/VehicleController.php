<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use App\Models\Location; 
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    public function index()
    {
        // 1. Get all vehicles from the Vehicles table
        $vehicles = Vehicle::get(); 

        // 2. Get the latest location for each vehicle from the Locations table
        $vehicles->each(function($vehicle) {
            
            // IMPORTANT: Changed 'vehicle_id' to 'VehicleId' and 'recorded_at' to 'UpdatedAt' to match Supabase
            $latestLocation = Location::where('VehicleId', $vehicle->VehicleId)
                                ->orderBy('UpdatedAt', 'desc')
                                ->first();

            if ($latestLocation) {
                // Get the latest location details and add them to the vehicle object (Handling Capitalized columns)
                $vehicle->Latitude = $latestLocation->Latitude ?? $latestLocation->latitude;
                $vehicle->Longitude = $latestLocation->Longitude ?? $latestLocation->longitude;
                $vehicle->Speed = $latestLocation->Speed ?? $latestLocation->speed ?? 0;
            }
        });

        return response()->json([
            'success' => true,
            'message' => 'Vehicles retrieved successfully.',
            'data' => $vehicles
        ]);
    }

    // Add a new vehicle
    public function store(Request $request)
    {
        $validated = $request->validate([
            'plate_number' => 'required|string|unique:Vehicles',
            'make' => 'required|string',
            'model' => 'required|string',
        ]);

        $vehicle = Vehicle::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Vehicle added successfully.',
            'data' => $vehicle
        ], 201);
    }

    // Get a specific vehicle
    public function show($id)
    {
        $vehicle = Vehicle::findOrFail($id);

        // Get the latest location for the vehicle
        $latestLocation = Location::where('VehicleId', $vehicle->VehicleId)
                            ->orderBy('UpdatedAt', 'desc')
                            ->first();

        if ($latestLocation) {
            $vehicle->Latitude = $latestLocation->Latitude ?? $latestLocation->latitude;
            $vehicle->Longitude = $latestLocation->Longitude ?? $latestLocation->longitude;
            $vehicle->Speed = $latestLocation->Speed ?? $latestLocation->speed ?? 0;
        }

        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }
}
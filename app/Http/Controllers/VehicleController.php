<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    
    public function index()
    {
        
        $vehicles = Vehicle::get(); 

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

        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }
}
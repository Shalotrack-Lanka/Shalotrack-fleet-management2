<?php

namespace App\Http\Controllers;

use App\Models\Vehicle;
use Illuminate\Http\Request;

class VehicleController extends Controller
{
    // Get all vehicles along with their latest location and associated device
    public function index()
    {
        $vehicles = Vehicle::with(['device', 'locations' => function($query) {
            $query->latest('recorded_at')->take(1); // Get the latest location for each vehicle
        }])->get();

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
            'plate_number' => 'required|string|unique:vehicles',
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

    // Get a specific vehicle along with their latest location and associated device
    public function show($id)
    {
        $vehicle = Vehicle::with(['device', 'locations' => function($query) {
            $query->latest('recorded_at')->take(1);
        }])->findOrFail($id);

        return response()->json([
            'success' => true,
            'data' => $vehicle
        ]);
    }
}
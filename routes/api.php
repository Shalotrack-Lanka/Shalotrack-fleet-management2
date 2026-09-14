<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VehicleController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\CustomerController;
use App\Http\Middleware\FirebaseAuthVerify;

// 
Route::post('/Customers', [CustomerController::class, 'store']);

// 
Route::middleware([FirebaseAuthVerify::class])->group(function () {
    
    Route::prefix('vehicles')->group(function () {
        Route::get('/', [VehicleController::class, 'index']);
        Route::post('/', [VehicleController::class, 'store']);
        Route::get('/{id}', [VehicleController::class, 'show']);
    });

    Route::post('/locations/push', [LocationController::class, 'store']);
});
<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    public function store(Request $request)
    {
        try {
            // Allow only specific fields to be mass assigned
            $firebaseUid = $request->input('FirebaseUid');
            $fullName    = $request->input('FullName');
            $email       = $request->input('Email');
            $phoneNumber = $request->input('PhoneNumber');
            $nicNumber   = $request->input('NicNumber');
            $address     = $request->input('Address');

            // Validate required fields
            DB::table('customers')->updateOrInsert(
                ['firebase_uid' => $firebaseUid],
                [
                    'full_name'    => $fullName,
                    'email'        => $email,
                    'phone_number' => $phoneNumber,
                    'nic_number'   => $nicNumber,
                    'address'      => $address,
                    'updated_at'   => now(),
                    'created_at'   => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Profile saved successfully to database'
            ], 200);

        } catch (\Exception $e) {
            Log::error('Customer Registration Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save profile: ' . $e->getMessage()
            ], 500);
        }
    }
}
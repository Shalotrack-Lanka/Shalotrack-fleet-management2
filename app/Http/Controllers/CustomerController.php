<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException; 

class CustomerController extends Controller
{
    public function store(Request $request)
    {
        try {
            // 1. Validation - Validation rules matching exact column names in Supabase
            $request->validate([
                'FirebaseUid' => 'required|string',
                'FullName'    => 'required|string',
                'Email'       => 'required|email|unique:Customers,Email', // Check in 'Customers' table, 'Email' column
                'PhoneNumber' => 'required|string|unique:Customers,PhoneNumber', 
                'NicNumber'   => 'required|string|unique:Customers,NicNumber', 
                'Address'     => 'required|string',
            ], [
                'Email.unique' => 'This email address is already registered.',
                'PhoneNumber.unique' => 'This phone number is already registered.',
                'NicNumber.unique' => 'This NIC number is already registered.'
            ]);

            // 2. Database Operation
            DB::table('Customers')->updateOrInsert(
                ['CustomerId' => $request->input('FirebaseUid')],
                [
                    'FullName'    => $request->input('FullName'),
                    'Email'       => $request->input('Email'),
                    'PhoneNumber' => $request->input('PhoneNumber'),
                    'NicNumber'   => $request->input('NicNumber'),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Profile saved successfully to database'
            ], 200);

        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors() 
            ], 422);

        } catch (\Exception $e) {
            Log::error('Customer Registration Error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save profile: ' . $e->getMessage()
            ], 500);
        }
    }

    // 4. Check if the phone number already exists before sending OTP
    public function checkPhone(Request $request)
    {
        $request->validate([
            'phone' => 'required|string'
        ]);

        // Query the 'Customers' table and 'PhoneNumber' column exactly as they appear in Supabase
        $exists = DB::table('Customers')->where('PhoneNumber', $request->phone)->exists();
        
        return response()->json([
            'exists' => $exists
        ]);
    }
}
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
            // 1. Validation - Validation rules and custom error messages
            $request->validate([
                'FirebaseUid' => 'required|string',
                'FullName'    => 'required|string',
                'Email'       => 'required|email|unique:customers,email', // Check if the email already exists in the customers table
                'PhoneNumber' => 'required|string|unique:customers,phone_number', // Check if the phone number already exists in the customers table
                'NicNumber'   => 'required|string|unique:customers,nic_number', // Check if the NIC number already exists in the customers table
                'Address'     => 'required|string',
            ], [
                // Give custom error messages for unique validation failures
                'Email.unique' => 'This email address is already registered.',
                'PhoneNumber.unique' => 'This phone number is already registered.',
                'NicNumber.unique' => 'This NIC number is already registered.'
            ]);

            // 2. Database Operation - Insert or Update the customer record based on Firebase UID
            DB::table('customers')->updateOrInsert(
                ['firebase_uid' => $request->input('FirebaseUid')],
                [
                    'full_name'    => $request->input('FullName'),
                    'email'        => $request->input('Email'),
                    'phone_number' => $request->input('PhoneNumber'),
                    'nic_number'   => $request->input('NicNumber'),
                    'address'      => $request->input('Address'),
                    'updated_at'   => now(),
                    'created_at'   => now(),
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Profile saved successfully to database'
            ], 200);

        } catch (ValidationException $e) {
            // 3. Validation Error Handling - Return validation errors with a 422 status code
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors() // Return the validation errors
            ], 422);

        } catch (\Exception $e) {
            Log::error('Customer Registration Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Failed to save profile: ' . $e->getMessage()
            ], 500);
        }
    }
}
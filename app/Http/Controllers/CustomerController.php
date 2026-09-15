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
            // 1. Validation - දත්ත Database එකට යන්න කලින් පරීක්ෂා කිරීම
            $request->validate([
                'FirebaseUid' => 'required|string',
                'FullName'    => 'required|string',
                'Email'       => 'required|email|unique:customers,email', // Email එක කලින් තියෙනවද බලනවා
                'PhoneNumber' => 'required|string|unique:customers,phone_number', // Phone එක කලින් තියෙනවද බලනවා
                'NicNumber'   => 'required|string|unique:customers,nic_number', // NIC එක කලින් තියෙනවද බලනවා
                'Address'     => 'required|string',
            ], [
                // අපිට ඕනෙ නම් Custom Error පණිවිඩ දෙන්න පුළුවන්
                'Email.unique' => 'මෙම ඊමේල් ලිපිනය දැනටමත් ලියාපදිංචි කර ඇත.',
                'PhoneNumber.unique' => 'මෙම දුරකථන අංකය දැනටමත් ලියාපදිංචි කර ඇත.',
                'NicNumber.unique' => 'මෙම ජාතික හැඳුනුම්පත් අංකය දැනටමත් පද්ධතියේ ඇත.'
            ]);

            // 2. Validation පාස් වුණොත් විතරක් Database එකට සේව් වෙනවා
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
            // 3. Validation ෆේල් වුණොත් React එකට 422 Error එකක් එක්ක වැරදි ටික යවනවා
            return response()->json([
                'success' => false,
                'message' => 'Validation Error',
                'errors'  => $e->errors() // වැරදි NIC/Email එක මොකක්ද කියලා මේකෙන් යවනවා
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
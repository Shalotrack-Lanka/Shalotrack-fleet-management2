<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Kreait\Laravel\Firebase\Facades\Firebase;
use Symfony\Component\HttpFoundation\Response;

class FirebaseAuthVerify
{
    public function handle(Request $request, Closure $next): Response
    {
        // Get the Bearer token from the Authorization header
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'success' => false, 
                'message' => 'Unauthorized - No Token Provided'
            ], 401);
        }

        try {
            // Verify the token using Firebase
            $auth = Firebase::auth();
            $verifiedIdToken = $auth->verifyIdToken($token);
            
            // Get the UID and phone number from the verified token
            $uid = $verifiedIdToken->claims()->get('sub');
            $phoneNumber = $verifiedIdToken->claims()->get('phone_number');

            // Add the Firebase UID and phone number to the request attributes
            $request->attributes->add([
                'firebase_uid' => $uid, 
                'phone_number' => $phoneNumber
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false, 
                'message' => 'Unauthorized - Invalid Token'
            ], 401);
        }

        return $next($request);
    }
}
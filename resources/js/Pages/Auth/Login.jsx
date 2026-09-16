import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase Imports
import { auth } from '../../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

export default function Login() {
    // Manage login steps (1: Phone Number, 2: OTP Code)
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [processing, setProcessing] = useState(false);

    // Setup Recaptcha for Firebase Phone Authentication
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    // Step 1: Verify if the user exists in the database and send OTP
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            // 1. Format Sri Lankan phone number FIRST (e.g., 077... to +9477...)
            const formatPhone = phone.startsWith('0') ? '+94' + phone.substring(1) : phone;

            // 2. Check if the FORMATTED phone number exists in Laravel DB
            const checkResponse = await axios.post('/api/check-phone', { phone: formatPhone });
            
            // If the user does NOT exist, prevent login and show an error
            if (!checkResponse.data.exists) {
                setErrorMsg("This phone number is not registered. Please create an account first.");
                setProcessing(false);
                return; // Stop execution here
            }

            // 3. If the user exists, proceed with Firebase OTP setup
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            
            const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
            setConfirmationResult(result);
            
            // Move to OTP entry step
            setStep(2); 
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to send OTP. Please check your internet connection and try again.");
            setProcessing(false);
        }
    };

    // Step 2: Verify the entered OTP Code
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            // Confirm the OTP code with Firebase
            await confirmationResult.confirm(otp);
            
            // Upon successful OTP verification, login is complete
            setSuccessMsg("Login successful! Redirecting to dashboard...");
            
            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/dashboard';
            }, 1000);

        } catch (error) {
            console.error(error);
            setErrorMsg("Invalid OTP code. Please check the code and try again.");
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Log in - Shalotrack" />
            
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border-t-4 border-[#003366]">
                
                {/* Header Section */}
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-[#003366]">Welcome Back!</h2>
                    <p className="mt-2 text-sm text-gray-600">Log in to Shalotrack Fleet Management</p>
                </div>

                {/* Alert Messages */}
                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                        <p>{errorMsg}</p>
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700">
                        <p>{successMsg}</p>
                    </div>
                )}

                {/* Hidden container required by Firebase Recaptcha */}
                <div id="recaptcha-container"></div>

                {/* Step 1: Phone Number Input Form */}
                {step === 1 && (
                    <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="0771234567" />
                        </div>
                        
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244] transition-colors duration-200">
                            {processing ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification Form */}
                {step === 2 && (
                    <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter OTP Code</label>
                            <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="123456" />
                        </div>
                        
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244] transition-colors duration-200">
                            {processing ? 'Verifying...' : 'Log In'}
                        </button>
                        
                        <div className="text-center mt-2">
                            <button type="button" onClick={() => setStep(1)} className="text-sm text-[#FF8C00] hover:underline">
                                Change Phone Number
                            </button>
                        </div>
                    </form>
                )}

                {/* Register Link Section - Connects to the Registration Page */}
                <div className="text-center mt-6 border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <Link href="/register" className="font-medium text-[#FF8C00] hover:underline">
                            Register here
                        </Link>
                    </p>
                </div>
                
            </div>
        </div>
    );
}
import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase Imports
import { auth } from '../../firebase';
import { 
    RecaptchaVerifier, 
    signInWithPhoneNumber, 
    EmailAuthProvider, 
    linkWithCredential, 
    sendEmailVerification 
} from 'firebase/auth';

export default function Register() {
    // Manage registration steps (1: Phone, 2: OTP, 3: Details, 4: Success)
    const [step, setStep] = useState(1); 
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [confirmationResult, setConfirmationResult] = useState(null);
    
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        nic: '',
        address: '',
        password: '',
        password_confirmation: ''
    });

    const [errorMsg, setErrorMsg] = useState('');
    const [processing, setProcessing] = useState(false);

    // Setup Recaptcha for Firebase Phone Authentication
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    // Handle form input changes
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Step 1: Send OTP to the provided phone number
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            // 1. Check if phone number already exists in Laravel DB first
            const checkResponse = await axios.post('/api/check-phone', { phone: phone });
            
            if (checkResponse.data.exists) {
                // If exists, stop the process and show an error
                setErrorMsg("This phone number is already registered. Please log in.");
                setProcessing(false);
                return; // Stop execution here
            }

            // 2. If phone is new, proceed with Firebase OTP setup
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            
            // Format Sri Lankan phone number (e.g., 077... to +9477...)
            const formatPhone = phone.startsWith('0') ? '+94' + phone.substring(1) : phone;
            
            const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
            setConfirmationResult(result);
            
            // Move to OTP entry step
            setStep(2); 
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to send OTP. Please check your phone number and try again.");
            setProcessing(false);
        }
    };

    // Step 2: Verify the entered OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            await confirmationResult.confirm(otp);
            // Move to final details step upon successful OTP verification
            setStep(3);
            setProcessing(false);
        } catch (error) {
            setErrorMsg("Invalid OTP code. Please try again.");
            setProcessing(false);
        }
    };

    // Step 3: Submit final details and link email credentials
    const submitFinalDetails = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.password_confirmation) {
            return setErrorMsg("Passwords do not match.");
        }

        setProcessing(true);

        try {
            // Get the user authenticated via phone OTP
            const user = auth.currentUser; 

            // Link email and password to the phone-authenticated user
            const credential = EmailAuthProvider.credential(formData.email, formData.password);
            await linkWithCredential(user, credential);

            // Send email verification link
            await sendEmailVerification(user);

            // Send data to Laravel Backend (Matching Laravel Controller keys exactly)
            await axios.post('/api/Customers', {
                FullName: formData.fullName,
                Email: formData.email,
                PhoneNumber: phone,
                NicNumber: formData.nic,
                Address: formData.address,
                FirebaseUid: user.uid
            });

            // Move to success step
            setStep(4); 
            setProcessing(false);

        } catch (error) {
            console.error(error);
            setProcessing(false);

            // Catch Laravel Validation Errors (Status 422)
            if (error.response && error.response.status === 422) {
                const validationErrors = error.response.data.errors;
                // Combine all Laravel validation error messages into a single string
                const errorMessages = Object.values(validationErrors).flat().join(' | ');
                setErrorMsg(errorMessages);
            } 
            // Catch Firebase existing email error
            else if (error.code === 'auth/email-already-in-use') {
                setErrorMsg("This email is already registered in our system.");
            } 
            // Catch any other generic errors
            else {
                setErrorMsg("An error occurred during registration. Please check your details and try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Register - Shalotrack" />
            
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border-t-4 border-[#003366]">
                
                {/* Header Section */}
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-[#003366]">Create an Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Shalotrack Fleet Management</p>
                </div>

                {/* Error Message Alert */}
                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* Hidden container required by Firebase Recaptcha */}
                <div id="recaptcha-container"></div>

                {/* Step 1: Phone Number Form */}
                {step === 1 && (
                    <form onSubmit={handleSendOtp} className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="0771234567" />
                        </div>
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244]">
                            {processing ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {/* Step 2: OTP Verification Form */}
                {step === 2 && (
                    <form onSubmit={handleVerifyOtp} className="mt-8 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Enter OTP Code</label>
                            <input type="text" required value={otp} onChange={(e) => setOtp(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="123456" />
                        </div>
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244]">
                            {processing ? 'Verifying...' : 'Verify OTP'}
                        </button>
                    </form>
                )}

                {/* Step 3: Registration Details Form */}
                {step === 3 && (
                    <form onSubmit={submitFinalDetails} className="mt-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="fullName" required value={formData.fullName} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                                <input type="email" name="email" required value={formData.email} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">NIC Number</label>
                                <input type="text" name="nic" required value={formData.nic} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"/>
                            </div>
                            <div className="col-span-1 md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700">Address</label>
                                <textarea name="address" required value={formData.address} onChange={handleChange} rows="2"
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Password</label>
                                <input type="password" name="password" required value={formData.password} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                                <input type="password" name="password_confirmation" required value={formData.password_confirmation} onChange={handleChange}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border" />
                            </div>
                        </div>
                        <button type="submit" disabled={processing}
                            className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244]">
                            {processing ? 'Saving...' : 'Complete Registration'}
                        </button>
                    </form>
                )}

                {/* Step 4: Final Success Message */}
                {step === 4 && (
                    <div className="text-center mt-8 space-y-4">
                        <div className="bg-green-100 p-4 rounded-lg border-2 border-green-500">
                            <h3 className="text-lg font-bold text-green-800">Registration Almost Complete!</h3>
                            <p className="mt-2 text-green-700">
                                We have sent a verification link to <strong>{formData.email}</strong>. 
                                Please check your email and click the link to verify your account before logging in.
                            </p>
                        </div>
                    </div>
                )}

                {/* Login Link Section - Show on all steps */}
                <div className="text-center mt-6 border-t border-gray-200 pt-6">
                    <p className="text-sm text-gray-600">
                        {step === 4 ? "Ready to start?" : "Already registered?"}{' '}
                        <Link href="/login" className="font-medium text-[#FF8C00] hover:underline">
                            Log in here
                        </Link>
                    </p>
                </div>

            </div>
        </div>
    );
}
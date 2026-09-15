import { useState, useEffect } from 'react';
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
    const [step, setStep] = useState(1); // Manage steps (1: Phone, 2: OTP, 3: Details, 4: Success)
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

    // 1. Recaptcha Setup 
    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
                size: 'invisible'
            });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 2. Send OTP to the provided phone number
    const handleSendOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            setupRecaptcha();
            const appVerifier = window.recaptchaVerifier;
            // Format the phone number to include country code 
            const formatPhone = phone.startsWith('0') ? '+94' + phone.substring(1) : phone;
            
            const result = await signInWithPhoneNumber(auth, formatPhone, appVerifier);
            setConfirmationResult(result);
            setStep(2); // Move to OTP verification step
            setProcessing(false);
        } catch (error) {
            console.error(error);
            setErrorMsg(" Could not send OTP. Please check the phone number and try again.");
            setProcessing(false);
        }
    };

    // 3. Verify the OTP entered by the user
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setProcessing(true);

        try {
            await confirmationResult.confirm(otp);
            // User is now authenticated with phone number, proceed to next step
            setStep(3);
            setProcessing(false);
        } catch (error) {
            setErrorMsg("Invalid OTP. Please try again.");
            setProcessing(false);
        }
    };

    // 4. Submit final details and send email verification
    const submitFinalDetails = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        if (formData.password !== formData.password_confirmation) {
            return setErrorMsg(" Password and Confirm Password do not match.");
        }

        setProcessing(true);

        try {
            const user = auth.currentUser; // User authenticated with OTP

            // Link the phone number with email and password
            const credential = EmailAuthProvider.credential(formData.email, formData.password);
            await linkWithCredential(user, credential);

            // Send email verification to the user's email
            await sendEmailVerification(user);

            // Save user details to the backend (Laravel)
            await axios.post('/api/Customers', {
                FullName: formData.fullName,
                Email: formData.email,
                Phone: phone,
                NIC: formData.nic,
                Address: formData.address,
                FirebaseUID: user.uid
            });

            setStep(4); // Move to final success step
            setProcessing(false);

        } catch (error) {
            console.error(error);
            setErrorMsg(" An error occurred while saving your details. Please try again.");
            setProcessing(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <Head title="Register - Shalotrack" />
            
            <div className="max-w-2xl w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border-t-4 border-[#003366]">
                <div className="text-center">
                    <h2 className="mt-2 text-3xl font-extrabold text-[#003366]">Create an Account</h2>
                    <p className="mt-2 text-sm text-gray-600">Shalotrack Fleet Management</p>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700">
                        <p>{errorMsg}</p>
                    </div>
                )}

                {/* Recaptcha */}
                <div id="recaptcha-container"></div>

                {/* Step 1: Phone Number Input */}
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

                {/* Step 2: OTP Input */}
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

                {/* Step 3: Registration Form */}
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
                                Please check your email and click the link to verify your account. After verification, you can log in.
                            </p>
                        </div>
                        <Link href="/login" className="inline-block mt-4 text-[#FF8C00] font-bold hover:underline">
                            Go to Login Page
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
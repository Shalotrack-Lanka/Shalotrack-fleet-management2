import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';

// Firebase Imports
import { auth } from '../../firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';

export default function Login() {
    // State management for form inputs and alerts
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [errorMsg, setErrorMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [processing, setProcessing] = useState(false);

    // Handle login form submission
    const submit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setProcessing(true);

        try {
            // 1. Authenticate user with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Security Check: Verify if the user's email is confirmed
            if (!user.emailVerified) {
                // Sign out the user immediately to prevent access to the dashboard
                await signOut(auth);
                setErrorMsg("Your email address is not verified yet. Please check your inbox and click the verification link.");
                setProcessing(false);
                return; // Stop execution here
            }

            // 3. If email is verified, proceed to login
            setSuccessMsg("Login successful! Redirecting to dashboard...");
            
            // NOTE: In the next phase, we will call a Laravel API here to set up the secure web session
            // await axios.post('/api/web-login', { FirebaseUid: user.uid });

            // Redirect to dashboard after a short delay
            setTimeout(() => {
                window.location.href = '/dashboard'; // Inertia or standard Laravel route
            }, 1000);

        } catch (error) {
            console.error(error);
            setProcessing(false);
            
            // 4. Handle specific Firebase login errors (Wrong password, user not found, etc.)
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                setErrorMsg("Invalid email or password. Please try again.");
            } else {
                setErrorMsg("An error occurred while logging in. Please try again.");
            }
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

                {/* Login Form */}
                <form className="mt-8 space-y-6" onSubmit={submit}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="john@example.com" />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF8C00] py-2 px-3 border"
                                placeholder="********" />
                        </div>
                    </div>

                    <button type="submit" disabled={processing}
                        className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-md text-white bg-[#003366] hover:bg-[#002244] transition-colors duration-200">
                        {processing ? 'Logging in...' : 'Log In'}
                    </button>
                </form>

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
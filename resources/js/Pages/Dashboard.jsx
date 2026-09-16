import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase imports (Make sure this path matches your firebase config file)
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    const [demoVehicle, setDemoVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Firebase එකෙන් User ලොග් වෙලාද කියලා බලනවා
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // 1. User ගේ Firebase Token එක ගන්නවා
                    const token = await user.getIdToken();

                    // 2. Token එකත් එක්ක Laravel Backend එකෙන් වාහන විස්තර ඉල්ලනවා
                    const response = await axios.get('/api/vehicles', {
                        headers: {
                            Authorization: `Bearer ${token}` // මේක අනිවාර්යයි!
                        }
                    });
                    
                    // අපිට බලාගන්න Console එකේ ප්‍රින්ට් කරනවා
                    console.log("🔥 API එකෙන් ආපු Data ටික:", response.data);
                    
                    if (response.data && response.data.length > 0) {
                        setDemoVehicle(response.data[0]);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching vehicles:", error);
                    setLoading(false);
                }
            } else {
                // ලොග් වෙලා නැත්නම් ආයෙත් Login පේජ් එකට යවනවා
                window.location.href = '/login';
            }
        });

        // Cleanup subscription
        return () => unsubscribe();
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex overflow-hidden">
            <Head title="Dashboard - Shalotrack" />

            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-[#003366] text-white shadow-xl flex flex-col z-20">
                <div className="p-6 text-center border-b border-[#002244]">
                    <h1 className="text-2xl font-bold text-[#FF8C00]">Shalotrack</h1>
                    <p className="text-xs text-gray-300 mt-1">Fleet Management</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 bg-[#FF8C00] text-white rounded-lg font-medium transition-colors">
                        Dashboard
                    </Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#002244] hover:text-white rounded-lg font-medium transition-colors">
                        Vehicles
                    </Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#002244] hover:text-white rounded-lg font-medium transition-colors">
                        Drivers
                    </Link>
                </nav>

                <div className="p-4 border-t border-[#002244]">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-[#002244] rounded-lg transition-colors">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative">
                
                {/* Background Map Placeholder */}
                <div className="absolute inset-0 z-0 bg-blue-50">
                    <iframe 
                        width="100%" height="100%" frameBorder="0" scrolling="no" marginHeight="0" marginWidth="0" 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=79.80%2C6.80%2C80.00%2C7.00&layer=mapnik" 
                        className="opacity-90"
                    ></iframe>
                </div>

                {/* Floating Interactive Panel */}
                <div className="absolute top-6 left-6 w-96 bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                    
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[#003366]">Demo Vehicle</h2>
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </span>
                        </div>
                        
                        {loading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : demoVehicle ? (
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="font-semibold text-gray-800 text-lg">{demoVehicle.VehicleId || 'Loading...'}</p>
                                <p className="text-sm text-gray-500 mt-1">Status: Active</p>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                No vehicles found.
                            </div>
                        )}
                    </div>

                    {/* Action Items List */}
                    <div className="p-4 overflow-y-auto">
                        <ul className="space-y-1">
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Person</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-[#003366] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Vehicle</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                            {/* ... (Other buttons remain the same) ... */}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
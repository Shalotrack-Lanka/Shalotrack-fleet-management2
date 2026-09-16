import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase Imports for Auth Token Verification
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

export default function Dashboard() {
    // State to hold the vehicle data from API
    const [demoVehicle, setDemoVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch vehicle data with Firebase Token when the component loads
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    // Get Firebase ID token to pass through middleware
                    const token = await user.getIdToken();

                    // Calling your Laravel API endpoint with Authorization Header
                    const response = await axios.get('/api/vehicles', {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });
                    
                    // Assuming the API returns an array, we take the first vehicle as the Demo
                    if (response.data && response.data.length > 0) {
                        setDemoVehicle(response.data[0]);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching vehicles:", error);
                    setLoading(false);
                }
            } else {
                // If not logged in, redirect to login page
                window.location.href = '/login';
            }
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = (e) => {
        e.preventDefault();
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex overflow-hidden">
            <Head title="Dashboard - Shalotrack" />

            {/* Left Sidebar Navigation (Web Layout) */}
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

            {/* Main Content Area - Full Map Background */}
            <div className="flex-1 relative">
                
                {/* Background Map Placeholder (Using OpenStreetMap iframe for immediate testing) */}
                <div className="absolute inset-0 z-0 bg-blue-50">
                    <iframe 
                        width="100%" 
                        height="100%" 
                        frameBorder="0" 
                        scrolling="no" 
                        marginHeight="0" 
                        marginWidth="0" 
                        src="https://www.openstreetmap.org/export/embed.html?bbox=79.80%2C6.80%2C80.00%2C7.00&layer=mapnik" 
                        className="opacity-90"
                    ></iframe>
                </div>

                {/* Floating Interactive Panel (Replicating the Mobile Bottom Sheet) */}
                <div className="absolute top-6 left-6 w-96 bg-white rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]">
                    
                    {/* Demo Vehicle Section (API Driven) */}
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
                                {/* Replace these keys with your actual API response keys */}
                                <p className="font-semibold text-gray-800 text-lg">{demoVehicle.vehicle_name || demoVehicle.VehicleId || 'Toyota Prius (Demo)'}</p>
                                <p className="text-sm text-gray-500 mt-1">Number Plate: {demoVehicle.number_plate || demoVehicle.NumberPlate || 'WP CAA-1234'}</p>
                                <div className="mt-3 inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                    Status: {demoVehicle.status || 'Active / Moving'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                No vehicles found. Add a vehicle first.
                            </div>
                        )}
                    </div>

                    {/* Action Items List */}
                    <div className="p-4 overflow-y-auto">
                        <ul className="space-y-1">
                            {/* Add a Person */}
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Person</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>

                            {/* Add a Vehicle */}
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-[#003366] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Vehicle</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>

                            {/* Add a Pet */}
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Pet</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>

                            {/* Add a TAG */}
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a TAG</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>

                            {/* Add a Place */}
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a place</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
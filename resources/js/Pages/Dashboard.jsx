import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase Imports
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

export default function Dashboard() {
    const [demoVehicle, setDemoVehicle] = useState(null);
    const [loading, setLoading] = useState(true);

    // Default Map Center (Colombo, Sri Lanka)
    const mapCenter = [6.9271, 79.8612];

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                try {
                    const token = await user.getIdToken();
                    const response = await axios.get('/api/vehicles', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data && response.data.length > 0) {
                        setDemoVehicle(response.data[0]);
                    }
                    setLoading(false);
                } catch (error) {
                    console.error("Error fetching vehicles:", error);
                    setLoading(false);
                }
            } else {
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

            {/* Main Content Area - Real Leaflet Map Background */}
            <div className="flex-1 relative z-0">
                
                {/* Real Interactive Map */}
                <div className="absolute inset-0 z-0">
                    <MapContainer 
                        center={mapCenter} 
                        zoom={13} 
                        style={{ height: '100vh', width: '100%' }} 
                        zoomControl={false}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={mapCenter}>
                            <Popup>
                                Demo Vehicle Location
                            </Popup>
                        </Marker>
                    </MapContainer>
                </div>

                {/* Floating Interactive Panel */}
                <div className="absolute top-6 left-6 w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
                    
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
                                <p className="font-semibold text-gray-800 text-lg">{demoVehicle.vehicle_name || demoVehicle.VehicleId || 'Toyota Prius (Demo)'}</p>
                                <p className="text-sm text-gray-500 mt-1">Number Plate: {demoVehicle.number_plate || demoVehicle.NumberPlate || 'WP CAA-1234'}</p>
                                <div className="mt-3 inline-block px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-200">
                                    Status: Active / Moving
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
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-100 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Person</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                            <li>
                                <button className="w-full flex items-center p-3 hover:bg-gray-100 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-[#003366] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Vehicle</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                            {/* අනිත් Buttons ටික එහෙම්මම තියෙනවා */}
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
import { useState, useEffect } from 'react';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';

// Firebase Imports for Authentication
import { auth } from '../firebase'; 
import { onAuthStateChanged } from 'firebase/auth';

// Leaflet Map Imports
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default Leaflet marker icons not rendering correctly in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Create a custom Car Icon for live tracking
const carIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3204/3204061.png', // Top-down car image
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
});

// Component to handle map centering (Follows the car smoothly)
function MapUpdater({ center }) {
    const map = useMap();
    useEffect(() => {
        if (center) {
            // Smooth transition when tracking the car
            map.flyTo(center, 16, { animate: true, duration: 1.5 }); 
        }
    }, [center, map]);
    return null;
}

export default function Dashboard() {
    // State to hold the selected/demo vehicle data for the floating panel
    const [demoVehicle, setDemoVehicle] = useState(null);
    // State to manage the loading skeleton animation
    const [loading, setLoading] = useState(true);
    
    // Default User Location (Initializes to Colombo, then updates to actual user location)
    const [userLocation, setUserLocation] = useState([6.9271, 79.8612]);
    
    // Live Location of the Car from the API
    const [carLocation, setCarLocation] = useState(null);

    // States for handling the "Add Vehicle" Modal and form submissions
    const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        plate_number: '',
        make: '',
        model: ''
    });

    // Function to fetch the list of vehicles from the Laravel backend
    const fetchVehicles = async (token) => {
        try {
            const response = await axios.get('/api/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const vehiclesList = response.data.data;
            
            if (vehiclesList && vehiclesList.length > 0) {
                // Find the specific demo vehicle, fallback to the first vehicle if not found
                const demo = vehiclesList.find(v => v.IsDemoVehicle === true) || vehiclesList[0];
                setDemoVehicle(demo);

                // Look for coordinates in the response (Handles both capitalized and simple letters)
                const lat = demo.Latitude || demo.latitude;
                const lng = demo.Longitude || demo.longitude;

                if (lat && lng) {
                    setCarLocation([parseFloat(lat), parseFloat(lng)]);
                }
            }
        } catch (error) {
            console.error("Error fetching vehicles:", error);
        }
    };

    useEffect(() => {
        // 1. Fetch the user's actual live location via browser Geolocation API
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => setUserLocation([position.coords.latitude, position.coords.longitude]),
                (error) => console.error("Location Error:", error)
            );
        }

        let intervalId; // To store the polling interval

        // 2. Listen for Firebase Auth state changes to secure API requests
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Retrieve ID token and pass it to the fetch function
                const token = await user.getIdToken();
                
                // Initial Fetch
                await fetchVehicles(token);
                setLoading(false);

                // 3. LIVE TRACKING POLLING: Fetch new data every 5 seconds
                intervalId = setInterval(() => {
                    fetchVehicles(token);
                }, 5000);

            } else {
                // Redirect to login if unauthenticated
                window.location.href = '/login';
            }
        });

        // Cleanup listener and interval on component unmount
        return () => {
            unsubscribe();
            if (intervalId) clearInterval(intervalId);
        };
    }, []);

    // Logout handler
    const handleLogout = (e) => {
        e.preventDefault();
        window.location.href = '/login';
    };

    // Handler for submitting the Add Vehicle form to the backend
    const handleAddVehicle = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const user = auth.currentUser;
            if (user) {
                const token = await user.getIdToken();
                
                // POST request to Laravel API to store the new vehicle
                await axios.post('/api/vehicles', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                alert("Vehicle Added Successfully! 🎉");
                setIsAddVehicleOpen(false); // Close the modal upon success
                setFormData({ plate_number: '', make: '', model: '' }); // Reset form fields
                
                // Re-fetch the vehicles to immediately update the dashboard data
                await fetchVehicles(token);
            }
        } catch (error) {
            console.error("Error adding vehicle:", error);
            alert("Failed to add vehicle. Please check the details.");
        } finally {
            setIsSubmitting(false); // Stop the loading spinner
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex overflow-hidden">
            <Head title="Dashboard - Shalotrack" />

            {/* Left Sidebar Navigation */}
            <div className="w-64 bg-[#003366] text-white shadow-xl flex flex-col z-20">
                <div className="p-6 text-center border-b border-[#002244]">
                    <h1 className="text-2xl font-bold text-[#FF8C00]">Shalotrack</h1>
                    <p className="text-xs text-gray-300 mt-1">Live Tracking Active</p>
                </div>
                
                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/dashboard" className="flex items-center px-4 py-3 bg-[#FF8C00] text-white rounded-lg font-medium transition-colors">Dashboard</Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#002244] hover:text-white rounded-lg font-medium transition-colors">Vehicles</Link>
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#002244] hover:text-white rounded-lg font-medium transition-colors">Drivers</Link>
                </nav>

                <div className="p-4 border-t border-[#002244]">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-[#002244] rounded-lg transition-colors">Log Out</button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 relative z-0">
                
                {/* Background Leaflet Map (Using fast Google Maps Tiles) */}
                <div className="absolute inset-0 z-0">
                    <MapContainer center={carLocation || userLocation} zoom={15} style={{ height: '100vh', width: '100%' }} zoomControl={false}>
                        <TileLayer 
                            attribution='&copy; Google Maps' 
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}" 
                        />
                        
                        {/* Smoothly follows the car if carLocation exists, otherwise centers on user */}
                        <MapUpdater center={carLocation || userLocation} />
                        
                        {/* User's Current Location (Default Blue Pin) */}
                        <Marker position={userLocation}>
                            <Popup>You are here!</Popup>
                        </Marker>

                        {/* Live Tracking Car Marker (Custom Car Icon) */}
                        {carLocation && (
                            <Marker position={carLocation} icon={carIcon}>
                                <Popup>
                                    <b>{demoVehicle?.Make} {demoVehicle?.Model}</b><br/>
                                    Plate: {demoVehicle?.VehicleNumber}<br/>
                                    <i>Live Tracking...</i>
                                </Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>

                {/* Floating Interactive Data Panel */}
                <div className="absolute top-6 left-6 w-96 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh] border border-gray-100">
                    
                    {/* Demo Vehicle Status Card */}
                    <div className="p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-bold text-[#003366]">Live Tracking</h2>
                            {/* Blinking Red Dot for Live Status */}
                            <span className="flex h-3 w-3 relative">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        </div>
                        
                        {/* Conditional Rendering: Loading State vs Data State */}
                        {loading ? (
                            <div className="animate-pulse flex space-x-4">
                                <div className="flex-1 space-y-3 py-1">
                                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                                </div>
                            </div>
                        ) : demoVehicle ? (
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <p className="font-semibold text-gray-800 text-lg">
                                    {demoVehicle.Make || 'Unknown'} {demoVehicle.Model || 'Model'}
                                </p>
                                <p className="text-sm text-gray-500 mt-1">
                                    Number Plate: {demoVehicle.VehicleNumber || demoVehicle.plate_number || 'N/A'}
                                </p>
                                <div className={`mt-3 inline-block px-3 py-1 text-xs font-bold rounded-full border ${carLocation ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-700 border-gray-200'}`}>
                                    Status: {carLocation ? '🟢 Moving (Live)' : '⏳ Waiting for GPS...'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-50 rounded-xl text-gray-500 text-sm">
                                No vehicles found. Add a vehicle first.
                            </div>
                        )}
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="p-4 overflow-y-auto">
                        <ul className="space-y-1">
                            <li><button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group"><div className="h-12 w-12 bg-blue-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></div><span className="ml-4 font-medium text-gray-700 text-lg">Add a Person</span></button></li>
                            
                            {/* Add Vehicle Button (Triggers the Modal) */}
                            <li>
                                <button onClick={() => setIsAddVehicleOpen(true)} className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group">
                                    <div className="h-12 w-12 bg-[#003366] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                                    </div>
                                    <span className="ml-4 font-medium text-gray-700 text-lg">Add a Vehicle</span>
                                    <svg className="ml-auto w-5 h-5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                </button>
                            </li>
                            
                            <li><button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group"><div className="h-12 w-12 bg-[#FF8C00] rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg></div><span className="ml-4 font-medium text-gray-700 text-lg">Add a Pet</span></button></li>
                            <li><button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group"><div className="h-12 w-12 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path></svg></div><span className="ml-4 font-medium text-gray-700 text-lg">Add a TAG</span></button></li>
                            <li><button className="w-full flex items-center p-3 hover:bg-gray-50 rounded-2xl transition-colors group"><div className="h-12 w-12 bg-teal-500 rounded-2xl flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.243-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></div><span className="ml-4 font-medium text-gray-700 text-lg">Add a place</span></button></li>
                        </ul>
                    </div>
                </div>

                {/* Add Vehicle Modal Overlay */}
                {isAddVehicleOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative">
                            {/* Modal Close Button */}
                            <button 
                                onClick={() => setIsAddVehicleOpen(false)}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-full p-2 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>

                            <h2 className="text-2xl font-bold text-[#003366] mb-6">Add New Vehicle</h2>
                            
                            <form onSubmit={handleAddVehicle} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Plate Number</label>
                                    <input 
                                        type="text" 
                                        required 
                                        placeholder="e.g. WP CAA-1234"
                                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all"
                                        value={formData.plate_number}
                                        onChange={(e) => setFormData({...formData, plate_number: e.target.value})}
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Make</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Toyota"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all"
                                            value={formData.make}
                                            onChange={(e) => setFormData({...formData, make: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                                        <input 
                                            type="text" 
                                            required 
                                            placeholder="e.g. Prius"
                                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FF8C00] focus:border-[#FF8C00] outline-none transition-all"
                                            value={formData.model}
                                            onChange={(e) => setFormData({...formData, model: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className="w-full mt-6 bg-[#003366] hover:bg-[#002244] text-white font-bold py-3 px-4 rounded-xl transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center"
                                >
                                    {isSubmitting ? (
                                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        "Save Vehicle"
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
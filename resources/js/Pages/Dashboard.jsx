import { Head, Link } from '@inertiajs/react';

export default function Dashboard() {
    // Logout function (We will implement the real Firebase logout later)
    const handleLogout = (e) => {
        e.preventDefault();
        // Redirect back to login for now
        window.location.href = '/login';
    };

    return (
        <div className="min-h-screen bg-gray-100 flex">
            <Head title="Dashboard - Shalotrack" />

            {/* Sidebar Navigation */}
            <div className="w-64 bg-[#003366] text-white shadow-xl flex flex-col">
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
                    <Link href="#" className="flex items-center px-4 py-3 text-gray-300 hover:bg-[#002244] hover:text-white rounded-lg font-medium transition-colors">
                        Reports
                    </Link>
                </nav>

                <div className="p-4 border-t border-[#002244]">
                    <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 text-sm text-red-400 hover:bg-[#002244] rounded-lg transition-colors">
                        Log Out
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Top Header */}
                <header className="bg-white shadow-sm h-16 flex items-center justify-between px-8">
                    <h2 className="text-xl font-semibold text-gray-800">Overview</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm font-medium text-gray-600">Welcome, Admin</span>
                        <div className="h-8 w-8 bg-[#FF8C00] rounded-full flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>
                </header>

                {/* Dashboard Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    
                    {/* Welcome Card */}
                    <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#003366]">
                        <h3 className="text-lg font-bold text-gray-800">Welcome to Shalotrack Dashboard!</h3>
                        <p className="mt-2 text-gray-600">
                            You have successfully logged in. This is the foundation of your dashboard where we will add vehicle tracking, statistics, and maps next.
                        </p>
                    </div>

                    {/* Placeholder for future Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex items-center justify-center text-gray-400">
                            Total Vehicles Card (Coming Soon)
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex items-center justify-center text-gray-400">
                            Active Drivers Card (Coming Soon)
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-32 flex items-center justify-center text-gray-400">
                            Alerts Card (Coming Soon)
                        </div>
                    </div>

                </main>
            </div>
        </div>
    );
}
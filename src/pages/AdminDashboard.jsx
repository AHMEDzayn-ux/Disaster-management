import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

function AdminDashboard() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const [loading] = useState(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">👑 Admin Dashboard</h1>
                        <p className="text-gray-600">Manage camps and system operations</p>
                    </div>
                    <div className="flex gap-2">
                        <Link to="/" className="btn-secondary">
                            ← Home
                        </Link>
                        <button onClick={async () => { await signOut(); navigate('/'); }} className="btn-danger">
                            🚪 Logout
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Link to="/camp-management" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">⛺</div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Register New Camp</h3>
                                <p className="text-gray-600 text-sm">Add official relief camps to the system</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/camp-requests-review" className="card hover:shadow-lg transition-shadow cursor-pointer bg-warning-50 border-warning-300">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">📨</div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Review Camp Requests</h3>
                                <p className="text-gray-600 text-sm">Approve/reject public camp requests</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/camps" className="card hover:shadow-lg transition-shadow cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">📋</div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-800">Manage Camps</h3>
                                <p className="text-gray-600 text-sm">View and update existing camps</p>
                            </div>
                        </div>
                    </Link>
                </div>

                <div className="card bg-primary-50">
                    <h3 className="font-bold text-primary-800 mb-2">📊 Admin Portal</h3>
                    <p className="text-sm text-primary-700">
                        Welcome to the admin portal. Use this dashboard to manage disaster relief camps and coordinate emergency response.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;

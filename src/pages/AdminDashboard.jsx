import React, { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AdminDashboard() {
    const navigate = useNavigate();
    const { user, signOut, loading } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !user) {
            navigate('/admin/login');
        }
    }, [user, loading, navigate]);

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/" className="text-gray-400 hover:text-white transition-colors">
                                ← Home
                            </Link>
                            <h1 className="text-xl font-bold">🔐 Admin Portal</h1>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-gray-400">{user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-gray-800">Camp Management Dashboard</h2>
                    <p className="text-gray-600 mt-1">Review camp requests and register official relief camps</p>
                </div>

                {/* Action Cards */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
                    {/* Review Camp Requests */}
                    <Link to="/admin/review-requests" className="block">
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-warning-500">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">📋</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Review Camp Requests
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Review and approve/reject public requests for new relief camps
                                    </p>
                                    <span className="text-warning-600 font-semibold">
                                        View Pending Requests →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Register New Camp */}
                    <Link to="/admin/register-camp" className="block">
                        <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow border-l-4 border-success-500">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">⛺</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2">
                                        Register New Camp
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Directly register a new official relief camp (authority action)
                                    </p>
                                    <span className="text-success-600 font-semibold">
                                        Register Camp →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Stats */}
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Pending Requests</p>
                        <p className="text-2xl font-bold text-warning-600">-</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Active Camps</p>
                        <p className="text-2xl font-bold text-success-600">-</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Total Capacity</p>
                        <p className="text-2xl font-bold text-primary-600">-</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Approved Today</p>
                        <p className="text-2xl font-bold text-gray-700">-</p>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { checkIsAdmin } from '../services/adminService';

/**
 * Admin Manage Camps
 * ==================
 * Admin-only page to view and manage all camps
 * Admins can mark camps as closed but cannot delete them to maintain records
 */
function AdminManageCamps() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [camps, setCamps] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Admin status
    const [adminStatus, setAdminStatus] = useState({ isAdmin: false, role: null });

    // Close camp modal state
    const [closeModal, setCloseModal] = useState({ isOpen: false, camp: null });
    const [isClosing, setIsClosing] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    // Check admin status
    useEffect(() => {
        if (user) {
            checkIsAdmin().then(setAdminStatus);
        }
    }, [user]);

    // Fetch camps
    useEffect(() => {
        if (user) {
            fetchCamps();
        }
    }, [user, filter]);

    const fetchCamps = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('camps')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.ilike('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setCamps(data || []);
        } catch (error) {
            console.error('Error fetching camps:', error);
        } finally {
            setLoading(false);
        }
    };

    // Mark camp as closed handler
    const handleCloseCamp = async () => {
        if (!closeModal.camp) return;

        setIsClosing(true);
        try {
            const { error } = await supabase
                .from('camps')
                .update({
                    status: 'Closed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', closeModal.camp.id);

            if (error) throw error;

            alert(`✅ Camp "${closeModal.camp.name}" has been marked as closed.`);
            fetchCamps();
            setCloseModal({ isOpen: false, camp: null });
        } catch (error) {
            console.error('Close camp error:', error);
            alert(`❌ Failed to close camp: ${error.message}`);
        } finally {
            setIsClosing(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getStatusBadge = (status) => {
        const statusLower = status?.toLowerCase() || '';
        const badges = {
            active: 'bg-success-100 text-success-700',
            approved: 'bg-success-100 text-success-700',
            inactive: 'bg-gray-100 text-gray-700',
            closed: 'bg-danger-100 text-danger-700'
        };
        return badges[statusLower] || 'bg-gray-100 text-gray-700';
    };

    // Filter camps by search term
    const filteredCamps = camps.filter(camp => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return (
            camp.camp_name?.toLowerCase().includes(search) ||
            camp.district?.toLowerCase().includes(search) ||
            camp.address?.toLowerCase().includes(search)
        );
    });

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-gray-800 text-white shadow-lg">
                <div className="w-full px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link to="/admin/dashboard" className="text-gray-400 hover:text-white transition-colors">
                                ← Dashboard
                            </Link>
                            <h1 className="text-xl font-bold">⛺ Manage Camps</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            {adminStatus.role === 'super_admin' && (
                                <span className="px-2 py-1 bg-purple-600 text-white text-xs rounded-full">
                                    Super Admin
                                </span>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">🔒</span>
                        <div>
                            <h3 className="font-semibold text-blue-800">Secure Camp Management</h3>
                            <p className="text-sm text-blue-700">
                                As an admin, you can view and mark camps as closed. Camp records are maintained for historical tracking.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <input
                        type="text"
                        placeholder="Search camps..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <div className="flex gap-2">
                        {['all', 'active', 'inactive', 'closed'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setFilter(status)}
                                className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${filter === status
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Total Camps</p>
                        <p className="text-2xl font-bold text-gray-800">{camps.length}</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Active</p>
                        <p className="text-2xl font-bold text-success-600">
                            {camps.filter(c => c.status?.toLowerCase() === 'active').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Inactive</p>
                        <p className="text-2xl font-bold text-gray-600">
                            {camps.filter(c => c.status?.toLowerCase() === 'inactive').length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg p-4 shadow-sm">
                        <p className="text-sm text-gray-600">Closed</p>
                        <p className="text-2xl font-bold text-danger-600">
                            {camps.filter(c => c.status?.toLowerCase() === 'closed').length}
                        </p>
                    </div>
                </div>

                {/* Camp List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                ) : filteredCamps.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">⛺</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Camps Found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try a different search term.' : 'No camps match the selected filter.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCamps.map((camp) => (
                            <div key={camp.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{camp.camp_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(camp.status)}`}>
                                                {camp.status}
                                            </span>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <p>📍 {camp.district} - {camp.address}</p>
                                            <p>👥 Capacity: {camp.current_occupancy || 0}/{camp.total_capacity || 'N/A'}</p>
                                            <p>📞 {camp.contact_number || 'No contact'}</p>
                                            <p>🕒 Created: {formatDate(camp.created_at)}</p>
                                        </div>
                                        {camp.facilities && camp.facilities.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {camp.facilities.slice(0, 5).map((facility, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                        {facility}
                                                    </span>
                                                ))}
                                                {camp.facilities.length > 5 && (
                                                    <span className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                        +{camp.facilities.length - 5} more
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/camps/${camp.id}`}
                                            className="px-3 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-medium transition-colors"
                                        >
                                            View Details
                                        </Link>

                                        {/* Edit Camp button - available to all admins */}
                                        {adminStatus.isAdmin && (
                                            <Link
                                                to={`/admin/edit-camp/${camp.id}`}
                                                className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                                                title="Edit camp details"
                                            >
                                                ✏️ Edit
                                            </Link>
                                        )}

                                        {/* Mark as Closed button - available to all admins */}
                                        {adminStatus.isAdmin && camp.status?.toLowerCase() !== 'closed' && (
                                            <button
                                                onClick={() => setCloseModal({ isOpen: true, camp })}
                                                disabled={isClosing}
                                                className="px-3 py-2 bg-warning-600 hover:bg-warning-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                                                title="Mark camp as closed"
                                            >
                                                ⛔ Mark as Closed
                                            </button>
                                        )}

                                        {camp.status?.toLowerCase() === 'closed' && (
                                            <span className="px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">
                                                ✓ Closed
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Close Confirmation Modal */}
                {closeModal.isOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">Mark Camp as Closed</h3>
                            <p className="text-gray-600 mb-4">
                                Are you sure you want to mark <strong>{closeModal.camp?.name}</strong> as closed?
                            </p>
                            <p className="text-sm text-gray-500 mb-6">
                                The camp will be marked as closed but all records will be maintained for historical tracking.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={handleCloseCamp}
                                    disabled={isClosing}
                                    className="btn-primary flex-1 disabled:opacity-50"
                                >
                                    {isClosing ? 'Closing...' : 'Yes, Mark as Closed'}
                                </button>
                                <button
                                    onClick={() => setCloseModal({ isOpen: false, camp: null })}
                                    disabled={isClosing}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div >
    );
}

export default AdminManageCamps;

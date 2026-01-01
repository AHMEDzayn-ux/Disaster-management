import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import { secureDeleteRecord, checkIsAdmin, DELETABLE_TABLES, SUPER_ADMIN_TABLES } from '../services/adminService';
import DeleteConfirmModal from '../components/shared/DeleteConfirmModal';

/**
 * Admin Manage Camps
 * ==================
 * Admin-only page to view and manage all camps
 * Super admins can delete approved camps if required by authorities
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

    // Delete state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, camp: null });
    const [isDeleting, setIsDeleting] = useState(false);

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

    // Secure delete handler
    const handleDeleteCamp = async (reason) => {
        if (!deleteModal.camp) return;

        setIsDeleting(true);
        try {
            const result = await secureDeleteRecord(
                DELETABLE_TABLES.CAMPS,
                deleteModal.camp.id,
                reason
            );

            if (result.success) {
                alert(`✅ ${result.message}`);
                fetchCamps();
                setDeleteModal({ isOpen: false, camp: null });
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert(`❌ Failed to delete: ${error.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDeleteModal = (camp) => {
        setDeleteModal({ isOpen: true, camp });
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
                                As an admin, you can manage and delete camps. All deletions are securely logged for audit purposes.
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

                                        {/* Delete button - available to all admins */}
                                        {adminStatus.isAdmin && (
                                            <button
                                                onClick={() => openDeleteModal(camp)}
                                                disabled={isDeleting}
                                                className="px-3 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                                                title="Delete camp"
                                            >
                                                🗑️ Delete
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, camp: null })}
                    onConfirm={handleDeleteCamp}
                    itemName={deleteModal.camp?.camp_name || ''}
                    itemType="Relief Camp"
                    requireReason={true}
                    isProcessing={isDeleting}
                    warningMessage="⚠️ CRITICAL: This will permanently delete an approved relief camp. This action should only be taken if explicitly required by authorities. All affected people records may be impacted."
                />
            </main>
        </div>
    );
}

export default AdminManageCamps;

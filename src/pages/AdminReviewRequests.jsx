import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
    secureDeleteRecord,
    secureRejectCampRequest,
    checkIsAdmin,
    DELETABLE_TABLES
} from '../services/adminService';
import DeleteConfirmModal from '../components/shared/DeleteConfirmModal';

function AdminReviewRequests() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [processing, setProcessing] = useState(false);

    // Delete state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, request: null });
    const [isDeleting, setIsDeleting] = useState(false);
    const [adminStatus, setAdminStatus] = useState({ isAdmin: false, role: null });

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

    // Fetch camp requests
    useEffect(() => {
        if (user) {
            fetchRequests();
        }
    }, [user, filter]);

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let query = supabase
                .from('camp_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (filter !== 'all') {
                query = query.eq('status', filter);
            }

            const { data, error } = await query;

            if (error) throw error;
            setRequests(data || []);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = (request) => {
        // Navigate to registration form with prefilled data from the request
        navigate('/admin/register-camp', {
            state: {
                fromRequest: true,
                requestId: request.id,
                prefillData: {
                    camp_name: request.camp_name,
                    district: request.district,
                    address: request.address,
                    latitude: request.latitude,
                    longitude: request.longitude,
                    estimated_capacity: request.estimated_capacity,
                    facilities_needed: request.facilities_needed,
                    requester_name: request.requester_name,
                    requester_phone: request.requester_phone,
                    requester_email: request.requester_email,
                    reason: request.reason,
                    additional_notes: request.additional_notes
                }
            }
        });
    };

    const handleReject = async (request) => {
        if (!rejectionReason.trim()) {
            alert('Please provide a reason for rejection');
            return;
        }

        setProcessing(true);
        try {
            // Use secure edge function for rejection
            const result = await secureRejectCampRequest(request.id, rejectionReason);

            if (result.success) {
                alert('✅ Camp request rejected successfully.');
                fetchRequests();
                setSelectedRequest(null);
                setRejectionReason('');
            } else {
                alert(`❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Failed to reject request: ' + error.message);
        } finally {
            setProcessing(false);
        }
    };

    // Secure delete handler
    const handleDeleteRequest = async (reason) => {
        if (!deleteModal.request) return;

        setIsDeleting(true);
        try {
            const result = await secureDeleteRecord(
                DELETABLE_TABLES.CAMP_REQUESTS,
                deleteModal.request.id,
                reason
            );

            if (result.success) {
                alert(`✅ ${result.message}`);
                fetchRequests();
                setDeleteModal({ isOpen: false, request: null });
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

    const openDeleteModal = (request) => {
        setDeleteModal({ isOpen: true, request });
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'bg-warning-100 text-warning-700',
            approved: 'bg-success-100 text-success-700',
            rejected: 'bg-danger-100 text-danger-700'
        };
        return badges[status] || 'bg-gray-100 text-gray-700';
    };

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
                            <h1 className="text-xl font-bold">📋 Review Camp Requests</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Filters */}
                <div className="flex gap-2 mb-6">
                    {['pending', 'approved', 'rejected', 'all'].map((status) => (
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

                {/* Request List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Requests Found</h3>
                        <p className="text-gray-500">No {filter !== 'all' ? filter : ''} camp requests at this time.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((request) => (
                            <div key={request.id} className="bg-white rounded-xl shadow-sm p-6">
                                <div className="flex flex-wrap items-start justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-bold text-gray-800">{request.camp_name}</h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(request.status)}`}>
                                                {request.status}
                                            </span>
                                        </div>
                                        <div className="grid sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                            <p>📍 {request.district} - {request.address}</p>
                                            <p>👤 {request.requester_name} ({request.requester_phone})</p>
                                            <p>👥 Capacity: {request.estimated_capacity}</p>
                                            <p>🕒 {formatDate(request.created_at)}</p>
                                        </div>
                                        {request.facilities_needed && request.facilities_needed.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-1">
                                                {request.facilities_needed.map((facility, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">
                                                        {facility}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        <p className="mt-2 text-sm text-gray-700"><strong>Reason:</strong> {request.reason}</p>
                                        {request.rejection_reason && (
                                            <p className="mt-2 text-sm text-danger-600"><strong>Rejection Reason:</strong> {request.rejection_reason}</p>
                                        )}
                                    </div>

                                    {request.status === 'pending' && (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleApprove(request)}
                                                disabled={processing}
                                                className="px-4 py-2 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                ✓ Approve
                                            </button>
                                            <button
                                                onClick={() => setSelectedRequest(request)}
                                                disabled={processing}
                                                className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                            >
                                                ✕ Reject
                                            </button>
                                        </div>
                                    )}

                                    {/* Delete button for rejected/pending requests */}
                                    {(request.status === 'rejected' || request.status === 'pending') && adminStatus.isAdmin && (
                                        <button
                                            onClick={() => openDeleteModal(request)}
                                            disabled={isDeleting}
                                            className="px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                                            title="Permanently delete this request"
                                        >
                                            🗑️ Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Rejection Modal */}
                {selectedRequest && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl p-6 max-w-md w-full">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Reject Camp Request</h3>
                            <p className="text-sm text-gray-600 mb-4">
                                Please provide a reason for rejecting "{selectedRequest.camp_name}"
                            </p>
                            <textarea
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                placeholder="Enter rejection reason..."
                                className="input-field h-24 mb-4"
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={() => {
                                        setSelectedRequest(null);
                                        setRejectionReason('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleReject(selectedRequest)}
                                    disabled={processing || !rejectionReason.trim()}
                                    className="px-4 py-2 bg-danger-600 hover:bg-danger-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processing ? 'Rejecting...' : 'Reject Request'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, request: null })}
                    onConfirm={handleDeleteRequest}
                    itemName={deleteModal.request?.camp_name || ''}
                    itemType="Camp Request"
                    requireReason={true}
                    isProcessing={isDeleting}
                    warningMessage="This will permanently remove this camp request from the database. The action will be recorded in the audit log."
                />
            </main>
        </div>
    );
}

export default AdminReviewRequests;

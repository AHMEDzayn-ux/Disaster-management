import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import {
    secureDeleteRecord,
    checkIsAdmin,
    DELETABLE_TABLES,
    TABLE_DISPLAY_NAMES
} from '../services/adminService';
import DeleteConfirmModal from '../components/shared/DeleteConfirmModal';

/**
 * Admin Records Management
 * ========================
 * Comprehensive admin page to view and delete ANY records
 * All deletions go through secure edge function with audit logging
 */
function AdminRecords() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();

    // Table selection
    const [selectedTable, setSelectedTable] = useState('camp_requests');
    const [records, setRecords] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Admin status
    const [adminStatus, setAdminStatus] = useState({ isAdmin: false, role: null });
    const [checkingAdmin, setCheckingAdmin] = useState(true);

    // Delete state
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, record: null });
    const [isDeleting, setIsDeleting] = useState(false);

    // Detail view state
    const [detailModal, setDetailModal] = useState({ isOpen: false, record: null });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    // Check admin status
    useEffect(() => {
        if (user) {
            setCheckingAdmin(true);
            checkIsAdmin().then((status) => {
                setAdminStatus(status);
                setCheckingAdmin(false);
            });
        } else {
            setCheckingAdmin(false);
        }
    }, [user]);

    // Fetch records when table changes
    useEffect(() => {
        if (user && selectedTable) {
            fetchRecords();
        }
    }, [user, selectedTable]);

    const fetchRecords = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from(selectedTable)
                .select('*')
                .order('created_at', { ascending: false })
                .limit(100);

            if (error) throw error;
            setRecords(data || []);
        } catch (error) {
            console.error('Error fetching records:', error);
            setRecords([]);
        } finally {
            setLoading(false);
        }
    };

    // Secure delete handler
    const handleDeleteRecord = async (reason) => {
        if (!deleteModal.record) return;

        setIsDeleting(true);
        try {
            const result = await secureDeleteRecord(
                selectedTable,
                deleteModal.record.id,
                reason
            );

            if (result.success) {
                alert(`✅ ${result.message}`);
                fetchRecords();
                setDeleteModal({ isOpen: false, record: null });
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

    // Get display name for a record
    const getRecordDisplayName = (record) => {
        // Try common name fields
        return record.name ||
            record.camp_name ||
            record.title ||
            record.person_name ||
            record.full_name ||
            record.donor_name ||
            record.description?.substring(0, 50) ||
            `Record ${record.id?.substring(0, 8)}...`;
    };

    // Get record summary based on table type
    const getRecordSummary = (record) => {
        switch (selectedTable) {
            case 'camps':
                return `${record.district || 'Unknown'} | Capacity: ${record.total_capacity || 'N/A'} | Status: ${record.status || 'Unknown'}`;
            case 'camp_requests':
                return `${record.district || 'Unknown'} | Requester: ${record.requester_name || 'Unknown'} | Status: ${record.status || 'pending'}`;
            case 'missing_persons':
                return `Age: ${record.age || 'N/A'} | Last seen: ${record.last_seen_location || 'Unknown'} | Status: ${record.status || 'missing'}`;
            case 'disasters':
                return `Type: ${record.disaster_type || 'Unknown'} | Location: ${record.location || 'Unknown'} | Severity: ${record.severity || 'Unknown'}`;
            case 'animal_rescues':
                return `Animal: ${record.animal_type || 'Unknown'} | Location: ${record.location || 'Unknown'} | Status: ${record.status || 'pending'}`;
            case 'donations':
                return `Amount: ₹${record.amount || 0} | Donor: ${record.donor_name || 'Anonymous'} | Status: ${record.status || 'Unknown'}`;
            default:
                return `ID: ${record.id}`;
        }
    };

    // Filter records by search term
    const filteredRecords = records.filter(record => {
        if (!searchTerm) return true;
        const search = searchTerm.toLowerCase();
        return JSON.stringify(record).toLowerCase().includes(search);
    });

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Render a detail field with label and value
    const renderDetailField = (label, value) => {
        if (value === null || value === undefined || value === '') return null;
        return (
            <div>
                <p className="text-sm text-gray-500">{label}</p>
                <p className="font-medium text-gray-800 capitalize">{value}</p>
            </div>
        );
    };

    if (authLoading || !user || checkingAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
            </div>
        );
    }

    if (!adminStatus.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl mb-4">🚫</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
                    <p className="text-gray-600 mb-4">You are not authorized to access this page.</p>
                    <Link to="/admin/dashboard" className="text-primary-600 hover:underline">
                        Return to Dashboard
                    </Link>
                </div>
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
                            <h1 className="text-xl font-bold">📊 Records Management</h1>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                                Admin: {user.email}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                {/* Info Banner */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <h3 className="font-semibold text-amber-800">Admin Records Management</h3>
                            <p className="text-sm text-amber-700">
                                You can delete any record from any table. All deletions are permanently logged for audit purposes.
                                Deleted data can be recovered from audit logs if needed.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Table Selection */}
                <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Select Table</label>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(DELETABLE_TABLES).map(([key, tableName]) => (
                            <button
                                key={key}
                                onClick={() => {
                                    setSelectedTable(tableName);
                                    setSearchTerm('');
                                }}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedTable === tableName
                                    ? 'bg-gray-800 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {TABLE_DISPLAY_NAMES[tableName] || tableName}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Search and Stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                    <div className="flex-1 min-w-[200px]">
                        <input
                            type="text"
                            placeholder={`Search in ${TABLE_DISPLAY_NAMES[selectedTable] || selectedTable}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                            Total: <strong>{records.length}</strong> records
                        </span>
                        <button
                            onClick={fetchRecords}
                            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                        >
                            🔄 Refresh
                        </button>
                    </div>
                </div>

                {/* Records List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary-600 border-t-transparent"></div>
                    </div>
                ) : filteredRecords.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center">
                        <div className="text-6xl mb-4">📭</div>
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Records Found</h3>
                        <p className="text-gray-500">
                            {searchTerm ? 'Try a different search term.' : `No records in ${TABLE_DISPLAY_NAMES[selectedTable] || selectedTable}.`}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Name/Title</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Details</th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Created</th>
                                        <th className="px-4 py-3 text-right text-sm font-semibold text-gray-700">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredRecords.map((record) => (
                                        <tr key={record.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3">
                                                <div className="font-medium text-gray-800">
                                                    {getRecordDisplayName(record)}
                                                </div>
                                                <div className="text-xs text-gray-400 font-mono">
                                                    {record.id?.substring(0, 8)}...
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {getRecordSummary(record)}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                {formatDate(record.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex gap-2 justify-end">
                                                    <button
                                                        onClick={() => setDetailModal({ isOpen: true, record })}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        👁️ View
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteModal({ isOpen: true, record })}
                                                        disabled={isDeleting}
                                                        className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                <DeleteConfirmModal
                    isOpen={deleteModal.isOpen}
                    onClose={() => setDeleteModal({ isOpen: false, record: null })}
                    onConfirm={handleDeleteRecord}
                    itemName={deleteModal.record ? getRecordDisplayName(deleteModal.record) : ''}
                    itemType={TABLE_DISPLAY_NAMES[selectedTable] || selectedTable}
                    requireReason={true}
                    isProcessing={isDeleting}
                    warningMessage={`This will permanently delete this ${TABLE_DISPLAY_NAMES[selectedTable] || 'record'} from the database. A snapshot will be saved in the audit log for potential recovery.`}
                />

                {/* Detail View Modal */}
                {detailModal.isOpen && detailModal.record && (
                    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white px-6 py-4 border-b flex items-start justify-between z-10">
                                <div>
                                    <span className="text-sm text-gray-500">{TABLE_DISPLAY_NAMES[selectedTable]}</span>
                                    <h3 className="text-xl font-bold text-gray-800">
                                        {getRecordDisplayName(detailModal.record)}
                                    </h3>
                                    <p className="text-xs text-gray-400 font-mono mt-1">ID: {detailModal.record.id}</p>
                                </div>
                                <button
                                    onClick={() => setDetailModal({ isOpen: false, record: null })}
                                    className="text-gray-400 hover:text-gray-600 text-2xl leading-none p-2"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Body */}
                            <div className="p-6">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    {/* Left Column - Photo & Key Info */}
                                    <div className="lg:col-span-1 space-y-6">
                                        {/* Photo Section */}
                                        {(detailModal.record.photo || detailModal.record.image || detailModal.record.photo_url || detailModal.record.image_url) && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Photo</h4>
                                                <img
                                                    src={detailModal.record.photo || detailModal.record.image || detailModal.record.photo_url || detailModal.record.image_url}
                                                    alt={getRecordDisplayName(detailModal.record)}
                                                    className="w-full rounded-lg border-2 border-gray-200 shadow-md object-cover"
                                                    onError={(e) => { e.target.style.display = 'none'; }}
                                                />
                                            </div>
                                        )}

                                        {/* Status Card */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">Status</h4>
                                            <div className="space-y-3">
                                                <div>
                                                    <p className="text-sm text-gray-500">Current Status</p>
                                                    <p className="font-medium text-gray-800">
                                                        {detailModal.record.status === 'approved' || detailModal.record.status === 'active' ? (
                                                            <span className="text-green-600">✅ {detailModal.record.status}</span>
                                                        ) : detailModal.record.status === 'pending' ? (
                                                            <span className="text-yellow-600">⏳ {detailModal.record.status}</span>
                                                        ) : detailModal.record.status === 'rejected' ? (
                                                            <span className="text-red-600">❌ {detailModal.record.status}</span>
                                                        ) : (
                                                            <span className="capitalize">{detailModal.record.status || 'N/A'}</span>
                                                        )}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-sm text-gray-500">Created At</p>
                                                    <p className="font-medium text-gray-800">{formatDate(detailModal.record.created_at)}</p>
                                                </div>
                                                {detailModal.record.updated_at && (
                                                    <div>
                                                        <p className="text-sm text-gray-500">Last Updated</p>
                                                        <p className="font-medium text-gray-800">{formatDate(detailModal.record.updated_at)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Contact Info Card */}
                                        {(detailModal.record.contact_number || detailModal.record.phone || detailModal.record.email || detailModal.record.contact) && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h4>
                                                <div className="space-y-3">
                                                    {(detailModal.record.contact_number || detailModal.record.phone || detailModal.record.contact) && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">Phone Number</p>
                                                            <a href={`tel:${detailModal.record.contact_number || detailModal.record.phone || detailModal.record.contact}`}
                                                                className="font-medium text-primary-600 hover:text-primary-700">
                                                                📞 {detailModal.record.contact_number || detailModal.record.phone || detailModal.record.contact}
                                                            </a>
                                                        </div>
                                                    )}
                                                    {detailModal.record.email && (
                                                        <div>
                                                            <p className="text-sm text-gray-500">Email</p>
                                                            <a href={`mailto:${detailModal.record.email}`}
                                                                className="font-medium text-primary-600 hover:text-primary-700">
                                                                ✉️ {detailModal.record.email}
                                                            </a>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right Column - Details */}
                                    <div className="lg:col-span-2 space-y-6">
                                        {/* Primary Information Card */}
                                        <div className="bg-gray-50 rounded-xl p-4">
                                            <h4 className="text-lg font-semibold text-gray-800 mb-4">
                                                {selectedTable === 'camps' ? 'Camp Information' :
                                                    selectedTable === 'camp_requests' ? 'Request Information' :
                                                        selectedTable === 'missing_persons' ? 'Person Information' :
                                                            selectedTable === 'disasters' ? 'Disaster Information' :
                                                                selectedTable === 'animal_rescues' ? 'Rescue Information' :
                                                                    selectedTable === 'donations' ? 'Donation Information' : 'Details'}
                                            </h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {renderDetailField('Name', detailModal.record.name || detailModal.record.camp_name || detailModal.record.title || detailModal.record.person_name)}
                                                {renderDetailField('District', detailModal.record.district)}
                                                {renderDetailField('Location', detailModal.record.location || detailModal.record.address)}
                                                {renderDetailField('Type', detailModal.record.type || detailModal.record.disaster_type || detailModal.record.animal_type)}
                                                {renderDetailField('Severity', detailModal.record.severity)}
                                                {renderDetailField('Age', detailModal.record.age)}
                                                {renderDetailField('Gender', detailModal.record.gender)}
                                                {renderDetailField('Capacity', detailModal.record.total_capacity || detailModal.record.capacity)}
                                                {renderDetailField('Current Occupancy', detailModal.record.current_occupancy)}
                                                {renderDetailField('Amount', detailModal.record.amount ? `₹${detailModal.record.amount}` : null)}
                                                {renderDetailField('Donor Name', detailModal.record.donor_name)}
                                                {renderDetailField('Requester', detailModal.record.requester_name)}
                                            </div>
                                        </div>

                                        {/* Description Card */}
                                        {(detailModal.record.description || detailModal.record.notes || detailModal.record.additional_info || detailModal.record.reason) && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Description</h4>
                                                <p className="text-gray-700 whitespace-pre-wrap">
                                                    {detailModal.record.description || detailModal.record.notes || detailModal.record.additional_info || detailModal.record.reason}
                                                </p>
                                            </div>
                                        )}

                                        {/* Facilities Card (for camps) */}
                                        {detailModal.record.facilities && (
                                            <div className="bg-gray-50 rounded-xl p-4">
                                                <h4 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {(Array.isArray(detailModal.record.facilities)
                                                        ? detailModal.record.facilities
                                                        : (typeof detailModal.record.facilities === 'string'
                                                            ? detailModal.record.facilities.split(',')
                                                            : [])
                                                    ).map((facility, idx) => (
                                                        <span key={idx} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                                                            {facility.trim()}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* All Fields (Expandable) */}
                                        <details className="bg-gray-50 rounded-xl">
                                            <summary className="p-4 cursor-pointer font-semibold text-gray-800 hover:bg-gray-100 rounded-xl">
                                                📋 View All Raw Fields
                                            </summary>
                                            <div className="px-4 pb-4 space-y-3 border-t border-gray-200 mt-2 pt-4">
                                                {Object.entries(detailModal.record).map(([key, value]) => {
                                                    if (value === null || value === undefined) return null;

                                                    let displayValue = value;
                                                    if (typeof value === 'object') {
                                                        displayValue = JSON.stringify(value, null, 2);
                                                    } else if (typeof value === 'boolean') {
                                                        displayValue = value ? '✅ Yes' : '❌ No';
                                                    } else if (key.includes('date') || key.includes('_at')) {
                                                        displayValue = formatDate(value);
                                                    }

                                                    return (
                                                        <div key={key} className="border-b border-gray-200 pb-2">
                                                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                                                {key.replace(/_/g, ' ')}
                                                            </p>
                                                            <div className="text-sm text-gray-800 mt-1">
                                                                {typeof value === 'object' ? (
                                                                    <pre className="bg-white p-2 rounded text-xs overflow-x-auto border">
                                                                        {displayValue}
                                                                    </pre>
                                                                ) : (
                                                                    <span className="whitespace-pre-wrap">{displayValue}</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </details>
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex gap-3 justify-end">
                                <button
                                    onClick={() => setDetailModal({ isOpen: false, record: null })}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={() => {
                                        setDetailModal({ isOpen: false, record: null });
                                        setDeleteModal({ isOpen: true, record: detailModal.record });
                                    }}
                                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    🗑️ Delete This Record
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminRecords;

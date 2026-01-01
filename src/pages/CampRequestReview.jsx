import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

function CampRequestReview() {
    const navigate = useNavigate();
    const [requests, setRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);

    useEffect(() => {
        const loadRequests = async () => {
            try {
                const { data, error } = await supabase
                    .from('camp_requests')
                    .select('*')
                    .eq('status', 'pending')
                    .order('requested_at', { ascending: false });

                if (error) throw error;
                setRequests(data || []);
            } catch (error) {
                console.error('Error loading requests:', error);
            }
        };

        loadRequests();

        // Set up real-time subscription
        const subscription = supabase
            .channel('camp_requests_changes')
            .on('postgres_changes',
                { event: '*', schema: 'public', table: 'camp_requests' },
                () => loadRequests()
            )
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const handleApprove = (request) => {
        // Navigate to camp management with pre-filled data matching database schema
        const campData = {
            name: `${request.district} Relief Camp - ${request.location}`,
            type: 'Temporary Shelter',
            capacity: request.approximate_people,
            location: {
                address: request.location,
                lat: 6.9271,
                lng: 79.8612,
                district: request.district
            },
            contactPerson: request.reporter_name,
            contactNumber: request.reporter_phone
        };

        // Store prefill data and navigate
        localStorage.setItem('campPrefillData', JSON.stringify(campData));
        navigate('/camp-management?from=request&id=' + request.id);
    };

    const handleReject = async (requestId, reason) => {
        if (!reason || reason.trim() === '') {
            alert('Please provide a reason for rejection');
            return;
        }

        try {
            const { error } = await supabase
                .from('camp_requests')
                .update({
                    status: 'rejected',
                    reviewed_at: new Date().toISOString(),
                    rejection_reason: reason
                })
                .eq('id', requestId);

            if (error) throw error;

            setSelectedRequest(null);
            alert('Request rejected and notified to requester');
        } catch (error) {
            console.error('Error rejecting request:', error);
            alert('Error rejecting request: ' + error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">📋 Camp Requests Review</h1>
                    <p className="text-gray-600">
                        Review and approve public camp registration requests
                    </p>
                </div>

                {requests.length === 0 ? (
                    <div className="card text-center py-12">
                        <div className="text-6xl mb-4">✅</div>
                        <h3 className="text-xl font-bold text-gray-800 mb-2">No Pending Requests</h3>
                        <p className="text-gray-600">All camp requests have been reviewed.</p>
                        <button onClick={() => navigate('/admin')} className="btn-secondary mt-4">
                            ← Back to Dashboard
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {requests.map((request) => (
                            <div key={request.id} className="card hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row gap-4">
                                    {/* Request Details */}
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-800">
                                                    {request.location}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {request.district} District • {new Date(request.requested_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-xs font-semibold">
                                                Pending Review
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-600">Disaster Type</p>
                                                <p className="font-semibold capitalize">{request.disaster_type}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-600">Affected People</p>
                                                <p className="font-semibold">{request.approximate_people}</p>
                                            </div>
                                            <div className="bg-gray-50 p-2 rounded">
                                                <p className="text-xs text-gray-600">Reporter</p>
                                                <p className="font-semibold text-sm">{request.reporter_name}</p>
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs text-gray-600 mb-1">Urgent Needs:</p>
                                            <div className="flex flex-wrap gap-1">
                                                {(Array.isArray(request.urgent_needs) ? request.urgent_needs : []).map((need, idx) => (
                                                    <span key={idx} className="px-2 py-1 bg-danger-100 text-danger-700 rounded text-xs">
                                                        {need}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="mb-3">
                                            <p className="text-xs text-gray-600 mb-1">Situation:</p>
                                            <p className="text-sm text-gray-700">{request.description}</p>
                                        </div>

                                        {request.additional_info && (
                                            <div className="mb-3">
                                                <p className="text-xs text-gray-600 mb-1">Additional Info:</p>
                                                <p className="text-sm text-gray-700">{request.additional_info}</p>
                                            </div>
                                        )}

                                        <div className="bg-blue-50 p-2 rounded">
                                            <p className="text-xs text-blue-600">
                                                📞 Contact: {request.reporter_phone}
                                                {request.reporter_email && ` • ✉️ ${request.reporter_email}`}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex md:flex-col gap-2 md:w-40">
                                        <button
                                            onClick={() => handleApprove(request)}
                                            className="btn-primary flex-1 md:flex-none"
                                        >
                                            ✅ Approve & Create Camp
                                        </button>
                                        <button
                                            onClick={() => setSelectedRequest(request.id)}
                                            className="btn-danger flex-1 md:flex-none"
                                        >
                                            ❌ Reject
                                        </button>
                                    </div>
                                </div>

                                {/* Rejection Modal */}
                                {selectedRequest === request.id && (
                                    <div className="mt-4 pt-4 border-t">
                                        <label className="label">Reason for Rejection *</label>
                                        <textarea
                                            id={`reject-reason-${request.id}`}
                                            rows="2"
                                            className="input-field mb-2"
                                            placeholder="Provide reason for rejection (will be sent to requester)..."
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setSelectedRequest(null)}
                                                className="btn-secondary flex-1"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = document.getElementById(`reject-reason-${request.id}`).value;
                                                    handleReject(request.id, reason);
                                                }}
                                                className="btn-danger flex-1"
                                            >
                                                Confirm Rejection
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className="mt-6">
                    <button onClick={() => navigate('/admin')} className="btn-secondary">
                        ← Back to Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
}

export default CampRequestReview;

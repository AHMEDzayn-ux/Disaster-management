import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDisasterStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletIconFix';

function DisasterReportDetail({ role: propRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { disasters, markResolvedByResponder, subscribeToDisasters, isInitialized } = useDisasterStore();

    // Ensure data is loaded
    useEffect(() => {
        if (!isInitialized) {
            subscribeToDisasters();
        }
    }, [isInitialized, subscribeToDisasters]);

    const role = propRole ||
        location.state?.role ||
        (location.pathname.startsWith('/disasters-list') ? 'responder' : 'reporter');

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [resolvedBy, setResolvedBy] = useState('');
    const [responderNotes, setResponderNotes] = useState('');

    const disaster = disasters.find(d => d.id === id || d.id === parseInt(id));

    // Show loading while data is being fetched
    if (!isInitialized) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!disaster) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Report Not Found</h1>
                <p className="text-gray-600 mb-6">The disaster report could not be found.</p>
                <button onClick={() => navigate(-1)} className="btn-primary">← Go Back</button>
            </div>
        );
    }

    const getDisasterIcon = (type) => {
        const icons = {
            'flood': '🌊', 'landslide': '⛰️', 'fire': '🔥', 'earthquake': '🌍',
            'cyclone': '🌀', 'drought': '🌵', 'tsunami': '🌊', 'building-collapse': '🏚️', 'other': '⚠️'
        };
        return icons[type] || '⚠️';
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            'critical': { className: 'bg-danger-600 text-white', text: '🚨 Critical - Life Threatening' },
            'high': { className: 'bg-danger-500 text-white', text: '⚠️ High - Severe Damage' },
            'moderate': { className: 'bg-warning-500 text-white', text: '⚡ Moderate - Significant Damage' },
            'low': { className: 'bg-info-500 text-white', text: 'ℹ️ Low - Minor Damage' }
        };
        return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badges[severity].className}`}>{badges[severity].text}</span>;
    };

    const getStatusBadge = (status) => {
        return status === 'Active'
            ? <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-100 text-danger-700">🔴 Active - Needs Response</span>
            : <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">✅ Resolved</span>;
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleMarkResolved = () => setShowConfirmDialog(true);

    const confirmMarkResolved = () => {
        markResolvedByResponder(disaster.id, resolvedBy || 'Disaster Response Team', responderNotes || null);
        setShowConfirmDialog(false);
    };

    const canMarkResolved = role === 'responder' && disaster.status === 'Active';

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2">
                    ← Back to List
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 capitalize flex items-center gap-2">
                            {getDisasterIcon(disaster.disasterType)} {disaster.disasterType.replace('-', ' ')}
                        </h1>
                        <p className="text-gray-600">Report ID: #{disaster.id}</p>
                    </div>
                    {getStatusBadge(disaster.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    {disaster.photo && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo Evidence</h3>
                            <img src={disaster.photo} alt={disaster.disasterType} className="w-full rounded-lg border-2 border-gray-200 shadow-md" />
                        </div>
                    )}

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Severity & Impact</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Severity Level</p>
                                <div className="mt-1">{getSeverityBadge(disaster.severity)}</div>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">People Affected</p>
                                <p className="font-medium text-gray-800">{disaster.peopleAffected}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Casualties</p>
                                <p className="font-medium text-gray-800 capitalize">{disaster.casualties}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Area Size</p>
                                <p className="font-medium text-gray-800 capitalize">{disaster.areaSize}</p>
                            </div>
                        </div>
                    </div>

                    {disaster.needs && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Immediate Needs</h3>
                            <div className="flex flex-wrap gap-2">
                                {disaster.needs.rescue && <span className="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-sm font-medium">🆘 Rescue</span>}
                                {disaster.needs.medical && <span className="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-sm font-medium">🏥 Medical</span>}
                                {disaster.needs.shelter && <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">🏠 Shelter</span>}
                                {disaster.needs.food && <span className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">🍚 Food</span>}
                                {disaster.needs.water && <span className="px-3 py-1 bg-info-100 text-info-700 rounded-full text-sm font-medium">💧 Water</span>}
                                {disaster.needs.evacuation && <span className="px-3 py-1 bg-danger-100 text-danger-700 rounded-full text-sm font-medium">🚶 Evacuation</span>}
                            </div>
                        </div>
                    )}

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reporter Contact</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-800">{disaster.reporterName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone</p>
                                <p className="font-medium text-gray-800">{disaster.contactNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
                        <p className="text-gray-700">{disaster.description}</p>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Location</h3>
                        <p className="text-gray-700 mb-3"><strong>Address:</strong> {disaster.location.address}</p>
                        {disaster.occurredDate && <p className="text-gray-600 text-sm mb-3"><strong>Occurred:</strong> {formatDate(disaster.occurredDate)}</p>}
                        <div style={{ height: '400px' }} className="rounded-lg overflow-hidden border-2 border-gray-200">
                            <MapContainer center={[disaster.location.lat, disaster.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[disaster.location.lat, disaster.location.lng]}>
                                    <Popup><div className="p-2"><p className="font-bold">{disaster.disasterType}</p><p className="text-sm text-gray-600">{disaster.location.address}</p></div></Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Status Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">1</div>
                                    {disaster.resolvedAt && <div className="w-0.5 h-full bg-primary-300 mt-2"></div>}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-semibold text-gray-800">Report Submitted</p>
                                    <p className="text-sm text-gray-600">{formatDate(disaster.reportedAt)}</p>
                                    <p className="text-sm text-gray-500 mt-1">By {disaster.reporterName}</p>
                                </div>
                            </div>

                            {disaster.resolvedAt && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-success-500 text-white flex items-center justify-center font-bold">✓</div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Situation Resolved</p>
                                        <p className="text-sm text-gray-600">{formatDate(disaster.resolvedAt)}</p>
                                        {disaster.resolvedBy && <p className="text-sm text-gray-500 mt-1">By {disaster.resolvedBy}</p>}
                                        {disaster.responderNotes && <p className="text-sm text-gray-700 mt-2 italic">{disaster.responderNotes}</p>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {canMarkResolved && (
                        <div className="card bg-primary-50 border-primary-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Responder Actions</h3>
                            <p className="text-gray-700 mb-4">Has the situation been resolved? Mark this report as resolved to close the case.</p>
                            <button onClick={handleMarkResolved} className="btn-primary w-full md:w-auto">✓ Mark as Resolved</button>
                        </div>
                    )}

                    {disaster.status === 'Resolved' && (
                        <div className="card bg-success-50 border-success-200">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">✅</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-success-800 mb-2">Situation Resolved</h3>
                                    <p className="text-success-700">This disaster was resolved on {formatDate(disaster.resolvedAt)}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Confirm Resolution</h3>
                        <p className="text-gray-600 mb-4">Please confirm that this disaster situation has been resolved.</p>

                        <div className="space-y-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Resolved By</label>
                                <input type="text" value={resolvedBy} onChange={(e) => setResolvedBy(e.target.value)} placeholder="Team/Organization name" className="input-field" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea value={responderNotes} onChange={(e) => setResponderNotes(e.target.value)} placeholder="Resolution details..." rows="3" className="input-field" />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={confirmMarkResolved} className="btn-primary flex-1">Confirm</button>
                            <button onClick={() => setShowConfirmDialog(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisasterReportDetail;

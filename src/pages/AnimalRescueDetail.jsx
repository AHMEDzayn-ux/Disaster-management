import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAnimalRescueStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function AnimalRescueDetail({ role: propRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { animalRescues, markFoundByResponder } = useAnimalRescueStore();

    // Determine role from prop, URL path, or location state
    const role = propRole ||
        location.state?.role ||
        (location.pathname.startsWith('/animal-rescue-list') ? 'responder' : 'reporter');

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [foundContact, setFoundContact] = useState('');

    const rescue = animalRescues.find(r => r.id === parseInt(id));

    if (!rescue) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Rescue Report Not Found</h1>
                <p className="text-gray-600 mb-6">The animal rescue record could not be found.</p>
                <button onClick={() => navigate(-1)} className="btn-primary">
                    ← Go Back
                </button>
            </div>
        );
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const getTimeSince = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        return 'Just now';
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-100 text-danger-700">🔴 Active - Needs Rescue</span>;
            case 'Resolved':
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">✅ Resolved - Animal Rescued</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    const getConditionBadge = (condition) => {
        const badges = {
            'critical': { className: 'bg-danger-600 text-white', text: '🚨 Critical Condition' },
            'injured': { className: 'bg-warning-600 text-white', text: '🩹 Injured' },
            'trapped': { className: 'bg-warning-500 text-white', text: '🔒 Trapped' },
            'sick': { className: 'bg-warning-400 text-gray-900', text: '🤒 Sick/Weak' },
            'healthy': { className: 'bg-info-500 text-white', text: '✓ Healthy/Unharmed' },
        };
        const badge = badges[condition] || { className: 'bg-gray-500 text-white', text: condition };
        return <span className={`px-3 py-1 rounded-full text-sm font-semibold ${badge.className}`}>{badge.text}</span>;
    };

    const getAnimalTypeIcon = (animalType) => {
        const icons = {
            'dog': '🐕',
            'cat': '🐈',
            'cattle': '🐄',
            'goat': '🐐',
            'bird': '🐦',
            'wildlife': '🦎',
            'other': '🐾'
        };
        return icons[animalType] || '🐾';
    };

    const handleMarkRescued = () => {
        setShowConfirmDialog(true);
    };

    const confirmMarkRescued = () => {
        markFoundByResponder(rescue.id, foundContact || null);
        setShowConfirmDialog(false);
        setFoundContact('');
    };

    const canMarkRescued = role === 'responder' && rescue.status === 'Active';

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2">
                    ← Back to List
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 capitalize flex items-center gap-2">
                            {getAnimalTypeIcon(rescue.animalType)} {rescue.animalType}
                            {rescue.breed && <span className="text-xl text-gray-600">({rescue.breed})</span>}
                        </h1>
                        <p className="text-gray-600">Report ID: #{rescue.id} • Reported {getTimeSince(rescue.reportedAt)}</p>
                    </div>
                    {getStatusBadge(rescue.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Photo & Animal Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Photo */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo</h3>
                        <img
                            src={rescue.photo}
                            alt={rescue.animalType}
                            className="w-full rounded-lg border-2 border-gray-200 shadow-md"
                        />
                    </div>

                    {/* Animal Information */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Animal Information</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Animal Type</p>
                                <p className="font-medium text-gray-800 capitalize flex items-center gap-2">
                                    {getAnimalTypeIcon(rescue.animalType)} {rescue.animalType}
                                </p>
                            </div>
                            {rescue.breed && (
                                <div>
                                    <p className="text-sm text-gray-500">Size/Breed</p>
                                    <p className="font-medium text-gray-800">{rescue.breed}</p>
                                </div>
                            )}
                            <div>
                                <p className="text-sm text-gray-500">Description</p>
                                <p className="font-medium text-gray-800">{rescue.description}</p>
                            </div>
                        </div>
                    </div>

                    {/* Safety Information */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">⚠️ Safety Information</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Danger Level</p>
                                {rescue.isDangerous ? (
                                    <div className="bg-danger-50 border-l-4 border-danger-500 p-3 rounded">
                                        <p className="font-bold text-danger-700 mb-1">⚠️ Dangerous Animal</p>
                                        {rescue.dangerDetails && (
                                            <p className="text-sm text-danger-600">{rescue.dangerDetails}</p>
                                        )}
                                    </div>
                                ) : (
                                    <p className="font-medium text-success-700">✓ Not dangerous - safe to approach</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Condition</p>
                                <div className="mt-1">
                                    {getConditionBadge(rescue.condition)}
                                </div>
                            </div>
                            {rescue.healthDetails && (
                                <div>
                                    <p className="text-sm text-gray-500">Health Details</p>
                                    <p className="font-medium text-gray-800">{rescue.healthDetails}</p>
                                </div>
                            )}
                            {rescue.accessibility && (
                                <div>
                                    <p className="text-sm text-gray-500">Accessibility</p>
                                    <p className="font-medium text-gray-800 capitalize">{rescue.accessibility} access</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Reporter Contact */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Reporter Contact</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Name</p>
                                <p className="font-medium text-gray-800">{rescue.reporterName}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                <p className="font-medium text-gray-800">{rescue.contactNumber}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Location, Timeline, Actions */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Location Map */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Animal Location</h3>
                        <div className="mb-3">
                            <p className="text-gray-700">
                                <strong>Address:</strong> {rescue.location.address}
                            </p>
                            {rescue.spottedDate && (
                                <p className="text-gray-600 text-sm mt-1">
                                    <strong>Spotted on:</strong> {formatDate(rescue.spottedDate)}
                                </p>
                            )}
                        </div>
                        <div style={{ height: '400px' }} className="rounded-lg overflow-hidden border-2 border-gray-200">
                            <MapContainer
                                center={[rescue.location.lat, rescue.location.lng]}
                                zoom={15}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <Marker position={[rescue.location.lat, rescue.location.lng]}>
                                    <Popup>
                                        <div className="p-2">
                                            <p className="font-bold capitalize">{rescue.animalType} spotted here</p>
                                            <p className="text-sm text-gray-600">{rescue.location.address}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Status Timeline</h3>
                        <div className="space-y-4">
                            {/* Reported */}
                            <div className="flex gap-4">
                                <div className="flex flex-col items-center">
                                    <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">
                                        1
                                    </div>
                                    {rescue.foundAt && <div className="w-0.5 h-full bg-primary-300 mt-2"></div>}
                                </div>
                                <div className="flex-1 pb-4">
                                    <p className="font-semibold text-gray-800">Report Submitted</p>
                                    <p className="text-sm text-gray-600">{formatDate(rescue.reportedAt)}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        By {rescue.reporterName} • {rescue.contactNumber}
                                    </p>
                                </div>
                            </div>

                            {/* Rescued */}
                            {rescue.foundAt && (
                                <div className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div className="w-10 h-10 rounded-full bg-success-500 text-white flex items-center justify-center font-bold">
                                            ✓
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-semibold text-gray-800">Animal Rescued</p>
                                        <p className="text-sm text-gray-600">{formatDate(rescue.foundAt)}</p>
                                        {rescue.foundByContact && (
                                            <p className="text-sm text-gray-500 mt-1">
                                                Contact: {rescue.foundByContact}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Responder Actions */}
                    {canMarkRescued && (
                        <div className="card bg-primary-50 border-primary-200">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🛠️ Responder Actions</h3>
                            <p className="text-gray-700 mb-4">
                                Have you successfully rescued this animal? Mark it as resolved to close the case.
                            </p>
                            <button
                                onClick={handleMarkRescued}
                                className="btn-primary w-full md:w-auto"
                            >
                                ✓ Mark as Rescued
                            </button>
                        </div>
                    )}

                    {/* Resolved Notice */}
                    {rescue.status === 'Resolved' && (
                        <div className="card bg-success-50 border-success-200">
                            <div className="flex items-start gap-3">
                                <div className="text-3xl">✅</div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-success-800 mb-2">
                                        Animal Successfully Rescued
                                    </h3>
                                    <p className="text-success-700">
                                        This animal was rescued on {formatDate(rescue.foundAt)}
                                    </p>
                                    {rescue.foundByContact && (
                                        <p className="text-success-600 text-sm mt-2">
                                            Contact provided: {rescue.foundByContact}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Confirm Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Confirm Animal Rescue
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Please confirm that this animal has been successfully rescued.
                            You can optionally provide a contact number for follow-up.
                        </p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Number (Optional)
                            </label>
                            <input
                                type="tel"
                                value={foundContact}
                                onChange={(e) => setFoundContact(e.target.value)}
                                placeholder="Enter contact number"
                                className="input-field"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Provide an alternate contact if needed
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmMarkRescued}
                                className="btn-primary flex-1"
                            >
                                Confirm Rescue
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setFoundContact('');
                                }}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AnimalRescueDetail;

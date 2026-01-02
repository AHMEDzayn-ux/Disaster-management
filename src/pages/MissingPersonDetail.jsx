import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useMissingPersonStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletIconFix';

function MissingPersonDetail({ role: propRole }) {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { missingPersons, subscribeToMissingPersons, isInitialized } = useMissingPersonStore();

    // Ensure data is loaded
    useEffect(() => {
        if (!isInitialized) {
            subscribeToMissingPersons();
        }
    }, [isInitialized, subscribeToMissingPersons]);

    // Determine role from prop, URL path, or location state
    const role = propRole ||
        location.state?.role ||
        (location.pathname.startsWith('/missing-persons-list') ? 'responder' : 'reporter');

    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [foundContact, setFoundContact] = useState('');

    const person = missingPersons.find(p => p.id === id || p.id === parseInt(id));

    // Handle both snake_case (database) and camelCase (legacy) field names
    const lastSeenLocation = person?.last_seen_location || person?.lastSeenLocation;
    const lastSeenDate = person?.last_seen_date || person?.lastSeenDate;
    const reporterName = person?.reporter_name || person?.reporterName;
    const contactNumber = person?.contact_number || person?.contactNumber;
    const reportedAt = person?.reported_at || person?.reportedAt || person?.created_at;
    const foundByContact = person?.found_by_contact || person?.foundByContact;

    // Show loading while data is being fetched
    if (!isInitialized) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!person) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Person Not Found</h1>
                <p className="text-gray-600 mb-6">The missing person record could not be found.</p>
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
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-danger-100 text-danger-700">🔴 Active - Still Missing</span>;
            case 'Resolved':
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-success-100 text-success-700">✅ Resolved - Person Found</span>;
            default:
                return <span className="px-3 py-1 rounded-full text-sm font-semibold bg-gray-100 text-gray-700">{status}</span>;
        }
    };

    const handleMarkFound = () => {
        setShowConfirmDialog(true);
    };

    const confirmMarkFound = () => {
        markFoundByResponder(person.id, foundContact || null);
        setShowConfirmDialog(false);
        setFoundContact('');
    };

    const canMarkFound = role === 'responder' && person.status === 'Active';

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Header */}
            <div className="mb-6">
                <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2">
                    ← Back to List
                </button>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{person.name}</h1>
                        <p className="text-gray-600">Report ID: #{person.id} • Reported {getTimeSince(reportedAt)}</p>
                    </div>
                    {getStatusBadge(person.status)}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Photo & Basic Info */}
                <div className="lg:col-span-1 space-y-6">
                    {/* Photo */}
                    {person.photo && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Photo</h3>
                            <img
                                src={person.photo}
                                alt={person.name || 'Missing Person'}
                                className="w-full max-h-96 rounded-lg border-2 border-gray-200 shadow-md object-contain bg-gray-50"
                                loading="lazy"
                            />
                        </div>
                    )}

                    {/* Basic Information */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                        <div className="space-y-3">
                            <div>
                                <p className="text-sm text-gray-500">Full Name</p>
                                <p className="font-medium text-gray-800">{person.name || 'Unknown'}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Age</p>
                                    <p className="font-medium text-gray-800">{person.age || 'N/A'} {person.age ? 'years' : ''}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Gender</p>
                                    <p className="font-medium text-gray-800 capitalize">{person.gender}</p>
                                </div>
                            </div>
                            {person.description && (
                                <div>
                                    <p className="text-sm text-gray-500">Description</p>
                                    <p className="font-medium text-gray-800">{person.description}</p>
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
                                <p className="font-medium text-gray-800">{reporterName || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Phone Number</p>
                                {contactNumber ? (
                                    <a href={`tel:${contactNumber}`} className="font-medium text-primary-600 hover:text-primary-700">
                                        📞 {contactNumber}
                                    </a>
                                ) : (
                                    <p className="font-medium text-gray-800">N/A</p>
                                )}
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Reported At</p>
                                <p className="font-medium text-gray-800">{formatDate(reportedAt)}</p>
                            </div>
                        </div>

                        {foundByContact && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <h4 className="text-sm font-semibold text-success-700 mb-2">✓ Found - Alternate Contact</h4>
                                <div>
                                    <p className="text-sm text-gray-500">Contact Person</p>
                                    <a href={`tel:${foundByContact}`} className="font-medium text-success-600 hover:text-success-700">
                                        📞 {foundByContact}
                                    </a>
                                    <p className="text-xs text-gray-500 mt-1">Contact this number for more information</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column - Details & Map */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Last Seen Information */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Last Seen Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <p className="text-sm text-gray-500">Location</p>
                                <p className="font-medium text-gray-800">📍 {lastSeenLocation?.address || 'Unknown'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Date & Time</p>
                                <p className="font-medium text-gray-800">🕒 {formatDate(lastSeenDate)}</p>
                                <p className="text-sm text-gray-600 mt-1">{getTimeSince(lastSeenDate)}</p>
                            </div>
                        </div>

                        {/* Map */}
                        {lastSeenLocation?.lat && lastSeenLocation?.lng && (
                            <div className="h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                                <MapContainer
                                    center={[lastSeenLocation.lat, lastSeenLocation.lng]}
                                    zoom={15}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                    />
                                    <Marker position={[lastSeenLocation.lat, lastSeenLocation.lng]}>
                                        <Popup>
                                            <strong>Last Seen Here</strong><br />
                                            {lastSeenLocation.address}
                                        </Popup>
                                    </Marker>
                                </MapContainer>
                            </div>
                        )}
                    </div>

                    {/* Additional Information */}
                    {person.additionalInfo && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                            <p className="text-gray-700">{person.additionalInfo}</p>
                        </div>
                    )}

                    {/* Status Timeline */}
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Status Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <span className="text-primary-600">📝</span>
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800">Report Filed</p>
                                    <p className="text-sm text-gray-600">{formatDate(person.reportedAt)}</p>
                                    <p className="text-xs text-gray-500">By {person.reporterName}</p>
                                </div>
                            </div>

                            {person.foundAt && (
                                <div className="flex gap-4">
                                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-success-100 flex items-center justify-center">
                                        <span className="text-success-600">✓</span>
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-800">Marked as Found</p>
                                        <p className="text-sm text-gray-600">{formatDate(person.foundAt)}</p>
                                        <p className="text-xs text-gray-500">Case resolved</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="card bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Actions</h3>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {canMarkFound && (
                                <button
                                    onClick={handleMarkFound}
                                    className="btn-primary flex-1"
                                >
                                    ✓ Mark as Found
                                </button>
                            )}

                            {!canMarkFound && person.status !== 'Resolved' && (
                                <p className="text-gray-600 text-center py-4">
                                    {role === 'responder'
                                        ? 'Person already marked as found'
                                        : 'View only - Contact responders to update status'}
                                </p>
                            )}

                            {person.status === 'Resolved' && (
                                <div className="text-center py-4 text-success-600 font-medium">
                                    ✅ This person has been found and the case is resolved
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">
                            Mark as Found?
                        </h3>
                        <p className="text-gray-600 mb-4">
                            This will mark {person.name} as found and change the status to "Resolved". Other responders can filter to view only active cases.
                        </p>

                        <div className="mb-6">
                            <label className="block text-gray-700 font-medium mb-2">
                                Contact Number (Optional)
                            </label>
                            <input
                                type="tel"
                                value={foundContact}
                                onChange={(e) => setFoundContact(e.target.value)}
                                placeholder="07XXXXXXXX"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Provide your contact in case the reporter needs to reach you
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmMarkFound}
                                className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => {
                                    setShowConfirmDialog(false);
                                    setFoundContact('');
                                }}
                                className="flex-1 border border-gray-300 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
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

export default MissingPersonDetail;

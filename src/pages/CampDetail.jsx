import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampStore } from '../store';
import { checkIsAdmin } from '../services/adminService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletIconFix';

function CampDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { camps, updateOccupancy, closeCamp, subscribeToCamps, isInitialized } = useCampStore();

    // Ensure data is loaded
    useEffect(() => {
        if (!isInitialized) {
            subscribeToCamps();
        }
    }, [isInitialized, subscribeToCamps]);

    const [showOccupancyDialog, setShowOccupancyDialog] = useState(false);
    const [newOccupancy, setNewOccupancy] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [adminStatus, setAdminStatus] = useState({ isAdmin: false, role: null });

    const camp = camps.find(c => c.id === id || c.id === parseInt(id));

    useEffect(() => {
        let mounted = true;
        checkIsAdmin().then((res) => {
            if (mounted) setAdminStatus(res);
        }).catch(() => { });
        return () => { mounted = false; };
    }, []);

    // Show loading while data is being fetched
    if (!isInitialized) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                <p className="text-gray-600">Loading...</p>
            </div>
        );
    }

    if (!camp) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Camp Not Found</h1>
                <button onClick={() => navigate(-1)} className="btn-primary">← Go Back</button>
            </div>
        );
    }

    const occupancyPercent = Math.round(((camp.current_occupancy || 0) / (camp.capacity || camp.total_capacity || 1)) * 100);

    const getCampTypeIcon = (type) => {
        const icons = {
            'temporary-shelter': '🏕️',
            'emergency-evacuation': '🚨',
            'long-term-relief': '🏠',
            'medical-facility': '🏥'
        };
        return icons[type] || '⛺';
    };

    const getStockBadge = (stock) => {
        const badges = {
            'adequate': { className: 'bg-success-100 text-success-700 border-success-300', text: '✓ Adequate' },
            'low': { className: 'bg-warning-100 text-warning-700 border-warning-300', text: '⚠️ Low' },
            'critical': { className: 'bg-danger-100 text-danger-700 border-danger-300', text: '🚨 Critical' },
            'none': { className: 'bg-gray-100 text-gray-700 border-gray-300', text: '✗ None' }
        };
        return badges[stock] || badges.none;
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' +
            date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleUpdateOccupancy = () => {
        if (newOccupancy && !isNaN(newOccupancy)) {
            updateOccupancy(camp.id, parseInt(newOccupancy));
            setShowOccupancyDialog(false);
            setNewOccupancy('');
        }
    };

    // Get coordinates
    const lat = camp.latitude || camp.location?.lat;
    const lng = camp.longitude || camp.location?.lng;
    const hasLocation = lat && lng;

    // Facility icons mapping
    const facilityIcons = {
        shelter: '🏠', food: '🍚', water: '💧', medical: '🏥',
        sanitation: '🚿', electricity: '⚡', bedding: '🛏️',
        communication: '📞', security: '🔒', transport: '🚗'
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">


            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                            {getCampTypeIcon(camp.type)} {camp.name || camp.camp_name || 'Unnamed Camp'}
                        </h1>
                        <div className="flex flex-wrap gap-2 mt-2 text-sm text-gray-600">
                            <span className="capitalize">{camp.type?.replace('-', ' ') || 'Unknown Type'}</span>
                            <span>•</span>
                            <span>{camp.district || 'Unknown'} District</span>
                            {camp.ds_division && (
                                <>
                                    <span>•</span>
                                    <span>{camp.ds_division} DS Division</span>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold ${camp.status === 'Active' ? 'bg-success-100 text-success-700' :
                            camp.status === 'Closed' ? 'bg-danger-100 text-danger-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {camp.status || 'Unknown'}
                        </span>
                        {camp.source && (
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${camp.source === 'public_request' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                                }`}>
                                {camp.source === 'public_request' ? '📋 From Request' : '👤 Admin Registered'}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm mb-6 overflow-hidden">
                <div className="flex border-b">
                    {[
                        { id: 'overview', label: '📊 Overview' },
                        { id: 'location', label: '📍 Location' },
                        { id: 'supplies', label: '📦 Supplies' },
                        { id: 'details', label: '📋 Full Details' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === tab.id
                                ? 'bg-primary-50 text-primary-700 border-b-2 border-primary-600'
                                : 'text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Tab Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <>
                        <div className="lg:col-span-1 space-y-6">
                            {/* Capacity Card */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">👥 Capacity Overview</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm text-gray-600">Current Occupancy</span>
                                            <span className="text-lg font-bold text-gray-800">
                                                {camp.current_occupancy || 0}/{camp.capacity || camp.total_capacity || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                            <div
                                                className={`h-3 rounded-full ${occupancyPercent >= 90 ? 'bg-danger-500' :
                                                    occupancyPercent >= 70 ? 'bg-warning-500' :
                                                        'bg-success-500'
                                                    }`}
                                                style={{ width: `${Math.min(occupancyPercent, 100)}%` }}
                                            />
                                        </div>
                                        <p className="text-sm text-gray-500">{occupancyPercent}% capacity used</p>
                                    </div>
                                    {camp.status === 'Active' && (
                                        <button
                                            onClick={() => setShowOccupancyDialog(true)}
                                            className="btn-secondary w-full"
                                        >
                                            Update Occupancy
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Contact Card */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📞 Contact Information</h3>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Contact Person</p>
                                        <p className="font-medium text-gray-800">{camp.contact_person || camp.managed_by || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Phone Number</p>
                                        <p className="font-medium text-gray-800">
                                            {camp.contact_number ? (
                                                <a href={`tel:${camp.contact_number}`} className="text-primary-600 hover:underline">
                                                    {camp.contact_number}
                                                </a>
                                            ) : 'N/A'}
                                        </p>
                                    </div>
                                    {camp.contact_email && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Email</p>
                                            <p className="font-medium text-gray-800">
                                                <a href={`mailto:${camp.contact_email}`} className="text-primary-600 hover:underline">
                                                    {camp.contact_email}
                                                </a>
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="lg:col-span-2 space-y-6">
                            {/* Urgent Needs */}
                            {Array.isArray(camp.needs) && camp.needs.length > 0 && (
                                <div className="card bg-warning-50 border-warning-300">
                                    <h3 className="text-lg font-semibold text-warning-800 mb-4">⚠️ Urgent Needs</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {camp.needs.map((need, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium"
                                            >
                                                {need}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Quick Supply Status */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📦 Supply Status</h3>
                                {camp.supplies && Object.keys(camp.supplies).length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {Object.entries(camp.supplies).map(([key, supply]) => {
                                            const badge = getStockBadge(supply?.stock);
                                            return (
                                                <div key={key} className={`p-3 border-2 rounded-lg ${badge.className}`}>
                                                    <p className="font-semibold capitalize">{key}</p>
                                                    <span className="text-xs">{badge.text}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No supply information available</p>
                                )}
                            </div>

                            {/* Facilities Card - Moved to right column */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">🏗️ Facilities</h3>
                                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                                    {Object.entries(facilityIcons).slice(0, 6).map(([key, icon]) => (
                                        <div
                                            key={key}
                                            className={`p-2 rounded text-center ${camp.facilities?.[key] ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-400'}`}
                                        >
                                            <div className="text-2xl mb-1">{icon}</div>
                                            <div className="text-xs font-medium capitalize">{key}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Special Needs */}
                            {camp.special_needs && (
                                <div className="card bg-blue-50 border-blue-200">
                                    <h3 className="text-lg font-semibold text-blue-800 mb-3">♿ Special Accommodations</h3>
                                    <p className="text-blue-700">{camp.special_needs}</p>
                                </div>
                            )}

                            {/* Timeline */}
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Timeline</h3>
                                <div className="space-y-4">
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold text-sm">1</div>
                                        <div>
                                            <p className="font-semibold text-gray-800">Camp Created</p>
                                            <p className="text-sm text-gray-600">{formatDate(camp.created_at || camp.openedDate)}</p>
                                            {camp.disasterType && <p className="text-sm text-gray-500">Disaster: {camp.disasterType}</p>}
                                        </div>
                                    </div>
                                    {camp.updated_at && camp.updated_at !== camp.created_at && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm">📝</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Last Updated</p>
                                                <p className="text-sm text-gray-600">{formatDate(camp.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                    {(camp.closedDate || camp.status === 'Closed') && (
                                        <div className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold">✓</div>
                                            <div>
                                                <p className="font-semibold text-gray-800">Camp Closed</p>
                                                <p className="text-sm text-gray-600">{formatDate(camp.closedDate || camp.updated_at)}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Location Tab */}
                {activeTab === 'location' && (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Location Details</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-xs text-gray-500 uppercase tracking-wide">Full Address</p>
                                        <p className="font-medium text-gray-800">{camp.address || camp.location?.address || 'N/A'}</p>
                                    </div>
                                    {camp.village_area && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Village/Area</p>
                                            <p className="font-medium text-gray-800">{camp.village_area}</p>
                                        </div>
                                    )}
                                    {camp.nearby_landmark && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Nearby Landmark</p>
                                            <p className="font-medium text-gray-800">{camp.nearby_landmark}</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">District</p>
                                            <p className="font-medium text-gray-800">{camp.district || 'N/A'}</p>
                                        </div>
                                        {camp.ds_division && (
                                            <div>
                                                <p className="text-xs text-gray-500 uppercase tracking-wide">DS Division</p>
                                                <p className="font-medium text-gray-800">{camp.ds_division}</p>
                                            </div>
                                        )}
                                    </div>
                                    {hasLocation && (
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">GPS Coordinates</p>
                                            <p className="font-mono text-sm text-gray-700">{lat.toFixed(6)}, {lng.toFixed(6)}</p>
                                        </div>
                                    )}
                                </div>
                                {hasLocation && (
                                    <div style={{ height: '300px' }} className="rounded-lg overflow-hidden border-2 border-gray-200">
                                        <MapContainer center={[lat, lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                            <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                            <Marker position={[lat, lng]}>
                                                <Popup>
                                                    <div className="p-2">
                                                        <p className="font-bold">{camp.name || camp.camp_name}</p>
                                                        <p className="text-sm text-gray-600">{camp.address || camp.location?.address}</p>
                                                    </div>
                                                </Popup>
                                            </Marker>
                                        </MapContainer>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Supplies Tab */}
                {activeTab === 'supplies' && (
                    <div className="lg:col-span-3 space-y-6">
                        {camp.supplies && Object.keys(camp.supplies).length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Object.entries(camp.supplies).map(([key, supply]) => {
                                    const badge = getStockBadge(supply?.stock);
                                    return (
                                        <div key={key} className={`card border-2 ${badge.className}`}>
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="font-semibold text-lg capitalize">{key}</h4>
                                                <span className="px-2 py-1 rounded text-xs font-semibold">{badge.text}</span>
                                            </div>
                                            {supply?.quantity !== undefined && (
                                                <p className="text-sm mb-2">Quantity: {supply.quantity}</p>
                                            )}
                                            {supply?.lastUpdated && (
                                                <p className="text-xs text-gray-500">Last updated: {formatDate(supply.lastUpdated)}</p>
                                            )}
                                            {supply?.notes && (
                                                <p className="text-sm mt-2 text-gray-600">{supply.notes}</p>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="card text-center py-12">
                                <div className="text-6xl mb-4">📦</div>
                                <p className="text-gray-500">No supply information recorded for this camp</p>
                            </div>
                        )}

                        {/* Urgent Needs */}
                        {Array.isArray(camp.needs) && camp.needs.length > 0 && (
                            <div className="card bg-warning-50 border-warning-300">
                                <h3 className="text-lg font-semibold text-warning-800 mb-4">⚠️ Current Urgent Needs</h3>
                                <div className="flex flex-wrap gap-2">
                                    {camp.needs.map((need, index) => (
                                        <span key={index} className="px-4 py-2 bg-warning-100 text-warning-700 rounded-full font-medium">
                                            {need}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Full Details Tab */}
                {activeTab === 'details' && (
                    <div className="lg:col-span-3 space-y-6">
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Complete Camp Information</h3>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {/* Basic Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Basic Information</h4>
                                    <DataRow label="Camp Name" value={camp.name || camp.camp_name} />
                                    <DataRow label="Type" value={camp.type?.replace('-', ' ')} capitalize />
                                    <DataRow label="Status" value={camp.status} />
                                    <DataRow label="District" value={camp.district} />
                                    <DataRow label="DS Division" value={camp.ds_division} />
                                    <DataRow label="Source" value={camp.source?.replace('_', ' ')} capitalize />
                                </div>

                                {/* Capacity Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Capacity & Occupancy</h4>
                                    <DataRow label="Total Capacity" value={camp.capacity || camp.total_capacity} />
                                    <DataRow label="Current Occupancy" value={camp.current_occupancy} />
                                    <DataRow label="Occupancy %" value={`${occupancyPercent}%`} />
                                    <DataRow label="Available Space" value={(camp.capacity || camp.total_capacity || 0) - (camp.current_occupancy || 0)} />
                                </div>

                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Contact Details</h4>
                                    <DataRow label="Contact Person" value={camp.contact_person || camp.managed_by} />
                                    <DataRow label="Phone" value={camp.contact_number} />
                                    <DataRow label="Email" value={camp.contact_email} />
                                </div>

                                {/* Location Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Location</h4>
                                    <DataRow label="Address" value={camp.address || camp.location?.address} />
                                    <DataRow label="Village/Area" value={camp.village_area} />
                                    <DataRow label="Landmark" value={camp.nearby_landmark} />
                                    <DataRow label="Latitude" value={lat?.toFixed(6)} />
                                    <DataRow label="Longitude" value={lng?.toFixed(6)} />
                                </div>

                                {/* Timestamps */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Dates</h4>
                                    <DataRow label="Created" value={formatDate(camp.created_at || camp.openedDate)} />
                                    <DataRow label="Last Updated" value={formatDate(camp.updated_at)} />
                                    <DataRow label="Disaster Type" value={camp.disasterType} />
                                    {camp.closedDate && <DataRow label="Closed Date" value={formatDate(camp.closedDate)} />}
                                </div>

                                {/* Additional Info */}
                                <div className="space-y-4">
                                    <h4 className="font-semibold text-gray-700 border-b pb-2">Additional</h4>
                                    <DataRow label="Camp ID" value={camp.id} mono />
                                    {camp.source_request_id && (
                                        <DataRow label="Request ID" value={camp.source_request_id} mono />
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Facilities Full List */}
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">🏗️ All Facilities</h3>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                                {Object.entries(facilityIcons).map(([key, icon]) => (
                                    <div
                                        key={key}
                                        className={`p-3 rounded-lg text-center ${camp.facilities?.[key] ? 'bg-success-50 text-success-700 border border-success-200' : 'bg-gray-50 text-gray-400 border border-gray-200'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">{icon}</div>
                                        <div className="text-xs font-medium capitalize">{key}</div>
                                        <div className="text-xs mt-1">{camp.facilities?.[key] ? '✓ Available' : '✗ N/A'}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Special Needs */}
                        {camp.special_needs && (
                            <div className="card bg-blue-50 border-blue-200">
                                <h3 className="text-lg font-semibold text-blue-800 mb-3">♿ Special Accommodations</h3>
                                <p className="text-blue-700">{camp.special_needs}</p>
                            </div>
                        )}

                        {/* Notes */}
                        {(camp.notes || camp.additional_notes) && (
                            <div className="card">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Notes</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{camp.notes || camp.additional_notes}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>



            {/* Occupancy Update Modal */}
            {showOccupancyDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Update Occupancy</h3>
                        <p className="text-gray-600 mb-4">
                            Current: {camp.current_occupancy || 0} / {camp.capacity || camp.total_capacity || 'N/A'} people
                        </p>
                        <input
                            type="number"
                            value={newOccupancy}
                            onChange={(e) => setNewOccupancy(e.target.value)}
                            placeholder="Enter new occupancy"
                            max={camp.capacity || camp.total_capacity}
                            min={0}
                            className="input-field mb-4"
                        />
                        <div className="flex gap-3">
                            <button onClick={handleUpdateOccupancy} className="btn-primary flex-1">Update</button>
                            <button
                                onClick={() => setShowOccupancyDialog(false)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
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

// Helper component for data rows
function DataRow({ label, value, capitalize = false, mono = false }) {
    return (
        <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
            <p className={`font-medium text-gray-800 ${capitalize ? 'capitalize' : ''} ${mono ? 'font-mono text-sm' : ''}`}>
                {value || 'N/A'}
            </p>
        </div>
    );
}

export default CampDetail;

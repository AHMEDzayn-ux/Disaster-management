import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix leaflet default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons for different statuses
const activeIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const resolvedIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// District boundaries
const districtBounds = {
    'Colombo': [[6.80, 79.80], [7.15, 80.00]],
    'Gampaha': [[6.95, 79.85], [7.35, 80.10]],
    'Kalutara': [[6.45, 79.90], [6.80, 80.30]],
    'Kandy': [[7.05, 80.45], [7.55, 80.85]],
    'Matale': [[7.35, 80.45], [7.85, 80.85]],
    'Nuwara Eliya': [[6.80, 80.60], [7.15, 81.00]],
    'Galle': [[5.90, 80.05], [6.25, 80.35]],
    'Matara': [[5.80, 80.40], [6.15, 80.70]],
    'Hambantota': [[5.95, 80.85], [6.40, 81.40]],
    'Jaffna': [[9.45, 79.90], [10.00, 80.20]],
    'Kilinochchi': [[9.20, 80.20], [9.65, 80.55]],
    'Mannar': [[8.70, 79.75], [9.20, 80.15]],
    'Vavuniya': [[8.55, 80.25], [9.05, 80.70]],
    'Mullaitivu': [[9.05, 80.65], [9.55, 81.05]],
    'Batticaloa': [[7.40, 81.40], [8.00, 81.90]],
    'Ampara': [[6.95, 81.40], [7.60, 81.90]],
    'Trincomalee': [[8.30, 80.90], [8.90, 81.45]],
    'Kurunegala': [[7.25, 80.15], [7.85, 80.65]],
    'Puttalam': [[7.85, 79.70], [8.50, 80.20]],
    'Anuradhapura': [[7.95, 80.15], [8.65, 80.65]],
    'Polonnaruwa': [[7.70, 80.85], [8.30, 81.35]],
    'Badulla': [[6.70, 80.90], [7.30, 81.40]],
    'Monaragala': [[6.50, 81.10], [7.10, 81.60]],
    'Ratnapura': [[6.45, 80.15], [7.00, 80.65]],
    'Kegalle': [[6.95, 80.10], [7.50, 80.55]]
};

function MapController({ districtFilter }) {
    const map = useMap();

    useEffect(() => {
        if (districtFilter !== 'all' && districtBounds[districtFilter]) {
            const bounds = districtBounds[districtFilter];
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            map.setView([7.8731, 80.7718], 7);
        }
    }, [districtFilter, map]);

    return null;
}

function DisasterReportsList({ role = 'responder' }) {
    const navigate = useNavigate();
    const { disasters, subscribeToDisasters, unsubscribeFromDisasters } = useDisasterStore();
    const [statusFilter, setStatusFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [severityFilter, setSeverityFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('cards');

    // Subscribe to real-time updates on mount
    useEffect(() => {
        subscribeToDisasters();
        return () => unsubscribeFromDisasters();
    }, []);

    const allDistricts = [
        'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
        'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi',
        'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu',
        'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    const getDistrictFromAddress = (address) => {
        const addressLower = address.toLowerCase();
        for (const district of allDistricts) {
            if (addressLower.includes(district.toLowerCase())) {
                return district;
            }
        }
        return null;
    };

    const filteredDisasters = disasters.filter(disaster => {
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && disaster.status === 'Active') ||
            (statusFilter === 'resolved' && disaster.status === 'Resolved');
        const disasterDistrict = getDistrictFromAddress(disaster.location?.address || '');
        const matchesDistrict = districtFilter === 'all' || disasterDistrict === districtFilter;
        const disasterType = disaster.disaster_type || disaster.disasterType;
        const matchesType = typeFilter === 'all' || disasterType === typeFilter;
        const matchesSeverity = severityFilter === 'all' || disaster.severity === severityFilter;
        const matchesSearch = (disaster.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (disaster.location?.address || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesDistrict && matchesType && matchesSeverity && matchesSearch;
    });

    const activeCount = disasters.filter(d => d.status === 'Active').length;
    const resolvedCount = disasters.filter(d => d.status === 'Resolved').length;
    const criticalCount = disasters.filter(d => d.status === 'Active' && d.severity === 'critical').length;

    const getDisasterIcon = (type) => {
        const icons = {
            'flood': '🌊',
            'landslide': '⛰️',
            'fire': '🔥',
            'earthquake': '🌍',
            'cyclone': '🌀',
            'drought': '🌵',
            'tsunami': '🌊',
            'building-collapse': '🏚️',
            'other': '⚠️'
        };
        return icons[type] || '⚠️';
    };

    const getSeverityBadge = (severity) => {
        const badges = {
            'critical': { className: 'bg-danger-600 text-white', text: '🚨 Critical' },
            'high': { className: 'bg-danger-500 text-white', text: '⚠️ High' },
            'moderate': { className: 'bg-warning-500 text-white', text: '⚡ Moderate' },
            'low': { className: 'bg-info-500 text-white', text: 'ℹ️ Low' }
        };
        return badges[severity] || badges.low;
    };

    const getStatusBadge = (status) => {
        return status === 'Active'
            ? { className: 'bg-danger-100 text-danger-700', text: 'Active' }
            : { className: 'bg-success-100 text-success-700', text: 'Resolved' };
    };

    const getTimeSince = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);

        if (diffDays > 0) return `${diffDays}d ago`;
        if (diffHours > 0) return `${diffHours}h ago`;
        return 'Just now';
    };

    const handleDisasterClick = (disaster) => {
        const route = role === 'responder' ? `/disasters-list/${disaster.id}` : `/disasters/${disaster.id}`;
        navigate(route);
    };

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {role === 'responder' ? '🚨 Disaster Response Operations' : '🚨 Disaster Reports'}
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {activeCount} active • {criticalCount} critical • {resolvedCount} resolved
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setViewMode('cards')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'cards'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            📋 Card View
                        </button>
                        <button
                            onClick={() => setViewMode('map')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'map'
                                ? 'bg-primary-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            🗺️ Map View
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input
                            type="text"
                            placeholder="Location, description..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
                            <option value="all">All Types</option>
                            <option value="flood">Flood</option>
                            <option value="landslide">Landslide</option>
                            <option value="fire">Fire</option>
                            <option value="cyclone">Cyclone</option>
                            <option value="earthquake">Earthquake</option>
                            <option value="drought">Drought</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Severity</label>
                        <select value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)} className="input-field">
                            <option value="all">All Severities</option>
                            <option value="critical">Critical</option>
                            <option value="high">High</option>
                            <option value="moderate">Moderate</option>
                            <option value="low">Low</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setStatusFilter('all');
                                setTypeFilter('all');
                                setSeverityFilter('all');
                                setDistrictFilter('all');
                            }}
                            className="btn-secondary w-full"
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            {viewMode === 'cards' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredDisasters.map((disaster) => {
                        const severityBadge = getSeverityBadge(disaster.severity);
                        const statusBadge = getStatusBadge(disaster.status);
                        const disasterType = disaster.disaster_type || disaster.disasterType || 'unknown';
                        const peopleAffected = disaster.people_affected || disaster.peopleAffected;
                        const reportedAt = disaster.reported_at || disaster.reportedAt || disaster.created_at;
                        const reporterName = disaster.reporter_name || disaster.reporterName;
                        const contactNumber = disaster.contact_number || disaster.contactNumber;

                        return (
                            <div
                                key={disaster.id}
                                onClick={() => handleDisasterClick(disaster)}
                                className="card hover:shadow-lg transition-shadow cursor-pointer"
                            >
                                {disaster.photo && (
                                    <div className="relative mb-4">
                                        <img src={disaster.photo} alt={disasterType} className="w-full h-48 object-cover rounded-lg" />
                                        <div className="absolute top-2 right-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBadge.className}`}>
                                                {statusBadge.text}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                                            <span>{getDisasterIcon(disasterType)}</span>
                                            {disasterType.replace('-', ' ')}
                                        </h3>
                                    </div>

                                    <div className="flex gap-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${severityBadge.className}`}>
                                            {severityBadge.text}
                                        </span>
                                    </div>

                                    <p className="text-sm text-gray-700 line-clamp-2">{disaster.description}</p>

                                    <div className="pt-2 border-t border-gray-200 space-y-2">
                                        <div className="flex items-start gap-2">
                                            <span className="text-gray-500 text-sm">📍</span>
                                            <span className="text-sm text-gray-700 line-clamp-2">{disaster.location?.address || 'Unknown'}</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 text-sm">👥</span>
                                                <span className="text-sm text-gray-600">{peopleAffected || 'Unknown'} affected</span>
                                            </div>
                                            <span className="text-sm text-gray-500">{getTimeSince(reportedAt)}</span>
                                        </div>
                                    </div>

                                    <button className="btn-primary w-full mt-4">
                                        View Details
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="card p-0 overflow-hidden">
                    <div style={{ height: '600px' }}>
                        <MapContainer
                            center={[7.8731, 80.7718]}
                            zoom={7}
                            style={{ height: '100%', width: '100%' }}
                            minZoom={6}
                            maxZoom={18}
                            maxBounds={[[5.5, 79.3], [10.2, 82.2]]}
                            maxBoundsViscosity={1.0}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            <MapController districtFilter={districtFilter} />

                            {districtFilter !== 'all' && districtBounds[districtFilter] && (
                                <Rectangle
                                    bounds={districtBounds[districtFilter]}
                                    pathOptions={{
                                        color: '#3B82F6',
                                        weight: 3,
                                        fillOpacity: 0.1,
                                        dashArray: '10, 10'
                                    }}
                                />
                            )}

                            <MarkerClusterGroup chunkedLoading maxClusterRadius={30} disableClusteringAtZoom={9} removeOutsideVisibleBounds={false}>
                                {filteredDisasters.map((disaster) => {
                                    const disasterType = disaster.disaster_type || disaster.disasterType || 'unknown';
                                    const reporterName = disaster.reporter_name || disaster.reporterName;
                                    const contactNumber = disaster.contact_number || disaster.contactNumber;

                                    return (
                                        <Marker
                                            key={disaster.id}
                                            position={[disaster.location.lat, disaster.location.lng]}
                                            icon={disaster.status === 'Active' ? activeIcon : resolvedIcon}
                                        >
                                            <Popup maxWidth={220} offset={[0, -10]}>
                                                <div className="p-1">
                                                    {disaster.photo && <img src={disaster.photo} alt={disasterType} className="w-full h-24 object-cover rounded mb-2" />}
                                                    <h3 className="font-bold text-sm capitalize mb-1">
                                                        {getDisasterIcon(disasterType)} {disasterType.replace('-', ' ')}
                                                    </h3>
                                                    <div className="mb-2">
                                                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getSeverityBadge(disaster.severity).className}`}>
                                                            {getSeverityBadge(disaster.severity).text}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-600 mb-1">📍 {disaster.location?.address || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-600 mb-1">👤 {reporterName || 'Unknown'}</p>
                                                    <p className="text-xs text-gray-600 mb-2">☎️ {contactNumber || 'Unknown'}</p>
                                                    <button onClick={() => handleDisasterClick(disaster)} className="btn-primary w-full text-xs py-1">
                                                        View Details
                                                    </button>
                                                </div>
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                            </MarkerClusterGroup>
                        </MapContainer>
                    </div>

                    <div className="p-4 bg-gray-50 border-t border-gray-200">
                        <div className="flex flex-wrap gap-4 items-center justify-center">
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-danger-500 rounded-full"></div>
                                <span className="text-sm font-medium">Active ({activeCount})</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-success-500 rounded-full"></div>
                                <span className="text-sm font-medium">Resolved ({resolvedCount})</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default DisasterReportsList;

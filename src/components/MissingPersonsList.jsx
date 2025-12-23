import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMissingPersonStore } from '../store';
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

// Approximate district boundaries for Sri Lanka (expanded to cover full districts)
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

// Component to handle map centering when district is selected
function MapController({ districtFilter, allDistricts }) {
    const map = useMap();

    useEffect(() => {
        if (districtFilter !== 'all' && districtBounds[districtFilter]) {
            const bounds = districtBounds[districtFilter];
            map.fitBounds(bounds, { padding: [50, 50] });
        } else {
            // Reset to Sri Lanka view
            map.setView([7.8731, 80.7718], 7);
        }
    }, [districtFilter, map]);

    return null;
}

function MissingPersonsList({ role = 'responder' }) {
    const navigate = useNavigate();
    const { missingPersons } = useMissingPersonStore();
    const [statusFilter, setStatusFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'map'

    // All 25 districts in Sri Lanka (matching EmergencyContacts)
    const allDistricts = [
        'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
        'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi',
        'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu',
        'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    // Helper function to extract district from address
    const getDistrictFromAddress = (address) => {
        const addressLower = address.toLowerCase();
        for (const district of allDistricts) {
            if (addressLower.includes(district.toLowerCase())) {
                return district;
            }
        }
        return null;
    };

    const filteredPersons = missingPersons.filter(person => {
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && person.status === 'Active') ||
            (statusFilter === 'found' && person.status === 'Resolved');
        const personDistrict = getDistrictFromAddress(person.lastSeenLocation.address);
        const matchesDistrict = districtFilter === 'all' || personDistrict === districtFilter;
        const matchesSearch = person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            person.lastSeenLocation.address.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesDistrict && matchesSearch;
    });

    const activeCount = missingPersons.filter(p => p.status === 'Active').length;
    const foundCount = missingPersons.filter(p => p.status === 'Resolved').length;

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Active':
                return { className: 'bg-danger-100 text-danger-700', text: 'Active' };
            case 'Resolved':
                return { className: 'bg-success-100 text-success-700', text: 'Found' };
            default:
                return { className: 'bg-gray-100 text-gray-700', text: status };
        }
    };

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

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Missing Persons</h1>
                <p className="text-gray-600">Reported missing persons in Sri Lanka</p>
            </div>

            {/* View Mode Toggle */}
            <div className="mb-6 flex justify-center">
                <div className="inline-flex rounded-lg border border-gray-300 bg-white">
                    <button
                        onClick={() => setViewMode('cards')}
                        className={`px-6 py-2 text-sm font-medium transition-colors rounded-l-lg ${viewMode === 'cards'
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        📋 Card View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-6 py-2 text-sm font-medium transition-colors rounded-r-lg border-l ${viewMode === 'map'
                                ? 'bg-primary-500 text-white'
                                : 'bg-white text-gray-700 hover:bg-gray-50'
                            }`}
                    >
                        🗺️ Map View
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            placeholder="🔍 Search by name or location..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-field"
                        />
                    </div>
                    <div className="md:w-48">
                        <select
                            value={districtFilter}
                            onChange={(e) => setDistrictFilter(e.target.value)}
                            className="input-field"
                        >
                            <option value="all">All Districts</option>
                            {allDistricts.map(district => (
                                <option key={district} value={district}>
                                    {district}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setStatusFilter('all')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'all'
                                ? 'bg-primary-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            All ({missingPersons.length})
                        </button>
                        <button
                            onClick={() => setStatusFilter('active')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'active'
                                ? 'bg-danger-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Active ({activeCount})
                        </button>
                        <button
                            onClick={() => setStatusFilter('found')}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${statusFilter === 'found'
                                ? 'bg-success-500 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            Found ({foundCount})
                        </button>
                    </div>
                </div>
            </div>

            {/* Card View */}
            {viewMode === 'cards' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPersons.map((person) => (
                        <div key={person.id} className="card hover:shadow-lg transition-shadow">
                            <div className="flex gap-4">
                                {/* Photo */}
                                <div className="flex-shrink-0">
                                    <img
                                        src={person.photo}
                                        alt={person.name}
                                        className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-2">
                                        <h3 className="text-lg font-bold text-gray-800 truncate">{person.name}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusBadge(person.status).className}`}>
                                            {getStatusBadge(person.status).text}
                                        </span>
                                    </div>

                                    <div className="space-y-1 text-sm text-gray-600">
                                        <p><span className="font-medium">Age:</span> {person.age} | <span className="font-medium">Gender:</span> {person.gender}</p>
                                        <p className="text-xs text-gray-500 truncate" title={person.lastSeenLocation.address}>
                                            📍 {person.lastSeenLocation.address}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            🕒 Last seen {getTimeSince(person.lastSeenDate)}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-sm text-gray-700 line-clamp-2">{person.description}</p>
                                {person.additionalInfo && (
                                    <p className="text-xs text-gray-600 mt-1 italic">ℹ️ {person.additionalInfo}</p>
                                )}
                                {person.foundByContact && (
                                    <div className="mt-2 p-2 bg-success-50 rounded">
                                        <p className="text-xs text-success-700 font-medium">✓ Contact: {person.foundByContact}</p>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="mt-3 flex gap-2">
                                <button
                                    onClick={() => {
                                        const detailPath = role === 'responder'
                                            ? `/missing-persons-list/${person.id}`
                                            : `/missing-persons/${person.id}`;
                                        navigate(detailPath);
                                    }}
                                    className="flex-1 bg-primary-500 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                                >
                                    View Details
                                </button>
                                <button className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors">
                                    <a href={`tel:${person.contactNumber}`}>📞 Call</a>
                                </button>
                            </div>

                            {/* Reporter Info */}
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <p className="text-xs text-gray-500">
                                    Reported by <span className="font-medium">{person.reporterName}</span> • {formatDate(person.reportedAt)}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Map View */}
            {viewMode === 'map' && (
                <div className="h-[600px] rounded-lg overflow-hidden border-2 border-gray-200">
                    <MapContainer
                        center={[7.8731, 80.7718]} // Center of Sri Lanka
                        zoom={7}
                        minZoom={6}
                        maxZoom={18}
                        maxBounds={[
                            [5.5, 79.3],  // Southwest corner (expanded)
                            [10.2, 82.2]   // Northeast corner (expanded)
                        ]}
                        maxBoundsViscosity={1.0}
                        style={{ height: '100%', width: '100%' }}
                        scrollWheelZoom={true}
                    >
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                        />

                        <MapController districtFilter={districtFilter} allDistricts={allDistricts} />

                        {/* Show district boundary when filtered */}
                        {districtFilter !== 'all' && districtBounds[districtFilter] && (
                            <Rectangle
                                bounds={districtBounds[districtFilter]}
                                pathOptions={{
                                    color: '#3B82F6',
                                    weight: 3,
                                    opacity: 0.8,
                                    dashArray: '10, 10',
                                    fillColor: '#3B82F6',
                                    fillOpacity: 0.1
                                }}
                            />
                        )}

                        <MarkerClusterGroup
                            chunkedLoading
                            maxClusterRadius={30}
                            disableClusteringAtZoom={9}
                            spiderfyOnMaxZoom={true}
                            showCoverageOnHover={false}
                            zoomToBoundsOnClick={true}
                            removeOutsideVisibleBounds={false}
                        >
                            {filteredPersons.map((person) => (
                                <Marker
                                    key={person.id}
                                    position={[person.lastSeenLocation.lat, person.lastSeenLocation.lng]}
                                    icon={person.status === 'Active' ? activeIcon : resolvedIcon}
                                >
                                    <Popup maxWidth={300}>
                                        <div className="p-2">
                                            <div className="flex gap-3 mb-3">
                                                <img
                                                    src={person.photo}
                                                    alt={person.name}
                                                    className="w-16 h-16 rounded object-cover"
                                                />
                                                <div className="flex-1">
                                                    <h3 className="font-bold text-gray-800">{person.name}</h3>
                                                    <p className="text-sm text-gray-600">Age: {person.age} | {person.gender}</p>
                                                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold mt-1 ${getStatusBadge(person.status).className}`}>
                                                        {getStatusBadge(person.status).text}
                                                    </span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-700 mb-2">{person.description}</p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                📍 {person.lastSeenLocation.address}<br />
                                                🕒 Last seen {getTimeSince(person.lastSeenDate)}
                                            </p>
                                            {person.foundByContact && (
                                                <p className="text-xs text-success-600 font-medium mb-2">
                                                    ✓ Contact: {person.foundByContact}
                                                </p>
                                            )}
                                            <button
                                                onClick={() => {
                                                    const detailPath = role === 'responder'
                                                        ? `/missing-persons-list/${person.id}`
                                                        : `/missing-persons/${person.id}`;
                                                    navigate(detailPath);
                                                }}
                                                className="w-full bg-primary-500 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-primary-600 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MarkerClusterGroup>
                    </MapContainer>

                    {/* Map Legend */}
                    <div className="mt-2 flex justify-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-danger-600">🔴</span>
                            <span>Active ({filteredPersons.filter(p => p.status === 'Active').length})</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-success-600">🟢</span>
                            <span>Resolved ({filteredPersons.filter(p => p.status === 'Resolved').length})</span>
                        </div>
                        <div className="text-gray-600">
                            Total: {filteredPersons.length} on map
                        </div>
                    </div>
                </div>
            )}

            {filteredPersons.length === 0 && (
                <div className="card text-center py-12">
                    <p className="text-gray-500 text-lg">No missing persons found matching your criteria</p>
                </div>
            )}
        </div>
    );
}

export default MissingPersonsList;

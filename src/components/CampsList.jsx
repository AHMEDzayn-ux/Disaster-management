import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCampStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup, Rectangle, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';
import '../utils/leafletIconFix';
import { greenIcon, greyIcon } from '../utils/leafletIconFix';
import ScrollToTop from './shared/ScrollToTop';

// Custom marker icons for different statuses
const activeIcon = greenIcon;
const closedIcon = greyIcon;

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

function CampsList({ role = 'responder' }) {
    const navigate = useNavigate();
    const { camps, loading, isInitialized, subscribeToCamps, unsubscribeFromCamps } = useCampStore();
    const [statusFilter, setStatusFilter] = useState('all');
    const [typeFilter, setTypeFilter] = useState('all');
    const [districtFilter, setDistrictFilter] = useState('all');
    const [needsFilter, setNeedsFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('map'); // Default to map view as it's most important
    const [isInitializing, setIsInitializing] = useState(!isInitialized);

    // Subscribe to real-time updates on mount
    useEffect(() => {
        if (!isInitialized) {
            const initialize = async () => {
                await subscribeToCamps();
                setIsInitializing(false);
            };
            initialize();
        } else {
            setIsInitializing(false);
        }
        // Don't unsubscribe on unmount to maintain cache
    }, []);

    const allDistricts = [
        'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha',
        'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalle', 'Kilinochchi',
        'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Monaragala', 'Mullaitivu',
        'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
    ];

    // Extract unique needs from all active camps
    const allNeeds = [...new Set(camps.filter(c => c.status === 'Active').flatMap(c => c.needs))].sort();

    const filteredCamps = camps.filter(camp => {
        const matchesStatus = statusFilter === 'all' ||
            (statusFilter === 'active' && camp.status === 'Active') ||
            (statusFilter === 'closed' && camp.status === 'Closed');
        const matchesType = typeFilter === 'all' || camp.campType === typeFilter;
        const matchesDistrict = districtFilter === 'all' || camp.district === districtFilter;
        const matchesNeeds = needsFilter === 'all' || (camp.needs && camp.needs.includes(needsFilter));
        const matchesSearch = (camp.campName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (camp.location?.address || '').toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesType && matchesDistrict && matchesNeeds && matchesSearch;
    });

    const activeCount = camps.filter(c => c.status === 'Active').length;
    const closedCount = camps.filter(c => c.status === 'Closed').length;
    const totalCapacity = camps.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.capacity, 0);
    const totalOccupancy = camps.filter(c => c.status === 'Active').reduce((sum, c) => sum + c.currentOccupancy, 0);

    const handleCampClick = (camp) => {
        navigate(`/camps/${camp.id}`);
    };

    const getOccupancyColor = (camp) => {
        const percent = (camp.currentOccupancy / camp.capacity) * 100;
        if (percent >= 90) return 'text-danger-600';
        if (percent >= 70) return 'text-warning-600';
        return 'text-success-600';
    };

    const getStockBadge = (stock) => {
        const badges = {
            'adequate': { className: 'bg-success-100 text-success-700', text: 'Adequate' },
            'low': { className: 'bg-warning-100 text-warning-700', text: 'Low' },
            'critical': { className: 'bg-danger-100 text-danger-700', text: 'Critical' },
            'none': { className: 'bg-gray-100 text-gray-700', text: 'None' }
        };
        return badges[stock] || badges.none;
    };

    const getCampTypeIcon = (type) => {
        const icons = {
            'temporary-shelter': '🏕️',
            'emergency-evacuation': '🚨',
            'long-term-relief': '🏠',
            'medical-facility': '🏥'
        };
        return icons[type] || '⛺';
    };

    // Show loading state while initializing
    if (isInitializing) {
        return (
            <div className="container mx-auto px-4 py-6">
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                        <p className="text-gray-600">Loading relief camps...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-6 max-w-7xl">
            {/* Header with view toggle */}
            <div className="mb-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">⛺ Disaster Relief Camps</h1>
                        <p className="text-sm text-gray-600 mt-1">
                            {activeCount} active camps • {totalOccupancy}/{totalCapacity} people sheltered
                        </p>
                    </div>

                    {/* View Mode Toggle */}
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
            </div >

            <div className="card mb-6">
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                        <input type="text" placeholder="Camp name, location..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="input-field" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="input-field">
                            <option value="all">All Types</option>
                            <option value="temporary-shelter">Temporary Shelter</option>
                            <option value="emergency-evacuation">Emergency Evacuation</option>
                            <option value="long-term-relief">Long-term Relief</option>
                            <option value="medical-facility">Medical Facility</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">District</label>
                        <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)} className="input-field">
                            <option value="all">All Districts</option>
                            {allDistricts.map(district => (
                                <option key={district} value={district}>{district}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">🎯 Filter by Urgent Need (for Donors)</label>
                        <p className="text-xs text-gray-500 mb-1">Select a need to find camps requesting specific supplies or help.</p>
                        <select value={needsFilter} onChange={(e) => setNeedsFilter(e.target.value)} className="input-field">
                            <option value="all">All Needs</option>
                            {allNeeds.map((need, idx) => (
                                <option key={need + '-' + idx} value={need}>{need}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); setTypeFilter('all'); setDistrictFilter('all'); setNeedsFilter('all'); }} className="w-full px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
                            <span>✕</span>
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {
                viewMode === 'cards' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredCamps.map((camp) => {
                            const occupancyPercent = Math.round((camp.currentOccupancy / camp.capacity) * 100);

                            return (
                                <div key={camp.id} onClick={() => handleCampClick(camp)} className="card hover:shadow-lg transition-shadow cursor-pointer">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                                                <span>{getCampTypeIcon(camp.campType)}</span>
                                                {camp.campName}
                                            </h3>
                                            <p className="text-sm text-gray-600 capitalize">{camp.campType?.replace('-', ' ') || 'Unknown'}</p>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${camp.status === 'Active' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
                                            {camp.status}
                                        </span>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <span className="text-sm text-gray-600">Occupancy</span>
                                                <span className={`text-sm font-semibold ${getOccupancyColor(camp)}`}>
                                                    {camp.currentOccupancy}/{camp.capacity} ({occupancyPercent}%)
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div className={`h-2 rounded-full ${occupancyPercent >= 90 ? 'bg-danger-500' : occupancyPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'}`} style={{ width: `${occupancyPercent}%` }}></div>
                                            </div>
                                        </div>

                                        <div className="pt-2 border-t border-gray-200">
                                            <p className="text-sm text-gray-700 mb-2">
                                                <span className="font-medium">📍</span> {camp.location?.address || 'N/A'}
                                            </p>
                                            <p className="text-sm text-gray-700">
                                                <span className="font-medium">☎️</span> {camp.contactPerson?.name || 'N/A'} • {camp.contactPerson?.phone || 'N/A'}
                                            </p>
                                        </div>

                                        {camp.status === 'Active' && (
                                            <>
                                                <div className="pt-2 border-t border-gray-200">
                                                    <p className="text-xs font-semibold text-gray-600 mb-2">Supply Status:</p>
                                                    <div className="flex flex-wrap gap-1">
                                                        <span className={`px-2 py-1 rounded text-xs ${getStockBadge(camp.supplies?.food?.stock).className}`}>
                                                            🍚 {getStockBadge(camp.supplies?.food?.stock).text}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs ${getStockBadge(camp.supplies?.water?.stock).className}`}>
                                                            💧 {getStockBadge(camp.supplies?.water?.stock).text}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded text-xs ${getStockBadge(camp.supplies?.medicine?.stock).className}`}>
                                                            💊 {getStockBadge(camp.supplies?.medicine?.stock).text}
                                                        </span>
                                                    </div>
                                                </div>

                                                {Array.isArray(camp.needs) && camp.needs.length > 0 && (
                                                    <div className="bg-warning-50 border border-warning-200 rounded p-2">
                                                        <p className="text-xs font-semibold text-warning-800 mb-1">Urgent Needs:</p>
                                                        <p className="text-xs text-warning-700">{camp.needs.join(', ')}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        <button className="btn-primary w-full mt-4">View Details</button>
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
                                    {filteredCamps.filter(c => c.location && c.location.lat && c.location.lng).map((camp) => {
                                        const occupancyPercent = Math.round((camp.currentOccupancy / camp.capacity) * 100);

                                        return (
                                            <Marker
                                                key={camp.id}
                                                position={[camp.location.lat, camp.location.lng]}
                                                icon={camp.status === 'Active' ? activeIcon : closedIcon}
                                            >
                                                <Popup maxWidth={220} offset={[0, -10]}>
                                                    <div className="p-1">
                                                        <h3 className="font-bold text-sm mb-1">
                                                            {getCampTypeIcon(camp.campType)} {camp.campName}
                                                        </h3>
                                                        <div className="mb-2">
                                                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${camp.status === 'Active' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
                                                                {camp.status}
                                                            </span>
                                                        </div>
                                                        <div className="mb-2">
                                                            <div className="flex justify-between items-center mb-1">
                                                                <span className="text-xs text-gray-600">Occupancy</span>
                                                                <span className={`text-xs font-semibold ${getOccupancyColor(camp)}`}>
                                                                    {camp.currentOccupancy}/{camp.capacity}
                                                                </span>
                                                            </div>
                                                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                <div className={`h-1.5 rounded-full ${occupancyPercent >= 90 ? 'bg-danger-500' : occupancyPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'}`} style={{ width: `${occupancyPercent}%` }}></div>
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-gray-600 mb-1">📍 {camp.location?.address || 'N/A'}</p>
                                                        <p className="text-xs text-gray-600 mb-1">👤 {camp.contactPerson?.name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-600 mb-2">☎️ {camp.contactPerson?.phone || 'N/A'}</p>
                                                        <button onClick={() => handleCampClick(camp)} className="btn-primary w-full text-xs py-1">
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
                                    <div className="w-6 h-6 bg-success-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Active ({activeCount})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-gray-400 rounded-full"></div>
                                    <span className="text-sm font-medium">Closed ({closedCount})</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            <ScrollToTop />
        </div >
    );
}

export default CampsList;

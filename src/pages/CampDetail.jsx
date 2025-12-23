import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCampStore } from '../store';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

function CampDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { camps, updateOccupancy, closeCamp } = useCampStore();
    const [showOccupancyDialog, setShowOccupancyDialog] = useState(false);
    const [newOccupancy, setNewOccupancy] = useState('');

    const camp = camps.find(c => c.id === parseInt(id));

    if (!camp) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-4">Camp Not Found</h1>
                <button onClick={() => navigate(-1)} className="btn-primary">← Go Back</button>
            </div>
        );
    }

    const occupancyPercent = Math.round((camp.currentOccupancy / camp.capacity) * 100);
    const getCampTypeIcon = (type) => {
        const icons = { 'temporary-shelter': '🏕️', 'emergency-evacuation': '🚨', 'long-term-relief': '🏠', 'medical-facility': '🏥' };
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

    return (
        <div className="container mx-auto px-4 py-6">
            <button onClick={() => navigate(-1)} className="text-primary-600 hover:text-primary-700 mb-4 flex items-center gap-2">← Back to Camps</button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                        {getCampTypeIcon(camp.campType)} {camp.campName}
                    </h1>
                    <p className="text-gray-600 capitalize">{camp.campType.replace('-', ' ')} • {camp.district} District</p>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${camp.status === 'Active' ? 'bg-success-100 text-success-700' : 'bg-gray-100 text-gray-700'}`}>
                    {camp.status}
                </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Capacity Overview</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-600">Current Occupancy</span>
                                    <span className="text-lg font-bold text-gray-800">{camp.currentOccupancy}/{camp.capacity}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                    <div className={`h-3 rounded-full ${occupancyPercent >= 90 ? 'bg-danger-500' : occupancyPercent >= 70 ? 'bg-warning-500' : 'bg-success-500'}`} style={{ width: `${occupancyPercent}%` }}></div>
                                </div>
                                <p className="text-sm text-gray-500">{occupancyPercent}% capacity</p>
                            </div>
                            {camp.status === 'Active' && (
                                <button onClick={() => setShowOccupancyDialog(true)} className="btn-secondary w-full">Update Occupancy</button>
                            )}
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Contact Person</h3>
                        <div className="space-y-2">
                            <p className="text-sm text-gray-600">Name</p>
                            <p className="font-medium text-gray-800">{camp.contactPerson.name}</p>
                            <p className="text-sm text-gray-600 mt-3">Role</p>
                            <p className="font-medium text-gray-800">{camp.contactPerson.role}</p>
                            <p className="text-sm text-gray-600 mt-3">Phone</p>
                            <p className="font-medium text-gray-800">{camp.contactPerson.phone}</p>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Facilities</h3>
                        <div className="grid grid-cols-2 gap-2">
                            <div className={`p-2 rounded text-center ${camp.facilities.shelter ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">🏠</div>
                                <div className="text-xs font-medium">Shelter</div>
                            </div>
                            <div className={`p-2 rounded text-center ${camp.facilities.food ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">🍚</div>
                                <div className="text-xs font-medium">Food</div>
                            </div>
                            <div className={`p-2 rounded text-center ${camp.facilities.water ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">💧</div>
                                <div className="text-xs font-medium">Water</div>
                            </div>
                            <div className={`p-2 rounded text-center ${camp.facilities.medical ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">🏥</div>
                                <div className="text-xs font-medium">Medical</div>
                            </div>
                            <div className={`p-2 rounded text-center ${camp.facilities.sanitation ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">🚿</div>
                                <div className="text-xs font-medium">Sanitation</div>
                            </div>
                            <div className={`p-2 rounded text-center ${camp.facilities.electricity ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-500'}`}>
                                <div className="text-2xl mb-1">⚡</div>
                                <div className="text-xs font-medium">Electricity</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📍 Location</h3>
                        <p className="text-gray-700 mb-3"><strong>Address:</strong> {camp.location.address}</p>
                        <div style={{ height: '300px' }} className="rounded-lg overflow-hidden border-2 border-gray-200">
                            <MapContainer center={[camp.location.lat, camp.location.lng]} zoom={15} style={{ height: '100%', width: '100%' }}>
                                <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <Marker position={[camp.location.lat, camp.location.lng]}>
                                    <Popup><div className="p-2"><p className="font-bold">{camp.campName}</p><p className="text-sm text-gray-600">{camp.location.address}</p></div></Popup>
                                </Marker>
                            </MapContainer>
                        </div>
                    </div>

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📦 Supply Status</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(camp.supplies).map(([key, supply]) => {
                                const badge = getStockBadge(supply.stock);
                                return (
                                    <div key={key} className={`p-4 border-2 rounded-lg ${badge.className}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <p className="font-semibold capitalize">{key}</p>
                                            <span className="px-2 py-1 rounded text-xs font-semibold">{badge.text}</span>
                                        </div>
                                        <p className="text-xs">Last updated: {formatDate(supply.lastUpdated)}</p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {camp.needs.length > 0 && (
                        <div className="card bg-warning-50 border-warning-300">
                            <h3 className="text-lg font-semibold text-warning-800 mb-4">⚠️ Urgent Needs</h3>
                            <div className="flex flex-wrap gap-2">
                                {camp.needs.map((need, index) => (
                                    <span key={index} className="px-3 py-1 bg-warning-100 text-warning-700 rounded-full text-sm font-medium">{need}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {camp.notes && (
                        <div className="card">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4">📝 Notes</h3>
                            <p className="text-gray-700">{camp.notes}</p>
                        </div>
                    )}

                    <div className="card">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">📋 Timeline</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">1</div>
                                <div>
                                    <p className="font-semibold text-gray-800">Camp Opened</p>
                                    <p className="text-sm text-gray-600">{formatDate(camp.openedDate)}</p>
                                    <p className="text-sm text-gray-500">Disaster Type: {camp.disasterType}</p>
                                </div>
                            </div>
                            {camp.closedDate && (
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-gray-500 text-white flex items-center justify-center font-bold">✓</div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Camp Closed</p>
                                        <p className="text-sm text-gray-600">{formatDate(camp.closedDate)}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {camp.status === 'Active' && (
                        <div className="card bg-danger-50 border-danger-300">
                            <h3 className="text-lg font-semibold text-danger-800 mb-4">⚠️ Danger Zone</h3>
                            <p className="text-danger-700 mb-4">Close this camp when all evacuees have been relocated or returned home.</p>
                            <button onClick={() => { if (confirm('Are you sure you want to close this camp?')) closeCamp(camp.id); }} className="bg-danger-600 text-white px-6 py-2 rounded-lg hover:bg-danger-700 transition-colors">
                                Close Camp
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {showOccupancyDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Update Occupancy</h3>
                        <p className="text-gray-600 mb-4">Current: {camp.currentOccupancy} / {camp.capacity} people</p>
                        <input type="number" value={newOccupancy} onChange={(e) => setNewOccupancy(e.target.value)} placeholder="Enter new occupancy" max={camp.capacity} min={0} className="input-field mb-4" />
                        <div className="flex gap-3">
                            <button onClick={handleUpdateOccupancy} className="btn-primary flex-1">Update</button>
                            <button onClick={() => setShowOccupancyDialog(false)} className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default CampDetail;

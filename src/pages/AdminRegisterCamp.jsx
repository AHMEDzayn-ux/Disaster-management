import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';
import LocationPicker from '../components/LocationPicker';

// Sri Lanka districts
const districts = [
    'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
    'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
    'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
    'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
    'Monaragala', 'Ratnapura', 'Kegalle'
];

const facilityOptions = [
    'Food', 'Water', 'Medical', 'Shelter', 'Sanitation', 'Electricity',
    'Communication', 'Transportation', 'Child Care', 'Elder Care'
];

function AdminRegisterCamp() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);

    // Get request data if coming from review page
    const requestData = location.state;
    const fromRequest = requestData?.fromRequest || false;
    const requestId = requestData?.requestId;
    const prefillData = requestData?.prefillData || {};

    const [formData, setFormData] = useState({
        name: prefillData.camp_name || '',
        district: prefillData.district || '',
        address: prefillData.address || '',
        capacity: prefillData.estimated_capacity || '',
        contact_name: prefillData.requester_name || '',
        contact_phone: prefillData.requester_phone || '',
        contact_email: prefillData.requester_email || '',
        facilities: prefillData.facilities_needed || [],
        type: 'temporary-shelter',
        notes: prefillData.additional_notes || ''
    });

    // Location state for LocationPicker
    const [campLocation, setCampLocation] = useState({
        lat: prefillData.latitude || null,
        lng: prefillData.longitude || null
    });

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/admin/login');
        }
    }, [user, authLoading, navigate]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFacilityToggle = (facility) => {
        setFormData(prev => ({
            ...prev,
            facilities: prev.facilities.includes(facility)
                ? prev.facilities.filter(f => f !== facility)
                : [...prev.facilities, facility]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Insert camp into database
            const { error: campError } = await supabase
                .from('camps')
                .insert({
                    name: formData.name,
                    type: formData.type,
                    location: {
                        address: formData.address,
                        lat: campLocation.lat,
                        lng: campLocation.lng,
                        district: formData.district
                    },
                    capacity: parseInt(formData.capacity),
                    current_occupancy: 0,
                    status: 'Active',
                    contact_person: formData.contact_name,
                    contact_number: formData.contact_phone,
                    facilities: formData.facilities
                });

            if (campError) throw campError;

            // If this came from a request approval, mark the request as approved
            if (fromRequest && requestId) {
                const { error: updateError } = await supabase
                    .from('camp_requests')
                    .update({
                        status: 'approved',
                        reviewed_at: new Date().toISOString(),
                        reviewed_by: user.id
                    })
                    .eq('id', requestId);

                if (updateError) throw updateError;
                alert('Camp request approved and registered successfully! The camp is now visible to the public.');
            } else {
                alert('Camp registered successfully! It is now visible to the public.');
            }

            navigate('/admin/dashboard');
        } catch (error) {
            console.error('Error registering camp:', error);
            alert('Failed to register camp: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent"></div>
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
                            <h1 className="text-xl font-bold">⛺ Register New Camp</h1>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800">Camp Registration Form</h2>
                            <p className="text-gray-600 text-sm mt-1">
                                {fromRequest
                                    ? '📝 This form has been auto-filled from a public camp request. Please review all details, complete missing fields, and confirm registration.'
                                    : 'Register an official relief camp. This will be immediately visible to the public.'}
                            </p>
                            {fromRequest && prefillData.reason && (
                                <div className="mt-3 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm font-medium text-blue-900">Requester's Reason:</p>
                                    <p className="text-sm text-blue-800 mt-1">{prefillData.reason}</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Camp Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Camp Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., Central Relief Camp - Colombo"
                                    required
                                />
                            </div>

                            {/* District and Address */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        District *
                                    </label>
                                    <select
                                        name="district"
                                        value={formData.district}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="">Select District</option>
                                        {districts.map(d => (
                                            <option key={d} value={d}>{d}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Camp Type *
                                    </label>
                                    <select
                                        name="type"
                                        value={formData.type}
                                        onChange={handleChange}
                                        className="input-field"
                                        required
                                    >
                                        <option value="temporary-shelter">Temporary Shelter</option>
                                        <option value="emergency-evacuation">Emergency Evacuation</option>
                                        <option value="long-term-relief">Long-term Relief</option>
                                        <option value="medical-facility">Medical Facility</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Full Address *
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="input-field h-20"
                                    placeholder="Complete address of the camp location"
                                    required
                                />
                            </div>

                            {/* Location Picker - Map Based Coordinate Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Exact Location Coordinates * (Click on map to select)
                                </label>
                                <LocationPicker
                                    value={campLocation}
                                    onChange={setCampLocation}
                                    required={true}
                                />
                                <p className="text-sm text-gray-600 mt-2">
                                    📍 Click on the map to set the exact camp location. This is required for admin registration.
                                </p>
                            </div>

                            {/* Capacity */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Maximum Capacity (people) *
                                </label>
                                <input
                                    type="number"
                                    name="capacity"
                                    value={formData.capacity}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="e.g., 500"
                                    min="1"
                                    required
                                />
                            </div>

                            {/* Contact Information */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Camp-in-Charge Contact</h3>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="contact_name"
                                            value={formData.contact_name}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="Full name"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Contact Phone *
                                        </label>
                                        <input
                                            type="tel"
                                            name="contact_phone"
                                            value={formData.contact_phone}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="e.g., 077-1234567"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Contact Email
                                    </label>
                                    <input
                                        type="email"
                                        name="contact_email"
                                        value={formData.contact_email}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            {/* Facilities */}
                            <div className="border-t pt-6">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Facilities</h3>
                                <div className="flex flex-wrap gap-2">
                                    {facilityOptions.map(facility => (
                                        <button
                                            key={facility}
                                            type="button"
                                            onClick={() => handleFacilityToggle(facility)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.facilities.includes(facility)
                                                ? 'bg-primary-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                }`}
                                        >
                                            {facility}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    className="input-field h-24"
                                    placeholder="Any additional information about the camp..."
                                />
                            </div>

                            {/* Submit */}
                            <div className="border-t pt-6 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin/dashboard')}
                                    className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 px-6 py-3 bg-success-600 hover:bg-success-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
                                >
                                    {submitting
                                        ? 'Processing...'
                                        : (fromRequest ? '✅ Confirm & Register Camp' : '⛺ Register Camp')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default AdminRegisterCamp;

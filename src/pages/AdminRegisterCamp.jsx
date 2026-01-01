import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../config/supabase';

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
    const { user, loading: authLoading } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        district: '',
        address: '',
        latitude: '',
        longitude: '',
        capacity: '',
        contact_name: '',
        contact_phone: '',
        contact_email: '',
        facilities: [],
        type: 'temporary-shelter',
        notes: ''
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
            const { error } = await supabase
                .from('camps')
                .insert({
                    name: formData.name,
                    district: formData.district,
                    location: {
                        address: formData.address,
                        lat: parseFloat(formData.latitude) || null,
                        lng: parseFloat(formData.longitude) || null
                    },
                    capacity: parseInt(formData.capacity),
                    current_occupancy: 0,
                    status: 'active',
                    type: formData.type,
                    contact_name: formData.contact_name,
                    contact_phone: formData.contact_phone,
                    contact_email: formData.contact_email || null,
                    facilities: formData.facilities,
                    supplies: {
                        food: 'adequate',
                        water: 'adequate',
                        medicine: 'adequate'
                    },
                    notes: formData.notes || null
                });

            if (error) throw error;

            alert('Camp registered successfully! It is now visible to the public.');
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
                                Register an official relief camp. This will be immediately visible to the public.
                            </p>
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

                            {/* Coordinates */}
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Latitude
                                    </label>
                                    <input
                                        type="text"
                                        name="latitude"
                                        value={formData.latitude}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., 6.9271"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Longitude
                                    </label>
                                    <input
                                        type="text"
                                        name="longitude"
                                        value={formData.longitude}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., 79.8612"
                                    />
                                </div>
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
                                    {submitting ? 'Registering...' : '⛺ Register Camp'}
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

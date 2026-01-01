import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCampStore } from '../store/supabaseStore';
import { supabase } from '../config/supabase';
import { useAuth } from '../contexts/AuthContext';
import LocationPicker from '../components/LocationPicker';

function CampManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const { addCamp } = useCampStore();
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        name: '',
        type: '',
        capacity: '',
        current_occupancy: 0,
        location: {
            district: '',
            address: '',
            coordinates: { lat: null, lng: null }
        },
        contact_person: '',
        contact_number: '',
        facilities: {
            medical: false,
            food: false,
            water: false,
            shelter: false,
            sanitation: false,
            electricity: false
        },
        status: 'active'
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Pre-fill from approved camp request
    useEffect(() => {
        if (location.state?.requestData) {
            const req = location.state.requestData;
            setFormData(prev => ({
                ...prev,
                name: `${req.disaster_type} Relief Camp - ${req.district}`,
                type: req.disaster_type?.toLowerCase() || 'general',
                capacity: req.approximate_people || '',
                location: {
                    district: req.district || '',
                    address: req.location || '',
                    coordinates: { lat: null, lng: null }
                }
            }));
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        if (name.startsWith('facilities.')) {
            const facilityKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                facilities: { ...prev.facilities, [facilityKey]: checked }
            }));
        } else if (name.startsWith('location.')) {
            const locationKey = name.split('.')[1];
            setFormData(prev => ({
                ...prev,
                location: { ...prev.location, [locationKey]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseInt(value) || 0 : value }));
        }
    };

    const handleLocationChange = (locationData) => {
        setFormData(prev => ({
            ...prev,
            location: {
                ...prev.location,
                address: locationData.address || prev.location.address,
                coordinates: {
                    lat: locationData.lat,
                    lng: locationData.lng
                }
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Strict validation for authority confirmation
            if (!formData.name || !formData.type || !formData.capacity || !formData.location.district) {
                alert('Please fill all required fields (marked with *)');
                setIsSubmitting(false);
                return;
            }

            // Validate exact coordinates are provided
            if (!formData.location.coordinates.lat || !formData.location.coordinates.lng) {
                alert('Exact location coordinates are required. Please use the map to pick the exact camp location.');
                setIsSubmitting(false);
                return;
            }

            // Validate full address is provided
            if (!formData.location.address || formData.location.address.trim().length < 10) {
                alert('Please provide a complete address (minimum 10 characters)');
                setIsSubmitting(false);
                return;
            }

            // Validate contact information
            if (!formData.contact_person || !formData.contact_number) {
                alert('Contact person name and phone number are required for authority verification');
                setIsSubmitting(false);
                return;
            }

            // Validate phone number format (Sri Lankan format)
            const phoneRegex = /^[0-9]{10}$/;
            if (!phoneRegex.test(formData.contact_number.replace(/[\s-]/g, ''))) {
                alert('Please enter a valid 10-digit phone number');
                setIsSubmitting(false);
                return;
            }

            const newCamp = await addCamp(formData);

            // If came from camp request approval, update that request
            if (location.state?.requestId && newCamp?.id) {
                try {
                    await supabase
                        .from('camp_requests')
                        .update({
                            status: 'approved',
                            reviewed_at: new Date().toISOString(),
                            reviewed_by: user?.id,
                            camp_id: newCamp.id
                        })
                        .eq('id', location.state.requestId);

                    alert('Camp registered and request approved!');
                } catch (error) {
                    console.error('Error updating request:', error);
                    alert('Camp registered but failed to update request');
                }
                navigate('/camp-requests-review');
            } else {
                alert('Camp registered successfully!');
                navigate('/admin');
            }
        } catch (error) {
            console.error('Error registering camp:', error);
            alert('Failed to register camp: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full px-4 py-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">Register Relief Camp</h1>
                    <button
                        type="button"
                        onClick={() => navigate('/admin')}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800"
                    >
                        ← Back to Admin
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">
                    {/* Basic Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                required
                            />
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
                                <option value="">Select Type</option>
                                <option value="flood">Flood Relief</option>
                                <option value="earthquake">Earthquake Relief</option>
                                <option value="cyclone">Cyclone Relief</option>
                                <option value="fire">Fire Relief</option>
                                <option value="general">General Relief</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Capacity *
                            </label>
                            <input
                                type="number"
                                name="capacity"
                                value={formData.capacity}
                                onChange={handleChange}
                                className="input-field"
                                min="1"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Current Occupancy
                            </label>
                            <input
                                type="number"
                                name="current_occupancy"
                                value={formData.current_occupancy}
                                onChange={handleChange}
                                className="input-field"
                                min="0"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-4 text-danger-600">⚠️ Exact Location Details (Critical)</h3>
                        <p className="text-sm text-gray-600 mb-4 bg-warning-50 p-3 rounded border-l-4 border-warning-500">
                            <strong>Important:</strong> Camp location must be verified by authorities. Use the map to select the exact coordinates.
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    District *
                                </label>
                                <select
                                    name="location.district"
                                    value={formData.location.district}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select District</option>
                                    <option value="Colombo">Colombo</option>
                                    <option value="Gampaha">Gampaha</option>
                                    <option value="Kalutara">Kalutara</option>
                                    <option value="Kandy">Kandy</option>
                                    <option value="Matale">Matale</option>
                                    <option value="Nuwara Eliya">Nuwara Eliya</option>
                                    <option value="Galle">Galle</option>
                                    <option value="Matara">Matara</option>
                                    <option value="Hambantota">Hambantota</option>
                                    <option value="Jaffna">Jaffna</option>
                                    <option value="Kilinochchi">Kilinochchi</option>
                                    <option value="Mannar">Mannar</option>
                                    <option value="Vavuniya">Vavuniya</option>
                                    <option value="Mullaitivu">Mullaitivu</option>
                                    <option value="Batticaloa">Batticaloa</option>
                                    <option value="Ampara">Ampara</option>
                                    <option value="Trincomalee">Trincomalee</option>
                                    <option value="Kurunegala">Kurunegala</option>
                                    <option value="Puttalam">Puttalam</option>
                                    <option value="Anuradhapura">Anuradhapura</option>
                                    <option value="Polonnaruwa">Polonnaruwa</option>
                                    <option value="Badulla">Badulla</option>
                                    <option value="Moneragala">Moneragala</option>
                                    <option value="Ratnapura">Ratnapura</option>
                                    <option value="Kegalle">Kegalle</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Complete Address *
                                </label>
                                <textarea
                                    name="location.address"
                                    value={formData.location.address}
                                    onChange={handleChange}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Enter complete address with street name, landmarks, etc."
                                    required
                                    minLength="10"
                                />
                                <p className="text-xs text-gray-500 mt-1">Provide detailed address for verification</p>
                            </div>

                            <div>
                                <LocationPicker
                                    label="Exact Coordinates (Click on Map)"
                                    value={formData.location.coordinates}
                                    onChange={handleLocationChange}
                                    required={true}
                                />
                                {formData.location.coordinates.lat && formData.location.coordinates.lng && (
                                    <div className="mt-2 p-2 bg-success-50 rounded text-sm">
                                        <strong>✓ Coordinates Set:</strong> {formData.location.coordinates.lat.toFixed(6)}, {formData.location.coordinates.lng.toFixed(6)}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-4">Contact Information (Required for Verification)</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Person Name *
                                </label>
                                <input
                                    type="text"
                                    name="contact_person"
                                    value={formData.contact_person}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Full name of camp manager"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Contact Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    name="contact_number"
                                    value={formData.contact_number}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="0771234567"
                                    pattern="[0-9]{10}"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">10-digit phone number (e.g., 0771234567)</p>
                            </div>
                        </div>
                    </div>

                    {/* Facilities */}
                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold mb-4">Available Facilities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(formData.facilities).map(([key, value]) => (
                                <label key={key} className="flex items-center space-x-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name={`facilities.${key}`}
                                        checked={value}
                                        onChange={handleChange}
                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <span className="text-sm text-gray-700 capitalize">{key}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="border-t pt-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Camp Status
                        </label>
                        <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="input-field"
                        >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="full">Full</option>
                        </select>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/admin')}
                            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                            disabled={isSubmitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Registering...' : 'Register Camp'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CampManagement;

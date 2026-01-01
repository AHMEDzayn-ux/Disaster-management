import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    'Food',
    'Drinking Water',
    'Medical Assistance',
    'Temporary Shelter',
    'Sanitation / Toilets',
    'Electricity',
    'Communication (mobile/internet)',
    'Transportation',
    'Child Care',
    'Elder Care'
];

/**
 * Public Camp Request Form - NO AUTHENTICATION REQUIRED
 * Anyone can submit a request for a new camp
 */
function CampRequestForm() {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [formData, setFormData] = useState({
        camp_name: '',
        district: '',
        ds_division: '',
        estimated_capacity: '',
        address: '',
        nearby_landmark: '',
        latitude: '',
        longitude: '',
        facilities_needed: [],
        reason: '',
        requester_name: '',
        requester_phone: '',
        requester_email: '',
        additional_notes: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFacilityToggle = (facility) => {
        setFormData(prev => ({
            ...prev,
            facilities_needed: prev.facilities_needed.includes(facility)
                ? prev.facilities_needed.filter(f => f !== facility)
                : [...prev.facilities_needed, facility]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const { error } = await supabase
                .from('camp_requests')
                .insert({
                    camp_name: formData.camp_name,
                    district: formData.district,
                    ds_division: formData.ds_division || null,
                    estimated_capacity: parseInt(formData.estimated_capacity),
                    address: formData.address,
                    nearby_landmark: formData.nearby_landmark || null,
                    latitude: formData.latitude ? parseFloat(formData.latitude) : null,
                    longitude: formData.longitude ? parseFloat(formData.longitude) : null,
                    facilities_needed: formData.facilities_needed,
                    reason: formData.reason,
                    requester_name: formData.requester_name,
                    requester_phone: formData.requester_phone,
                    requester_email: formData.requester_email || null,
                    additional_notes: formData.additional_notes || null,
                    status: 'pending'
                });

            if (error) throw error;
            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Failed to submit request: ' + error.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Success state
    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
                <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Request Submitted!</h2>
                    <p className="text-gray-600 mb-6">
                        Your camp request has been submitted successfully.
                        It will be reviewed by authorities and you will be notified once approved.
                    </p>
                    <div className="space-y-3">
                        <button
                            onClick={() => navigate('/camps')}
                            className="w-full btn-primary"
                        >
                            View Existing Camps
                        </button>
                        <button
                            onClick={() => navigate('/respond')}
                            className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-600 hover:text-gray-800 mb-4 flex items-center gap-2"
                    >
                        ← Back
                    </button>
                    <h1 className="text-2xl font-bold text-gray-800">📋 Request a New Relief Camp</h1>
                    <p className="text-gray-600 mt-1">
                        Submit a request for a new relief camp. Your request will be reviewed by authorities.
                    </p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Camp Details Section */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>⛺</span> Proposed Camp Information
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Proposed Camp Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="camp_name"
                                        value={formData.camp_name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., Community Relief Camp - Kelaniya"
                                        required
                                    />
                                </div>

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
                                            DS Division / Area
                                        </label>
                                        <input
                                            type="text"
                                            name="ds_division"
                                            value={formData.ds_division}
                                            onChange={handleChange}
                                            className="input-field"
                                            placeholder="e.g., Kelaniya DS Division"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Estimated Number of Affected People *
                                    </label>
                                    <input
                                        type="number"
                                        name="estimated_capacity"
                                        value={formData.estimated_capacity}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., 200"
                                        min="1"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Location Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📍</span> Proposed Location
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Address *
                                    </label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="input-field h-20"
                                        placeholder="Complete address or nearby landmark where the camp can be set up"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nearby Landmark
                                    </label>
                                    <input
                                        type="text"
                                        name="nearby_landmark"
                                        value={formData.nearby_landmark}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="e.g., Near Kelaniya Temple / School playground"
                                    />
                                </div>

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

                                <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                                    <p className="text-sm text-blue-800">
                                        ⚠️ Location coordinates are optional for the public. Admin will verify and finalize them.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Facilities Needed */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>🏥</span> Facilities Needed (Select All That Apply)
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {facilityOptions.map(facility => (
                                    <button
                                        key={facility}
                                        type="button"
                                        onClick={() => handleFacilityToggle(facility)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${formData.facilities_needed.includes(facility)
                                            ? 'bg-primary-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {facility}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Reason */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📝</span> Reason for Request
                            </h3>
                            <textarea
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                className="input-field h-28"
                                placeholder="Briefly explain the situation (e.g., flood affected area, evacuation count, urgent needs)"
                                required
                            />
                        </div>

                        {/* Your Information */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>👤</span> Requester Contact Information
                            </h3>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Your Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="requester_name"
                                        value={formData.requester_name}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Full name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        name="requester_phone"
                                        value={formData.requester_phone}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="077 123 4567"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">(Primary contact method)</p>
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="requester_email"
                                    value={formData.requester_email}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>

                        {/* Additional Notes */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                <span>📎</span> Additional Notes
                            </h3>
                            <textarea
                                name="additional_notes"
                                value={formData.additional_notes}
                                onChange={handleChange}
                                className="input-field h-20"
                                placeholder="Any extra details that may help authorities verify the request"
                            />
                        </div>

                        {/* Submit */}
                        <div className="border-t pt-6">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="w-full btn-primary py-3 text-lg disabled:opacity-50"
                            >
                                {submitting ? 'Submitting Request...' : '📤 Submit Camp Request'}
                            </button>
                            <p className="text-xs text-gray-500 text-center mt-3">
                                Your request will be reviewed by authorities. You will be contacted once a decision is made.
                            </p>
                        </div>
                    </form>
                </div>
            </div >
        </div >
    );
}

export default CampRequestForm;

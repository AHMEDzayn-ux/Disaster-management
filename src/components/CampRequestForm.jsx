import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../config/supabase';

function CampRequestForm() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        reporterName: '',
        reporterPhone: '',
        reporterEmail: '',
        location: '',
        district: 'Colombo',
        approximatePeople: '',
        urgentNeeds: [],
        disasterType: 'flood',
        description: '',
        additionalInfo: ''
    });

    const districts = [
        'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
        'Galle', 'Matara', 'Hambantota', 'Jaffna', 'Kilinochchi', 'Mannar',
        'Vavuniya', 'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee',
        'Kurunegala', 'Puttalam', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
        'Monaragala', 'Ratnapura', 'Kegalle'
    ];

    const needOptions = [
        'Shelter',
        'Food & Water',
        'Medical Services',
        'Sanitation',
        'Blankets & Clothing',
        'Emergency Supplies',
        'Communication',
        'Transportation'
    ];

    const handleNeedToggle = (need) => {
        setFormData(prev => ({
            ...prev,
            urgentNeeds: prev.urgentNeeds.includes(need)
                ? prev.urgentNeeds.filter(n => n !== need)
                : [...prev.urgentNeeds, need]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Create camp request object with database-compatible structure
            const campRequest = {
                reporter_name: formData.reporterName,
                reporter_phone: formData.reporterPhone,
                reporter_email: formData.reporterEmail,
                location: formData.location,
                district: formData.district,
                approximate_people: parseInt(formData.approximatePeople),
                urgent_needs: formData.urgentNeeds,
                disaster_type: formData.disasterType,
                description: formData.description,
                additional_info: formData.additionalInfo,
                status: 'pending',
                requested_at: new Date().toISOString()
            };

            // Save to Supabase
            const { error } = await supabase
                .from('camp_requests')
                .insert([campRequest]);

            if (error) throw error;

            alert('✅ Camp request submitted successfully!\n\nOur authorities will review your request and establish a relief camp if needed. You will be notified of the status.');
            navigate('/');
        } catch (error) {
            console.error('Error submitting request:', error);
            alert('Error submitting request: ' + error.message);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">🏕️ Request Relief Camp</h1>
                    <p className="text-gray-600">
                        Report the need for a relief camp in your area. Authorities will review and establish camps as needed.
                    </p>
                </div>

                <div className="card bg-warning-50 border-warning-300 mb-6">
                    <div className="flex items-start gap-3">
                        <div className="text-2xl">⚠️</div>
                        <div>
                            <h3 className="font-bold text-warning-800 mb-1">Important Information</h3>
                            <ul className="text-sm text-warning-700 space-y-1">
                                <li>• Only submit genuine requests for areas requiring relief camps</li>
                                <li>• Provide accurate information to help authorities respond effectively</li>
                                <li>• You will be contacted for verification if needed</li>
                                <li>• Camp establishment is subject to authority approval</li>
                            </ul>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="card space-y-6">
                    {/* Reporter Information */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Your Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="label">Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.reporterName}
                                    onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
                                    placeholder="Full name"
                                />
                            </div>
                            <div>
                                <label className="label">Phone Number *</label>
                                <input
                                    type="tel"
                                    required
                                    className="input-field"
                                    value={formData.reporterPhone}
                                    onChange={(e) => setFormData({ ...formData, reporterPhone: e.target.value })}
                                    placeholder="07X XXX XXXX"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="label">Email (Optional)</label>
                                <input
                                    type="email"
                                    className="input-field"
                                    value={formData.reporterEmail}
                                    onChange={(e) => setFormData({ ...formData, reporterEmail: e.target.value })}
                                    placeholder="your@email.com"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Location Information */}
                    <div>
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Location Details</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="label">Specific Location / Address *</label>
                                <input
                                    type="text"
                                    required
                                    className="input-field"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    placeholder="e.g., Community Center, Main Street, Colombo"
                                />
                            </div>
                            <div>
                                <label className="label">District *</label>
                                <select
                                    required
                                    className="input-field"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                >
                                    {districts.map(d => (
                                        <option key={d} value={d}>{d}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="label">Approximate Number of Affected People *</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="input-field"
                                    value={formData.approximatePeople}
                                    onChange={(e) => setFormData({ ...formData, approximatePeople: e.target.value })}
                                    placeholder="e.g., 200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Disaster Type */}
                    <div>
                        <label className="label">Type of Disaster *</label>
                        <select
                            required
                            className="input-field"
                            value={formData.disasterType}
                            onChange={(e) => setFormData({ ...formData, disasterType: e.target.value })}
                        >
                            <option value="flood">Flood</option>
                            <option value="landslide">Landslide</option>
                            <option value="cyclone">Cyclone</option>
                            <option value="drought">Drought</option>
                            <option value="fire">Fire</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Urgent Needs */}
                    <div>
                        <label className="label mb-3">Urgent Needs * (Select all that apply)</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {needOptions.map(need => (
                                <label key={need} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.urgentNeeds.includes(need)}
                                        onChange={() => handleNeedToggle(need)}
                                        className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-gray-700">{need}</span>
                                </label>
                            ))}
                        </div>
                        {formData.urgentNeeds.length === 0 && (
                            <p className="text-xs text-danger-600 mt-1">Please select at least one urgent need</p>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="label">Situation Description *</label>
                        <textarea
                            required
                            rows="4"
                            className="input-field"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the current situation, severity, and why a relief camp is needed..."
                        />
                    </div>

                    {/* Additional Information */}
                    <div>
                        <label className="label">Additional Information (Optional)</label>
                        <textarea
                            rows="3"
                            className="input-field"
                            value={formData.additionalInfo}
                            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
                            placeholder="Any other relevant details about access routes, available facilities, local contacts, etc."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn-secondary"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={formData.urgentNeeds.length === 0}
                            className="btn-primary flex-1"
                        >
                            📨 Submit Camp Request
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default CampRequestForm;

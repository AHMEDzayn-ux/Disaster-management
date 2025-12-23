import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import LocationPicker from './LocationPicker';

function DisasterReportForm() {
    const { register, handleSubmit, formState: { errors }, reset, control, watch } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const disasterType = watch('disasterType');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('Photo size must be less than 5MB');
                e.target.value = '';
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            const newReport = {
                id: Date.now(),
                ...data,
                photo: photoPreview,
                status: 'Active',
                reportedAt: new Date().toISOString(),
            };

            const existingReports = JSON.parse(localStorage.getItem('disasterReports') || '[]');
            existingReports.push(newReport);
            localStorage.setItem('disasterReports', JSON.stringify(existingReports));

            setSubmitSuccess(true);
            reset();
            setPhotoPreview(null);

            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (error) {
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    🚨 Report Disaster
                </h2>

                {submitSuccess && (
                    <div className="bg-success-100 border border-success-500 text-success-700 px-4 py-3 rounded mb-4">
                        ✅ Report submitted successfully! Emergency teams will be notified.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Disaster Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Disaster Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Disaster Type <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    {...register('disasterType', { required: 'Disaster type is required' })}
                                    className="input-field"
                                >
                                    <option value="">Select type</option>
                                    <option value="flood">Flood</option>
                                    <option value="landslide">Landslide</option>
                                    <option value="fire">Fire</option>
                                    <option value="earthquake">Earthquake</option>
                                    <option value="cyclone">Cyclone/Storm</option>
                                    <option value="drought">Drought</option>
                                    <option value="tsunami">Tsunami</option>
                                    <option value="building-collapse">Building Collapse</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.disasterType && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.disasterType.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Severity Level <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    {...register('severity', { required: 'Severity is required' })}
                                    className="input-field"
                                >
                                    <option value="">Select severity</option>
                                    <option value="low">Low - Minor damage</option>
                                    <option value="moderate">Moderate - Significant damage</option>
                                    <option value="high">High - Severe damage</option>
                                    <option value="critical">Critical - Life threatening</option>
                                </select>
                                {errors.severity && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.severity.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Description <span className="text-danger-500">*</span>
                            </label>
                            <textarea
                                {...register('description', {
                                    required: 'Description is required',
                                    minLength: { value: 10, message: 'Minimum 10 characters' }
                                })}
                                className="input-field"
                                rows="3"
                                placeholder="Describe what happened, extent of damage, etc."
                            />
                            {errors.description && (
                                <span className="text-danger-500 text-sm mt-1 block">
                                    {errors.description.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Photo Upload */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            📸 Photo Evidence (Optional)
                        </h3>

                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Upload Photo
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register('photo')}
                                    onChange={handlePhotoChange}
                                    className="input-field"
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Photo helps assess the situation (max 5MB)
                                </p>
                            </div>

                            {photoPreview && (
                                <div className="flex-shrink-0">
                                    <img
                                        src={photoPreview}
                                        alt="Preview"
                                        className="w-32 h-32 object-cover rounded-lg border-2 border-primary-300 shadow-md"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Impact Assessment */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Impact Assessment
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    People Affected (Estimate)
                                </label>
                                <select
                                    {...register('peopleAffected')}
                                    className="input-field"
                                >
                                    <option value="0">None/Unknown</option>
                                    <option value="1-10">1-10 people</option>
                                    <option value="11-50">11-50 people</option>
                                    <option value="51-100">51-100 people</option>
                                    <option value="100+">More than 100</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Casualties/Injuries
                                </label>
                                <select
                                    {...register('casualties')}
                                    className="input-field"
                                >
                                    <option value="none">None known</option>
                                    <option value="minor">Minor injuries</option>
                                    <option value="serious">Serious injuries</option>
                                    <option value="fatalities">Fatalities reported</option>
                                </select>
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Immediate Needs (Check all that apply)
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.rescue')} className="w-4 h-4" />
                                    <span className="text-sm">🆘 Rescue</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.medical')} className="w-4 h-4" />
                                    <span className="text-sm">🏥 Medical</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.shelter')} className="w-4 h-4" />
                                    <span className="text-sm">🏠 Shelter</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.food')} className="w-4 h-4" />
                                    <span className="text-sm">🍚 Food</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.water')} className="w-4 h-4" />
                                    <span className="text-sm">💧 Water</span>
                                </label>
                                <label className="flex items-center gap-2">
                                    <input type="checkbox" {...register('needs.evacuation')} className="w-4 h-4" />
                                    <span className="text-sm">🚶 Evacuation</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Location
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <Controller
                                    name="location"
                                    control={control}
                                    rules={{ required: 'Location is required' }}
                                    render={({ field }) => (
                                        <LocationPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Disaster Location"
                                            required
                                            error={errors.location?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Date & Time Occurred
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('occurredDate')}
                                    className="input-field"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Affected Area Size
                                </label>
                                <select
                                    {...register('areaSize')}
                                    className="input-field"
                                >
                                    <option value="small">Small (single building/area)</option>
                                    <option value="medium">Medium (multiple buildings)</option>
                                    <option value="large">Large (neighborhood/village)</option>
                                    <option value="massive">Massive (entire district)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Your Contact
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Your Name <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    {...register('reporterName', {
                                        required: 'Your name is required'
                                    })}
                                    className="input-field"
                                    placeholder="Your name"
                                />
                                {errors.reporterName && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.reporterName.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Phone Number <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    {...register('contactNumber', {
                                        required: 'Phone number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Enter valid 10-digit number'
                                        }
                                    })}
                                    className="input-field"
                                    placeholder="07XXXXXXXX"
                                />
                                {errors.contactNumber && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.contactNumber.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : '📤 Submit Disaster Report'}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                reset();
                                setPhotoPreview(null);
                            }}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Clear
                        </button>
                    </div>

                    <p className="text-sm text-gray-600 text-center">
                        <span className="text-danger-500">*</span> Required fields | ✓ Works offline
                    </p>
                </form>
            </div>
        </div>
    );
}

export default DisasterReportForm;

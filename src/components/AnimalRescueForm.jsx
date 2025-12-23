import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import LocationPicker from './LocationPicker';

function AnimalRescueForm() {
    const { register, handleSubmit, formState: { errors }, reset, watch, control } = useForm();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [photoPreview, setPhotoPreview] = useState(null);

    const isDangerous = watch('isDangerous');

    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                alert('Photo size must be less than 5MB');
                e.target.value = '';
                return;
            }

            // Create preview
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
                status: 'Pending',
                reportedAt: new Date().toISOString(),
            };

            // Store locally (will sync when online)
            const existingReports = JSON.parse(localStorage.getItem('animalRescueReports') || '[]');
            existingReports.push(newReport);
            localStorage.setItem('animalRescueReports', JSON.stringify(existingReports));

            // Show success message
            setSubmitSuccess(true);
            reset();
            setPhotoPreview(null);

            // Hide success message after 3 seconds
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
                    🐾 Animal Rescue Report
                </h2>

                {submitSuccess && (
                    <div className="bg-success-100 border border-success-500 text-success-700 px-4 py-3 rounded mb-4">
                        ✅ Report submitted successfully! Rescue team will be notified.
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Photo Upload - Primary Identification */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            📸 Photo
                        </h3>

                        <div className="flex flex-col md:flex-row gap-4 items-start">
                            <div className="flex-1">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Upload Photo <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    {...register('photo', {
                                        required: 'Photo helps rescue team identify the animal'
                                    })}
                                    onChange={handlePhotoChange}
                                    className="input-field"
                                />
                                {errors.photo && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.photo.message}
                                    </span>
                                )}
                                <p className="text-sm text-gray-500 mt-1">
                                    Clear photo showing the animal (max 5MB)
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

                    {/* Animal Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Animal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Animal Type <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    {...register('animalType', { required: 'Animal type is required' })}
                                    className="input-field"
                                >
                                    <option value="">Select type</option>
                                    <option value="dog">Dog</option>
                                    <option value="cat">Cat</option>
                                    <option value="cattle">Cattle (Cow/Buffalo)</option>
                                    <option value="goat">Goat/Sheep</option>
                                    <option value="bird">Bird</option>
                                    <option value="wildlife">Other Wildlife</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.animalType && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.animalType.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Size/Breed (if known)
                                </label>
                                <input
                                    {...register('breed')}
                                    className="input-field"
                                    placeholder="e.g., Large dog, Small cat"
                                />
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Description <span className="text-danger-500">*</span>
                            </label>
                            <textarea
                                {...register('description', {
                                    required: 'Description is required'
                                })}
                                className="input-field"
                                rows="2"
                                placeholder="Color, markings, condition, etc."
                            />
                            {errors.description && (
                                <span className="text-danger-500 text-sm mt-1 block">
                                    {errors.description.message}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Safety Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            ⚠️ Safety Information
                        </h3>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    {...register('isDangerous')}
                                    className="mt-1 w-5 h-5 text-danger-500 focus:ring-danger-500"
                                />
                                <div>
                                    <label className="text-gray-700 font-medium">
                                        Animal is dangerous or may bite
                                    </label>
                                    <p className="text-sm text-gray-500">
                                        Check if the animal shows aggressive behavior
                                    </p>
                                </div>
                            </div>

                            {isDangerous && (
                                <div className="bg-danger-50 border-l-4 border-danger-500 p-4 rounded">
                                    <p className="text-danger-700 font-medium mb-2">
                                        ⚠️ Warning: Professional rescue team required
                                    </p>
                                    <textarea
                                        {...register('dangerDetails')}
                                        className="input-field mt-2"
                                        rows="2"
                                        placeholder="Describe the danger: aggressive, biting, venomous, etc."
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Condition <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    {...register('condition', { required: 'Condition is required' })}
                                    className="input-field"
                                >
                                    <option value="">Select condition</option>
                                    <option value="healthy">Healthy/Unharmed</option>
                                    <option value="injured">Injured</option>
                                    <option value="trapped">Trapped</option>
                                    <option value="sick">Sick/Weak</option>
                                    <option value="critical">Critical Condition</option>
                                </select>
                                {errors.condition && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.condition.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Injury/Health Details (Optional)
                                </label>
                                <textarea
                                    {...register('healthDetails')}
                                    className="input-field"
                                    rows="2"
                                    placeholder="Describe any visible injuries or health issues"
                                />
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
                                    rules={{ required: 'Location is required for rescue' }}
                                    render={({ field }) => (
                                        <LocationPicker
                                            value={field.value}
                                            onChange={field.onChange}
                                            label="Current Location"
                                            required
                                            error={errors.location?.message}
                                        />
                                    )}
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Accessibility
                                </label>
                                <select
                                    {...register('accessibility')}
                                    className="input-field"
                                >
                                    <option value="easy">Easy Access</option>
                                    <option value="moderate">Moderate (needs tools)</option>
                                    <option value="difficult">Difficult (special equipment needed)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Date & Time Spotted
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('spottedDate')}
                                    className="input-field"
                                />
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
                            {isSubmitting ? 'Submitting...' : '📤 Submit Rescue Request'}
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

export default AnimalRescueForm;

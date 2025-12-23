import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMissingPersonStore } from '../store';

function MissingPersonForm() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { addMissingPerson } = useMissingPersonStore();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const onSubmit = async (data) => {
        setIsSubmitting(true);
        setSubmitSuccess(false);

        try {
            // Add to local store (later replace with API call)
            const newReport = {
                id: Date.now(),
                ...data,
                status: 'Active',
                reportedAt: new Date().toISOString(),
            };

            addMissingPerson(newReport);

            // Show success message
            setSubmitSuccess(true);
            reset(); // Clear form

            // Hide success message after 3 seconds
            setTimeout(() => setSubmitSuccess(false), 3000);
        } catch (error) {
            console.error('Error submitting report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                    Report Missing Person
                </h2>

                {submitSuccess && (
                    <div className="bg-success-100 border border-success-500 text-success-700 px-4 py-3 rounded mb-4">
                        ✅ Report submitted successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Personal Information Section */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Personal Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Full Name <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    {...register('name', {
                                        required: 'Name is required',
                                        minLength: { value: 2, message: 'Name must be at least 2 characters' }
                                    })}
                                    className="input-field"
                                    placeholder="Enter full name"
                                />
                                {errors.name && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.name.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Age <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('age', {
                                        required: 'Age is required',
                                        min: { value: 0, message: 'Age must be positive' },
                                        max: { value: 150, message: 'Please enter a valid age' }
                                    })}
                                    className="input-field"
                                    placeholder="Enter age"
                                />
                                {errors.age && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.age.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Gender <span className="text-danger-500">*</span>
                                </label>
                                <select
                                    {...register('gender', { required: 'Gender is required' })}
                                    className="input-field"
                                >
                                    <option value="">Select gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                                {errors.gender && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.gender.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Height (cm)
                                </label>
                                <input
                                    type="number"
                                    {...register('height', {
                                        min: { value: 0, message: 'Height must be positive' }
                                    })}
                                    className="input-field"
                                    placeholder="e.g., 170"
                                />
                                {errors.height && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.height.message}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <label className="block text-gray-700 font-medium mb-2">
                                Physical Description
                            </label>
                            <textarea
                                {...register('description')}
                                className="input-field"
                                rows="3"
                                placeholder="Hair color, clothing, distinguishing features, etc."
                            />
                        </div>
                    </div>

                    {/* Last Seen Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Last Seen Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Last Seen Location <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    {...register('lastSeenLocation', {
                                        required: 'Location is required'
                                    })}
                                    className="input-field"
                                    placeholder="City, area, or specific address"
                                />
                                {errors.lastSeenLocation && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.lastSeenLocation.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Date & Time Last Seen <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="datetime-local"
                                    {...register('lastSeenDate', {
                                        required: 'Date is required'
                                    })}
                                    className="input-field"
                                />
                                {errors.lastSeenDate && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.lastSeenDate.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-700 mb-4 border-b pb-2">
                            Contact Information
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Reporter Name <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    {...register('reporterName', {
                                        required: 'Reporter name is required'
                                    })}
                                    className="input-field"
                                    placeholder="Your full name"
                                />
                                {errors.reporterName && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.reporterName.message}
                                    </span>
                                )}
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-2">
                                    Contact Number <span className="text-danger-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    {...register('contactNumber', {
                                        required: 'Contact number is required',
                                        pattern: {
                                            value: /^[0-9]{10}$/,
                                            message: 'Enter a valid 10-digit phone number'
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

                            <div className="md:col-span-2">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Email (Optional)
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className="input-field"
                                    placeholder="email@example.com"
                                />
                                {errors.email && (
                                    <span className="text-danger-500 text-sm mt-1 block">
                                        {errors.email.message}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Additional Information */}
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Additional Information
                        </label>
                        <textarea
                            {...register('additionalInfo')}
                            className="input-field"
                            rows="4"
                            placeholder="Any other relevant information that might help locate the person..."
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-4">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                        <button
                            type="button"
                            onClick={() => reset()}
                            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            Clear Form
                        </button>
                    </div>

                    <p className="text-sm text-gray-600">
                        <span className="text-danger-500">*</span> Required fields
                    </p>
                </form>
            </div>
        </div>
    );
}

export default MissingPersonForm;

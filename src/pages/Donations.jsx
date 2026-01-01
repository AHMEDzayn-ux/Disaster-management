import React, { useEffect, useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { motion } from 'framer-motion';
import { useDonationStore } from '../store/supabaseStore';
import DonationCounter from '../components/DonationCounter';
import DonationForm from '../components/DonationForm';
import RecentDonations from '../components/RecentDonations';
import DonationList from '../components/DonationList';

// Load Stripe with your publishable key
// TODO: Add VITE_STRIPE_PUBLISHABLE_KEY to your .env file
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_YOUR_KEY_HERE');

function Donations() {
    const { subscribeToDonations, unsubscribeFromDonations, fetchDonations } = useDonationStore();
    const [activeTab, setActiveTab] = useState('donate'); // 'donate' or 'transparency'
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successData, setSuccessData] = useState(null);

    useEffect(() => {
        // Initialize donations subscription on mount
        subscribeToDonations();

        // Cleanup subscription on unmount
        return () => {
            unsubscribeFromDonations();
        };
    }, [subscribeToDonations, unsubscribeFromDonations]);

    const handleDonationSuccess = (donation) => {
        setSuccessData(donation);
        setShowSuccessModal(true);

        // Auto-hide after 10 seconds
        setTimeout(() => {
            setShowSuccessModal(false);
        }, 10000);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-3">
                        💝 Support Disaster Relief
                    </h1>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Your contribution helps provide emergency relief, shelter, food, and medical supplies
                        to families affected by disasters. We accept donations in LKR and foreign currencies.
                    </p>
                </motion.div>

                {/* Donation Counter - Always Visible */}
                <div className="mb-8">
                    <DonationCounter />
                </div>

                {/* Tab Navigation */}
                <div className="flex justify-center mb-8">
                    <div className="bg-white rounded-lg shadow-md p-1 inline-flex gap-1">
                        <button
                            onClick={() => setActiveTab('donate')}
                            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 ${activeTab === 'donate'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            🎁 Make a Donation
                        </button>
                        <button
                            onClick={() => setActiveTab('transparency')}
                            className={`px-6 py-3 rounded-md font-semibold transition-all duration-200 ${activeTab === 'transparency'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            📊 Transparency Report
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'donate' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Form */}
                        <div className="lg:col-span-2">
                            {/* Donation Form */}
                            <Elements stripe={stripePromise}>
                                <DonationForm onSuccess={handleDonationSuccess} />
                            </Elements>
                        </div>

                        {/* Right Column: Recent Donations */}
                        <div className="lg:col-span-1">
                            <RecentDonations limit={8} showTicker={true} />
                        </div>
                    </div>
                ) : (
                    <div>
                        <DonationList />
                    </div>
                )}

                {/* Success Modal */}
                {showSuccessModal && successData && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowSuccessModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        >
                            {/* Success Animation */}
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                                    <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                                    Thank You! 🎉
                                </h2>
                                <p className="text-gray-600">
                                    Your generous donation of{' '}
                                    <span className="font-bold text-green-600 text-xl">
                                        {successData.currency === 'LKR' ? 'Rs.' : '$'}{parseFloat(successData.amount).toLocaleString()}
                                    </span>
                                    {' '}({successData.currency}) has been received!
                                </p>
                            </div>

                            {/* Details */}
                            <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Purpose:</span>
                                    <span className="font-semibold text-gray-800">
                                        {successData.donation_purpose}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Payment Status:</span>
                                    <span className="font-semibold text-green-600">
                                        Confirmed ✓
                                    </span>
                                </div>
                                {successData.stripe_payment_id && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Transaction ID:</span>
                                        <code className="text-xs bg-white px-2 py-1 rounded">
                                            {successData.stripe_payment_id.substring(0, 15)}...
                                        </code>
                                    </div>
                                )}
                            </div>

                            {/* Impact Message */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <p className="text-sm text-blue-800">
                                    <strong>Your Impact:</strong> Your donation will directly help families
                                    affected by disasters get access to emergency supplies, shelter, and medical care.
                                    Thank you for making a difference! 🙏
                                </p>
                            </div>

                            {/* Close Button */}
                            <button
                                onClick={() => setShowSuccessModal(false)}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                            >
                                Close
                            </button>
                        </motion.div>
                    </motion.div>
                )}

                {/* Footer Info */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-12 bg-white rounded-xl shadow-md p-6"
                >
                    <h3 className="text-xl font-bold text-gray-800 mb-4 text-center">
                        Official Government Bank Account
                    </h3>
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md w-full text-center">
                            <p className="text-lg font-semibold text-gray-700 mb-2">All donations are deposited directly to the official government disaster relief account.</p>
                            <div className="bg-white rounded-lg p-4 shadow text-left">
                                <div className="mb-2"><span className="font-bold">Bank Name:</span> [Official Bank Name]</div>
                                <div className="mb-2"><span className="font-bold">Account Name:</span> [Government Disaster Relief Fund]</div>
                                <div className="mb-2"><span className="font-bold">Account Number:</span> [000-000-0000]</div>
                                <div><span className="font-bold">Branch:</span> [Branch Name]</div>
                            </div>
                            <p className="text-sm text-gray-600 mt-4">Your contribution goes directly to government-coordinated relief efforts, ensuring maximum impact and transparency.</p>
                        </div>
                    </div>
                </motion.div>

                {/* Important Setup Note */}
                {!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY && (
                    <div className="mt-6 bg-red-50 border-2 border-red-300 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <svg className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            <div className="flex-1">
                                <h4 className="font-bold text-red-800 mb-2">⚠️ Stripe Payment Configuration Required</h4>
                                <p className="text-sm text-red-700 mb-3">
                                    To enable donation payments, you need to set up Stripe. This involves:
                                </p>
                                <ol className="text-sm text-red-700 mb-3 ml-4 space-y-1 list-decimal">
                                    <li>Creating a Stripe account and getting API keys</li>
                                    <li>Adding your publishable key to the <code className="bg-red-100 px-1 rounded">.env</code> file</li>
                                    <li>Setting up a backend endpoint for payment processing</li>
                                    <li>Configuring currency support (LKR and foreign currencies)</li>
                                </ol>
                                <div className="bg-red-100 p-3 rounded mb-3">
                                    <p className="text-sm font-semibold text-red-800 mb-1">Quick Start:</p>
                                    <code className="block text-xs bg-white p-2 rounded">
                                        VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
                                    </code>
                                </div>
                                <p className="text-sm text-red-700">
                                    📖 <strong>For complete setup instructions</strong>, please refer to{' '}
                                    <code className="bg-red-100 px-1 rounded font-semibold">STRIPE_SETUP_GUIDE.md</code>{' '}
                                    in the project root directory.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Donations;


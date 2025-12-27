import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateAllTestData, generateMissingPersons, generateDisasters, generateAnimalRescues, generateCamps } from '../utils/bulkTestData';

function BulkTestData() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState('');
    const [result, setResult] = useState(null);

    const handleGenerateAll = async () => {
        if (!confirm('⚠️ This will create 140 test records in your database. Continue?')) return;

        setLoading(true);
        setResult(null);
        setProgress('Starting generation...');

        try {
            const res = await generateAllTestData();
            setResult(res);
            setProgress('');
            alert('✅ All test data generated successfully! Check console for details.');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            setProgress('');
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateType = async (type, count, generator) => {
        if (!confirm(`⚠️ This will create ${count} ${type} records. Continue?`)) return;

        setLoading(true);
        setProgress(`Generating ${count} ${type}...`);

        try {
            await generator(count);
            alert(`✅ ${count} ${type} generated successfully! Check console for details.`);
            setProgress('');
        } catch (error) {
            alert(`❌ Error: ${error.message}`);
            setProgress('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/')}
                        className="text-primary-600 hover:text-primary-800 mb-4 flex items-center gap-2"
                    >
                        ← Back to Home
                    </button>
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">🧪 Bulk Test Data Generator</h1>
                    <p className="text-gray-600">Generate realistic test data for testing and demo purposes</p>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="card bg-blue-50 border-l-4 border-blue-500 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
                            <div>
                                <p className="text-blue-800 font-semibold">Generating data...</p>
                                {progress && <p className="text-sm text-blue-600 mt-1">{progress}</p>}
                            </div>
                        </div>
                        <p className="text-sm text-blue-600 mt-3">
                            This may take 1-3 minutes. Check browser console (F12) for detailed progress.
                        </p>
                    </div>
                )}

                {/* Success Result */}
                {result && (
                    <div className="card bg-green-50 border-l-4 border-green-500 mb-6">
                        <h3 className="font-bold text-green-800 mb-2">✅ Generation Complete!</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div className="bg-white rounded p-3 text-center">
                                <p className="text-2xl font-bold text-primary-600">{result.counts.missingPersons}</p>
                                <p className="text-xs text-gray-600">Missing Persons</p>
                            </div>
                            <div className="bg-white rounded p-3 text-center">
                                <p className="text-2xl font-bold text-danger-600">{result.counts.disasters}</p>
                                <p className="text-xs text-gray-600">Disasters</p>
                            </div>
                            <div className="bg-white rounded p-3 text-center">
                                <p className="text-2xl font-bold text-warning-600">{result.counts.animalRescues}</p>
                                <p className="text-xs text-gray-600">Animal Rescues</p>
                            </div>
                            <div className="bg-white rounded p-3 text-center">
                                <p className="text-2xl font-bold text-success-600">{result.counts.camps}</p>
                                <p className="text-xs text-gray-600">Camps</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Warning */}
                <div className="card bg-yellow-50 border-l-4 border-yellow-500 mb-6">
                    <h3 className="font-bold text-yellow-800 mb-2">⚠️ Important Notes</h3>
                    <ul className="text-yellow-700 text-sm space-y-1">
                        <li>• This creates test records in your Supabase database</li>
                        <li>• Data is realistic but randomly generated</li>
                        <li>• Photos are not included (photo field will be null)</li>
                        <li>• Generation may take 1-3 minutes depending on count</li>
                        <li>• Check browser console (F12) for detailed progress</li>
                    </ul>
                </div>

                {/* Generate All Button */}
                <div className="card mb-6 bg-gradient-to-r from-primary-500 to-primary-700 text-white">
                    <h3 className="font-bold text-xl mb-2">🚀 Generate All Test Data</h3>
                    <p className="text-primary-100 mb-4">
                        Creates 140 records: 50 Missing Persons + 30 Disasters + 40 Animal Rescues + 20 Camps
                    </p>
                    <button
                        onClick={handleGenerateAll}
                        disabled={loading}
                        className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Generating...' : '🎯 Generate All (140 records)'}
                    </button>
                </div>

                {/* Individual Generators */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Missing Persons */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">📋</span>
                            Missing Persons
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Generates reports with names, ages, locations, and contact details
                        </p>
                        <button
                            onClick={() => handleGenerateType('Missing Persons', 50, generateMissingPersons)}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate 50 Missing Persons
                        </button>
                    </div>

                    {/* Disasters */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">⚠️</span>
                            Disaster Reports
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Various disaster types with severities and locations across Sri Lanka
                        </p>
                        <button
                            onClick={() => handleGenerateType('Disaster Reports', 30, generateDisasters)}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate 30 Disasters
                        </button>
                    </div>

                    {/* Animal Rescues */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">🐕</span>
                            Animal Rescues
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Different animal types with various conditions and rescue statuses
                        </p>
                        <button
                            onClick={() => handleGenerateType('Animal Rescues', 40, generateAnimalRescues)}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate 40 Animal Rescues
                        </button>
                    </div>

                    {/* Camps */}
                    <div className="card">
                        <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
                            <span className="text-2xl">⛺</span>
                            Relief Camps
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Emergency camps with capacities, facilities, and contact information
                        </p>
                        <button
                            onClick={() => handleGenerateType('Relief Camps', 20, generateCamps)}
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Generate 20 Camps
                        </button>
                    </div>
                </div>

                {/* Features List */}
                <div className="card mt-6">
                    <h3 className="font-bold text-gray-800 mb-3">📦 What's Generated:</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
                        <div>
                            <p className="font-semibold mb-2">✓ Realistic Data:</p>
                            <ul className="space-y-1 ml-4">
                                <li>• Sri Lankan names</li>
                                <li>• Valid phone numbers</li>
                                <li>• All 25 districts</li>
                                <li>• Recent dates (last 30 days)</li>
                            </ul>
                        </div>
                        <div>
                            <p className="font-semibold mb-2">✓ Features:</p>
                            <ul className="space-y-1 ml-4">
                                <li>• Mixed statuses (Active/Resolved)</li>
                                <li>• Various severities</li>
                                <li>• Real GPS coordinates</li>
                                <li>• Detailed descriptions</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BulkTestData;

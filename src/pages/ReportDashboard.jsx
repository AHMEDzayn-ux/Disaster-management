import React from 'react';
import { Link } from 'react-router-dom';

function ReportDashboard() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-800 mb-2">
                    Report Emergency
                </h1>
                <p className="text-gray-600 text-lg">
                    Submit your report quickly - works offline
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Disaster Report */}
                <Link to="/disasters" className="group">
                    <div className="card hover:shadow-xl transition-all border-l-4 border-orange-500 h-full">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">⚠️</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600">
                                    Report Disaster
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    Report floods, fires, landslides, etc.
                                </p>
                                <span className="text-sm font-semibold text-orange-600">
                                    Report Now →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Missing Person Report */}
                <Link to="/missing-persons" className="group">
                    <div className="card hover:shadow-xl transition-all border-l-4 border-danger-500 h-full">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">👤</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-danger-600">
                                    Report Missing Person
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    Report someone missing during disaster
                                </p>
                                <span className="text-sm font-semibold text-danger-600">
                                    Report Now →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Animal Rescue */}
                <Link to="/animal-rescue" className="group">
                    <div className="card hover:shadow-xl transition-all border-l-4 border-primary-500 h-full">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🐕</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600">
                                    Request Animal Rescue
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    Report animals needing rescue
                                </p>
                                <span className="text-sm font-semibold text-primary-600">
                                    Report Now →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Emergency Contacts */}
                <Link to="/emergency" className="group">
                    <div className="card hover:shadow-xl transition-all border-l-4 border-success-500 h-full">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">📞</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-success-600">
                                    Emergency Contacts
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    Quick access to helplines
                                </p>
                                <span className="text-sm font-semibold text-success-600">
                                    View Contacts →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>

                {/* Request Camp */}
                <Link to="/request-camp" className="group">
                    <div className="card hover:shadow-xl transition-all border-l-4 border-warning-500 h-full">
                        <div className="flex items-start gap-4">
                            <div className="text-4xl">🏕️</div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-warning-600">
                                    Request Relief Camp
                                </h3>
                                <p className="text-gray-600 mb-3">
                                    Request a new relief camp in your area
                                </p>
                                <span className="text-sm font-semibold text-warning-600">
                                    Request Now →
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Important Notice */}
            <div className="mt-8 card bg-primary-50 border-l-4 border-primary-500">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Works Offline</h4>
                        <p className="text-gray-700">
                            All forms work without internet. Your report will be saved and submitted automatically when connection is restored.
                        </p>
                    </div>
                </div>
            </div>

            {/* SMS Alternative */}
            <div className="mt-4 card bg-orange-50 border-l-4 border-orange-500">
                <div className="flex items-start gap-4">
                    <div className="text-3xl">📱</div>
                    <div>
                        <h4 className="font-bold text-gray-800 mb-2">Can't Use App? Send SMS</h4>
                        <p className="text-gray-700 mb-2">
                            Text your report to: <span className="font-bold">1234</span>
                        </p>
                        <p className="text-sm text-gray-600">
                            Format: MISSING [Name] [Age] [Location] OR DISASTER [Type] [Location]
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportDashboard;

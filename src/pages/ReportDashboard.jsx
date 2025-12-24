import React from 'react';
import { Link } from 'react-router-dom';

function ReportDashboard() {
    return (
        <div className="px-4 py-3">
            <div className="mb-3">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Report Emergency
                </h1>
                <p className="text-gray-600 text-sm">
                    Submit your report quickly - works offline
                </p>
            </div>

            <div className="flex gap-4">
                {/* Main Cards Section */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Missing Person Report */}
                    <Link to="/missing-persons" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-danger-500 h-full">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">👤</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-danger-600">
                                        Missing Person
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

                    {/* Disaster Report */}
                    <Link to="/disasters" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-orange-500 h-full">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">⚠️</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600">
                                        Disaster Incident
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

                    {/* Animal Rescue */}
                    <Link to="/animal-rescue" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-primary-500 h-full">
                            <div className="flex items-start gap-4">
                                <div className="text-4xl">🐕</div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600">
                                        Animal Rescue
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
                </div>

                {/* Info Sidebar */}
                <div className="w-64 flex-shrink-0 space-y-3">
                    {/* Important Notice */}
                    <div className="bg-white rounded-lg shadow-sm p-3 bg-primary-50 border-l-4 border-primary-500">
                        <div className="flex items-start gap-2">
                            <div className="text-2xl">💡</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1">Works Offline</h4>
                                <p className="text-gray-700 text-xs">
                                    All forms work without internet. Your report will be saved and submitted automatically when connection is restored.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* SMS Alternative */}
                    <div className="bg-white rounded-lg shadow-sm p-3 bg-orange-50 border-l-4 border-orange-500">
                        <div className="flex items-start gap-2">
                            <div className="text-2xl">📱</div>
                            <div>
                                <h4 className="font-bold text-gray-800 text-sm mb-1">Can't Use App? Send SMS</h4>
                                <p className="text-gray-700 text-xs mb-1">
                                    Text to: <span className="font-bold">1234</span>
                                </p>
                                <p className="text-xs text-gray-600">
                                    Format: MISSING [Name] [Age] [Location] OR DISASTER [Type] [Location]
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ReportDashboard;

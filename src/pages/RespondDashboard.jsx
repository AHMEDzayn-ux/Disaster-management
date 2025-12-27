import React from 'react';
import { Link } from 'react-router-dom';

function RespondDashboard() {
    return (
        <div className="px-4 py-3">
            <div className="mb-3">
                <h1 className="text-2xl font-bold text-gray-800 mb-1">
                    Respond & Help
                </h1>
                <p className="text-gray-600 text-sm">
                    Coordinate rescue efforts and provide assistance
                </p>
            </div>

            <div className="flex gap-4">
                {/* Main Cards Section - Left aligned */}
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {/* View Missing Persons */}
                    <Link to="/missing-persons-list" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-danger-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">🔍</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-danger-600">
                                        Missing Persons List
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Search and help locate missing people
                                    </p>
                                    <span className="text-sm font-semibold text-danger-600">
                                        View List →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Active Disasters */}
                    <Link to="/disasters-list" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-orange-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">🗺️</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-orange-600">
                                        Active Disasters
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        See disaster zones and response status
                                    </p>
                                    <span className="text-sm font-semibold text-orange-600">
                                        View Map →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Volunteer Registration */}
                    <Link to="/volunteers" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-success-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">🙋</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-success-600">
                                        Register as Volunteer
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Join rescue and relief efforts
                                    </p>
                                    <span className="text-sm font-semibold text-success-600">
                                        Register →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Camp Management */}
                    <Link to="/camps" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-primary-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">⛺</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-primary-600">
                                        Relief Camps
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Manage camps and resources
                                    </p>
                                    <span className="text-sm font-semibold text-primary-600">
                                        View Camps →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Donations */}
                    <Link to="/donations" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-purple-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">💰</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-purple-600">
                                        Make a Donation
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Support relief efforts
                                    </p>
                                    <span className="text-sm font-semibold text-purple-600">
                                        Donate Now →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Animal Rescue List */}
                    <Link to="/animal-rescue-list" className="group">
                        <div className="card hover:shadow-xl transition-all border-l-4 border-blue-500 h-full">
                            <div className="flex flex-col items-center justify-center gap-3 text-center h-full">
                                <div className="text-4xl">🐾</div>
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-blue-600">
                                        Animal Rescue Requests
                                    </h3>
                                    <p className="text-gray-600 mb-3">
                                        Coordinate animal rescue operations
                                    </p>
                                    <span className="text-sm font-semibold text-blue-600">
                                        View Requests →
                                    </span>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Quick Stats - Right Sidebar - Hidden on mobile/tablet */}
                <div className="hidden xl:block w-56 flex-shrink-0">
                    <div className="sticky top-4">
                        <h2 className="text-base font-bold text-gray-800 mb-2">Quick Stats</h2>
                        <div className="space-y-2">
                            <div className="bg-white rounded-lg shadow-sm p-3 text-center bg-danger-50">
                                <p className="text-xl font-bold text-danger-600">0</p>
                                <p className="text-xs text-gray-600">Missing Persons</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-3 text-center bg-orange-50">
                                <p className="text-xl font-bold text-orange-600">0</p>
                                <p className="text-xs text-gray-600">Active Disasters</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-3 text-center bg-success-50">
                                <p className="text-xl font-bold text-success-600">0</p>
                                <p className="text-xs text-gray-600">Volunteers</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm p-3 text-center bg-primary-50">
                                <p className="text-xl font-bold text-primary-600">0</p>
                                <p className="text-xs text-gray-600">Relief Camps</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RespondDashboard;

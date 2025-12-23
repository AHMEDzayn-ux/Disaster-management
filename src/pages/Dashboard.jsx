import React from 'react';

function Dashboard() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-6">
                Disaster Management Dashboard
            </h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">
                        Missing Persons
                    </h3>
                    <p className="text-gray-600">Report and track missing individuals</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-danger-600 mb-2">
                        Disaster Reports
                    </h3>
                    <p className="text-gray-600">Submit disaster incidents and alerts</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-success-600 mb-2">
                        Animal Rescue
                    </h3>
                    <p className="text-gray-600">Report animals in need of rescue</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">
                        Camp Management
                    </h3>
                    <p className="text-gray-600">Manage relief camps and supplies</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-success-600 mb-2">
                        Volunteers
                    </h3>
                    <p className="text-gray-600">Register and coordinate volunteers</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-primary-600 mb-2">
                        Donations
                    </h3>
                    <p className="text-gray-600">Facilitate donations and support</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-danger-600 mb-2">
                        Emergency Contacts
                    </h3>
                    <p className="text-gray-600">Quick access to emergency services</p>
                </div>

                <div className="card hover:shadow-lg transition-shadow">
                    <h3 className="text-xl font-semibold text-success-600 mb-2">
                        SMS Reporting
                    </h3>
                    <p className="text-gray-600">AI-powered SMS incident reporting</p>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;

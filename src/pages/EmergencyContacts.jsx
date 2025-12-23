import React from 'react';

function EmergencyContacts() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Emergency Contacts</h1>
            <div className="card">
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold text-gray-700">Sri Lanka Emergency Services</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border-l-4 border-danger-500 pl-4">
                            <h3 className="font-semibold">Police Emergency</h3>
                            <p className="text-2xl font-bold text-danger-600">119</p>
                        </div>
                        <div className="border-l-4 border-danger-500 pl-4">
                            <h3 className="font-semibold">Ambulance</h3>
                            <p className="text-2xl font-bold text-danger-600">110</p>
                        </div>
                        <div className="border-l-4 border-danger-500 pl-4">
                            <h3 className="font-semibold">Fire & Rescue</h3>
                            <p className="text-2xl font-bold text-danger-600">110</p>
                        </div>
                        <div className="border-l-4 border-primary-500 pl-4">
                            <h3 className="font-semibold">Disaster Management Centre</h3>
                            <p className="text-2xl font-bold text-primary-600">117</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default EmergencyContacts;

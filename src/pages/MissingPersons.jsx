import React from 'react';
import MissingPersonForm from '../components/MissingPersonForm';
import { useMissingPersonStore } from '../store';

function MissingPersons() {
    const { missingPersons } = useMissingPersonStore();

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Missing Persons</h1>
                <p className="text-gray-600">
                    Report missing persons to help locate them during disasters
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-2">
                    <MissingPersonForm />
                </div>

                {/* Emergency Hotline */}
                <div>
                    <div className="card bg-primary-50">
                        <h4 className="font-semibold text-primary-800 mb-2">
                            📞 Emergency Hotline
                        </h4>
                        <p className="text-2xl font-bold text-primary-600">119</p>
                        <p className="text-sm text-gray-600 mt-1">
                            Police Emergency Services
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default MissingPersons;

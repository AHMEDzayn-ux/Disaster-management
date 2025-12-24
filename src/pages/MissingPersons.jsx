import React from 'react';
import MissingPersonForm from '../components/MissingPersonForm';

function MissingPersons() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Missing Persons</h1>
                <p className="text-gray-600">
                    Report missing persons to help locate them during disasters
                </p>
            </div>

            <div className="max-w-3xl mx-auto">
                <MissingPersonForm />
            </div>
        </div>
    );
}

export default MissingPersons;

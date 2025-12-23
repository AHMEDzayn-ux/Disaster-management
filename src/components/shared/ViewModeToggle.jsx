import React from 'react';

function ViewModeToggle({ viewMode, setViewMode }) {
    return (
        <div className="flex gap-2">
            <button
                onClick={() => setViewMode('cards')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'cards'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
            >
                📋 Card View
            </button>
            <button
                onClick={() => setViewMode('map')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${viewMode === 'map'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
            >
                🗺️ Map View
            </button>
        </div>
    );
}

export default ViewModeToggle;

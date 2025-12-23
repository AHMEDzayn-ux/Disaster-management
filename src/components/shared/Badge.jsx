import React from 'react';

/**
 * Reusable badge component for displaying status, severity, and other categorical data
 * @param {string} type - The type of badge ('status', 'severity', 'condition', 'danger', 'custom')
 * @param {string} value - The value to display
 * @param {string} customClass - Optional custom className override
 */
function Badge({ type, value, customClass }) {
    const getBadgeClass = () => {
        if (customClass) return customClass;

        // Status badges (Active, Rescued, Resolved, Closed, etc.)
        if (type === 'status') {
            const statusClasses = {
                'Active': 'bg-danger-100 text-danger-700',
                'Rescued': 'bg-success-100 text-success-700',
                'Resolved': 'bg-success-100 text-success-700',
                'Closed': 'bg-gray-100 text-gray-700',
            };
            return statusClasses[value] || 'bg-gray-100 text-gray-700';
        }

        // Severity badges (Critical, High, Moderate, Low)
        if (type === 'severity') {
            const severityClasses = {
                'critical': 'bg-danger-600 text-white',
                'high': 'bg-warning-600 text-white',
                'moderate': 'bg-warning-400 text-white',
                'low': 'bg-success-600 text-white',
            };
            return severityClasses[value] || 'bg-gray-100 text-gray-700';
        }

        // Condition badges (Critical, Injured, Healthy, Unknown)
        if (type === 'condition') {
            const conditionClasses = {
                'critical': 'bg-danger-600 text-white',
                'injured': 'bg-warning-600 text-white',
                'healthy': 'bg-success-600 text-white',
                'unknown': 'bg-gray-500 text-white',
            };
            return conditionClasses[value?.toLowerCase()] || 'bg-gray-100 text-gray-700';
        }

        // Danger badge
        if (type === 'danger') {
            return 'bg-danger-600 text-white';
        }

        // Stock badges
        if (type === 'stock') {
            const stockClasses = {
                'adequate': 'bg-success-100 text-success-700',
                'low': 'bg-warning-100 text-warning-700',
                'critical': 'bg-danger-100 text-danger-700',
                'none': 'bg-gray-100 text-gray-700'
            };
            return stockClasses[value] || 'bg-gray-100 text-gray-700';
        }

        return 'bg-gray-100 text-gray-700';
    };

    return (
        <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${getBadgeClass()}`}>
            {value}
        </span>
    );
}

export default Badge;

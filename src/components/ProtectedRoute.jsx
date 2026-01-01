import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children, requireRole = null }) {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-600 border-t-transparent mb-4"></div>
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    // Not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Role-based access
    if (requireRole) {
        const userRole = profile?.role || 'public';

        // Admin can access everything
        if (userRole === 'admin') {
            return children;
        }

        // Check specific role requirements
        if (Array.isArray(requireRole)) {
            if (!requireRole.includes(userRole)) {
                return (
                    <div className="min-h-screen flex items-center justify-center px-4">
                        <div className="text-center max-w-md">
                            <div className="text-6xl mb-4">🔒</div>
                            <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                            <p className="text-gray-600 mb-4">
                                You don't have permission to access this page. This area is restricted to {requireRole.join(' or ')} users.
                            </p>
                            <button onClick={() => window.history.back()} className="btn-primary">
                                ← Go Back
                            </button>
                        </div>
                    </div>
                );
            }
        } else if (userRole !== requireRole) {
            return (
                <div className="min-h-screen flex items-center justify-center px-4">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
                        <p className="text-gray-600 mb-4">
                            You don't have permission to access this page. This area is restricted to {requireRole} users.
                        </p>
                        <button onClick={() => window.history.back()} className="btn-primary">
                            ← Go Back
                        </button>
                    </div>
                </div>
            );
        }
    }

    return children;
}

export default ProtectedRoute;

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { signIn, user } = useAuth();
    const navigate = useNavigate();

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            navigate('/admin', { replace: true });
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message);
            setLoading(false);
        }
        // Don't navigate here - let useEffect handle it when user is set
    };

    const fillTestCredentials = () => {
        setEmail('admin@disaster.lk');
        setPassword('admin123');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 flex items-center justify-center px-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">� Admin Portal</h1>
                    <p className="text-primary-100">Disaster Management System</p>
                </div>

                <div className="bg-white rounded-lg shadow-xl p-8">
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">Admin Sign In</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-danger-50 border-l-4 border-danger-500 rounded">
                            <p className="text-danger-800 text-sm">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="label-field">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="your@email.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="label-field">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50"
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">Test Credentials:</p>
                        <button
                            onClick={() => fillTestCredentials('admin')}
                            className="w-full px-3 py-2 bg-purple-100 text-purple-700 rounded text-sm font-medium hover:bg-purple-200"
                        >
                            👑 Fill Admin Credentials
                        </button>
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            Email: admin@disaster.lk | Password: admin123
                        </p>
                    </div>

                    <div className="mt-6 text-center">
                        <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                            ← Back to Home
                        </Link>
                    </div>
                </div>

                <div className="mt-6 text-center text-primary-100 text-sm">
                    <p>Emergency Hotline: 119 | 117</p>
                </div>
            </div>
        </div>
    );
}

export default Login;

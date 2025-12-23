import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ userType = 'reporter' }) {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    // Different navigation links for different user types
    const reporterLinks = [
        { path: '/report', label: 'Dashboard' },
        { path: '/missing-persons', label: 'Missing Person' },
        { path: '/disasters', label: 'Disaster' },
        { path: '/animal-rescue', label: 'Animal Rescue' },
        { path: '/emergency', label: 'Emergency Contacts' },
    ];

    const responderLinks = [
        { path: '/respond', label: 'Dashboard' },
        { path: '/missing-persons-list', label: 'Missing Persons' },
        { path: '/disasters-list', label: 'Disasters' },
        { path: '/animal-rescue-list', label: 'Animal Rescue' },
        { path: '/camps', label: 'Camps' },
        { path: '/volunteers', label: 'Volunteers' },
        { path: '/donations', label: 'Donations' },
    ];

    const navLinks = userType === 'reporter' ? reporterLinks : responderLinks;
    const navColor = userType === 'reporter' ? 'bg-danger-600' : 'bg-success-600';
    const navColorHover = userType === 'reporter' ? 'bg-danger-700' : 'bg-success-700';
    const navColorLight = userType === 'reporter' ? 'bg-danger-500' : 'bg-success-500';

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`${navColor} shadow-lg`}>
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    <Link to="/" className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                        {userType === 'reporter' ? '📢' : '🤝'}
                        <span className="hidden sm:inline">Disaster Management</span>
                        <span className="sm:hidden">DM SL</span>
                    </Link>

                    {/* User Type Badge */}
                    <div className="hidden lg:flex items-center gap-3">
                        <span className="text-white/80 text-sm">
                            {userType === 'reporter' ? 'Report Mode' : 'Respond Mode'}
                        </span>
                        <Link
                            to="/"
                            className="text-white/90 hover:text-white text-sm underline"
                        >
                            Switch
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden text-white focus:outline-none"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            {isOpen ? (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            ) : (
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            )}
                        </svg>
                    </button>

                    {/* Desktop menu */}
                    <div className="hidden md:flex space-x-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive(link.path)
                                        ? `${navColorHover} text-white`
                                        : `text-white/90 hover:${navColorLight} hover:text-white`
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </div>
                </div>

                {/* Mobile menu */}
                {isOpen && (
                    <div className="md:hidden pb-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-3 py-2 rounded-md text-base font-medium ${isActive(link.path)
                                        ? `${navColorHover} text-white`
                                        : `text-white/90 hover:${navColorLight} hover:text-white`
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Switch Mode */}
                        <Link
                            to="/"
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 mt-2 border-t border-white/20 text-white/80 text-sm"
                        >
                            ← Switch to {userType === 'reporter' ? 'Respond' : 'Report'} Mode
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

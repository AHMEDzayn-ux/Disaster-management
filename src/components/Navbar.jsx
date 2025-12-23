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
            <div className="px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo - Left aligned */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-xl md:text-2xl font-bold flex items-center gap-2">
                            {userType === 'reporter' ? '📢' : '🤝'}
                            <span className="hidden sm:inline">Disaster Management - {userType === 'reporter' ? 'Reporting' : 'Responding'}</span>
                            <span className="sm:hidden">DM SL</span>
                        </Link>
                    </div>

                    {/* Desktop menu - Right aligned */}
                    <div className="hidden md:flex items-center space-x-2 ml-auto">
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

                        {/* Mode Switcher */}
                        <div className="ml-4 pl-4 border-l border-white/30">
                            <Link
                                to={userType === 'reporter' ? '/respond' : '/report'}
                                className="px-3 py-2 rounded-md text-sm font-medium bg-white/20 hover:bg-white/30 text-white transition-colors flex items-center gap-2"
                            >
                                {userType === 'reporter' ? '🤝 Switch to Responder' : '📢 Switch to Reporter'}
                            </Link>
                        </div>
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

                        {/* Mobile Mode Switcher */}
                        <Link
                            to={userType === 'reporter' ? '/respond' : '/report'}
                            onClick={() => setIsOpen(false)}
                            className="block px-3 py-2 mt-4 pt-4 border-t border-white/20 rounded-md text-base font-medium bg-white/20 hover:bg-white/30 text-white"
                        >
                            {userType === 'reporter' ? '🤝 Switch to Responder' : '📢 Switch to Reporter'}
                        </Link>

                        {/* Mobile Home Link */}
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

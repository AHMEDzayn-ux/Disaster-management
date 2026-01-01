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

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`${navColor} shadow-lg`}>
            <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="flex items-center h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <Link to="/" className="text-white text-lg lg:text-xl font-bold flex items-center gap-2 hover:opacity-90 transition-opacity">
                            {userType === 'reporter' ? '📢' : '🤝'}
                            <div className="flex flex-col leading-tight">
                                <span className="hidden sm:inline text-sm font-semibold opacity-90">Sri Lanka</span>
                                <span className="hidden sm:inline">Disaster Management</span>
                            </div>
                            <span className="sm:hidden">DM SL</span>
                        </Link>
                    </div>

                    {/* Desktop menu and switcher - Right aligned */}
                    <div className="hidden lg:flex items-center gap-1 ml-auto">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive(link.path)
                                    ? 'bg-white/25 text-white shadow-sm'
                                    : 'text-white/90 hover:bg-white/15 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mode Switcher */}
                        <Link
                            to={userType === 'reporter' ? '/respond' : '/report'}
                            className="ml-2 px-4 py-2 rounded-lg text-sm font-medium bg-white text-gray-800 hover:bg-white/90 transition-all duration-200 shadow-md flex items-center gap-2"
                        >
                            {userType === 'reporter' ? (
                                <>
                                    <span>🤝</span>
                                    <span>Respond Mode</span>
                                </>
                            ) : (
                                <>
                                    <span>📢</span>
                                    <span>Report Mode</span>
                                </>
                            )}
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden ml-auto text-white focus:outline-none p-2 rounded-md hover:bg-white/10 transition-colors"
                        aria-label="Toggle menu"
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
                    <div className="lg:hidden py-3 space-y-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                onClick={() => setIsOpen(false)}
                                className={`block px-4 py-2.5 rounded-lg text-base font-medium transition-all ${isActive(link.path)
                                    ? 'bg-white/25 text-white'
                                    : 'text-white/90 hover:bg-white/15 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Mobile Mode Switcher */}
                        <div className="pt-3 mt-3 border-t border-white/20">
                            <Link
                                to={userType === 'reporter' ? '/respond' : '/report'}
                                onClick={() => setIsOpen(false)}
                                className="block px-4 py-2.5 rounded-lg text-base font-medium bg-white text-gray-800 hover:bg-white/90 transition-all"
                            >
                                {userType === 'reporter' ? '🤝 Respond Mode' : '📢 Report Mode'}
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}

export default Navbar;

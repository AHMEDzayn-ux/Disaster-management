import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const motivationalMessages = [
    {
        icon: '💝',
        message: 'Every dollar brings hope to a family in need',
        subtext: 'Your generosity makes a difference'
    },
    {
        icon: '🌟',
        message: 'Together, we are stronger than any disaster',
        subtext: 'United in compassion and action'
    },
    {
        icon: '🤝',
        message: 'Be the light in someone\'s darkest hour',
        subtext: 'Small acts create big waves of change'
    },
    {
        icon: '⚡',
        message: 'Emergency relief can\'t wait - act now',
        subtext: 'Time is critical, lives depend on your support'
    },
    {
        icon: '🏠',
        message: '$25 provides emergency supplies for one family',
        subtext: 'See the direct impact of your contribution'
    },
    {
        icon: '🍲',
        message: '$50 feeds a family for a week',
        subtext: 'Nourishment brings strength and hope'
    },
    {
        icon: '⛺',
        message: '$100 sets up a temporary shelter',
        subtext: 'Safety and security for those displaced'
    },
    {
        icon: '👥',
        message: 'Join thousands of heroes making a difference',
        subtext: 'Our community stands together in crisis'
    },
    {
        icon: '✨',
        message: '100% of your donation goes to relief efforts',
        subtext: 'Complete transparency, maximum impact'
    },
    {
        icon: '📊',
        message: 'Track exactly where your money goes',
        subtext: 'Real-time updates on fund distribution'
    },
    {
        icon: '🙏',
        message: 'Your generosity rebuilds lives',
        subtext: 'From emergency to recovery, you make it possible'
    },
    {
        icon: '💪',
        message: 'You\'re not alone - we rise together',
        subtext: 'Community strength in times of crisis'
    }
];

function DonationMotivation({ autoRotate = true, rotateInterval = 5000 }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        if (!autoRotate || isPaused) return;

        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % motivationalMessages.length);
        }, rotateInterval);

        return () => clearInterval(interval);
    }, [autoRotate, rotateInterval, isPaused]);

    const current = motivationalMessages[currentIndex];

    const handleNext = () => {
        setCurrentIndex((prev) => (prev + 1) % motivationalMessages.length);
    };

    const handlePrev = () => {
        setCurrentIndex((prev) =>
            prev === 0 ? motivationalMessages.length - 1 : prev - 1
        );
    };

    return (
        <div
            className="relative bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 shadow-lg border border-orange-100"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Navigation Arrows */}
            <button
                onClick={handlePrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                aria-label="Previous message"
            >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
            </button>

            <button
                onClick={handleNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all duration-200 hover:scale-110"
                aria-label="Next message"
            >
                <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>

            {/* Message Content */}
            <div className="text-center px-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                    >
                        {/* Icon */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                            className="text-5xl mb-3"
                        >
                            {current.icon}
                        </motion.div>

                        {/* Main Message */}
                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                            {current.message}
                        </h3>

                        {/* Subtext */}
                        <p className="text-gray-600 text-sm md:text-base">
                            {current.subtext}
                        </p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Dots */}
                <div className="flex justify-center gap-2 mt-4">
                    {motivationalMessages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                    ? 'w-8 bg-orange-500'
                                    : 'w-2 bg-orange-200 hover:bg-orange-300'
                                }`}
                            aria-label={`Go to message ${index + 1}`}
                        />
                    ))}
                </div>

                {/* Counter */}
                <div className="text-xs text-gray-500 mt-2">
                    {currentIndex + 1} / {motivationalMessages.length}
                </div>
            </div>

            {/* Pause indicator */}
            {isPaused && autoRotate && (
                <div className="absolute top-2 right-2 text-xs text-gray-500 bg-white/80 px-2 py-1 rounded">
                    Paused
                </div>
            )}
        </div>
    );
}

export default DonationMotivation;

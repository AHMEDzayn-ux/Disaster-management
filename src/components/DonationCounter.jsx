import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import { useDonationStore } from '../store/supabaseStore';

function DonationCounter({ goalAmount = 200000 }) {
    const { totalRaised, donationStats } = useDonationStore();
    const [previousTotal, setPreviousTotal] = useState(0);

    useEffect(() => {
        if (totalRaised > previousTotal) {
            setPreviousTotal(totalRaised);
        }
    }, [totalRaised]);

    const progressPercentage = Math.min((totalRaised / goalAmount) * 100, 100);
    const isGoalReached = totalRaised >= goalAmount;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-8 shadow-2xl"
        >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24"></div>

            {/* Content */}
            <div className="relative z-10">
                {/* Title */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-center mb-6"
                >
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        🎯 Together We've Raised
                    </h2>
                    <p className="text-blue-100 text-sm">
                        {donationStats.successfulCount} generous donors have contributed
                    </p>
                </motion.div>

                {/* Amount Counter */}
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                    className="text-center mb-6"
                >
                    <div className="text-5xl md:text-7xl font-extrabold text-white mb-2">
                        $<CountUp
                            start={previousTotal}
                            end={totalRaised}
                            duration={2.5}
                            separator=","
                            decimals={0}
                            decimal="."
                        />
                    </div>
                    {donationStats.avgDonation > 0 && (
                        <p className="text-blue-100 text-sm">
                            Average donation: ${donationStats.avgDonation.toFixed(2)}
                        </p>
                    )}
                </motion.div>

                {/* Progress Bar */}
                <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-white text-sm font-medium">
                            Progress to Goal
                        </span>
                        <span className="text-white text-sm font-bold">
                            {progressPercentage.toFixed(1)}%
                        </span>
                    </div>

                    <div className="relative h-4 bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 1.5, delay: 0.6, ease: 'easeOut' }}
                            className={`h-full rounded-full ${isGoalReached
                                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                                    : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                                }`}
                        >
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </motion.div>
                    </div>

                    <div className="flex justify-between items-center mt-2">
                        <span className="text-blue-100 text-xs">
                            ${totalRaised.toLocaleString()}
                        </span>
                        <span className="text-blue-100 text-xs">
                            Goal: ${goalAmount.toLocaleString()}
                        </span>
                    </div>
                </div>

                {/* Goal Status */}
                {isGoalReached ? (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                        className="text-center bg-green-500/20 border-2 border-green-400 rounded-lg p-3"
                    >
                        <p className="text-green-100 font-bold text-lg">
                            🎉 Goal Achieved! Thank you!
                        </p>
                        <p className="text-green-200 text-sm">
                            Your generosity is making a real difference
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-center bg-white/10 rounded-lg p-3"
                    >
                        <p className="text-white font-semibold">
                            ${(goalAmount - totalRaised).toLocaleString()} more needed
                        </p>
                        <p className="text-blue-100 text-sm">
                            to reach our relief goal
                        </p>
                    </motion.div>
                )}

                {/* Stats Row */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                    className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/20"
                >
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {donationStats.successfulCount}
                        </div>
                        <div className="text-xs text-blue-100">Donors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {donationStats.pendingCount}
                        </div>
                        <div className="text-xs text-blue-100">Pending</div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold text-white">
                            {donationStats.totalCount}
                        </div>
                        <div className="text-xs text-blue-100">Total</div>
                    </div>
                </motion.div>
            </div>

            {/* CSS for shimmer animation */}
            <style jsx>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </motion.div>
    );
}

export default DonationCounter;

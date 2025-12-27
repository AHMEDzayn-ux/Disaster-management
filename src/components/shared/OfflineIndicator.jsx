import { useState, useEffect } from 'react';
import { Wifi, WifiOff, Upload } from 'lucide-react';
import { isOnline, getPendingCount } from '../../utils/offlineManager';
import { syncAllPending } from '../../utils/syncHandler';

/**
 * Offline Indicator Component
 * Shows connection status and pending submission count
 */
export default function OfflineIndicator() {
    const [online, setOnline] = useState(isOnline());
    const [pendingCount, setPendingCount] = useState(0);
    const [syncing, setSyncing] = useState(false);

    useEffect(() => {
        // Update online status
        const updateOnlineStatus = () => {
            setOnline(isOnline());
            updatePendingCount();
        };

        // Update pending count
        const updatePendingCount = async () => {
            const count = await getPendingCount();
            setPendingCount(count);
        };

        // Listen for online/offline events
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);

        // Update count every 10 seconds
        const interval = setInterval(updatePendingCount, 10000);

        // Initial update
        updatePendingCount();

        return () => {
            window.removeEventListener('online', updateOnlineStatus);
            window.removeEventListener('offline', updateOnlineStatus);
            clearInterval(interval);
        };
    }, []);

    // Handle manual sync
    const handleManualSync = async () => {
        if (!online || syncing || pendingCount === 0) return;

        setSyncing(true);
        try {
            await syncAllPending();
            // Update count after sync
            const count = await getPendingCount();
            setPendingCount(count);
        } finally {
            setSyncing(false);
        }
    };

    // Don't show if online and no pending submissions
    if (online && pendingCount === 0) {
        return null;
    }

    return (
        <div className={`fixed bottom-4 right-4 z-50 flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg transition-all ${online ? 'bg-white border border-gray-200' : 'bg-red-500 text-white'
            }`}>
            {/* Connection Status */}
            <div className="flex items-center gap-2">
                {online ? (
                    <>
                        <Wifi className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Online</span>
                    </>
                ) : (
                    <>
                        <WifiOff className="w-4 h-4" />
                        <span className="text-sm font-medium">Offline</span>
                    </>
                )}
            </div>

            {/* Pending Submissions Count */}
            {pendingCount > 0 && (
                <>
                    <div className="w-px h-6 bg-gray-300" />
                    <div className="flex items-center gap-2">
                        <span className={`text-sm ${online ? 'text-gray-600' : 'text-white'}`}>
                            {pendingCount} pending
                        </span>

                        {/* Manual Sync Button */}
                        {online && !syncing && (
                            <button
                                onClick={handleManualSync}
                                className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-white bg-primary-500 rounded hover:bg-primary-600 transition-colors"
                                title="Upload pending submissions"
                            >
                                <Upload className="w-3 h-3" />
                                Sync
                            </button>
                        )}

                        {/* Syncing Indicator */}
                        {syncing && (
                            <div className="flex items-center gap-1 text-xs text-primary-500">
                                <div className="animate-spin rounded-full h-3 w-3 border-2 border-primary-500 border-t-transparent" />
                                Syncing...
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

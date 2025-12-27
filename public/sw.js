/**
 * Service Worker for Disaster Management App
 * Caches app shell and assets for offline use
 */

const CACHE_NAME = 'disaster-management-v1';
const RUNTIME_CACHE = 'disaster-management-runtime-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/App.jsx',
    '/src/index.css',
    '/src/App.css'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching static assets');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => self.skipWaiting())
            .catch((error) => {
                console.error('[SW] Failed to cache static assets:', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip cross-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    // Skip Supabase API requests (we want fresh data)
    if (url.hostname.includes('supabase')) {
        return;
    }

    event.respondWith(
        caches.match(request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    // Serve from cache
                    return cachedResponse;
                }

                // Fetch from network and cache
                return fetch(request)
                    .then((response) => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type === 'error') {
                            return response;
                        }

                        // Clone the response
                        const responseToCache = response.clone();

                        // Cache runtime assets
                        caches.open(RUNTIME_CACHE)
                            .then((cache) => {
                                cache.put(request, responseToCache);
                            });

                        return response;
                    })
                    .catch((error) => {
                        console.error('[SW] Fetch failed:', error);
                        
                        // Return offline page if available
                        return caches.match('/index.html');
                    });
            })
    );
});

// Background sync event - sync pending submissions
self.addEventListener('sync', (event) => {
    if (event.tag === 'sync-submissions') {
        console.log('[SW] Background sync triggered');
        
        event.waitUntil(
            // Notify all clients to trigger sync
            self.clients.matchAll()
                .then((clients) => {
                    clients.forEach((client) => {
                        client.postMessage({
                            type: 'BACKGROUND_SYNC',
                            message: 'Syncing offline submissions...'
                        });
                    });
                })
        );
    }
});

// Message event - handle messages from clients
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service worker loaded');

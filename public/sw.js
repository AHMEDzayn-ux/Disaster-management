/**
 * Service Worker for Disaster Management App
 * Caches app shell, assets, and images for better performance
 */

const CACHE_NAME = 'disaster-management-v2';
const RUNTIME_CACHE = 'disaster-management-runtime-v2';
const IMAGE_CACHE = 'disaster-management-images-v1';

// Assets to cache on install
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/src/main.jsx',
    '/src/App.jsx',
    '/src/index.css',
    '/src/App.css'
];

// Max age for cached images (7 days)
const IMAGE_CACHE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

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
    
    const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => !currentCaches.includes(name))
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// Helper: Check if request is for an image
const isImageRequest = (request) => {
    const url = new URL(request.url);
    return request.destination === 'image' || 
           /\.(jpg|jpeg|png|gif|webp|svg|ico)(\?.*)?$/i.test(url.pathname) ||
           url.hostname.includes('supabase') && url.pathname.includes('/storage/');
};

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Handle Supabase API requests (data) - always fetch fresh
    if (url.hostname.includes('supabase') && !url.pathname.includes('/storage/')) {
        return;
    }

    // Handle image requests with dedicated cache strategy
    if (isImageRequest(request)) {
        event.respondWith(
            caches.open(IMAGE_CACHE).then((cache) => {
                return cache.match(request).then((cachedResponse) => {
                    if (cachedResponse) {
                        // Return cached image immediately
                        // Also update cache in background (stale-while-revalidate)
                        fetch(request).then((networkResponse) => {
                            if (networkResponse && networkResponse.ok) {
                                cache.put(request, networkResponse.clone());
                            }
                        }).catch(() => {});
                        return cachedResponse;
                    }

                    // Fetch from network and cache
                    return fetch(request).then((networkResponse) => {
                        if (networkResponse && networkResponse.ok) {
                            cache.put(request, networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // Return placeholder for failed image loads
                        return new Response(
                            '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#e5e7eb" width="100" height="100"/><text x="50" y="50" text-anchor="middle" dy=".3em" fill="#9ca3af" font-size="12">No Image</text></svg>',
                            { headers: { 'Content-Type': 'image/svg+xml' } }
                        );
                    });
                });
            })
        );
        return;
    }

    // Skip cross-origin requests (except images handled above)
    if (url.origin !== location.origin) {
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

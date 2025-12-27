// Service Worker - Multiple Caching Strategy Examples
// This file demonstrates different caching strategies

const CACHE_VERSION = 'v1';
const CACHE_NAMES = {
  static: `static-${CACHE_VERSION}`,
  dynamic: `dynamic-${CACHE_VERSION}`,
  images: `images-${CACHE_VERSION}`,
  api: `api-${CACHE_VERSION}`
};

// Resources to cache immediately on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './offline.html'
];

// Current active strategy (can be changed via message)
let currentStrategy = 'cache-first';

// ============================================================================
// INSTALL EVENT - Cache static assets
// ============================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAMES.static)
      .then(cache => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting(); // Activate immediately
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// ============================================================================
// ACTIVATE EVENT - Clean up old caches
// ============================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');

  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Delete caches that don't match current version
            const isCurrentCache = Object.values(CACHE_NAMES).includes(cacheName);
            if (!isCurrentCache) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// ============================================================================
// FETCH EVENT - Handle requests with different strategies
// ============================================================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome extensions and other origins
  if (!url.pathname.startsWith('/') && url.origin !== location.origin) {
    return;
  }

  // Route to appropriate strategy based on request type
  if (url.pathname.includes('/api/')) {
    event.respondWith(networkFirstStrategy(request));
  } else if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, CACHE_NAMES.images));
  } else {
    // Use the currently selected strategy for demo purposes
    event.respondWith(routeToStrategy(request, currentStrategy));
  }
});

// ============================================================================
// STRATEGY 1: CACHE FIRST (Cache Falling Back to Network)
// Best for: Static assets, fonts, images
// ============================================================================
async function cacheFirstStrategy(request, cacheName = CACHE_NAMES.static) {
  try {
    // Try cache first
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('[SW] Cache hit:', request.url);
      return cachedResponse;
    }

    // Not in cache, fetch from network
    console.log('[SW] Cache miss, fetching:', request.url);
    const networkResponse = await fetch(request);

    // Cache the response for future use
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Cache first failed:', error);
    return getOfflineFallback(request);
  }
}

// ============================================================================
// STRATEGY 2: NETWORK FIRST (Network Falling Back to Cache)
// Best for: API calls, frequently updated content
// ============================================================================
async function networkFirstStrategy(request, cacheName = CACHE_NAMES.api) {
  try {
    console.log('[SW] Fetching from network:', request.url);
    const networkResponse = await fetch(request);

    // Cache successful responses
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
      console.log('[SW] Cached network response:', request.url);
    }

    return networkResponse;
  } catch (error) {
    // Network failed, try cache
    console.log('[SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      console.log('[SW] Serving from cache:', request.url);
      return cachedResponse;
    }

    console.error('[SW] Network first failed:', error);
    return getOfflineFallback(request);
  }
}

// ============================================================================
// STRATEGY 3: STALE WHILE REVALIDATE
// Best for: Frequently updated content that can be slightly stale
// ============================================================================
async function staleWhileRevalidateStrategy(request, cacheName = CACHE_NAMES.dynamic) {
  const cachedResponse = await caches.match(request);

  // Fetch fresh version in background
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse && networkResponse.status === 200) {
      const cache = caches.open(cacheName);
      cache.then(c => c.put(request, networkResponse.clone()));
      console.log('[SW] Updated cache in background:', request.url);
    }
    return networkResponse;
  }).catch(error => {
    console.error('[SW] Background fetch failed:', error);
    return cachedResponse; // Return cached version if fetch fails
  });

  // Return cached version immediately, or wait for network
  if (cachedResponse) {
    console.log('[SW] Serving cached, updating in background:', request.url);
    return cachedResponse;
  }

  console.log('[SW] No cache, waiting for network:', request.url);
  return fetchPromise;
}

// ============================================================================
// STRATEGY 4: NETWORK ONLY
// Best for: Always-fresh data, analytics
// ============================================================================
async function networkOnlyStrategy(request) {
  try {
    console.log('[SW] Network only:', request.url);
    return await fetch(request);
  } catch (error) {
    console.error('[SW] Network only failed:', error);
    return getOfflineFallback(request);
  }
}

// ============================================================================
// STRATEGY 5: CACHE ONLY
// Best for: Pre-cached resources that never change
// ============================================================================
async function cacheOnlyStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    console.log('[SW] Cache only hit:', request.url);
    return cachedResponse;
  }

  console.log('[SW] Cache only miss:', request.url);
  return getOfflineFallback(request);
}

// ============================================================================
// STRATEGY ROUTER - Route to different strategies for demo
// ============================================================================
function routeToStrategy(request, strategy) {
  switch (strategy) {
    case 'cache-first':
      return cacheFirstStrategy(request);
    case 'network-first':
      return networkFirstStrategy(request);
    case 'stale-while-revalidate':
      return staleWhileRevalidateStrategy(request);
    case 'network-only':
      return networkOnlyStrategy(request);
    case 'cache-only':
      return cacheOnlyStrategy(request);
    default:
      return cacheFirstStrategy(request);
  }
}

// ============================================================================
// OFFLINE FALLBACK - Provide fallback content when both cache and network fail
// ============================================================================
async function getOfflineFallback(request) {
  // For HTML pages, show offline page
  if (request.destination === 'document') {
    const offlinePage = await caches.match('./offline.html');
    return offlinePage || new Response('Offline - No cached content available', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' })
    });
  }

  // For images, return placeholder
  if (request.destination === 'image') {
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect fill="#ddd" width="200" height="200"/><text fill="#999" x="50%" y="50%" text-anchor="middle" dy=".3em">Offline</text></svg>',
      { headers: { 'Content-Type': 'image/svg+xml' } }
    );
  }

  // Generic fallback
  return new Response('Offline', { status: 503 });
}

// ============================================================================
// MESSAGE HANDLER - Receive messages from the page
// ============================================================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'CHANGE_STRATEGY') {
    currentStrategy = event.data.strategy;
    console.log('[SW] Strategy changed to:', currentStrategy);

    // Notify all clients
    self.clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'STRATEGY_CHANGED',
          strategy: currentStrategy
        });
      });
    });
  }

  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            console.log('[SW] Clearing cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        console.log('[SW] All caches cleared');
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({ type: 'CACHE_CLEARED' });
          });
        });
      })
    );
  }

  if (event.data.type === 'CACHE_URL') {
    const url = event.data.url;
    event.waitUntil(
      caches.open(CACHE_NAMES.dynamic).then(cache => {
        return fetch(url).then(response => {
          return cache.put(url, response);
        });
      }).then(() => {
        console.log('[SW] Cached URL:', url);
        event.ports[0].postMessage({ success: true });
      }).catch(error => {
        console.error('[SW] Failed to cache URL:', error);
        event.ports[0].postMessage({ success: false, error: error.message });
      })
    );
  }

  if (event.data.type === 'GET_CACHE_INFO') {
    event.waitUntil(
      getCacheInfo().then(info => {
        self.clients.matchAll().then(clients => {
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_INFO',
              info: info
            });
          });
        });
      })
    );
  }

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

// Get cache statistics
async function getCacheInfo() {
  const cacheNames = await caches.keys();
  const info = {
    count: cacheNames.length,
    names: cacheNames,
    entries: {}
  };

  for (const name of cacheNames) {
    const cache = await caches.open(name);
    const keys = await cache.keys();
    info.entries[name] = keys.length;
  }

  return info;
}

// ============================================================================
// BACKGROUND SYNC (if supported)
// ============================================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);

  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});

async function syncData() {
  try {
    console.log('[SW] Syncing data...');
    // Implement your sync logic here
    // For example, send queued data to server
    const response = await fetch('/api/sync', {
      method: 'POST',
      body: JSON.stringify({ timestamp: Date.now() })
    });

    if (response.ok) {
      console.log('[SW] Sync successful');
    }
  } catch (error) {
    console.error('[SW] Sync failed:', error);
    throw error; // Retry sync
  }
}

// ============================================================================
// PUSH NOTIFICATIONS (if supported)
// ============================================================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');

  let data = { title: 'Notification', body: 'You have a new notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: './icon-192.png',
    badge: './badge-72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      { action: 'explore', title: 'Explore' },
      { action: 'close', title: 'Close' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// ============================================================================
// PERIODIC BACKGROUND SYNC (if supported)
// ============================================================================
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync triggered:', event.tag);

  if (event.tag === 'update-content') {
    event.waitUntil(updateContent());
  }
});

async function updateContent() {
  try {
    console.log('[SW] Updating content...');
    // Fetch and cache fresh content
    const response = await fetch('/api/latest-content');
    const cache = await caches.open(CACHE_NAMES.dynamic);
    await cache.put('/api/latest-content', response);
    console.log('[SW] Content updated');
  } catch (error) {
    console.error('[SW] Content update failed:', error);
  }
}

// ============================================================================
// Log Service Worker status
// ============================================================================
console.log('[SW] Service Worker script loaded');
console.log('[SW] Available strategies:', [
  'cache-first',
  'network-first',
  'stale-while-revalidate',
  'network-only',
  'cache-only'
]);

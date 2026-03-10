// ===========================================================================
// Background Sync API Demo - Service Worker
// ===========================================================================

const CACHE_NAME = 'bg-sync-demo-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './script.js'
];

// ===========================================================================
// Install Event - Cache Core Assets
// ===========================================================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching core assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Installed successfully');
        return self.skipWaiting();
      })
  );
});

// ===========================================================================
// Activate Event - Clean Old Caches
// ===========================================================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ]).then(() => {
      console.log('[SW] Activated and controlling all pages');
      // Notify all clients that the SW is ready
      return notifyAllClients({ type: 'SW_ACTIVATED' });
    })
  );
});

// ===========================================================================
// Fetch Event - Serve from Cache When Offline
// ===========================================================================
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          // Cache successful responses
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
      .catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

// ===========================================================================
// Background Sync Event - One-Time Sync
// ===========================================================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background Sync event fired! Tag:', event.tag);
  console.log('[SW] Last chance:', event.lastChance);

  if (event.tag === 'sync-messages') {
    event.waitUntil(syncPendingMessages(event));
  }

  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData(event));
  }

  if (event.tag === 'sync-analytics') {
    event.waitUntil(syncAnalytics(event));
  }
});

// ===========================================================================
// Periodic Background Sync Event
// ===========================================================================
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync event fired! Tag:', event.tag);

  if (event.tag === 'periodic-content-refresh') {
    event.waitUntil(periodicContentRefresh());
  }
});

// ===========================================================================
// Sync Handler: Messages
// ===========================================================================
async function syncPendingMessages(event) {
  console.log('[SW] Syncing pending messages...');

  try {
    const pending = await getFromIndexedDB('pending-messages');

    if (!pending || pending.length === 0) {
      console.log('[SW] No pending messages to sync');
      await notifyAllClients({
        type: 'SYNC_COMPLETE',
        tag: 'sync-messages',
        synced: 0
      });
      return;
    }

    console.log(`[SW] Found ${pending.length} pending messages`);

    let synced = 0;
    const failures = [];

    for (const item of pending) {
      try {
        // Simulate API call (in a real app, this would be a real endpoint)
        await simulateNetworkRequest(item);
        await removeFromIndexedDB('pending-messages', item.id);
        synced++;
        console.log(`[SW] Message synced: ${item.id}`);
      } catch (error) {
        failures.push(item.id);
        console.error(`[SW] Failed to sync message ${item.id}:`, error);
      }
    }

    // Notify page of results
    await notifyAllClients({
      type: 'SYNC_COMPLETE',
      tag: 'sync-messages',
      synced,
      failures: failures.length,
      lastChance: event.lastChance
    });

    // If some failed and it's not the last chance, throw to trigger retry
    if (failures.length > 0 && !event.lastChance) {
      throw new Error(`${failures.length} messages failed, will retry`);
    }

    // If last chance and still failures, notify user
    if (failures.length > 0 && event.lastChance) {
      console.log('[SW] Last chance reached, some messages could not be synced');
      await notifyAllClients({
        type: 'SYNC_FAILED_FINAL',
        tag: 'sync-messages',
        failures: failures.length
      });
    }

  } catch (error) {
    console.error('[SW] Sync messages failed:', error);

    await notifyAllClients({
      type: 'SYNC_ERROR',
      tag: 'sync-messages',
      error: error.message,
      lastChance: event.lastChance
    });

    if (!event.lastChance) {
      throw error; // Re-throw to trigger retry
    }
  }
}

// ===========================================================================
// Sync Handler: Form Data
// ===========================================================================
async function syncFormData(event) {
  console.log('[SW] Syncing pending form data...');

  try {
    const pending = await getFromIndexedDB('pending-forms');

    if (!pending || pending.length === 0) {
      console.log('[SW] No pending form data to sync');
      return;
    }

    for (const form of pending) {
      await simulateNetworkRequest(form);
      await removeFromIndexedDB('pending-forms', form.id);
    }

    await notifyAllClients({
      type: 'SYNC_COMPLETE',
      tag: 'sync-form-data',
      synced: pending.length
    });

  } catch (error) {
    console.error('[SW] Sync form data failed:', error);
    if (!event.lastChance) throw error;
  }
}

// ===========================================================================
// Sync Handler: Analytics
// ===========================================================================
async function syncAnalytics(event) {
  console.log('[SW] Syncing analytics...');

  try {
    const events = await getFromIndexedDB('pending-analytics');

    if (!events || events.length === 0) return;

    // Batch send analytics
    await simulateNetworkRequest({ batch: events });

    // Remove all synced events
    for (const e of events) {
      await removeFromIndexedDB('pending-analytics', e.id);
    }

    console.log(`[SW] Synced ${events.length} analytics events`);

  } catch (error) {
    console.error('[SW] Sync analytics failed:', error);
    if (!event.lastChance) throw error;
  }
}

// ===========================================================================
// Periodic Sync Handler: Content Refresh
// ===========================================================================
async function periodicContentRefresh() {
  console.log('[SW] Periodic content refresh running...');

  try {
    // In a real app, this would fetch fresh content from your API
    const timestamp = new Date().toISOString();

    // Update the cache with fresh content timestamp
    const cache = await caches.open(CACHE_NAME);
    const refreshData = JSON.stringify({
      lastRefreshed: timestamp,
      message: 'Content refreshed by periodic background sync'
    });

    await cache.put(
      '/periodic-sync-data',
      new Response(refreshData, {
        headers: { 'Content-Type': 'application/json' }
      })
    );

    // Notify all open tabs
    await notifyAllClients({
      type: 'PERIODIC_SYNC_COMPLETE',
      timestamp
    });

    console.log('[SW] Periodic content refresh complete:', timestamp);

  } catch (error) {
    console.error('[SW] Periodic sync failed:', error);
    throw error;
  }
}

// ===========================================================================
// IndexedDB Helpers
// ===========================================================================
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BGSyncDemoDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      const stores = [
        'pending-messages',
        'pending-forms',
        'pending-analytics'
      ];

      stores.forEach(storeName => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, {
            keyPath: 'id',
            autoIncrement: false
          });
        }
      });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getFromIndexedDB(storeName) {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removeFromIndexedDB(storeName, id) {
  const db = await openSyncDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// ===========================================================================
// Utility: Notify All Open Clients
// ===========================================================================
async function notifyAllClients(message) {
  const clients = await self.clients.matchAll({
    includeUncontrolled: true,
    type: 'window'
  });

  clients.forEach(client => {
    client.postMessage(message);
  });
}

// ===========================================================================
// Utility: Simulate Network Request (for demo purposes)
// ===========================================================================
function simulateNetworkRequest(data) {
  return new Promise((resolve, reject) => {
    // Simulate a Network delay of 300-800ms
    const delay = Math.random() * 500 + 300;

    setTimeout(() => {
      // 90% success rate for simulation
      if (Math.random() > 0.1) {
        console.log('[SW] Simulated request success for:', data.id || 'batch');
        resolve({ success: true, id: data.id });
      } else {
        console.log('[SW] Simulated request failed for:', data.id);
        reject(new Error('Simulated Network error'));
      }
    }, delay);
  });
}

// ===========================================================================
// Message Handler (from page)
// ===========================================================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);

  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data.type === 'GET_SYNC_STATUS') {
    event.ports[0].postMessage({
      type: 'SYNC_STATUS',
      cacheVersion: CACHE_NAME
    });
  }
});

console.log('[SW] Service Worker for Background Sync Demo loaded');

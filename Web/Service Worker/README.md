# 🔧 Service Worker - Complete Guide

## 📚 Table of Contents
- [Introduction](#introduction)
- [What Problem Does It Solve?](#what-problem-does-it-solve)
- [How It Works](#how-it-works)
- [Core Concepts](#core-concepts)
- [Service Worker Lifecycle](#service-worker-lifecycle)
- [Basic Usage](#basic-usage)
- [Caching Strategies](#caching-strategies)
- [Advanced Features](#advanced-features)
- [Real-World Use Cases](#real-world-use-cases)
- [Browser Support](#browser-support)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)

---

## 🌟 Introduction

A **Service Worker** is a JavaScript file that runs in the background, separate from your web page. It acts as a programmable network proxy, allowing you to control how network requests from your page are handled. Think of it as a powerful middleman between your web application, the browser, and the network.

### Why Is This Important?

Service Workers enable web applications to:
- **Work offline** - Cache resources and serve them when there's no network
- **Load faster** - Serve cached content instantly
- **Receive push notifications** - Even when the app isn't open
- **Sync in the background** - Update data when connectivity is restored
- **Intercept and modify requests** - Control all network traffic
- **Progressive Web Apps (PWAs)** - Build app-like experiences on the web

Service Workers are the foundation of modern Progressive Web Apps (PWAs) and essential for creating reliable, fast, and engaging web experiences.

---

## ❓ What Problem Does It Solve?

### The Problems Before Service Workers

**1. No Offline Support**
```javascript
// Traditional web app
fetch('/api/data')
  .then(response => response.json())
  .then(data => displayData(data))
  .catch(error => {
    // User sees error when offline - terrible UX!
    showError("No internet connection");
  });
```

**2. Slow Repeat Visits**
- Every visit re-downloads all assets
- No control over caching behavior
- Browser cache is unreliable and limited

**3. No Background Capabilities**
- Can't receive notifications when app is closed
- Can't sync data in the background
- No way to update content proactively

**4. No Network Control**
- Can't intercept or modify requests
- Can't implement custom caching logic
- Limited offline strategies

### The Service Worker Solution

```javascript
// With Service Worker - Works offline!
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Serve cached version if available
        if (cachedResponse) {
          return cachedResponse;
        }
        // Otherwise fetch from network
        return fetch(event.request);
      })
  );
});
```

**Benefits:**
- Complete offline functionality
- Instant page loads from cache
- Background sync and notifications
- Full control over network requests
- Reliable performance regardless of network quality

---

## ⚙️ How It Works

Service Workers operate on a separate thread from your main JavaScript. Here's the architecture:

```
┌─────────────────────────────────────────┐
│         Web Page (Client)               │
│  ┌───────────────────────────────┐      │
│  │   HTML + CSS + JavaScript     │      │
│  └───────────────────────────────┘      │
│              ↕                          │
│  ┌───────────────────────────────┐      │
│  │    Service Worker (Proxy)     │      │
│  │  • Intercepts requests        │      │
│  │  • Manages cache              │      │
│  │  • Handles offline            │      │
│  └───────────────────────────────┘      │
│              ↕                          │
└─────────────────────────────────────────┘
               ↕
    ┌──────────────────────┐
    │   Cache Storage      │
    └──────────────────────┘
               ↕
    ┌──────────────────────┐
    │   Network/Server     │
    └──────────────────────┘
```

### Key Characteristics

1. **Runs on a separate thread** - Doesn't block your main page
2. **Cannot access DOM directly** - Communicates via messages
3. **Programmable network proxy** - Intercepts all network requests
4. **Event-driven** - Wakes up when needed, sleeps when idle
5. **HTTPS only** (or localhost) - For security
6. **Promises-based** - All APIs use Promises

---

## 🎯 Core Concepts

### 1. Registration

Before a Service Worker can work, it must be registered from your main JavaScript:

```javascript
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('Service Worker registered:', registration);
    })
    .catch(error => {
      console.log('Registration failed:', error);
    });
}
```

### 2. Scope

The Service Worker's scope determines which pages it controls:

```javascript
// Controls all pages under /app/
navigator.serviceWorker.register('/sw.js', { scope: '/app/' });

// Controls all pages on the origin (default)
navigator.serviceWorker.register('/sw.js');
```

**Rule:** A Service Worker can only control pages at or below its scope.

### 3. Events

Service Workers are event-driven. Key events:

- **install** - When the Service Worker is first installed
- **activate** - When the Service Worker becomes active
- **fetch** - When a network request is made
- **message** - When a message is received from the page
- **sync** - When background sync is triggered
- **push** - When a push notification is received

### 4. Cache Storage

A separate cache API for storing Request/Response pairs:

```javascript
// Open a cache
caches.open('my-cache-v1').then(cache => {
  // Add resources to cache
  cache.addAll(['/index.html', '/styles.css', '/app.js']);
});
```

### 5. Update Mechanism

Service Workers update automatically when the browser detects a byte difference in the Service Worker file.

---

## 🔄 Service Worker Lifecycle

Understanding the lifecycle is crucial for working with Service Workers.

### Phase 1: Installation

When a Service Worker is first registered or updated:

```javascript
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');

  event.waitUntil(
    caches.open('my-cache-v1').then(cache => {
      return cache.addAll([
        '/',
        '/index.html',
        '/styles.css',
        '/app.js',
        '/offline.html'
      ]);
    })
  );
});
```

**What happens:**
- Service Worker downloads
- `install` event fires
- Cache essential resources
- If successful, moves to "installed" state
- If fails, discards and tries again next time

### Phase 2: Waiting

New Service Worker waits until no pages are using the old one:

```javascript
self.addEventListener('install', (event) => {
  // Skip waiting to activate immediately
  self.skipWaiting();

  event.waitUntil(
    // Cache resources...
  );
});
```

### Phase 3: Activation

When the new Service Worker takes control:

```javascript
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Delete old caches
          if (cacheName !== 'my-cache-v1') {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Take control of all pages immediately
  return self.clients.claim();
});
```

**What happens:**
- Old Service Worker is replaced
- `activate` event fires
- Clean up old caches
- Service Worker now controls pages

### Phase 4: Active

Service Worker is now running and handling events:

```javascript
self.addEventListener('fetch', (event) => {
  // Handle requests
});
```

### Lifecycle Diagram

```
   Register
      ↓
  Installing ──→ [Failed] ──→ Terminated
      ↓
  Installed
      ↓
   Waiting (if old SW exists)
      ↓
  Activating
      ↓
   Activated
      ↓
     Idle ←──→ Active (handling events)
      ↓
  Terminated (to save memory)
```

---

## 🚀 Basic Usage

### Step 1: Create Your Service Worker File (`sw.js`)

```javascript
// sw.js
const CACHE_NAME = 'my-app-v1';
const urlsToCache = [
  '/',
  '/styles.css',
  '/app.js',
  '/images/logo.png'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

### Step 2: Register the Service Worker in Your HTML

```html
<!DOCTYPE html>
<html>
<head>
  <title>My PWA</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <h1>My Progressive Web App</h1>

  <script>
    // Check if Service Workers are supported
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered:', registration);
          })
          .catch(error => {
            console.log('SW registration failed:', error);
          });
      });
    }
  </script>
  <script src="app.js"></script>
</body>
</html>
```

### Step 3: Test Your Service Worker

1. Open your site in a browser (must be HTTPS or localhost)
2. Open DevTools → Application → Service Workers
3. Verify the Service Worker is registered and activated
4. Go offline (DevTools → Network → Offline)
5. Refresh the page - it should still load!

---

## 💾 Caching Strategies

Different strategies for different use cases:

### 1. Cache First (Cache Falling Back to Network)

**Best for:** Static assets that rarely change (CSS, JS, images)

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached version or fetch from network
        return cachedResponse || fetch(event.request);
      })
  );
});
```

**Flow:**
```
Request → Check Cache → Found? Return : Fetch from Network
```

**Pros:** Fastest possible response, works offline
**Cons:** May serve stale content

---

### 2. Network First (Network Falling Back to Cache)

**Best for:** Dynamic content, API calls, frequently updated data

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Update cache with fresh content
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      })
      .catch(() => {
        // Network failed, try cache
        return caches.match(event.request);
      })
  );
});
```

**Flow:**
```
Request → Fetch from Network → Success? Return & Update Cache : Return Cached
```

**Pros:** Always fresh content when online
**Cons:** Slower, requires network

---

### 3. Stale While Revalidate

**Best for:** Balance between speed and freshness (news feeds, social media)

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Update cache in background
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // Return cached immediately, update in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});
```

**Flow:**
```
Request → Return Cached (if exists) → Fetch & Update Cache in Background
```

**Pros:** Fast response + always updating
**Cons:** May serve stale content briefly

---

### 4. Cache Only

**Best for:** Pre-cached resources that never change

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
  );
});
```

**Flow:**
```
Request → Return Cached or Fail
```

**Pros:** Fastest, predictable
**Cons:** Only works for pre-cached resources

---

### 5. Network Only

**Best for:** Real-time data, analytics, non-GET requests

```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
  );
});
```

**Flow:**
```
Request → Fetch from Network
```

**Pros:** Always fresh
**Cons:** Fails when offline

---

### 6. Cache Then Network (Advanced)

**Best for:** Showing cached content immediately while updating

**Service Worker:**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        return response;
      });
    })
  );
});
```

**Page JavaScript:**
```javascript
// Show cached content immediately
caches.match('/api/data').then(response => {
  if (response) {
    response.json().then(data => updateUI(data));
  }
});

// Fetch fresh content
fetch('/api/data')
  .then(response => response.json())
  .then(data => updateUI(data));
```

**Flow:**
```
Request → Return Cached → Fetch & Display Fresh Content
```

---

### Strategy Selection Guide

| Content Type | Strategy | Reason |
|--------------|----------|--------|
| App Shell (HTML, CSS, JS) | Cache First | Speed, offline |
| User-generated content | Network First | Freshness |
| News feeds | Stale While Revalidate | Balance |
| Static images | Cache First | Performance |
| API calls | Network First | Fresh data |
| Analytics | Network Only | Accuracy |

---

## 🔥 Advanced Features

### 1. Background Sync

Sync data when connectivity is restored:

```javascript
// In your page
navigator.serviceWorker.ready.then(registration => {
  return registration.sync.register('sync-messages');
});

// In Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      sendMessagesToServer()
        .then(() => console.log('Sync complete'))
        .catch(() => console.log('Sync failed'))
    );
  }
});

function sendMessagesToServer() {
  // Get pending messages from IndexedDB
  // Send to server
  return fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify(pendingMessages)
  });
}
```

---

### 2. Push Notifications

Receive notifications even when app is closed:

**Request Permission:**
```javascript
// In your page
Notification.requestPermission().then(permission => {
  if (permission === 'granted') {
    console.log('Notification permission granted');
    subscribeUserToPush();
  }
});

function subscribeUserToPush() {
  navigator.serviceWorker.ready.then(registration => {
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    }).then(subscription => {
      // Send subscription to server
      fetch('/api/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' }
      });
    });
  });
}
```

**Handle Push:**
```javascript
// In Service Worker
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/images/icon.png',
    badge: '/images/badge.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
```

---

### 3. Message Communication

Communicate between page and Service Worker:

**From Page to Service Worker:**
```javascript
// In your page
navigator.serviceWorker.controller.postMessage({
  type: 'CACHE_URLS',
  urls: ['/new-page.html', '/new-image.jpg']
});
```

**In Service Worker:**
```javascript
self.addEventListener('message', (event) => {
  if (event.data.type === 'CACHE_URLS') {
    caches.open(CACHE_NAME).then(cache => {
      cache.addAll(event.data.urls);
    });
  }
});
```

**From Service Worker to Page:**
```javascript
// In Service Worker
self.clients.matchAll().then(clients => {
  clients.forEach(client => {
    client.postMessage({
      type: 'UPDATE_AVAILABLE',
      message: 'New content available!'
    });
  });
});

// In Page
navigator.serviceWorker.addEventListener('message', (event) => {
  if (event.data.type === 'UPDATE_AVAILABLE') {
    showUpdateNotification(event.data.message);
  }
});
```

---

### 4. Advanced Caching Patterns

**Cache with Expiration:**
```javascript
const CACHE_NAME = 'my-cache-v1';
const MAX_AGE = 24 * 60 * 60 * 1000; // 24 hours

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          const cachedDate = new Date(cachedResponse.headers.get('date'));
          const now = new Date();

          // Check if cache is expired
          if (now - cachedDate < MAX_AGE) {
            return cachedResponse;
          }
        }

        // Fetch fresh content
        return fetch(event.request).then(networkResponse => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      });
    })
  );
});
```

**Selective Caching:**
```javascript
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Cache same-origin requests only
  if (url.origin === location.origin) {
    event.respondWith(cacheFirstStrategy(event.request));
  } else {
    // External resources - network only
    event.respondWith(fetch(event.request));
  }
});

// Cache images differently
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(event.request));
  } else if (event.request.destination === 'document') {
    event.respondWith(networkFirstStrategy(event.request));
  }
});
```

---

### 5. Precaching and Runtime Caching

**Precache Critical Resources:**
```javascript
const PRECACHE_URLS = [
  '/',
  '/styles.css',
  '/app.js',
  '/offline.html'
];

const RUNTIME_CACHE = 'runtime-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
  );
});
```

**Cache at Runtime:**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        // Don't cache non-successful responses
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }

        // Clone response before caching
        const responseToCache = networkResponse.clone();

        caches.open(RUNTIME_CACHE).then(cache => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      });
    })
  );
});
```

---

### 6. Workbox Library (Google's Service Worker Library)

Instead of writing everything manually, use Workbox:

```javascript
// Import Workbox
importScripts('https://storage.googleapis.com/workbox-cdn/releases/6.5.4/workbox-sw.js');

// Precache
workbox.precaching.precacheAndRoute([
  { url: '/index.html', revision: '1' },
  { url: '/styles.css', revision: '1' },
  { url: '/app.js', revision: '1' }
]);

// Caching strategies made easy
workbox.routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new workbox.strategies.CacheFirst({
    cacheName: 'images',
    plugins: [
      new workbox.expiration.ExpirationPlugin({
        maxEntries: 60,
        maxAgeSeconds: 30 * 24 * 60 * 60 // 30 days
      })
    ]
  })
);

workbox.routing.registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new workbox.strategies.NetworkFirst({
    cacheName: 'api-cache'
  })
);
```

---

## 💼 Real-World Use Cases

### Use Case 1: Offline-First Blog

**Goal:** Users can read articles offline

```javascript
// sw.js
const CACHE_NAME = 'blog-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/app.js',
        '/offline.html',
        '/images/logo.png'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Serve from cache, fetch and cache in background
      const fetchPromise = fetch(event.request)
        .then(networkResponse => {
          // Only cache successful responses
          if (networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If both cache and network fail, show offline page
          if (event.request.destination === 'document') {
            return caches.match('/offline.html');
          }
        });

      return cachedResponse || fetchPromise;
    })
  );
});
```

---

### Use Case 2: E-commerce with Background Sync

**Goal:** Allow users to add items to cart offline, sync when online

```javascript
// In page - add to cart
addToCartButton.addEventListener('click', async () => {
  const item = { id: 123, name: 'Product', price: 29.99 };

  // Save to IndexedDB
  await saveToIndexedDB('pending-cart-items', item);

  // Register background sync
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-cart');

  showNotification('Item will be added when online');
});

// In Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartItems());
  }
});

async function syncCartItems() {
  const items = await getFromIndexedDB('pending-cart-items');

  for (const item of items) {
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        body: JSON.stringify(item),
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        await removeFromIndexedDB('pending-cart-items', item.id);
      }
    } catch (error) {
      // Will retry on next sync
      throw error;
    }
  }
}
```

---

### Use Case 3: News App with Push Notifications

**Goal:** Send breaking news to users

```javascript
// Subscribe to push
async function subscribeToPush() {
  const registration = await navigator.serviceWorker.ready;

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: PUBLIC_VAPID_KEY
  });

  // Send subscription to server
  await fetch('/api/push-subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: { 'Content-Type': 'application/json' }
  });
}

// In Service Worker - receive push
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/images/news-icon.png',
    badge: '/images/badge.png',
    tag: 'breaking-news',
    requireInteraction: true,
    actions: [
      { action: 'read', title: 'Read Now' },
      { action: 'dismiss', title: 'Dismiss' }
    ],
    data: {
      articleUrl: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'read') {
    event.waitUntil(
      clients.openWindow(event.notification.data.articleUrl)
    );
  }
});
```

---

### Use Case 4: Progressive Image Loading

**Goal:** Show low-quality images immediately, upgrade to high-quality

```javascript
// In Service Worker
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Handle image requests
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        // Check for low-quality version
        const lowQualityUrl = url.pathname.replace(/\.jpg$/, '-low.jpg');

        return caches.match(lowQualityUrl).then(lowQualityResponse => {
          // Fetch high-quality in background
          const fetchPromise = fetch(event.request).then(networkResponse => {
            const responseToCache = networkResponse.clone();
            caches.open('images-v1').then(cache => {
              cache.put(event.request, responseToCache);
            });
            return networkResponse;
          });

          // Return low-quality immediately or wait for high-quality
          return lowQualityResponse || fetchPromise;
        });
      })
    );
  }
});
```

---

### Use Case 5: Analytics Queue

**Goal:** Queue analytics events offline, send when online

```javascript
// In page
function trackEvent(eventName, eventData) {
  if (navigator.onLine) {
    sendAnalytics(eventName, eventData);
  } else {
    // Queue for later
    queueAnalytics(eventName, eventData);
  }
}

async function queueAnalytics(eventName, eventData) {
  await saveToIndexedDB('analytics-queue', {
    event: eventName,
    data: eventData,
    timestamp: Date.now()
  });

  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-analytics');
}

// In Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-analytics') {
    event.waitUntil(sendQueuedAnalytics());
  }
});

async function sendQueuedAnalytics() {
  const events = await getFromIndexedDB('analytics-queue');

  for (const event of events) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(event),
        headers: { 'Content-Type': 'application/json' }
      });

      await removeFromIndexedDB('analytics-queue', event.id);
    } catch (error) {
      // Retry next time
      throw error;
    }
  }
}
```

---

### Use Case 6: App Shell Architecture

**Goal:** Instant loading of app structure, dynamic content loads separately

```javascript
// sw.js
const APP_SHELL = [
  '/',
  '/index.html',
  '/styles/app.css',
  '/js/app.js',
  '/images/logo.png',
  '/fonts/main.woff2'
];

const CACHE_NAME = 'app-shell-v1';
const DATA_CACHE = 'app-data-v1';

// Install - cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// Fetch - different strategies for shell vs data
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // App shell - cache first
  if (APP_SHELL.includes(url.pathname)) {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    );
    return;
  }

  // API data - network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const responseToCache = response.clone();
          caches.open(DATA_CACHE).then(cache => {
            cache.put(event.request, responseToCache);
          });
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Everything else - network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
```

---

## 🌐 Browser Support

### Current Support (as of 2025)

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 40+ | ✅ Full |
| Edge | 17+ | ✅ Full |
| Firefox | 44+ | ✅ Full |
| Safari | 11.1+ | ✅ Full |
| Opera | 27+ | ✅ Full |
| Samsung Internet | 4.0+ | ✅ Full |

**Support:** ~95% of all users globally

### Feature Detection

Always check for support:

```javascript
if ('serviceWorker' in navigator) {
  // Service Workers supported
  navigator.serviceWorker.register('/sw.js');
} else {
  console.log('Service Workers not supported');
  // Provide fallback experience
}

// Check for specific features
if ('sync' in registration) {
  // Background Sync supported
}

if ('pushManager' in registration) {
  // Push Notifications supported
}
```

### HTTPS Requirement

Service Workers require HTTPS (except for localhost):

```javascript
// Works on:
// ✅ https://example.com
// ✅ http://localhost
// ✅ http://127.0.0.1

// Doesn't work on:
// ❌ http://example.com
```

---

## ✅ Best Practices

### 1. Version Your Caches

**❌ Bad:**
```javascript
const CACHE_NAME = 'my-cache'; // Never changes
```

**✅ Good:**
```javascript
const CACHE_NAME = 'my-cache-v2'; // Version number

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

---

### 2. Use waitUntil for Async Operations

**❌ Bad:**
```javascript
self.addEventListener('install', (event) => {
  // May not complete before worker is terminated
  caches.open(CACHE_NAME).then(cache => {
    cache.addAll(urls);
  });
});
```

**✅ Good:**
```javascript
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urls);
    })
  );
});
```

---

### 3. Don't Cache Everything

**❌ Bad:**
```javascript
// Caches all requests indiscriminately
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        return response;
      });
    })
  );
});
```

**✅ Good:**
```javascript
// Selective caching
self.addEventListener('fetch', (event) => {
  // Only cache GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Don't cache analytics
  if (event.request.url.includes('/analytics')) {
    return;
  }

  // Cache same-origin only
  const url = new URL(event.request.url);
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(cacheStrategy(event.request));
});
```

---

### 4. Handle Failed Requests Gracefully

**❌ Bad:**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request) // Fails when offline
  );
});
```

**✅ Good:**
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // Provide fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html');
        }
        if (event.request.destination === 'image') {
          return caches.match('/images/offline.svg');
        }
      })
  );
});
```

---

### 5. Clean Up Old Caches

```javascript
self.addEventListener('activate', (event) => {
  const currentCaches = ['v1-assets', 'v1-data'];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!currentCaches.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

---

### 6. Use Cache Busting for Updates

**❌ Bad:**
```javascript
cache.addAll(['/app.js']); // Same URL, may not update
```

**✅ Good:**
```javascript
// Add version or hash to filenames
cache.addAll(['/app.js?v=2']);

// Or use build tools to generate:
cache.addAll(['/app.abc123.js']);
```

---

### 7. Test Thoroughly

```javascript
// Test different scenarios
// 1. First install
// 2. Update
// 3. Offline mode
// 4. Flaky network
// 5. Cache quota exceeded

// Use Chrome DevTools:
// - Application > Service Workers (inspect, unregister, update)
// - Application > Cache Storage (view cached resources)
// - Network > Offline (test offline mode)
// - Network > Throttling (test slow connections)
```

---

### 8. Limit Cache Size

```javascript
async function limitCacheSize(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();

  if (keys.length > maxItems) {
    // Delete oldest items
    await cache.delete(keys[0]);
    await limitCacheSize(cacheName, maxItems);
  }
}

// Use after caching
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.open('images').then(cache => {
      return fetch(event.request).then(response => {
        cache.put(event.request, response.clone());
        limitCacheSize('images', 50); // Keep only 50 images
        return response;
      });
    })
  );
});
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Update Cache Version

**Problem:** Users stuck with old cached content

```javascript
// BAD - Never updates
const CACHE_NAME = 'my-cache-v1';

// After deploy, cache never updates!
```

**Solution:**
```javascript
// Update version on each deploy
const CACHE_NAME = 'my-cache-v2'; // Increment this!
```

---

### 2. Caching Opaque Responses

**Problem:** Third-party requests with no-cors

```javascript
// Problem: Opaque responses take up more cache quota
fetch('https://example.com/api', { mode: 'no-cors' })
  .then(response => {
    // response.status = 0
    // Can't read response body
    cache.put(request, response); // Uses ~7MB of cache!
  });
```

**Solution:**
```javascript
// Only cache successful responses
fetch(request).then(response => {
  if (response.status === 200) {
    cache.put(request, response.clone());
  }
  return response;
});
```

---

### 3. Not Cloning Responses

**Problem:** Response body can only be read once

```javascript
// BAD
fetch(request).then(response => {
  cache.put(request, response);
  return response; // ERROR: body already used!
});
```

**Solution:**
```javascript
// GOOD
fetch(request).then(response => {
  cache.put(request, response.clone()); // Clone before caching
  return response;
});
```

---

### 4. Service Worker Not Updating

**Problem:** Browser caches the Service Worker file itself

**Solution:**
```javascript
// 1. Bypass cache during development
navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });

// 2. Force update check
registration.update();

// 3. Skip waiting immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});
```

---

### 5. Scope Issues

**Problem:** Service Worker not controlling expected pages

```javascript
// Service Worker at: /scripts/sw.js
// Can only control: /scripts/* pages

// BAD
navigator.serviceWorker.register('/scripts/sw.js');
// Only controls /scripts/* paths
```

**Solution:**
```javascript
// GOOD - Put Service Worker at root
// File: /sw.js
navigator.serviceWorker.register('/sw.js');
// Controls all paths

// Or specify scope
navigator.serviceWorker.register('/scripts/sw.js', {
  scope: '/' // Requires Service-Worker-Allowed header on server
});
```

---

### 6. Blocking Install with Failed Requests

**Problem:** One failed cache request breaks entire install

```javascript
// BAD - If one URL fails, entire install fails
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll([
        '/',
        '/styles.css',
        '/broken-link.jpg' // This fails = whole install fails!
      ]);
    })
  );
});
```

**Solution:**
```javascript
// GOOD - Handle failures gracefully
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      const urlsToCache = [
        '/',
        '/styles.css',
        '/app.js'
      ];

      // Cache each individually
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(error => {
            console.log('Failed to cache:', url, error);
          });
        })
      );
    })
  );
});
```

---

### 7. Not Handling POST Requests

**Problem:** Trying to cache POST requests

```javascript
// BAD - POST requests can't be cached
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request) // POST requests never match!
  );
});
```

**Solution:**
```javascript
// GOOD - Only handle GET requests
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') {
    return; // Let POST, PUT, DELETE pass through
  }

  event.respondWith(cachingStrategy(event.request));
});
```

---

## 📖 Quick Reference

### Registration

```javascript
// Basic registration
navigator.serviceWorker.register('/sw.js');

// With scope
navigator.serviceWorker.register('/sw.js', { scope: '/app/' });

// Check status
navigator.serviceWorker.ready.then(registration => {
  console.log('Service Worker ready');
});
```

### Essential Events

```javascript
// Install - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(/* cache resources */);
});

// Activate - cleanup
self.addEventListener('activate', (event) => {
  event.waitUntil(/* cleanup old caches */);
});

// Fetch - intercept requests
self.addEventListener('fetch', (event) => {
  event.respondWith(/* return response */);
});
```

### Cache API

```javascript
// Open cache
caches.open('cache-name');

// Add to cache
cache.add('/file.js');
cache.addAll(['/file1.js', '/file2.css']);
cache.put(request, response);

// Get from cache
caches.match(request);
cache.match(request);

// Delete from cache
cache.delete(request);
caches.delete('cache-name');

// List caches
caches.keys();
```

---

## 🎓 Learning Path

1. **Start with Basics** - Register a simple Service Worker
2. **Cache Static Assets** - Implement offline functionality
3. **Try Different Strategies** - Experiment with caching patterns
4. **Add Dynamic Caching** - Cache resources at runtime
5. **Implement Updates** - Handle Service Worker updates
6. **Background Sync** - Queue actions for when online
7. **Push Notifications** - Engage users with notifications
8. **Build a PWA** - Combine all features

---

## 🔗 Additional Resources

- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Google's Service Worker Guide](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Workbox (Google's SW Library)](https://developers.google.com/web/tools/workbox)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [PWA Builder](https://www.pwabuilder.com/)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)

---

## 📝 Summary

**Service Workers** are essential for modern web applications:

✅ **Offline Support** - Apps work without internet
✅ **Performance** - Instant loading from cache
✅ **Reliability** - Handle network failures gracefully
✅ **Engagement** - Push notifications and background sync
✅ **PWA Foundation** - Required for Progressive Web Apps
✅ **Control** - Full power over network requests

**Key Takeaways:**
- Use appropriate caching strategies for different content types
- Always version your caches
- Handle failures gracefully with fallbacks
- Test thoroughly in different network conditions
- Clean up old caches during activation
- Don't cache everything - be selective

**Remember:** Service Workers are powerful but require careful planning. Start simple, test thoroughly, and gradually add advanced features! 🚀

---

**Happy Coding!** 🔧

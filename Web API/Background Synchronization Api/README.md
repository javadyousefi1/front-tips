# 🔄 Background Synchronization API - Complete Guide

## 📚 Table of Contents
- [Introduction](#introduction)
- [What Problem Does It Solve?](#what-problem-does-it-solve)
- [How It Works](#how-it-works)
- [Core Concepts](#core-concepts)
- [One-Time Background Sync](#one-time-background-sync)
- [Periodic Background Sync](#periodic-background-sync)
- [Real-World Use Cases](#real-world-use-cases)
- [Browser Support](#browser-support)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)

---

## 🌟 Introduction

The **Background Synchronization API** allows web applications to defer actions until the user has stable internet connectivity. Instead of failing silently when a network request is made offline, the browser queues the request and automatically retries it in the background as soon as connectivity is restored — even if the user has already closed the tab.

### Two Parts of the API

| API | Purpose | Browser Support |
|-----|---------|-----------------|
| **Background Sync** (One-time) | Retry a failed action once connectivity returns | Chrome, Edge, Opera |
| **Periodic Background Sync** | Periodically update content in the background | Chrome 80+, Edge |

### Why Is This Important?

Background Sync enables:
- **Reliable form submissions** - Forms submitted offline don't get lost
- **Offline-first data** - Queue operations, execute when online
- **Fresh content** - Periodically update cached data in the background
- **Better UX** - No more "you're offline, try again" dead ends

---

## ❓ What Problem Does It Solve?

### The Problem Without Background Sync

```javascript
// Traditional approach - fails when offline
submitButton.addEventListener('click', async () => {
  try {
    await fetch('/api/messages', {
      method: 'POST',
      body: JSON.stringify({ text: 'Hello!' })
    });
    showSuccess('Message sent!');
  } catch (error) {
    // User loses their message completely!
    showError('Failed. No internet connection.');
  }
});
```

**Problems:**
- Data is permanently lost on network failure
- User has to manually retry everything
- Poor user experience on flaky connections
- No guarantee the retry will work on the same tab session

### The Background Sync Solution

```javascript
// With Background Sync - defers until online
submitButton.addEventListener('click', async () => {
  // 1. Save the data locally first
  await saveToIndexedDB('pending-messages', { text: 'Hello!' });

  // 2. Register a sync event
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-messages');

  showInfo('Message queued - will send when online!');
});

// In Service Worker - runs automatically when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(sendPendingMessages()); // Automatically retried!
  }
});
```

**Benefits:**
- Data is never lost
- Automatic retry when connectivity returns
- Works even after the page/tab is closed
- Browser manages retry logic

---

## ⚙️ How It Works

Background Sync works through the Service Worker, which acts as a middleman between your app and the network:

```
┌─────────────────────────────────────────────┐
│              Web Page                        │
│  1. User action (submit form)               │
│  2. Save data to IndexedDB                  │
│  3. Register sync event via SyncManager     │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│           Service Worker                    │
│  4. Browser fires 'sync' event when online  │
│  5. SW reads data from IndexedDB            │
│  6. SW sends data to server                 │
│  7. On success: remove from IndexedDB       │
│  8. On failure: browser retries again later │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│              Network / Server               │
└─────────────────────────────────────────────┘
```

### Key Behavior

1. **Fires immediately** if already online
2. **Deferred** if offline — triggers when connectivity returns
3. **Automatic retries** if the sync handler throws an error
4. **Survives tab close** — works in background
5. **Tag-based** — use unique tags to identify sync operations

---

## 🎯 Core Concepts

### 1. SyncManager

The `SyncManager` is accessed via the service worker registration. It manages sync event registrations.

```javascript
// Get access to SyncManager
const registration = await navigator.serviceWorker.ready;
const syncManager = registration.sync;

// Register a sync
await syncManager.register('my-sync-tag');

// Get all pending syncs
const tags = await syncManager.getTags();
console.log('Pending syncs:', tags); // ['my-sync-tag']
```

### 2. SyncEvent

Fired in the Service Worker when a sync is triggered:

```javascript
self.addEventListener('sync', (event) => {
  console.log('Sync event fired, tag:', event.tag);

  // event.lastChance: true if this is the last retry attempt
  if (event.lastChance) {
    console.log('This is the last chance to sync!');
  }

  // Must return a Promise that resolves on success, rejects on failure
  event.waitUntil(doSync());
});
```

### 3. Sync Tags

Tags are string identifiers for sync operations. Use descriptive names:

```javascript
// Good tag names
await registration.sync.register('sync-cart-items');
await registration.sync.register('sync-user-profile');
await registration.sync.register('sync-form-data');

// Multiple registrations of the same tag are deduplicated
await registration.sync.register('sync-cart-items'); // Same tag = single sync
await registration.sync.register('sync-cart-items'); // No duplicate
```

### 4. PeriodicSyncManager

For periodic sync operations:

```javascript
// Register periodic sync
const registration = await navigator.serviceWorker.ready;
await registration.periodicSync.register('update-news', {
  minInterval: 24 * 60 * 60 * 1000 // At least every 24 hours
});

// Get registered periodic syncs
const tags = await registration.periodicSync.getTags();

// Unregister
await registration.periodicSync.unregister('update-news');
```

---

## 🔄 One-Time Background Sync

### Full Implementation

#### Step 1: Store Data Locally (IndexedDB)

```javascript
// db.js - IndexedDB helper
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('SyncDB', 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pending')) {
        db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function addPending(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite');
    const store = tx.objectStore('pending');
    const request = store.add({ ...data, timestamp: Date.now() });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function getAllPending() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readonly');
    const store = tx.objectStore('pending');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function removePending(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending', 'readwrite');
    const store = tx.objectStore('pending');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
```

#### Step 2: Register Sync from the Page

```javascript
// In your main JavaScript
async function submitForm(formData) {
  try {
    // Always save locally first
    await addPending({
      type: 'form-submission',
      data: formData
    });

    // Try to register background sync
    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-form-data');
      showToast('Saved! Will submit when online.');
    } else {
      // Fallback: try direct submission
      await submitToServer(formData);
    }
  } catch (error) {
    console.error('Failed to queue form:', error);
  }
}
```

#### Step 3: Handle Sync in Service Worker

```javascript
// sw.js
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event received:', event.tag);

  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

async function syncFormData() {
  // Open IndexedDB
  const db = await openSyncDB();
  const pending = await getPendingItems(db, 'form-submissions');

  console.log(`[SW] Syncing ${pending.length} pending items`);

  const results = await Promise.allSettled(
    pending.map(item => submitItem(item, db))
  );

  const failures = results.filter(r => r.status === 'rejected');
  if (failures.length > 0) {
    // Throw to trigger a retry
    throw new Error(`${failures.length} items failed to sync`);
  }

  console.log('[SW] All items synced successfully!');
}

async function submitItem(item, db) {
  const response = await fetch('/api/submissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(item.data)
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  // Remove from pending queue on success
  await removePendingItem(db, item.id);
}
```

### Retry Behavior

```javascript
self.addEventListener('sync', (event) => {
  event.waitUntil(
    syncData().catch(error => {
      // If this Promise rejects:
      // - Browser will retry at an increasing interval
      // - event.lastChance will be true on the final attempt

      if (event.lastChance) {
        console.log('[SW] Last chance to sync, notifying user...');
        // Optionally show a notification
        self.registration.showNotification('Sync Failed', {
          body: 'Some data could not be synced. Please try again.'
        });
      }

      throw error; // Re-throw to trigger retry
    })
  );
});
```

---

## ⏰ Periodic Background Sync

The **Periodic Background Sync API** allows your app to periodically update content in the background, similar to a mobile app that refreshes data even when you haven't opened it.

### Prerequisites

- Requires user permission (Chrome requires the site to be installed as a PWA)
- Must have a registered Service Worker
- Browser determines the actual interval based on usage patterns

### Checking Permission

```javascript
async function checkPeriodicSyncPermission() {
  const status = await navigator.permissions.query({
    name: 'periodic-background-sync'
  });

  console.log('Permission:', status.state); // 'granted', 'denied', or 'prompt'

  status.addEventListener('change', () => {
    console.log('Permission changed to:', status.state);
  });

  return status.state;
}
```

### Registering Periodic Sync

```javascript
async function registerPeriodicSync() {
  const permission = await checkPeriodicSyncPermission();

  if (permission !== 'granted') {
    console.log('Periodic Sync permission not granted');
    return;
  }

  const registration = await navigator.serviceWorker.ready;

  // Check if periodic sync is supported
  if ('periodicSync' in registration) {
    try {
      await registration.periodicSync.register('refresh-news', {
        minInterval: 60 * 60 * 1000 // Minimum 1 hour interval
      });
      console.log('Periodic sync registered!');
    } catch (error) {
      console.error('Periodic sync registration failed:', error);
    }
  }
}

// Get all registered periodic syncs
async function getPeriodicSyncs() {
  const registration = await navigator.serviceWorker.ready;
  if ('periodicSync' in registration) {
    const tags = await registration.periodicSync.getTags();
    return tags;
  }
  return [];
}

// Unregister a periodic sync
async function unregisterPeriodicSync(tag) {
  const registration = await navigator.serviceWorker.ready;
  if ('periodicSync' in registration) {
    await registration.periodicSync.unregister(tag);
    console.log(`Periodic sync '${tag}' unregistered`);
  }
}
```

### Handling Periodic Sync in Service Worker

```javascript
// sw.js
self.addEventListener('periodicsync', (event) => {
  console.log('[SW] Periodic sync fired:', event.tag);

  if (event.tag === 'refresh-news') {
    event.waitUntil(refreshNewsContent());
  }

  if (event.tag === 'sync-user-data') {
    event.waitUntil(syncUserData());
  }
});

async function refreshNewsContent() {
  try {
    const response = await fetch('/api/news/latest');
    const news = await response.json();

    // Update cache with fresh content
    const cache = await caches.open('news-cache-v1');
    await cache.put('/api/news/latest', new Response(JSON.stringify(news)));

    console.log('[SW] News content updated in background');
  } catch (error) {
    console.error('[SW] Failed to refresh news:', error);
    throw error; // Will cause retry later
  }
}
```

---

## 💼 Real-World Use Cases

### Use Case 1: Offline Form Submission

**Goal:** Allow users to submit contact forms even when offline

```javascript
// contact-form.js
const contactForm = document.getElementById('contactForm');

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const formData = {
    name: event.target.name.value,
    email: event.target.email.value,
    message: event.target.message.value,
    timestamp: new Date().toISOString()
  };

  try {
    // Save to IndexedDB
    await saveToIndexedDB('pending-contacts', formData);

    // Register background sync
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-contact-form');

    showSuccess('Your message has been saved and will be sent when you\'re back online!');
    contactForm.reset();
  } catch (error) {
    showError('Failed to save your message. Please try again.');
  }
});

// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-contact-form') {
    event.waitUntil(
      sendPendingContacts().catch(() => {
        // Retry on next sync opportunity
        throw new Error('Will retry later');
      })
    );
  }
});

async function sendPendingContacts() {
  const pending = await getAllFromIndexedDB('pending-contacts');

  for (const contact of pending) {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });

    if (response.ok) {
      await removeFromIndexedDB('pending-contacts', contact.id);
    }
  }
}
```

---

### Use Case 2: E-Commerce Cart Sync

**Goal:** Sync shopping cart across devices/sessions

```javascript
// cart.js
async function addToCart(productId, quantity) {
  // Optimistic update - update UI immediately
  updateCartUI(productId, quantity);

  // Save to local storage
  await saveCartLocally(productId, quantity);

  // Queue sync
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register('sync-cart');
}

// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartToServer());
  }
});

async function syncCartToServer() {
  const cartItems = await getCartFromIndexedDB();

  if (cartItems.length === 0) return;

  const response = await fetch('/api/cart/sync', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${await getAuthToken()}`
    },
    body: JSON.stringify({ items: cartItems })
  });

  if (response.ok) {
    await clearLocalCart();
    console.log('[SW] Cart synced successfully');
  }
}
```

---

### Use Case 3: Analytics Queue

**Goal:** Never lose analytics events, even on flaky connections

```javascript
// analytics.js
const analyticsQueue = [];

function trackEvent(eventName, properties = {}) {
  const event = {
    id: crypto.randomUUID(),
    name: eventName,
    properties,
    timestamp: Date.now(),
    sessionId: getSessionId()
  };

  // Add to local queue
  analyticsQueue.push(event);
  persistQueue();

  // Try to register sync
  navigator.serviceWorker.ready.then(registration => {
    return registration.sync.register('flush-analytics');
  }).catch(console.error);
}

function persistQueue() {
  localStorage.setItem('analytics-queue', JSON.stringify(analyticsQueue));
}

// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'flush-analytics') {
    event.waitUntil(flushAnalytics());
  }
});

async function flushAnalytics() {
  const queue = JSON.parse(localStorage.getItem('analytics-queue') || '[]');

  if (queue.length === 0) return;

  const response = await fetch('/api/analytics/batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ events: queue })
  });

  if (response.ok) {
    // Clear sent events
    const result = await response.json();
    const sentIds = new Set(result.accepted);
    const remaining = queue.filter(e => !sentIds.has(e.id));
    localStorage.setItem('analytics-queue', JSON.stringify(remaining));
  }
}
```

---

### Use Case 4: Periodic News Update (Periodic Sync)

**Goal:** Keep news feed fresh in the background

```javascript
// app.js - Register periodic sync when PWA is installed
window.addEventListener('appinstalled', async () => {
  const registration = await navigator.serviceWorker.ready;

  if ('periodicSync' in registration) {
    const permission = await navigator.permissions.query({
      name: 'periodic-background-sync'
    });

    if (permission.state === 'granted') {
      await registration.periodicSync.register('update-news-feed', {
        minInterval: 30 * 60 * 1000 // Every 30 minutes at minimum
      });
      console.log('News will update automatically in the background!');
    }
  }
});

// sw.js
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'update-news-feed') {
    event.waitUntil(updateNewsFeed());
  }
});

async function updateNewsFeed() {
  const categories = ['technology', 'science', 'world'];

  await Promise.all(categories.map(async (category) => {
    const response = await fetch(`/api/news/${category}?limit=20`);
    const articles = await response.json();

    const cache = await caches.open(`news-${category}-v1`);
    await cache.put(
      `/api/news/${category}`,
      new Response(JSON.stringify(articles), {
        headers: { 'Content-Type': 'application/json' }
      })
    );
  }));

  // Notify open tabs about new content
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'NEWS_UPDATED' });
  });
}
```

---

### Use Case 5: Offline Todo App with Background Sync

**Goal:** Full CRUD operations offline, sync when online

```javascript
// todos.js
class TodoApp {
  constructor() {
    this.db = null;
    this.init();
  }

  async init() {
    this.db = await this.openDB();
    await this.registerServiceWorker();
    await this.renderTodos();
  }

  async addTodo(text) {
    const todo = {
      id: crypto.randomUUID(),
      text,
      completed: false,
      createdAt: Date.now(),
      syncStatus: 'pending' // 'pending' | 'synced'
    };

    // Save locally
    await this.saveLocal(todo);

    // Update UI immediately
    this.renderTodo(todo);

    // Queue sync
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-todos');

    return todo;
  }

  async toggleTodo(id) {
    const todo = await this.getLocal(id);
    todo.completed = !todo.completed;
    todo.syncStatus = 'pending';
    todo.updatedAt = Date.now();

    await this.updateLocal(todo);
    await navigator.serviceWorker.ready.then(r =>
      r.sync.register('sync-todos')
    );
  }

  async deleteTodo(id) {
    await this.markForDeletion(id);
    await navigator.serviceWorker.ready.then(r =>
      r.sync.register('sync-todos')
    );
  }
}

// sw.js
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-todos') {
    event.waitUntil(syncTodos());
  }
});

async function syncTodos() {
  const pending = await getPendingTodos();

  for (const todo of pending) {
    try {
      if (todo.deleted) {
        await fetch(`/api/todos/${todo.id}`, { method: 'DELETE' });
        await removeTodoLocally(todo.id);
      } else if (todo.id.startsWith('local-')) {
        // New todo - create on server
        const response = await fetch('/api/todos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo)
        });
        const serverTodo = await response.json();
        await updateTodoId(todo.id, serverTodo.id);
      } else {
        // Existing todo - update on server
        await fetch(`/api/todos/${todo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(todo)
        });
      }

      await markTodoSynced(todo.id);
    } catch (error) {
      console.error('[SW] Failed to sync todo:', todo.id, error);
      throw error; // Retry all if any fail
    }
  }
}
```

---

## 🌐 Browser Support

### Background Sync (One-Time)

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 49+ | ✅ Full |
| Edge | 79+ | ✅ Full |
| Opera | 36+ | ✅ Full |
| Firefox | - | ❌ Not Supported |
| Safari | - | ❌ Not Supported |

**Coverage:** ~70% of users globally

### Periodic Background Sync

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 80+ | ✅ Full (PWA required) |
| Edge | 80+ | ✅ Full (PWA required) |
| Firefox | - | ❌ Not Supported |
| Safari | - | ❌ Not Supported |

**Coverage:** ~65% of users globally

### Feature Detection

Always check for support before using:

```javascript
// Check for Background Sync
async function checkSyncSupport() {
  if (!('serviceWorker' in navigator)) {
    console.log('Service Workers not supported');
    return false;
  }

  const registration = await navigator.serviceWorker.ready;

  if (!('sync' in registration)) {
    console.log('Background Sync not supported');
    return false;
  }

  return true;
}

// Check for Periodic Background Sync
async function checkPeriodicSyncSupport() {
  if (!('serviceWorker' in navigator)) return false;

  const registration = await navigator.serviceWorker.ready;

  if (!('periodicSync' in registration)) return false;

  const permission = await navigator.permissions.query({
    name: 'periodic-background-sync'
  });

  return permission.state === 'granted';
}

// Graceful degradation
async function syncData(data) {
  const supported = await checkSyncSupport();

  if (supported) {
    // Save locally and queue sync
    await saveToIndexedDB('pending', data);
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-data');
    return { status: 'queued' };
  } else {
    // Fallback: direct fetch with retry
    return await fetchWithRetry('/api/data', data);
  }
}

async function fetchWithRetry(url, data, attempts = 3) {
  for (let i = 0; i < attempts; i++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      if (i === attempts - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * (i + 1)));
    }
  }
}
```

---

## ✅ Best Practices

### 1. Always Save Data Locally First

**❌ Bad:**
```javascript
// If sync registration fails, data is lost
await registration.sync.register('sync-form');
```

**✅ Good:**
```javascript
// Save FIRST, then register sync
await saveToIndexedDB('pending-forms', formData);
await registration.sync.register('sync-form');
```

---

### 2. Use IndexedDB for Persistent Storage

**❌ Bad:**
```javascript
// localStorage can be cleared by the browser
localStorage.setItem('pending', JSON.stringify(data));
```

**✅ Good:**
```javascript
// IndexedDB is more reliable and supports large data
const db = await openDB('MyApp', 1, {
  upgrade(db) {
    db.createObjectStore('pending', { keyPath: 'id', autoIncrement: true });
  }
});
await db.add('pending', data);
```

---

### 3. Handle `lastChance` Gracefully

```javascript
self.addEventListener('sync', (event) => {
  event.waitUntil(
    syncData().catch(error => {
      if (event.lastChance) {
        // Last retry — notify user, don't lose data
        return notifyUserOfFailure();
      }
      throw error; // Re-throw to trigger more retries
    })
  );
});
```

---

### 4. Use Descriptive Tag Names

**❌ Bad:**
```javascript
registration.sync.register('sync'); // Too generic
registration.sync.register('s1');   // Not descriptive
```

**✅ Good:**
```javascript
registration.sync.register('sync-user-profile-update');
registration.sync.register('sync-pending-orders');
registration.sync.register('sync-draft-messages');
```

---

### 5. Implement Idempotent Operations

Your sync handler may run multiple times. Make sure your operations are safe to repeat:

```javascript
// ❌ Bad - May create duplicates
async function syncOrder(order) {
  await fetch('/api/orders', {
    method: 'POST',
    body: JSON.stringify(order) // Creates a new order each time!
  });
}

// ✅ Good - Idempotent with unique ID
async function syncOrder(order) {
  await fetch('/api/orders', {
    method: 'PUT', // Upsert by ID
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': order.localId // Prevents duplicates on server
    },
    body: JSON.stringify(order)
  });
}
```

---

### 6. Clean Up Synced Data

```javascript
// ❌ Bad - Accumulates data forever
async function syncItems() {
  const items = await getAllPending();
  await sendToServer(items);
  // Forgot to clean up!
}

// ✅ Good - Remove after successful sync
async function syncItems() {
  const items = await getAllPending();

  for (const item of items) {
    const response = await fetch('/api/items', {
      method: 'POST',
      body: JSON.stringify(item)
    });

    if (response.ok) {
      await removePending(item.id); // Clean up immediately
    }
  }
}
```

---

### 7. Provide Fallback for Unsupported Browsers

```javascript
async function queueAction(action) {
  await saveLocally(action);

  const supported = 'sync' in (await navigator.serviceWorker.ready);

  if (supported) {
    const reg = await navigator.serviceWorker.ready;
    await reg.sync.register('sync-actions');
  } else {
    // Fallback: listen for online event
    window.addEventListener('online', async () => {
      await flushLocalQueue();
    }, { once: true });

    if (navigator.onLine) {
      await flushLocalQueue();
    }
  }
}
```

---

## ⚠️ Common Pitfalls

### 1. Not Waiting for `navigator.serviceWorker.ready`

**Problem:** The service worker may not be active yet

```javascript
// ❌ Bad
navigator.serviceWorker.register('./sw.js');
navigator.serviceWorker.controller.postMessage('sync'); // May be null!
```

**Solution:**
```javascript
// ✅ Good
await navigator.serviceWorker.register('./sw.js');
const registration = await navigator.serviceWorker.ready; // Wait for activation
await registration.sync.register('my-sync');
```

---

### 2. Forgetting That the Tab May Be Closed

**Problem:** Relying on page-level variables in the sync handler

```javascript
// ❌ Bad - this data disappears when tab closes!
let pendingData = [];

self.addEventListener('sync', (event) => {
  event.waitUntil(
    sendData(pendingData) // pendingData is empty if tab closed and reopened
  );
});
```

**Solution:**
```javascript
// ✅ Good - always read from IndexedDB
self.addEventListener('sync', (event) => {
  event.waitUntil(
    readFromIndexedDB('pending').then(data => sendData(data))
  );
});
```

---

### 3. Not Handling Partial Failures

**Problem:** If one item fails, all items fail

```javascript
// ❌ Bad - one failure kills the whole batch
async function syncAll(items) {
  const responses = await Promise.all(items.map(item => sendItem(item)));
  // If one fails, all are lost!
}
```

**Solution:**
```javascript
// ✅ Good - handle each item individually
async function syncAll(items) {
  const results = await Promise.allSettled(
    items.map(item => sendItemSafely(item))
  );

  const failed = results.filter(r => r.status === 'rejected');
  if (failed.length > 0) {
    throw new Error(`${failed.length} of ${items.length} items failed`);
  }
}
```

---

### 4. Long-Running Sync Operations

**Problem:** Browser terminates Service Workers after a few minutes

```javascript
// ❌ Bad - may be terminated mid-sync
async function syncLargeDataset(items) {
  for (const item of items) {
    await processHeavyItem(item); // May take too long!
  }
}
```

**Solution:**
```javascript
// ✅ Good - batch and prioritize
async function syncLargeDataset(items) {
  const BATCH_SIZE = 10;
  const batches = chunk(items, BATCH_SIZE);

  for (const batch of batches) {
    await Promise.all(batch.map(item => processItem(item)));
    // Each batch is fast, reducing timeout risk
  }
}
```

---

### 5. Registering Sync Without Service Worker

**Problem:** Trying to use Background Sync before SW is registered

```javascript
// ❌ Bad
async function init() {
  navigator.serviceWorker.register('/sw.js');
  // immediately trying to use sync
  const reg = await navigator.serviceWorker.ready;
  await reg.sync.register('sync'); // May fail if SW not yet installed
}
```

**Solution:**
```javascript
// ✅ Good - ensure SW is fully active
async function init() {
  await navigator.serviceWorker.register('/sw.js');
  const registration = await navigator.serviceWorker.ready;

  // Now safe to register syncs
  await registration.sync.register('initial-sync');
}
```

---

## 📖 Quick Reference

### One-Time Background Sync

```javascript
// Register from page
const reg = await navigator.serviceWorker.ready;
await reg.sync.register('my-sync-tag');

// Get pending sync tags
const tags = await reg.sync.getTags();

// Handle in Service Worker
self.addEventListener('sync', (event) => {
  if (event.tag === 'my-sync-tag') {
    event.waitUntil(doSync());
  }
  // event.lastChance: true if last retry attempt
});
```

### Periodic Background Sync

```javascript
// Register (requires PWA + permission)
await reg.periodicSync.register('my-periodic-tag', {
  minInterval: 24 * 60 * 60 * 1000 // 24 hours
});

// Get all periodic syncs
const tags = await reg.periodicSync.getTags();

// Unregister
await reg.periodicSync.unregister('my-periodic-tag');

// Handle in Service Worker
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'my-periodic-tag') {
    event.waitUntil(doPeriodicWork());
  }
});
```

### Feature Detection Pattern

```javascript
const hasBgSync = 'serviceWorker' in navigator &&
  'sync' in ServiceWorkerRegistration.prototype;

const hasPeriodicSync = 'serviceWorker' in navigator &&
  'periodicSync' in ServiceWorkerRegistration.prototype;
```

---

## 🎓 Learning Path

1. **Understand Service Workers** - Background Sync requires a SW
2. **Implement IndexedDB storage** - Store data that survives tab close
3. **Register a basic sync** - Try one-time background sync
4. **Test offline scenarios** - Go offline, submit data, come back online
5. **Add periodic sync** - Keep content fresh automatically
6. **Handle edge cases** - `lastChance`, partial failures, large datasets
7. **Build full offline-first app** - Combine with Cache API and IndexedDB

---

## 🔗 Additional Resources

- [MDN Background Synchronization API](https://developer.mozilla.org/en-US/docs/Web/API/Background_Synchronization_API)
- [MDN Periodic Background Sync API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Periodic_Background_Synchronization_API)
- [Google's Background Sync Guide](https://developers.google.com/web/updates/2015/12/background-sync)
- [Can I Use - Background Sync](https://caniuse.com/background-sync)
- [Workbox Background Sync Plugin](https://developers.google.com/web/tools/workbox/modules/workbox-background-sync)

---

## 📝 Summary

**Background Synchronization API** is essential for offline-first web applications:

✅ **Reliable Data Submission** - Forms never get lost, even offline
✅ **Automatic Retry** - Browser handles retry logic for you
✅ **Tab-Agnostic** - Works even after the tab is closed
✅ **Fresh Content** - Periodic sync keeps data up to date
✅ **Better UX** - Users don't see "you're offline" dead ends
✅ **Graceful Degradation** - Fallbacks for unsupported browsers

**Key Takeaways:**
- Always save data locally (IndexedDB) before registering a sync
- Use descriptive tag names for sync events
- Handle `event.lastChance` to avoid losing data
- Make sync operations idempotent (safe to repeat)
- Provide fallbacks for browsers that don't support Background Sync
- Clean up synced data immediately after successful submission

**Remember:** Background Sync is a progressive enhancement — your app should work without it, but be significantly better with it! 🚀

---

**Happy Coding!** 🔄

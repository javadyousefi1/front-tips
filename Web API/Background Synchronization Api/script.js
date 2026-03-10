// ===========================================================================
// Background Sync API Demo - Main Application Script
// ===========================================================================

// Global State
let swRegistration = null;
let pendingMessages = [];
let syncedCount = 0;
let failedCount = 0;
let totalEventCount = 0;
let totalSyncedGlobal = 0;

// ===========================================================================
// Initialization
// ===========================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Background Sync API Demo Loaded');
    initializeApp();
    setupNavigation();
    setupEventListeners();
    monitorNetworkStatus();
    checkAllSupport();
});

async function initializeApp() {
    if (!('serviceWorker' in navigator)) {
        updateStatus('Service Workers Not Supported', 'error');
        showToast('Service Workers are not supported in this browser', 'error');
        return;
    }

    try {
        swRegistration = await navigator.serviceWorker.register('./sync-sw.js');
        console.log('✅ Service Worker registered:', swRegistration);

        // Wait for SW to be ready
        await navigator.serviceWorker.ready;
        updateStatus('Service Worker Active', 'success');

        // Listen for messages from Service Worker
        navigator.serviceWorker.addEventListener('message', handleSWMessage);

        // Listen for controller changes
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            showToast('Service Worker updated!', 'info');
        });

        // Load saved queue from IndexedDB
        await refreshQueueDisplay();

    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        updateStatus('Service Worker Registration Failed', 'error');
        showToast('Failed to register Service Worker', 'error');
    }
}

// ===========================================================================
// Service Worker Message Handler
// ===========================================================================
function handleSWMessage(event) {
    const data = event.data;
    console.log('[App] Message from SW:', data);

    switch (data.type) {
        case 'SW_ACTIVATED':
            logToMonitor('Service Worker activated and ready', 'success');
            updateMetric('metricSwStatus', 'Active ✅');
            break;

        case 'SYNC_COMPLETE':
            logToMonitor(
                `Sync complete! Tag: "${data.tag}" | Synced: ${data.synced} items${data.failures ? ` | Failed: ${data.failures}` : ''}`,
                'success'
            );
            totalSyncedGlobal += data.synced || 0;
            updateMetric('metricTotalSynced', totalSyncedGlobal);
            syncedCount += data.synced || 0;
            failedCount += data.failures || 0;
            updateCounters();
            refreshQueueDisplay();
            showToast(`Sync complete! ${data.synced} items synced.`, 'success');
            logToBasicSync(`[${timestamp()}] Sync completed: ${data.synced} items synced. Tag: "${data.tag}"`, 'success');
            break;

        case 'SYNC_ERROR':
            logToMonitor(
                `Sync error! Tag: "${data.tag}" | Error: ${data.error}${data.lastChance ? ' (Last Chance!)' : ' (Will retry)'}`,
                'error'
            );
            showToast(`Sync error: ${data.error}`, 'error');
            logToBasicSync(`[${timestamp()}] Sync failed: ${data.error}`, 'error');
            break;

        case 'SYNC_FAILED_FINAL':
            logToMonitor(
                `Final sync attempt failed! Tag: "${data.tag}" | ${data.failures} items could not be synced.`,
                'error'
            );
            showToast('Some items could not be synced after multiple retries', 'error');
            break;

        case 'PERIODIC_SYNC_COMPLETE':
            logToMonitor(`Periodic sync complete! Content refreshed at: ${data.timestamp}`, 'info');
            logToPeriodic(`[${timestamp()}] Periodic sync ran at: ${new Date(data.timestamp).toLocaleString()}`, 'success');
            showToast('Periodic sync completed!', 'success');
            break;

        default:
            logToMonitor(`Unknown message type: ${data.type}`, 'info');
    }
}

// ===========================================================================
// Demo 1: Basic Sync
// ===========================================================================
async function registerSync() {
    const tagInput = document.getElementById('syncTag');
    const tag = tagInput.value.trim() || 'sync-messages';

    if (!swRegistration) {
        showToast('Service Worker not ready yet', 'error');
        return;
    }

    try {
        if (!('sync' in swRegistration)) {
            logToBasicSync('Background Sync is not supported in this browser.', 'error');
            showToast('Background Sync not supported', 'error');
            return;
        }

        await swRegistration.sync.register(tag);
        logToBasicSync(`[${timestamp()}] Sync registered with tag: "${tag}"`, 'success');
        showToast(`Sync registered: "${tag}"`, 'success');
        logToMonitor(`Sync event registered: "${tag}"`, 'info');

        // Update pending syncs count
        await updatePendingSyncsCount();

    } catch (error) {
        console.error('Sync registration failed:', error);
        logToBasicSync(`[${timestamp()}] Registration failed: ${error.message}`, 'error');
        showToast('Failed to register sync', 'error');
    }
}

async function getPendingTags() {
    if (!swRegistration || !('sync' in swRegistration)) {
        logToBasicSync('Background Sync not supported in this browser.', 'error');
        return;
    }

    try {
        const tags = await swRegistration.sync.getTags();

        if (tags.length === 0) {
            logToBasicSync(`[${timestamp()}] No pending sync tags.`, 'info');
        } else {
            logToBasicSync(`[${timestamp()}] Pending sync tags (${tags.length}): ${tags.join(', ')}`, 'success');
        }

        updateMetric('metricPendingSyncs', tags.length);
    } catch (error) {
        logToBasicSync(`[${timestamp()}] Failed to get tags: ${error.message}`, 'error');
    }
}

function logToBasicSync(message, type = 'info') {
    const output = document.getElementById('basicSyncOutput');
    if (!output) return;

    if (output.innerHTML.includes('will appear here')) {
        output.innerHTML = '';
    }

    const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    output.innerHTML = `<p class="${className}">${message}</p>` + output.innerHTML;
}

// ===========================================================================
// Demo 2: Offline Queue
// ===========================================================================
async function addToQueue() {
    const input = document.getElementById('messageText');
    const text = input.value.trim();

    if (!text) {
        showToast('Please enter a message', 'warning');
        return;
    }

    const item = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        text,
        timestamp: Date.now(),
        status: 'pending'
    };

    // Save to IndexedDB
    await saveToIndexedDB('pending-messages', item);
    pendingMessages.push(item);
    input.value = '';

    // Register background sync
    try {
        if (swRegistration && 'sync' in swRegistration) {
            await swRegistration.sync.register('sync-messages');
            showToast(`Message queued${navigator.onLine ? ' - syncing...' : ' - will sync when online'}`, 'success');
        } else {
            showToast('Message queued (Background Sync not available, using fallback)', 'warning');
            if (navigator.onLine) {
                setTimeout(() => flushQueueFallback(), 1000);
            }
        }
    } catch (error) {
        console.error('Failed to register sync:', error);
        showToast('Message queued (will send when online)', 'warning');
    }

    await refreshQueueDisplay();
    await updatePendingSyncsCount();
}

async function triggerSyncNow() {
    if (!swRegistration) {
        showToast('Service Worker not ready', 'error');
        return;
    }

    try {
        if ('sync' in swRegistration) {
            await swRegistration.sync.register('sync-messages');
            showToast('Sync triggered!', 'success');
            logToMonitor('Manual sync trigger: sync-messages', 'info');
        } else {
            // Fallback
            await flushQueueFallback();
        }
    } catch (error) {
        showToast('Failed to trigger sync: ' + error.message, 'error');
    }
}

async function clearQueue() {
    if (!confirm('Clear all pending messages?')) return;

    const db = await openDB();
    const tx = db.transaction('pending-messages', 'readwrite');
    tx.objectStore('pending-messages').clear();
    await new Promise(r => tx.oncomplete = r);

    pendingMessages = [];
    syncedCount = 0;
    failedCount = 0;
    updateCounters();
    await refreshQueueDisplay();
    showToast('Queue cleared', 'success');
}

async function refreshQueueDisplay() {
    const output = document.getElementById('queueOutput');
    if (!output) return;

    const items = await getAllFromIndexedDB('pending-messages');
    pendingMessages = items;

    document.getElementById('pendingCount').textContent = items.length;

    if (items.length === 0) {
        output.innerHTML = '<p class="muted">No pending items in the queue</p>';
        return;
    }

    output.innerHTML = items
        .sort((a, b) => b.timestamp - a.timestamp)
        .map(item => `
            <div class="queue-item ${item.status}">
                <span class="queue-status-dot"></span>
                <div class="queue-item-content">
                    <strong>${item.text}</strong>
                    <small>${new Date(item.timestamp).toLocaleTimeString()}</small>
                </div>
                <span class="queue-badge ${item.status}">${item.status}</span>
            </div>
        `).join('');
}

function updateCounters() {
    document.getElementById('syncedCount').textContent = syncedCount;
    document.getElementById('failedCount').textContent = failedCount;
}

// Fallback sync using the online event
async function flushQueueFallback() {
    const items = await getAllFromIndexedDB('pending-messages');
    if (items.length === 0) return;

    for (const item of items) {
        await new Promise(r => setTimeout(r, 300)); // Simulate Network call
        await removeFromIndexedDB('pending-messages', item.id);
        syncedCount++;
    }

    updateCounters();
    await refreshQueueDisplay();
    showToast(`${items.length} messages synced via fallback`, 'success');
}

// ===========================================================================
// Demo 3: Periodic Sync
// ===========================================================================
async function registerPeriodicSync() {
    const tag = document.getElementById('periodicTag').value.trim() || 'periodic-content-refresh';
    const minInterval = parseInt(document.getElementById('periodicInterval').value);

    if (!swRegistration) {
        showToast('Service Worker not ready', 'error');
        return;
    }

    if (!('periodicSync' in swRegistration)) {
        logToPeriodic('Periodic Background Sync is not supported in this browser.', 'error');
        showToast('Periodic Background Sync not supported', 'error');
        return;
    }

    try {
        // Check permission
        const status = await navigator.permissions.query({
            name: 'periodic-background-sync'
        });

        if (status.state !== 'granted') {
            logToPeriodic(`Permission not granted (status: "${status.state}"). Install the site as a PWA to enable.`, 'error');
            showToast('Periodic Sync requires PWA installation', 'warning');
            return;
        }

        await swRegistration.periodicSync.register(tag, { minInterval });
        logToPeriodic(`[${timestamp()}] Periodic sync registered: "${tag}" (min interval: ${minInterval / 1000}s)`, 'success');
        showToast(`Periodic sync registered: "${tag}"`, 'success');

    } catch (error) {
        logToPeriodic(`[${timestamp()}] Registration failed: ${error.message}`, 'error');
        showToast('Registration failed: ' + error.message, 'error');
    }
}

async function getPeriodicTags() {
    if (!swRegistration || !('periodicSync' in swRegistration)) {
        logToPeriodic('Periodic Background Sync not supported.', 'error');
        return;
    }

    try {
        const tags = await swRegistration.periodicSync.getTags();
        if (tags.length === 0) {
            logToPeriodic(`[${timestamp()}] No active periodic sync tags.`, 'info');
        } else {
            logToPeriodic(`[${timestamp()}] Active periodic tags (${tags.length}): ${tags.join(', ')}`, 'success');
        }
    } catch (error) {
        logToPeriodic(`[${timestamp()}] Failed: ${error.message}`, 'error');
    }
}

async function unregisterPeriodicSync() {
    const tag = document.getElementById('periodicTag').value.trim() || 'periodic-content-refresh';

    if (!swRegistration || !('periodicSync' in swRegistration)) {
        logToPeriodic('Periodic Background Sync not supported.', 'error');
        return;
    }

    try {
        await swRegistration.periodicSync.unregister(tag);
        logToPeriodic(`[${timestamp()}] Periodic sync unregistered: "${tag}"`, 'success');
        showToast(`Periodic sync unregistered: "${tag}"`, 'success');
    } catch (error) {
        logToPeriodic(`[${timestamp()}] Unregister failed: ${error.message}`, 'error');
    }
}

function logToPeriodic(message, type = 'info') {
    const output = document.getElementById('periodicOutput');
    if (!output) return;

    if (output.innerHTML.includes('will appear here')) {
        output.innerHTML = '';
    }

    const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    output.innerHTML = `<p class="${className}">${message}</p>` + output.innerHTML;
}

// ===========================================================================
// Demo 4: Monitor
// ===========================================================================
function logToMonitor(message, type = 'info') {
    const output = document.getElementById('monitorOutput');
    if (!output) return;

    if (output.innerHTML.includes('Waiting for events')) {
        output.innerHTML = '';
    }

    totalEventCount++;
    const badge = document.getElementById('eventCount');
    if (badge) badge.textContent = `${totalEventCount} events`;

    const typeIcon = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    }[type] || 'ℹ️';

    const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
    output.innerHTML = `<p class="${className}">[${timestamp()}] ${typeIcon} ${message}</p>` + output.innerHTML;
}

function simulateBackgroundSync() {
    // Simulate adding data and triggering a sync
    const fakeItems = [
        { id: `sim-${Date.now()}-1`, text: 'Simulated message 1', timestamp: Date.now(), status: 'pending' },
        { id: `sim-${Date.now()}-2`, text: 'Simulated message 2', timestamp: Date.now(), status: 'pending' }
    ];

    Promise.all(fakeItems.map(item => saveToIndexedDB('pending-messages', item))).then(() => {
        pendingMessages.push(...fakeItems);
        refreshQueueDisplay();

        if (swRegistration && 'sync' in swRegistration) {
            return swRegistration.sync.register('sync-messages');
        }
    }).then(() => {
        logToMonitor('Simulated: Added 2 items and registered sync', 'info');
        showToast('Simulation started!', 'info');
    });
}

function simulateSyncFailure() {
    logToMonitor('Simulated sync failure event — SW would retry this automatically', 'error');
    showToast('Sync failure simulated (check monitor)', 'error');
}

function clearMonitor() {
    const output = document.getElementById('monitorOutput');
    if (output) output.innerHTML = '<p class="muted">Log cleared. Waiting for events...</p>';
    totalEventCount = 0;
    const badge = document.getElementById('eventCount');
    if (badge) badge.textContent = '0 events';
}

function updateMetric(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
}

async function updatePendingSyncsCount() {
    if (swRegistration && 'sync' in swRegistration) {
        try {
            const tags = await swRegistration.sync.getTags();
            updateMetric('metricPendingSyncs', tags.length);
        } catch (e) {
            // ignore
        }
    }
}

// ===========================================================================
// Demo 5: Support & Fallback
// ===========================================================================
async function checkAllSupport() {
    const features = [
        {
            name: 'Service Worker',
            check: () => 'serviceWorker' in navigator,
            description: 'Required for Background Sync to work'
        },
        {
            name: 'Background Sync (One-Time)',
            check: async () => {
                if (!swRegistration) return false;
                return 'sync' in swRegistration;
            },
            description: 'Register one-time sync events'
        },
        {
            name: 'Periodic Background Sync',
            check: async () => {
                if (!swRegistration) return false;
                return 'periodicSync' in swRegistration;
            },
            description: 'Register recurring background sync tasks'
        },
        {
            name: 'IndexedDB',
            check: () => 'indexedDB' in window,
            description: 'Persistent storage for queued data'
        },
        {
            name: 'Cache API',
            check: () => 'caches' in window,
            description: 'Store resources for offline use'
        },
        {
            name: 'Notifications API',
            check: () => 'Notification' in window,
            description: 'Notify user when sync completes'
        },
        {
            name: 'Online/Offline Events',
            check: () => 'onLine' in navigator,
            description: 'Fallback for detecting connectivity'
        }
    ];

    const grid = document.getElementById('supportGrid');
    if (!grid) return;

    const results = await Promise.all(
        features.map(async feature => ({
            ...feature,
            supported: await feature.check()
        }))
    );

    grid.innerHTML = results.map(({ name, supported, description }) => `
        <div class="support-item ${supported ? 'supported' : 'not-supported'}">
            <div class="support-icon">${supported ? '✅' : '❌'}</div>
            <div class="support-info">
                <strong>${name}</strong>
                <small>${description}</small>
            </div>
            <div class="support-status">${supported ? 'Supported' : 'Not Supported'}</div>
        </div>
    `).join('');
}

async function sendWithFallback() {
    const input = document.getElementById('fallbackMessage');
    const message = input.value.trim();

    if (!message) {
        showToast('Please enter a message', 'warning');
        return;
    }

    const item = {
        id: `fb-${Date.now()}`,
        text: message,
        timestamp: Date.now()
    };

    // Step 1: Always save locally
    await saveToIndexedDB('pending-messages', item);
    logToFallback(`[${timestamp()}] Saved locally: "${message}"`, 'info');

    // Step 2: Try Background Sync
    if (swRegistration && 'sync' in swRegistration) {
        try {
            await swRegistration.sync.register('sync-messages');
            logToFallback(`[${timestamp()}] Background Sync registered — will sync automatically`, 'success');
            showToast('Message queued via Background Sync', 'success');
        } catch (e) {
            logToFallback(`[${timestamp()}] Background Sync failed, using online event fallback`, 'warning');
            useFallbackOnlineListener(item);
        }
    } else {
        // Fallback: online event listener
        logToFallback(`[${timestamp()}] Background Sync not supported — using online event listener`, 'warning');

        if (navigator.onLine) {
            await simulateSend(item);
            logToFallback(`[${timestamp()}] Sent directly (was already online)`, 'success');
        } else {
            useFallbackOnlineListener(item);
        }
    }

    input.value = '';
    await refreshQueueDisplay();
}

function useFallbackOnlineListener(item) {
    logToFallback(`[${timestamp()}] Waiting for online event...`, 'warning');

    window.addEventListener('online', async () => {
        logToFallback(`[${timestamp()}] Online! Sending queued message now...`, 'info');
        await simulateSend(item);
        await removeFromIndexedDB('pending-messages', item.id);
        logToFallback(`[${timestamp()}] Message sent via fallback: "${item.text}"`, 'success');
        showToast('Message sent (fallback method)!', 'success');
        await refreshQueueDisplay();
    }, { once: true });
}

async function testRetryLogic() {
    logToFallback(`[${timestamp()}] Testing retry logic (3 attempts)...`, 'info');

    for (let i = 1; i <= 3; i++) {
        try {
            await simulateSendWithFailure(i);
            logToFallback(`[${timestamp()}] Attempt ${i}: Success!`, 'success');
            break;
        } catch (error) {
            if (i < 3) {
                logToFallback(`[${timestamp()}] Attempt ${i}: Failed — retrying in ${i}s...`, 'error');
                await new Promise(r => setTimeout(r, i * 1000));
            } else {
                logToFallback(`[${timestamp()}] All ${i} attempts failed. Queuing for later.`, 'error');
            }
        }
    }
}

function simulateSend(item) {
    return new Promise(resolve => setTimeout(() => {
        console.log('[App] Simulated send:', item);
        resolve({ success: true });
    }, 500));
}

function simulateSendWithFailure(attempt) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (attempt < 3) {
                reject(new Error('Network error'));
            } else {
                resolve({ success: true });
            }
        }, 400);
    });
}

function logToFallback(message, type = 'info') {
    const output = document.getElementById('fallbackOutput');
    if (!output) return;

    if (output.innerHTML.includes('will appear here')) {
        output.innerHTML = '';
    }

    const className = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : '';
    output.innerHTML = `<p class="${className}">${message}</p>` + output.innerHTML;
}

// ===========================================================================
// IndexedDB Helpers
// ===========================================================================
function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BGSyncDemoDB', 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            const stores = ['pending-messages', 'pending-forms', 'pending-analytics'];
            stores.forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName, { keyPath: 'id' });
                }
            });
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function saveToIndexedDB(storeName, data) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.put(data);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllFromIndexedDB(storeName) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function removeFromIndexedDB(storeName, id) {
    const db = await openDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// ===========================================================================
// Network Status Monitoring
// ===========================================================================
function monitorNetworkStatus() {
    updateNetworkStatus();

    window.addEventListener('online', () => {
        updateNetworkStatus();
        showToast('Back online! Background sync will now fire.', 'success');
        logToMonitor('Network: Back online', 'success');
        updateMetric('metricNetwork', 'Online 🌐');
    });

    window.addEventListener('offline', () => {
        updateNetworkStatus();
        showToast('Offline — messages will sync when you reconnect', 'warning');
        logToMonitor('Network: Went offline', 'warning');
        updateMetric('metricNetwork', 'Offline 📡');
    });
}

function updateNetworkStatus() {
    const bar = document.getElementById('networkStatus');
    const text = document.getElementById('networkText');

    if (navigator.onLine) {
        if (bar) bar.className = 'Network-status online';
        if (text) text.textContent = '🌐 Online';
        updateMetric('metricNetwork', 'Online 🌐');
    } else {
        if (bar) bar.className = 'Network-status offline';
        if (text) text.textContent = '📡 Offline — syncs queued';
        updateMetric('metricNetwork', 'Offline 📡');
    }
}

// ===========================================================================
// Status Utilities
// ===========================================================================
function updateStatus(text, type) {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');

    if (statusText) statusText.textContent = `SW: ${text}`;
    if (statusIndicator) statusIndicator.className = `status-indicator status-${type}`;

    updateMetric('metricSwStatus', type === 'success' ? 'Active ✅' : type === 'error' ? 'Error ❌' : text);
}

function timestamp() {
    return new Date().toLocaleTimeString();
}

// ===========================================================================
// Navigation
// ===========================================================================
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    const demoSections = document.querySelectorAll('.demo-section');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const demo = btn.dataset.demo;

            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            demoSections.forEach(section => {
                section.classList.toggle('active', section.id === `demo-${demo}`);
            });
        });
    });
}

// ===========================================================================
// Event Listeners
// ===========================================================================
function setupEventListeners() {
    // Demo 1: Basic Sync
    safeListener('registerSyncBtn', 'click', registerSync);
    safeListener('getPendingTagsBtn', 'click', getPendingTags);

    // Demo 2: Queue
    safeListener('addToQueueBtn', 'click', addToQueue);
    safeListener('triggerSyncBtn', 'click', triggerSyncNow);
    safeListener('clearQueueBtn', 'click', clearQueue);

    // Allow Enter on message input
    const msgInput = document.getElementById('messageText');
    if (msgInput) {
        msgInput.addEventListener('keypress', e => {
            if (e.key === 'Enter') addToQueue();
        });
    }

    // Demo 3: Periodic
    safeListener('registerPeriodicBtn', 'click', registerPeriodicSync);
    safeListener('getPeriodicTagsBtn', 'click', getPeriodicTags);
    safeListener('unregisterPeriodicBtn', 'click', unregisterPeriodicSync);

    // Demo 4: Monitor
    safeListener('simulateSyncBtn', 'click', simulateBackgroundSync);
    safeListener('simulateFailBtn', 'click', simulateSyncFailure);
    safeListener('clearMonitorBtn', 'click', clearMonitor);

    // Demo 5: Support
    safeListener('sendWithFallbackBtn', 'click', sendWithFallback);
    safeListener('retryFetchBtn', 'click', testRetryLogic);
}

function safeListener(id, event, handler) {
    const el = document.getElementById(id);
    if (el) el.addEventListener(event, handler);
}

// ===========================================================================
// Toast Notifications
// ===========================================================================
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (!toast || !toastMessage) return;

    toastMessage.textContent = message;
    toast.className = `toast toast-${type} show`;

    setTimeout(() => toast.classList.remove('show'), 3500);
}

// ===========================================================================
// Console Welcome
// ===========================================================================
console.log('%c🔄 Background Sync API Demo', 'font-size: 20px; font-weight: bold; color: #00897B;');
console.log('%cOpen DevTools → Application → Background Sync to inspect sync events', 'font-size: 12px; color: #666;');
console.log('%cTry going offline and adding messages to see the sync queue in action!', 'font-size: 12px; color: #666;');

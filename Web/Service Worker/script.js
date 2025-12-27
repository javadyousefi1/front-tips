// ===========================================================================
// Service Worker Demo - Main Application Script
// ===========================================================================

// Global variables
let registration = null;
let currentStrategy = 'cache-first';

// ===========================================================================
// Initialization
// ===========================================================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Service Worker Demo App Loaded');
    initializeApp();
    setupEventListeners();
    setupNavigation();
    monitorNetworkStatus();
    checkServiceWorkerSupport();
    displayPerformanceMetrics();
});

// ===========================================================================
// App Initialization
// ===========================================================================
function initializeApp() {
    // Check for Service Worker support
    if (!('serviceWorker' in navigator)) {
        showToast('❌ Service Workers not supported in this browser', 'error');
        updateStatus('Not Supported', 'error');
        return;
    }

    // Auto-register Service Worker
    registerServiceWorker();

    // Listen for messages from Service Worker
    navigator.serviceWorker.addEventListener('message', handleSWMessage);

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        showToast('🔄 New Service Worker activated!', 'success');
    });
}

// ===========================================================================
// Service Worker Registration
// ===========================================================================
async function registerServiceWorker() {
    try {
        registration = await navigator.serviceWorker.register('./sw.js');
        console.log('✅ Service Worker registered:', registration);

        updateStatus('Registered', 'success');
        updateRegistrationOutput('Service Worker registered successfully!', 'success');

        // Check for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            console.log('🔄 New Service Worker found');

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New Service Worker available
                    showUpdateNotification();
                }
            });
        });

        // Check update on focus
        window.addEventListener('focus', () => {
            if (registration) {
                registration.update();
            }
        });

    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
        updateStatus('Registration Failed', 'error');
        updateRegistrationOutput(`Registration failed: ${error.message}`, 'error');
        showToast('Failed to register Service Worker', 'error');
    }
}

async function unregisterServiceWorker() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
            await registration.unregister();
            console.log('✅ Service Worker unregistered');
            updateStatus('Unregistered', 'warning');
            updateRegistrationOutput('Service Worker unregistered successfully', 'warning');
            showToast('Service Worker unregistered', 'warning');
        } else {
            showToast('No Service Worker to unregister', 'info');
        }
    } catch (error) {
        console.error('❌ Unregistration failed:', error);
        showToast('Failed to unregister Service Worker', 'error');
    }
}

async function checkServiceWorkerStatus() {
    try {
        const registration = await navigator.serviceWorker.getRegistration();
        let statusHTML = '<ul class="status-list">';

        if (registration) {
            statusHTML += `<li><strong>Status:</strong> Registered ✅</li>`;
            statusHTML += `<li><strong>Scope:</strong> ${registration.scope}</li>`;
            statusHTML += `<li><strong>Active:</strong> ${registration.active ? 'Yes' : 'No'}</li>`;
            statusHTML += `<li><strong>Installing:</strong> ${registration.installing ? 'Yes' : 'No'}</li>`;
            statusHTML += `<li><strong>Waiting:</strong> ${registration.waiting ? 'Yes' : 'No'}</li>`;
        } else {
            statusHTML += '<li><strong>Status:</strong> Not Registered ❌</li>';
        }

        statusHTML += '</ul>';
        updateRegistrationOutput(statusHTML, 'info');
    } catch (error) {
        console.error('Error checking status:', error);
        showToast('Failed to check status', 'error');
    }
}

// ===========================================================================
// Status Updates
// ===========================================================================
function updateStatus(text, type) {
    const statusText = document.getElementById('statusText');
    const statusIndicator = document.getElementById('statusIndicator');

    if (statusText) {
        statusText.textContent = `Service Worker: ${text}`;
    }

    if (statusIndicator) {
        statusIndicator.className = `status-indicator status-${type}`;
    }
}

function updateRegistrationOutput(message, type) {
    const output = document.getElementById('registrationOutput');
    if (output) {
        const className = type === 'error' ? 'error' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : '';
        output.innerHTML = `<p class="${className}">${message}</p>`;
    }
}

function showUpdateNotification() {
    const updateBtn = document.getElementById('updateBtn');
    if (updateBtn) {
        updateBtn.style.display = 'block';
        updateBtn.onclick = () => {
            window.location.reload();
        };
    }
    showToast('🔄 Update available! Click the button to refresh', 'info');
}

// ===========================================================================
// Network Status Monitoring
// ===========================================================================
function monitorNetworkStatus() {
    updateNetworkStatus();

    window.addEventListener('online', () => {
        updateNetworkStatus();
        showToast('🌐 You are back online!', 'success');
        logOfflineEvent('Connection restored');
    });

    window.addEventListener('offline', () => {
        updateNetworkStatus();
        showToast('📡 You are offline. Cached content will be served.', 'warning');
        logOfflineEvent('Connection lost - Working offline');
    });
}

function updateNetworkStatus() {
    const networkStatus = document.getElementById('networkStatus');
    const networkText = document.getElementById('networkText');
    const onlineStatus = document.getElementById('currentOnlineStatus');

    if (navigator.onLine) {
        if (networkStatus) networkStatus.className = 'network-status online';
        if (networkText) networkText.textContent = '🌐 Online';
        if (onlineStatus) {
            onlineStatus.textContent = 'Online';
            onlineStatus.className = 'status-online';
        }
    } else {
        if (networkStatus) networkStatus.className = 'network-status offline';
        if (networkText) networkText.textContent = '📡 Offline';
        if (onlineStatus) {
            onlineStatus.textContent = 'Offline';
            onlineStatus.className = 'status-offline';
        }
    }
}

function logOfflineEvent(message) {
    const log = document.getElementById('offlineEventLog');
    if (log) {
        const timestamp = new Date().toLocaleTimeString();
        const currentLog = log.innerHTML === 'No offline events yet...' ? '' : log.innerHTML;
        log.innerHTML = `<p>[${timestamp}] ${message}</p>${currentLog}`;
    }
}

// ===========================================================================
// Caching Strategies
// ===========================================================================
async function applyStrategy() {
    const selected = document.querySelector('input[name="strategy"]:checked');
    if (!selected) {
        showToast('Please select a strategy', 'warning');
        return;
    }

    currentStrategy = selected.value;

    // Send message to Service Worker to change strategy
    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CHANGE_STRATEGY',
            strategy: currentStrategy
        });

        updateStrategyOutput(`Strategy changed to: <strong>${currentStrategy}</strong>`, 'success');
        showToast(`Strategy changed to ${currentStrategy}`, 'success');
    } else {
        showToast('Service Worker not active yet', 'error');
    }
}

async function testStrategy() {
    updateStrategyOutput('Testing strategy... Please wait', 'info');

    const testUrl = './test-resource.json';
    const startTime = performance.now();

    try {
        const response = await fetch(testUrl);
        const endTime = performance.now();
        const loadTime = (endTime - startTime).toFixed(2);

        let source = 'unknown';
        const cacheControl = response.headers.get('cache-control');

        // Determine if response came from cache or network
        if (response.type === 'cached') {
            source = 'cache';
        } else if (performance.getEntriesByName(testUrl).length > 0) {
            const perfEntry = performance.getEntriesByName(testUrl)[0];
            source = perfEntry.transferSize === 0 ? 'cache' : 'network';
        }

        updateStrategyOutput(`
            <p><strong>Test Complete!</strong></p>
            <ul class="status-list">
                <li>Strategy: ${currentStrategy}</li>
                <li>Response source: ${source}</li>
                <li>Load time: ${loadTime}ms</li>
                <li>Status: ${response.status}</li>
                <li>Online: ${navigator.onLine ? 'Yes' : 'No'}</li>
            </ul>
        `, 'success');

    } catch (error) {
        updateStrategyOutput(`Test failed: ${error.message}`, 'error');
    }
}

function updateStrategyOutput(message, type) {
    const output = document.getElementById('strategyOutput');
    if (output) {
        const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
        output.innerHTML = `<div class="${className}">${message}</div>`;
    }
}

// ===========================================================================
// Cache Management
// ===========================================================================
async function cacheCurrentPage() {
    if (!navigator.serviceWorker.controller) {
        showToast('Service Worker not active', 'error');
        return;
    }

    try {
        const cache = await caches.open('manual-cache-v1');
        const urls = [
            window.location.href,
            './style.css',
            './script.js'
        ];

        await cache.addAll(urls);
        showToast('✅ Page cached successfully!', 'success');
        logOfflineEvent('Page manually cached');
    } catch (error) {
        console.error('Caching failed:', error);
        showToast('❌ Failed to cache page', 'error');
    }
}

async function viewCacheInfo() {
    try {
        const cacheNames = await caches.keys();
        let html = `<p><strong>Total Caches:</strong> ${cacheNames.length}</p>`;

        if (cacheNames.length === 0) {
            html += '<p class="muted">No caches found</p>';
        } else {
            html += '<ul class="cache-list">';

            for (const cacheName of cacheNames) {
                const cache = await caches.open(cacheName);
                const keys = await cache.keys();
                html += `<li><strong>${cacheName}</strong> (${keys.length} items)</li>`;
            }

            html += '</ul>';
        }

        document.getElementById('cacheStats').innerHTML = html;
        showToast('Cache info loaded', 'success');
    } catch (error) {
        console.error('Error getting cache info:', error);
        showToast('Failed to get cache info', 'error');
    }
}

async function clearAllCaches() {
    if (!confirm('Are you sure you want to clear all caches?')) {
        return;
    }

    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));

        showToast('✅ All caches cleared!', 'success');
        document.getElementById('cacheStats').innerHTML = '<p class="muted">All caches have been cleared</p>';
        logOfflineEvent('All caches cleared');
    } catch (error) {
        console.error('Error clearing caches:', error);
        showToast('❌ Failed to clear caches', 'error');
    }
}

// ===========================================================================
// Background Sync
// ===========================================================================
async function queueSync() {
    const messageInput = document.getElementById('syncMessage');
    const message = messageInput.value.trim();

    if (!message) {
        showToast('Please enter a message', 'warning');
        return;
    }

    if ('serviceWorker' in navigator && 'sync' in registration) {
        try {
            await registration.sync.register('sync-data');
            updateSyncOutput(`Queued: "${message}" - Will sync when online`, 'success');
            showToast('✅ Queued for sync!', 'success');
            messageInput.value = '';
        } catch (error) {
            console.error('Sync registration failed:', error);
            showToast('❌ Sync registration failed', 'error');
        }
    } else {
        updateSyncOutput('Background Sync not supported in this browser', 'error');
        showToast('Background Sync not supported', 'error');
    }
}

function updateSyncOutput(message, type) {
    const output = document.getElementById('syncOutput');
    if (output) {
        const timestamp = new Date().toLocaleTimeString();
        const className = type === 'error' ? 'error' : type === 'success' ? 'success' : '';
        output.innerHTML = `<p class="${className}">[${timestamp}] ${message}</p>` + output.innerHTML;
    }
}

// ===========================================================================
// Push Notifications
// ===========================================================================
async function requestNotificationPermission() {
    try {
        const permission = await Notification.requestPermission();
        updatePermissionStatus(permission);

        if (permission === 'granted') {
            showToast('✅ Notification permission granted!', 'success');
            document.getElementById('sendNotification').disabled = false;
            document.getElementById('sendCustomNotification').disabled = false;
            logNotification('Permission granted');
        } else if (permission === 'denied') {
            showToast('❌ Notification permission denied', 'error');
            logNotification('Permission denied');
        } else {
            showToast('Notification permission dismissed', 'warning');
            logNotification('Permission dismissed');
        }
    } catch (error) {
        console.error('Error requesting permission:', error);
        showToast('Failed to request permission', 'error');
    }
}

function updatePermissionStatus(status) {
    const statusEl = document.getElementById('permissionStatus');
    if (statusEl) {
        statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
        statusEl.className = `permission-${status}`;
    }
}

async function sendTestNotification() {
    if (Notification.permission !== 'granted') {
        showToast('Please grant notification permission first', 'warning');
        return;
    }

    if (registration) {
        try {
            await registration.showNotification('Test Notification', {
                body: 'This is a test notification from the Service Worker!',
                icon: './icon-192.png',
                badge: './badge-72.png',
                vibrate: [200, 100, 200],
                tag: 'test-notification',
                requireInteraction: false
            });

            showToast('✅ Notification sent!', 'success');
            logNotification('Test notification sent');
        } catch (error) {
            console.error('Error sending notification:', error);
            showToast('Failed to send notification', 'error');
        }
    }
}

async function sendCustomNotification() {
    if (Notification.permission !== 'granted') {
        showToast('Please grant notification permission first', 'warning');
        return;
    }

    const title = document.getElementById('notifTitle').value;
    const body = document.getElementById('notifBody').value;

    if (!title || !body) {
        showToast('Please fill in title and body', 'warning');
        return;
    }

    if (registration) {
        try {
            await registration.showNotification(title, {
                body: body,
                icon: './icon-192.png',
                badge: './badge-72.png',
                vibrate: [200, 100, 200]
            });

            showToast('✅ Custom notification sent!', 'success');
            logNotification(`Custom notification: ${title}`);
        } catch (error) {
            console.error('Error sending notification:', error);
            showToast('Failed to send notification', 'error');
        }
    }
}

function logNotification(message) {
    const output = document.getElementById('notificationOutput');
    if (output) {
        const timestamp = new Date().toLocaleTimeString();
        output.innerHTML = `<p>[${timestamp}] ${message}</p>` + output.innerHTML;
    }
}

// ===========================================================================
// Advanced Features
// ===========================================================================
function sendMessageToSW() {
    const input = document.getElementById('messageToSW');
    const message = input.value.trim();

    if (!message) {
        showToast('Please enter a message', 'warning');
        return;
    }

    if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
            type: 'CUSTOM_MESSAGE',
            message: message,
            timestamp: Date.now()
        });

        logMessage(`Sent to SW: ${message}`, 'sent');
        input.value = '';
        showToast('Message sent to Service Worker', 'success');
    } else {
        showToast('Service Worker not active', 'error');
    }
}

function handleSWMessage(event) {
    console.log('Message from SW:', event.data);

    if (event.data.type === 'STRATEGY_CHANGED') {
        logMessage(`SW: Strategy changed to ${event.data.strategy}`, 'received');
    } else if (event.data.type === 'CACHE_CLEARED') {
        logMessage('SW: Caches cleared', 'received');
    } else if (event.data.type === 'CACHE_INFO') {
        console.log('Cache info:', event.data.info);
    } else {
        logMessage(`SW: ${JSON.stringify(event.data)}`, 'received');
    }
}

function logMessage(message, type) {
    const output = document.getElementById('messageOutput');
    if (output) {
        const timestamp = new Date().toLocaleTimeString();
        const className = type === 'sent' ? 'message-sent' : 'message-received';
        output.innerHTML = `<p class="${className}">[${timestamp}] ${message}</p>` + output.innerHTML;
    }
}

async function cacheSpecificUrl() {
    const urlInput = document.getElementById('cacheUrl');
    const url = urlInput.value.trim();

    if (!url) {
        showToast('Please enter a URL', 'warning');
        return;
    }

    try {
        const cache = await caches.open('manual-cache-v1');
        await cache.add(url);
        showToast(`✅ Cached: ${url}`, 'success');
        logMessage(`Cached URL: ${url}`, 'sent');
        urlInput.value = '';
    } catch (error) {
        console.error('Failed to cache URL:', error);
        showToast('❌ Failed to cache URL', 'error');
    }
}

async function getClientInfo() {
    if (!navigator.serviceWorker.controller) {
        document.getElementById('clientInfo').innerHTML = '<p class="error">Service Worker not active</p>';
        return;
    }

    const info = {
        'Client ID': await getClientId(),
        'Controlled': navigator.serviceWorker.controller ? 'Yes' : 'No',
        'Online': navigator.onLine ? 'Yes' : 'No',
        'User Agent': navigator.userAgent,
        'Language': navigator.language,
        'Cookies Enabled': navigator.cookieEnabled ? 'Yes' : 'No'
    };

    let html = '<ul class="status-list">';
    for (const [key, value] of Object.entries(info)) {
        html += `<li><strong>${key}:</strong> ${value}</li>`;
    }
    html += '</ul>';

    document.getElementById('clientInfo').innerHTML = html;
}

async function getClientId() {
    const reg = await navigator.serviceWorker.getRegistration();
    return reg ? 'Active' : 'None';
}

// ===========================================================================
// Performance Metrics
// ===========================================================================
function displayPerformanceMetrics() {
    if (!window.performance || !window.performance.timing) {
        return;
    }

    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
            const connectTime = perfData.responseEnd - perfData.requestStart;
            const renderTime = perfData.domComplete - perfData.domLoading;

            const metricsEl = document.getElementById('performanceMetrics');
            if (metricsEl) {
                metricsEl.innerHTML = `
                    <ul class="status-list">
                        <li><strong>Page Load Time:</strong> ${pageLoadTime}ms</li>
                        <li><strong>Server Response Time:</strong> ${connectTime}ms</li>
                        <li><strong>DOM Render Time:</strong> ${renderTime}ms</li>
                        <li><strong>Service Worker Active:</strong> ${navigator.serviceWorker.controller ? 'Yes' : 'No'}</li>
                    </ul>
                `;
            }
        }, 0);
    });
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

            // Update active nav button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Show corresponding demo section
            demoSections.forEach(section => {
                if (section.id === `demo-${demo}`) {
                    section.classList.add('active');
                } else {
                    section.classList.remove('active');
                }
            });
        });
    });
}

// ===========================================================================
// Event Listeners Setup
// ===========================================================================
function setupEventListeners() {
    // Demo 1: Registration
    const registerBtn = document.getElementById('registerSW');
    const unregisterBtn = document.getElementById('unregisterSW');
    const checkStatusBtn = document.getElementById('checkSWStatus');

    if (registerBtn) registerBtn.addEventListener('click', registerServiceWorker);
    if (unregisterBtn) unregisterBtn.addEventListener('click', unregisterServiceWorker);
    if (checkStatusBtn) checkStatusBtn.addEventListener('click', checkServiceWorkerStatus);

    // Demo 2: Caching Strategies
    const applyStrategyBtn = document.getElementById('applyStrategy');
    const testStrategyBtn = document.getElementById('testStrategy');

    if (applyStrategyBtn) applyStrategyBtn.addEventListener('click', applyStrategy);
    if (testStrategyBtn) testStrategyBtn.addEventListener('click', testStrategy);

    // Demo 3: Offline
    const cachePageBtn = document.getElementById('cacheCurrentPage');
    const viewCacheBtn = document.getElementById('viewCacheInfo');
    const clearCacheBtn = document.getElementById('clearAllCaches');

    if (cachePageBtn) cachePageBtn.addEventListener('click', cacheCurrentPage);
    if (viewCacheBtn) viewCacheBtn.addEventListener('click', viewCacheInfo);
    if (clearCacheBtn) clearCacheBtn.addEventListener('click', clearAllCaches);

    // Demo 4: Background Sync
    const queueSyncBtn = document.getElementById('queueSync');
    if (queueSyncBtn) queueSyncBtn.addEventListener('click', queueSync);

    // Demo 5: Notifications
    const requestPermBtn = document.getElementById('requestPermission');
    const sendNotifBtn = document.getElementById('sendNotification');
    const sendCustomNotifBtn = document.getElementById('sendCustomNotification');

    if (requestPermBtn) requestPermBtn.addEventListener('click', requestNotificationPermission);
    if (sendNotifBtn) sendNotifBtn.addEventListener('click', sendTestNotification);
    if (sendCustomNotifBtn) sendCustomNotifBtn.addEventListener('click', sendCustomNotification);

    // Update permission status on load
    if (Notification.permission === 'granted') {
        updatePermissionStatus('granted');
        if (sendNotifBtn) sendNotifBtn.disabled = false;
        if (sendCustomNotifBtn) sendCustomNotifBtn.disabled = false;
    }

    // Demo 6: Advanced
    const sendMsgBtn = document.getElementById('sendMessageToSW');
    const cacheUrlBtn = document.getElementById('cacheSpecificUrl');
    const clientInfoBtn = document.getElementById('getClientInfo');

    if (sendMsgBtn) sendMsgBtn.addEventListener('click', sendMessageToSW);
    if (cacheUrlBtn) cacheUrlBtn.addEventListener('click', cacheSpecificUrl);
    if (clientInfoBtn) clientInfoBtn.addEventListener('click', getClientInfo);

    // Allow Enter key for inputs
    const messageInput = document.getElementById('messageToSW');
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessageToSW();
        });
    }

    const syncInput = document.getElementById('syncMessage');
    if (syncInput) {
        syncInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') queueSync();
        });
    }
}

// ===========================================================================
// Service Worker Support Check
// ===========================================================================
function checkServiceWorkerSupport() {
    const features = {
        'Service Worker': 'serviceWorker' in navigator,
        'Cache API': 'caches' in window,
        'Background Sync': 'sync' in (registration || {}),
        'Push Notifications': 'PushManager' in window,
        'Notifications': 'Notification' in window
    };

    console.table(features);
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

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ===========================================================================
// Console Welcome Message
// ===========================================================================
console.log('%c🔧 Service Worker Demo', 'font-size: 20px; font-weight: bold; color: #4CAF50;');
console.log('%cOpen the Application tab in DevTools to inspect the Service Worker', 'font-size: 12px; color: #666;');
console.log('%cTry going offline to test caching!', 'font-size: 12px; color: #666;');

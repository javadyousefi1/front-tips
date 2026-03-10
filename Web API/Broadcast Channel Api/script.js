// ====================================
// Utilities
// ====================================

// Generate unique tab ID
function getTabId() {
    if (!sessionStorage.tabId) {
        sessionStorage.tabId = 'tab-' + Math.random().toString(36).substr(2, 9);
    }
    return sessionStorage.tabId;
}

const TAB_ID = getTabId();
document.getElementById('currentTabId').textContent = TAB_ID;

// Toast notification system
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    const container = document.getElementById('toast-container');
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ====================================
// Demo 1: Basic Cross-Tab Messaging
// ====================================

const messageChannel = new BroadcastChannel('messages');
const messageInput = document.getElementById('messageInput');
const sendMessageBtn = document.getElementById('sendMessage');
const messageLog = document.getElementById('messageLog');

let messages = [];

// Send message
sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (!message) return;

    const messageData = {
        type: 'MESSAGE',
        content: message,
        sender: TAB_ID,
        timestamp: Date.now()
    };

    // Broadcast to other tabs
    messageChannel.postMessage(messageData);

    // Add to local log
    addMessageToLog(messageData, true);

    messageInput.value = '';
    showToast('Message sent to all tabs!', 'success');
});

// Receive messages
messageChannel.onmessage = (event) => {
    if (event.data.type === 'MESSAGE') {
        addMessageToLog(event.data, false);
        showToast(`New message from ${event.data.sender}`, 'info');
    }
};

function addMessageToLog(messageData, isSent) {
    // Remove empty state
    const emptyState = messageLog.querySelector('.empty-state');
    if (emptyState) emptyState.remove();

    const messageDiv = document.createElement('div');
    messageDiv.className = `message-item ${isSent ? 'sent' : 'received'}`;
    messageDiv.innerHTML = `
        <div class="message-header">
            <strong>${isSent ? 'You' : messageData.sender}</strong>
            <span class="message-time">${new Date(messageData.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${messageData.content}</div>
    `;

    messageLog.appendChild(messageDiv);
    messageLog.scrollTop = messageLog.scrollHeight;
}

// Enter to send
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessageBtn.click();
});

// ====================================
// Demo 2: State Synchronization
// ====================================

const stateChannel = new BroadcastChannel('state-sync');

let appState = {
    counter: 0,
    text: '',
    theme: 'light'
};

const counterValue = document.getElementById('counterValue');
const textValue = document.getElementById('textValue');
const themeSelect = document.getElementById('themeSelect');
const incrementBtn = document.getElementById('incrementBtn');
const decrementBtn = document.getElementById('decrementBtn');
const resetBtn = document.getElementById('resetBtn');

// Increment counter
incrementBtn.addEventListener('click', () => {
    updateState({ counter: appState.counter + 1 });
});

// Decrement counter
decrementBtn.addEventListener('click', () => {
    updateState({ counter: appState.counter - 1 });
});

// Reset counter
resetBtn.addEventListener('click', () => {
    updateState({ counter: 0 });
});

// Text change
textValue.addEventListener('input', (e) => {
    updateState({ text: e.target.value });
});

// Theme change
themeSelect.addEventListener('change', (e) => {
    updateState({ theme: e.target.value });
});

function updateState(changes) {
    // Update local state
    appState = { ...appState, ...changes };

    // Broadcast to other tabs
    stateChannel.postMessage({
        type: 'STATE_UPDATE',
        changes: changes,
        sender: TAB_ID
    });

    // Update UI
    renderState();
}

function renderState() {
    counterValue.textContent = appState.counter;
    textValue.value = appState.text;
    themeSelect.value = appState.theme;

    // Apply theme
    document.body.setAttribute('data-theme', appState.theme);
}

// Receive state updates
stateChannel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE' && event.data.sender !== TAB_ID) {
        appState = { ...appState, ...event.data.changes };
        renderState();
        showToast('State updated from another tab!', 'info');
    }
};

// ====================================
// Demo 3: Authentication Sync
// ====================================

const authChannel = new BroadcastChannel('auth');

let currentAuthUser = null;

const authStatus = document.getElementById('authStatus');
const loginForm = document.getElementById('loginForm');
const logoutForm = document.getElementById('logoutForm');
const usernameInput = document.getElementById('usernameInput');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const currentUserSpan = document.getElementById('currentUser');

// Login
loginBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) return;

    const user = {
        username: username,
        loginTime: Date.now(),
        tabId: TAB_ID
    };

    // Broadcast login
    authChannel.postMessage({
        type: 'LOGIN',
        user: user
    });

    // Update local state
    handleLogin(user);
    usernameInput.value = '';
});

// Logout
logoutBtn.addEventListener('click', () => {
    // Broadcast logout
    authChannel.postMessage({
        type: 'LOGOUT'
    });

    // Update local state
    handleLogout();
});

function handleLogin(user) {
    currentAuthUser = user;
    loginForm.style.display = 'none';
    logoutForm.style.display = 'block';
    currentUserSpan.textContent = user.username;

    const indicator = authStatus.querySelector('.status-indicator');
    indicator.className = 'status-indicator online';
    authStatus.querySelector('span:last-child').textContent = `Logged in as ${user.username}`;

    showToast(`Logged in as ${user.username}`, 'success');
}

function handleLogout() {
    currentAuthUser = null;
    loginForm.style.display = 'block';
    logoutForm.style.display = 'none';

    const indicator = authStatus.querySelector('.status-indicator');
    indicator.className = 'status-indicator offline';
    authStatus.querySelector('span:last-child').textContent = 'Not logged in';

    showToast('Logged out from all tabs', 'info');
}

// Receive auth events
authChannel.onmessage = (event) => {
    switch (event.data.type) {
        case 'LOGIN':
            handleLogin(event.data.user);
            break;
        case 'LOGOUT':
            handleLogout();
            break;
    }
};

// Enter to login
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') loginBtn.click();
});

// ====================================
// Demo 4: Shopping Cart Sync
// ====================================

const cartChannel = new BroadcastChannel('shopping-cart');

let cart = [];

const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCartBtn');
const addProductBtns = document.querySelectorAll('.add-product');

// Add product
addProductBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const product = {
            name: btn.dataset.name,
            price: parseFloat(btn.dataset.price),
            id: Math.random().toString(36).substr(2, 9)
        };

        // Broadcast add
        cartChannel.postMessage({
            type: 'ADD_ITEM',
            item: product
        });

        // Update local cart
        addToCart(product);

        // Visual feedback
        btn.textContent = 'Added!';
        setTimeout(() => btn.textContent = 'Add', 1000);
    });
});

// Clear cart
clearCartBtn.addEventListener('click', () => {
    // Broadcast clear
    cartChannel.postMessage({
        type: 'CLEAR_CART'
    });

    // Update local cart
    clearCart();
});

function addToCart(item) {
    cart.push(item);
    renderCart();
    showToast(`Added ${item.name} to cart`, 'success');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    renderCart();
}

function clearCart() {
    cart = [];
    renderCart();
    showToast('Cart cleared in all tabs', 'info');
}

function renderCart() {
    const total = cart.reduce((sum, item) => sum + item.price, 0);

    cartBadge.textContent = cart.length;
    cartBadge.style.display = cart.length > 0 ? 'inline' : 'none';
    cartTotal.textContent = total;

    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-state">Cart is empty</p>';
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>$${item.price}</span>
                <button class="btn-remove" data-id="${item.id}">×</button>
            </div>
        `).join('');

        // Add remove listeners
        cartItems.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.id;

                // Broadcast remove
                cartChannel.postMessage({
                    type: 'REMOVE_ITEM',
                    itemId: itemId
                });

                // Update local cart
                removeFromCart(itemId);
            });
        });
    }
}

// Receive cart events
cartChannel.onmessage = (event) => {
    switch (event.data.type) {
        case 'ADD_ITEM':
            addToCart(event.data.item);
            break;
        case 'REMOVE_ITEM':
            removeFromCart(event.data.itemId);
            break;
        case 'CLEAR_CART':
            clearCart();
            break;
    }
};

// ====================================
// Demo 5: Tab Presence Detection
// ====================================

const presenceChannel = new BroadcastChannel('presence');

let activeTabs = new Map();
activeTabs.set(TAB_ID, {
    id: TAB_ID,
    joinedAt: Date.now(),
    lastSeen: Date.now()
});

const tabList = document.getElementById('tabList');
const totalTabsEl = document.getElementById('totalTabs');
const activeSinceEl = document.getElementById('activeSince');

// Announce this tab
presenceChannel.postMessage({
    type: 'TAB_JOINED',
    tabId: TAB_ID,
    timestamp: Date.now()
});

// Request all tabs to announce
presenceChannel.postMessage({
    type: 'REQUEST_PRESENCE'
});

// Heartbeat every 2 seconds
setInterval(() => {
    presenceChannel.postMessage({
        type: 'HEARTBEAT',
        tabId: TAB_ID,
        timestamp: Date.now()
    });
}, 2000);

// Check for dead tabs every 5 seconds
setInterval(() => {
    const now = Date.now();
    activeTabs.forEach((tab, id) => {
        if (id !== TAB_ID && now - tab.lastSeen > 10000) {
            activeTabs.delete(id);
            renderTabs();
        }
    });
}, 5000);

// Receive presence events
presenceChannel.onmessage = (event) => {
    switch (event.data.type) {
        case 'TAB_JOINED':
            if (event.data.tabId !== TAB_ID) {
                activeTabs.set(event.data.tabId, {
                    id: event.data.tabId,
                    joinedAt: event.data.timestamp,
                    lastSeen: Date.now()
                });
                renderTabs();
                showToast('New tab opened!', 'info');

                // Respond with our presence
                presenceChannel.postMessage({
                    type: 'HEARTBEAT',
                    tabId: TAB_ID,
                    timestamp: Date.now()
                });
            }
            break;

        case 'REQUEST_PRESENCE':
            if (event.data.tabId !== TAB_ID) {
                presenceChannel.postMessage({
                    type: 'HEARTBEAT',
                    tabId: TAB_ID,
                    timestamp: Date.now()
                });
            }
            break;

        case 'HEARTBEAT':
            if (event.data.tabId !== TAB_ID) {
                if (!activeTabs.has(event.data.tabId)) {
                    activeTabs.set(event.data.tabId, {
                        id: event.data.tabId,
                        joinedAt: event.data.timestamp,
                        lastSeen: Date.now()
                    });
                    renderTabs();
                } else {
                    const tab = activeTabs.get(event.data.tabId);
                    tab.lastSeen = Date.now();
                }
            }
            break;

        case 'TAB_CLOSING':
            if (event.data.tabId !== TAB_ID) {
                activeTabs.delete(event.data.tabId);
                renderTabs();
                showToast('A tab was closed', 'info');
            }
            break;
    }
};

function renderTabs() {
    const tabs = Array.from(activeTabs.values());

    tabList.innerHTML = tabs.map(tab => `
        <div class="tab-item ${tab.id === TAB_ID ? 'current' : ''}">
            <span class="tab-icon">📑</span>
            <span class="tab-name">${tab.id === TAB_ID ? 'This Tab' : tab.id}</span>
            ${tab.id === TAB_ID ? '<span class="tab-badge">Current</span>' : ''}
        </div>
    `).join('');

    totalTabsEl.textContent = tabs.length;
}

// Update active since timer
const startTime = Date.now();
setInterval(() => {
    const seconds = Math.floor((Date.now() - startTime) / 1000);
    activeSinceEl.textContent = seconds + 's';
}, 1000);

// Announce when closing
window.addEventListener('beforeunload', () => {
    presenceChannel.postMessage({
        type: 'TAB_CLOSING',
        tabId: TAB_ID
    });
});

// ====================================
// Demo 6: Cross-Tab Notifications
// ====================================

const notificationChannel = new BroadcastChannel('notifications');

const notificationType = document.getElementById('notificationType');
const notificationText = document.getElementById('notificationText');
const sendNotificationBtn = document.getElementById('sendNotification');
const notificationContainer = document.getElementById('notificationContainer');

// Send notification
sendNotificationBtn.addEventListener('click', () => {
    const text = notificationText.value.trim();
    if (!text) return;

    const notification = {
        type: notificationType.value,
        message: text,
        timestamp: Date.now(),
        sender: TAB_ID
    };

    // Broadcast to other tabs
    notificationChannel.postMessage({
        type: 'NOTIFICATION',
        notification: notification
    });

    // Show locally
    showNotification(notification);

    notificationText.value = '';
});

// Receive notifications
notificationChannel.onmessage = (event) => {
    if (event.data.type === 'NOTIFICATION') {
        showNotification(event.data.notification);
    }
};

function showNotification(notification) {
    const notifEl = document.createElement('div');
    notifEl.className = `notification notification-${notification.type}`;

    const icon = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    }[notification.type];

    notifEl.innerHTML = `
        <span class="notification-icon">${icon}</span>
        <div class="notification-content">
            <div class="notification-message">${notification.message}</div>
            <div class="notification-meta">
                ${notification.sender === TAB_ID ? 'You' : notification.sender} •
                ${new Date(notification.timestamp).toLocaleTimeString()}
            </div>
        </div>
        <button class="notification-close">×</button>
    `;

    notificationContainer.appendChild(notifEl);

    // Animate in
    setTimeout(() => notifEl.classList.add('show'), 10);

    // Close button
    notifEl.querySelector('.notification-close').addEventListener('click', () => {
        notifEl.classList.remove('show');
        setTimeout(() => notifEl.remove(), 300);
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notifEl.parentElement) {
            notifEl.classList.remove('show');
            setTimeout(() => notifEl.remove(), 300);
        }
    }, 5000);
}

// Enter to send notification
notificationText.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendNotificationBtn.click();
});

// ====================================
// Update tab counter in header
// ====================================

setInterval(() => {
    document.getElementById('tabCount').textContent = activeTabs.size;
}, 1000);

// ====================================
// Cleanup on page unload
// ====================================

window.addEventListener('beforeunload', () => {
    messageChannel.close();
    stateChannel.close();
    authChannel.close();
    cartChannel.close();
    presenceChannel.close();
    notificationChannel.close();
});

// ====================================
// Initial render
// ====================================

renderState();
renderCart();
renderTabs();

console.log('✓ BroadcastChannel demos loaded!');
console.log('💡 Open this page in multiple tabs to see cross-tab communication!');
console.log('Tab ID:', TAB_ID);

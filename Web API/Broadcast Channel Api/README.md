# BroadcastChannel API

A comprehensive guide to the BroadcastChannel API with 6 practical examples demonstrating how to communicate between browser tabs, windows, and iframes.

## What is BroadcastChannel?

The **BroadcastChannel** API allows simple communication between different browsing contexts (tabs, windows, iframes, workers) of the same origin. It enables you to broadcast messages to all listening contexts without needing to maintain references to them.

## Key Concepts

### 1. Creating a Channel
Create a channel with a unique name that all contexts will use.

```javascript
const channel = new BroadcastChannel('my-channel');
```

### 2. Sending Messages
Broadcast messages to all other contexts listening on the same channel.

```javascript
channel.postMessage({ type: 'greeting', message: 'Hello!' });
```

### 3. Receiving Messages
Listen for messages from other contexts.

```javascript
channel.onmessage = (event) => {
    console.log('Received:', event.data);
};
```

### 4. Closing the Channel
Close the channel when done to free resources.

```javascript
channel.close();
```

## Why Use BroadcastChannel?

### The Problem Without It

**Before BroadcastChannel**, cross-tab communication required:
- LocalStorage events (hacky and unreliable)
- SharedWorkers (complex setup)
- Server-side solutions (WebSockets, polling)
- Window.postMessage (requires window references)

### The Solution With BroadcastChannel

```javascript
// Simple and clean!
const channel = new BroadcastChannel('sync');

// Send from Tab 1
channel.postMessage({ user: 'logged-in' });

// Receive in Tab 2, 3, 4...
channel.onmessage = (e) => {
    console.log('User logged in!', e.data);
};
```

**Benefits:**
- ✅ Simple API
- ✅ No server required
- ✅ Works across tabs, windows, iframes
- ✅ Same-origin only (secure)
- ✅ Automatic message distribution

## Demos Included

### 1. Basic Cross-Tab Messaging
Send simple messages between tabs.

**Use Case**: Notify all tabs when something happens.

```javascript
// Create a channel
const channel = new BroadcastChannel('notifications');

// Send a message
channel.postMessage({
    type: 'notification',
    message: 'New message received!',
    timestamp: Date.now()
});

// Listen for messages
channel.onmessage = (event) => {
    const { type, message, timestamp } = event.data;
    console.log(`[${new Date(timestamp).toLocaleTimeString()}] ${message}`);
};
```

### 2. Cross-Tab State Sync
Synchronize application state across all open tabs.

**Use Case**: Keep UI in sync when user makes changes in one tab.

```javascript
const syncChannel = new BroadcastChannel('app-state');

// When state changes in Tab 1
function updateState(newState) {
    // Update local state
    appState = { ...appState, ...newState };

    // Broadcast to other tabs
    syncChannel.postMessage({
        type: 'STATE_UPDATE',
        payload: newState
    });
}

// Other tabs receive and update
syncChannel.onmessage = (event) => {
    if (event.data.type === 'STATE_UPDATE') {
        appState = { ...appState, ...event.data.payload };
        renderUI();
    }
};
```

### 3. User Authentication Sync
Sync login/logout across all tabs.

**Use Case**: When user logs out in one tab, log out everywhere.

```javascript
const authChannel = new BroadcastChannel('auth');

// User logs in
function login(user) {
    localStorage.setItem('user', JSON.stringify(user));

    authChannel.postMessage({
        type: 'LOGIN',
        user: user
    });
}

// User logs out
function logout() {
    localStorage.removeItem('user');

    authChannel.postMessage({
        type: 'LOGOUT'
    });
}

// Listen in all tabs
authChannel.onmessage = (event) => {
    switch(event.data.type) {
        case 'LOGIN':
            updateUserUI(event.data.user);
            break;
        case 'LOGOUT':
            redirectToLogin();
            break;
    }
};
```

### 4. Shopping Cart Sync
Keep shopping cart synchronized across tabs.

**Use Case**: User adds items in Tab 1, sees them in Tab 2.

```javascript
const cartChannel = new BroadcastChannel('shopping-cart');

class ShoppingCart {
    addItem(item) {
        this.items.push(item);
        this.save();

        // Notify other tabs
        cartChannel.postMessage({
            action: 'ITEM_ADDED',
            item: item,
            cartTotal: this.getTotal()
        });
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);
        this.save();

        cartChannel.postMessage({
            action: 'ITEM_REMOVED',
            itemId: itemId,
            cartTotal: this.getTotal()
        });
    }
}

// Listen for cart updates in all tabs
cartChannel.onmessage = (event) => {
    const { action, item, itemId, cartTotal } = event.data;

    switch(action) {
        case 'ITEM_ADDED':
            showNotification(`Added ${item.name} to cart`);
            updateCartBadge(cartTotal);
            break;
        case 'ITEM_REMOVED':
            updateCartBadge(cartTotal);
            break;
    }
};
```

### 5. Live Collaborative Features
Enable real-time collaboration features.

**Use Case**: Multiple tabs editing the same document.

```javascript
const collabChannel = new BroadcastChannel('collaboration');

// User makes an edit
function onEdit(change) {
    // Apply change locally
    applyChange(change);

    // Broadcast to other tabs
    collabChannel.postMessage({
        type: 'EDIT',
        change: change,
        userId: currentUser.id,
        timestamp: Date.now()
    });
}

// Receive edits from other tabs
collabChannel.onmessage = (event) => {
    if (event.data.type === 'EDIT') {
        // Don't apply our own edits
        if (event.data.userId !== currentUser.id) {
            applyChange(event.data.change);
            showUserActivity(event.data.userId, 'is editing');
        }
    }
};
```

### 6. Tab Counter & Presence
Track how many tabs are open and which tab is active.

**Use Case**: Show user how many tabs they have open, manage resources.

```javascript
const presenceChannel = new BroadcastChannel('presence');

let openTabs = new Set([getTabId()]);

// Announce this tab
presenceChannel.postMessage({
    type: 'TAB_OPENED',
    tabId: getTabId()
});

// Request all tabs to announce themselves
presenceChannel.postMessage({
    type: 'REQUEST_PRESENCE'
});

// Listen for other tabs
presenceChannel.onmessage = (event) => {
    const { type, tabId } = event.data;

    switch(type) {
        case 'TAB_OPENED':
            openTabs.add(tabId);
            updateTabCounter(openTabs.size);
            break;

        case 'TAB_CLOSED':
            openTabs.delete(tabId);
            updateTabCounter(openTabs.size);
            break;

        case 'REQUEST_PRESENCE':
            // Respond with our presence
            presenceChannel.postMessage({
                type: 'TAB_OPENED',
                tabId: getTabId()
            });
            break;
    }
};

// Announce when closing
window.addEventListener('beforeunload', () => {
    presenceChannel.postMessage({
        type: 'TAB_CLOSED',
        tabId: getTabId()
    });
});

function getTabId() {
    if (!sessionStorage.tabId) {
        sessionStorage.tabId = Math.random().toString(36).substr(2, 9);
    }
    return sessionStorage.tabId;
}
```

## Real-World Use Cases

### 1. Multi-Tab Music Player

```javascript
const musicChannel = new BroadcastChannel('music-player');

class MusicPlayer {
    play(song) {
        this.currentSong = song;
        this.audio.play();

        // Pause in other tabs
        musicChannel.postMessage({
            action: 'PAUSE_OTHER_TABS',
            tabId: this.tabId,
            song: song
        });
    }

    pause() {
        this.audio.pause();

        musicChannel.postMessage({
            action: 'PAUSED',
            song: this.currentSong
        });
    }
}

musicChannel.onmessage = (event) => {
    if (event.data.action === 'PAUSE_OTHER_TABS') {
        if (event.data.tabId !== player.tabId) {
            player.pause();
        }
    }
};
```

### 2. Form Auto-Save Sync

```javascript
const formChannel = new BroadcastChannel('form-sync');

// Save draft in one tab
function saveDraft(formData) {
    localStorage.setItem('draft', JSON.stringify(formData));

    formChannel.postMessage({
        type: 'DRAFT_SAVED',
        data: formData,
        timestamp: Date.now()
    });
}

// Load in other tabs
formChannel.onmessage = (event) => {
    if (event.data.type === 'DRAFT_SAVED') {
        showNotification('Draft saved in another tab');

        if (confirm('Load the latest draft?')) {
            loadFormData(event.data.data);
        }
    }
};
```

### 3. Theme Sync

```javascript
const themeChannel = new BroadcastChannel('theme');

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    // Apply to all tabs
    themeChannel.postMessage({
        type: 'THEME_CHANGED',
        theme: theme
    });
}

themeChannel.onmessage = (event) => {
    if (event.data.type === 'THEME_CHANGED') {
        document.documentElement.setAttribute('data-theme', event.data.theme);
    }
};
```

### 4. Notification Center

```javascript
const notificationChannel = new BroadcastChannel('notifications');

function showNotification(notification) {
    // Show in current tab
    displayNotification(notification);

    // Show in all other tabs
    notificationChannel.postMessage({
        type: 'NEW_NOTIFICATION',
        notification: notification,
        timestamp: Date.now()
    });
}

notificationChannel.onmessage = (event) => {
    if (event.data.type === 'NEW_NOTIFICATION') {
        displayNotification(event.data.notification);

        // Play sound only if tab is not active
        if (document.hidden) {
            playNotificationSound();
        }
    }
};
```

### 5. Session Timeout Sync

```javascript
const sessionChannel = new BroadcastChannel('session');

let sessionTimeout;

function resetSessionTimeout() {
    clearTimeout(sessionTimeout);

    sessionTimeout = setTimeout(() => {
        // Logout this tab
        logout();

        // Logout all tabs
        sessionChannel.postMessage({
            type: 'SESSION_EXPIRED'
        });
    }, 30 * 60 * 1000); // 30 minutes

    // Notify other tabs to reset their timers
    sessionChannel.postMessage({
        type: 'ACTIVITY'
    });
}

sessionChannel.onmessage = (event) => {
    switch(event.data.type) {
        case 'ACTIVITY':
            resetSessionTimeout();
            break;
        case 'SESSION_EXPIRED':
            logout();
            break;
    }
};

// Reset on any user activity
document.addEventListener('click', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
```

### 6. Online/Offline Status

```javascript
const statusChannel = new BroadcastChannel('online-status');

window.addEventListener('online', () => {
    statusChannel.postMessage({
        type: 'ONLINE',
        timestamp: Date.now()
    });
});

window.addEventListener('offline', () => {
    statusChannel.postMessage({
        type: 'OFFLINE',
        timestamp: Date.now()
    });
});

statusChannel.onmessage = (event) => {
    if (event.data.type === 'ONLINE') {
        showBanner('Connection restored');
        syncPendingData();
    } else if (event.data.type === 'OFFLINE') {
        showBanner('No internet connection');
    }
};
```

## Advanced Patterns

### Message Queue with Acknowledgment

```javascript
const queueChannel = new BroadcastChannel('message-queue');

class MessageQueue {
    constructor() {
        this.pendingMessages = new Map();

        queueChannel.onmessage = (event) => {
            if (event.data.type === 'ACK') {
                this.pendingMessages.delete(event.data.messageId);
            } else if (event.data.type === 'MESSAGE') {
                this.handleMessage(event.data);

                // Send acknowledgment
                queueChannel.postMessage({
                    type: 'ACK',
                    messageId: event.data.id
                });
            }
        };
    }

    send(message) {
        const id = Math.random().toString(36);

        this.pendingMessages.set(id, {
            message,
            timestamp: Date.now()
        });

        queueChannel.postMessage({
            type: 'MESSAGE',
            id: id,
            payload: message
        });

        // Retry if no ACK in 5 seconds
        setTimeout(() => {
            if (this.pendingMessages.has(id)) {
                this.send(message);
            }
        }, 5000);
    }
}
```

### Leader Election

```javascript
const leaderChannel = new BroadcastChannel('leader-election');

class TabLeader {
    constructor() {
        this.tabId = getTabId();
        this.isLeader = false;
        this.lastHeartbeat = Date.now();

        // Request current leader
        leaderChannel.postMessage({
            type: 'WHO_IS_LEADER'
        });

        // Become leader if no response in 1 second
        setTimeout(() => {
            if (!this.isLeader) {
                this.becomeLeader();
            }
        }, 1000);

        leaderChannel.onmessage = (event) => {
            switch(event.data.type) {
                case 'WHO_IS_LEADER':
                    if (this.isLeader) {
                        leaderChannel.postMessage({
                            type: 'I_AM_LEADER',
                            tabId: this.tabId
                        });
                    }
                    break;

                case 'I_AM_LEADER':
                    if (event.data.tabId !== this.tabId) {
                        this.isLeader = false;
                        this.lastHeartbeat = Date.now();
                    }
                    break;

                case 'LEADER_HEARTBEAT':
                    this.lastHeartbeat = Date.now();
                    break;
            }
        };

        // Check if leader is alive
        setInterval(() => {
            if (!this.isLeader && Date.now() - this.lastHeartbeat > 5000) {
                this.becomeLeader();
            }
        }, 1000);
    }

    becomeLeader() {
        this.isLeader = true;
        console.log('This tab is now the leader');

        // Send heartbeat
        setInterval(() => {
            if (this.isLeader) {
                leaderChannel.postMessage({
                    type: 'LEADER_HEARTBEAT',
                    tabId: this.tabId
                });
            }
        }, 2000);

        // Do leader-specific tasks
        this.startLeaderTasks();
    }

    startLeaderTasks() {
        // Only the leader tab does this
        // e.g., polling server, background sync, etc.
    }
}
```

### Request-Response Pattern

```javascript
const rpcChannel = new BroadcastChannel('rpc');

class TabRPC {
    constructor() {
        this.pendingRequests = new Map();

        rpcChannel.onmessage = (event) => {
            if (event.data.type === 'REQUEST') {
                this.handleRequest(event.data);
            } else if (event.data.type === 'RESPONSE') {
                const callback = this.pendingRequests.get(event.data.requestId);
                if (callback) {
                    callback(event.data.result);
                    this.pendingRequests.delete(event.data.requestId);
                }
            }
        };
    }

    request(method, params) {
        return new Promise((resolve) => {
            const requestId = Math.random().toString(36);

            this.pendingRequests.set(requestId, resolve);

            rpcChannel.postMessage({
                type: 'REQUEST',
                requestId: requestId,
                method: method,
                params: params
            });

            // Timeout after 5 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(requestId)) {
                    this.pendingRequests.delete(requestId);
                    resolve(null);
                }
            }, 5000);
        });
    }

    handleRequest(request) {
        // Process request
        const result = this.processMethod(request.method, request.params);

        // Send response
        rpcChannel.postMessage({
            type: 'RESPONSE',
            requestId: request.requestId,
            result: result
        });
    }
}

// Usage
const rpc = new TabRPC();
const result = await rpc.request('getUserData', { userId: 123 });
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 54+     |
| Firefox | 38+     |
| Safari  | 15.4+   |
| Edge    | 79+     |
| Opera   | 41+     |

**Support:** ~95% of users globally

### Feature Detection

```javascript
if ('BroadcastChannel' in window) {
    const channel = new BroadcastChannel('my-channel');
    // Use BroadcastChannel
} else {
    // Fallback to localStorage events
    console.warn('BroadcastChannel not supported');
}
```

## Best Practices

### 1. Always Close Channels

```javascript
// ✓ Good
const channel = new BroadcastChannel('data');

window.addEventListener('beforeunload', () => {
    channel.close();
});

// ✗ Bad - Memory leak
const channel = new BroadcastChannel('data');
// Never closed
```

### 2. Use Structured Messages

```javascript
// ✓ Good - Typed messages
channel.postMessage({
    type: 'USER_ACTION',
    action: 'LOGIN',
    payload: { userId: 123 },
    timestamp: Date.now()
});

// ✗ Bad - Unstructured
channel.postMessage('user logged in');
```

### 3. Handle Message Types

```javascript
// ✓ Good
channel.onmessage = (event) => {
    switch(event.data.type) {
        case 'LOGIN':
            handleLogin(event.data);
            break;
        case 'LOGOUT':
            handleLogout(event.data);
            break;
        default:
            console.warn('Unknown message type:', event.data.type);
    }
};

// ✗ Bad - No type checking
channel.onmessage = (event) => {
    handleMessage(event.data); // What type is this?
};
```

### 4. Namespace Your Channels

```javascript
// ✓ Good - Specific names
const authChannel = new BroadcastChannel('myapp:auth');
const cartChannel = new BroadcastChannel('myapp:cart');

// ✗ Bad - Generic names
const channel1 = new BroadcastChannel('updates');
const channel2 = new BroadcastChannel('data');
```

### 5. Don't Send Large Data

```javascript
// ✓ Good - Send references
channel.postMessage({
    type: 'DATA_UPDATED',
    storageKey: 'large-dataset-key'
});

// ✗ Bad - Send large objects
channel.postMessage({
    type: 'DATA',
    data: hugeMegabyteArray // Slow!
});
```

## Common Pitfalls

### 1. Same-Origin Only

```javascript
// ✗ Won't work across different origins
// Tab 1: https://example.com
// Tab 2: https://different.com
// BroadcastChannel won't communicate between them
```

### 2. Messages Sent to Self

```javascript
// ✗ Your own tab receives your messages!
channel.postMessage('Hello');

channel.onmessage = (e) => {
    console.log(e.data); // "Hello" - received your own message!
};

// ✓ Filter your own messages
const tabId = getTabId();

channel.postMessage({ message: 'Hello', senderId: tabId });

channel.onmessage = (e) => {
    if (e.data.senderId !== tabId) {
        console.log(e.data.message);
    }
};
```

### 3. Forgetting to Close

```javascript
// ✗ Memory leak in SPAs
function setupChannel() {
    const channel = new BroadcastChannel('data');
    // Channel never closed when component unmounts
}

// ✓ Clean up properly
function setupChannel() {
    const channel = new BroadcastChannel('data');

    return () => channel.close(); // Return cleanup function
}
```

### 4. Not Handling Errors

```javascript
// ✓ Good - Handle errors
channel.onmessageerror = (event) => {
    console.error('Message deserialization error:', event);
};
```

## Testing BroadcastChannel

### Jest Test Example

```javascript
describe('BroadcastChannel', () => {
    let channel;

    beforeEach(() => {
        channel = new BroadcastChannel('test');
    });

    afterEach(() => {
        channel.close();
    });

    test('should send and receive messages', (done) => {
        const testMessage = { type: 'TEST', data: 'Hello' };

        channel.onmessage = (event) => {
            expect(event.data).toEqual(testMessage);
            done();
        };

        channel.postMessage(testMessage);
    });
});
```

## Resources

- [MDN BroadcastChannel](https://developer.mozilla.org/en-US/docs/Web/API/BroadcastChannel)
- [Can I Use](https://caniuse.com/broadcastchannel)
- [Web API Specification](https://html.spec.whatwg.org/multipage/web-messaging.html#broadcasting-to-other-browsing-contexts)

## Files

- **index.html** - Interactive demos page
- **style.css** - Styling for all demos
- **script.js** - All 6 demo implementations
- **README.md** - This documentation

## Running the Examples

Open `index.html` in a browser, then **open the same page in multiple tabs** to see cross-tab communication in action!

## License

Free to use for learning and projects.

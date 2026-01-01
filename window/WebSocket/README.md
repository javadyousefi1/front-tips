# WebSocket API

A comprehensive guide to the WebSocket API with 6 practical examples demonstrating real-time bidirectional communication between clients and servers.

## What is WebSocket?

The **WebSocket API** provides a way to open a persistent, full-duplex communication channel over a single TCP connection between a client and a server. Unlike traditional HTTP requests, WebSocket allows both the client and server to send messages to each other at any time, enabling true real-time communication.

## Key Concepts

### 1. Creating a WebSocket Connection

Establish a connection to a WebSocket server.

```javascript
const ws = new WebSocket('wss://example.com/socket');
// ws:// for insecure, wss:// for secure (like https)
```

### 2. Event Handlers

Handle connection lifecycle events.

```javascript
ws.onopen = (event) => {
    console.log('Connection opened');
    ws.send('Hello Server!');
};

ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

ws.onerror = (error) => {
    console.error('Error:', error);
};

ws.onclose = (event) => {
    console.log('Connection closed:', event.code, event.reason);
};
```

### 3. Sending Messages

Send data to the server.

```javascript
// Send text
ws.send('Hello Server!');

// Send JSON
ws.send(JSON.stringify({ type: 'message', data: 'Hello' }));

// Send binary data
const buffer = new ArrayBuffer(8);
ws.send(buffer);
```

### 4. Ready States

Check connection state.

```javascript
switch(ws.readyState) {
    case WebSocket.CONNECTING: // 0
        console.log('Connecting...');
        break;
    case WebSocket.OPEN: // 1
        console.log('Connected');
        break;
    case WebSocket.CLOSING: // 2
        console.log('Closing...');
        break;
    case WebSocket.CLOSED: // 3
        console.log('Closed');
        break;
}
```

### 5. Closing Connection

Close the WebSocket connection.

```javascript
ws.close(1000, 'Normal closure'); // code, reason
```

## Why Use WebSocket?

### The Problem Without It

**Before WebSocket**, real-time communication required:
- HTTP polling (inefficient, high latency)
- Long polling (complex, resource-heavy)
- Server-Sent Events (one-way only)
- Flash/plugin-based solutions (deprecated)
- Complex workarounds (comet, ajax push)
- High server load and bandwidth usage

### The Solution With WebSocket

```javascript
// Simple and efficient!
const ws = new WebSocket('wss://example.com/socket');

ws.onopen = () => {
    console.log('Connected!');
};

ws.onmessage = (event) => {
    console.log('Real-time message:', event.data);
};

ws.send('Instant bidirectional communication!');
```

**Benefits:**
- ✅ True bidirectional communication
- ✅ Low latency (real-time)
- ✅ Persistent connection
- ✅ Efficient (low overhead)
- ✅ Works through firewalls
- ✅ Excellent browser support
- ✅ Scalable for many clients

## Demos Included

### 1. Basic WebSocket Connection

Connect to a server, send and receive messages.

**Use Case**: Simple real-time communication, testing WebSocket endpoints.

```javascript
const ws = new WebSocket('wss://echo.websocket.org');

ws.onopen = () => {
    console.log('Connected to echo server');
    ws.send('Hello!');
};

ws.onmessage = (event) => {
    console.log('Received:', event.data);
};

ws.onclose = () => {
    console.log('Disconnected');
};

ws.onerror = (error) => {
    console.error('WebSocket error:', error);
};
```

### 2. Real-time Chat Application

Build a real-time chat with multiple users.

**Use Case**: Chat apps, messaging platforms, collaborative tools.

```javascript
class ChatClient {
    constructor(url, username) {
        this.ws = new WebSocket(url);
        this.username = username;

        this.ws.onopen = () => {
            this.sendMessage({
                type: 'join',
                user: this.username
            });
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            this.displayMessage(message);
        };
    }

    sendMessage(text) {
        const message = {
            type: 'message',
            user: this.username,
            text: text,
            timestamp: Date.now()
        };

        this.ws.send(JSON.stringify(message));
    }

    displayMessage(message) {
        console.log(`[${message.user}]: ${message.text}`);
    }
}

// Usage
const chat = new ChatClient('wss://chat-server.com', 'John');
chat.sendMessage('Hello everyone!');
```

### 3. Live Notifications & Updates

Receive real-time notifications and live data streams.

**Use Case**: Notifications, live dashboards, stock tickers, IoT sensors.

```javascript
class NotificationClient {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.notifications = [];

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'notification') {
                this.handleNotification(data);
            } else if (data.type === 'data_update') {
                this.handleDataUpdate(data);
            }
        };
    }

    handleNotification(notification) {
        this.notifications.push(notification);
        this.showNotification(notification.title, notification.message);
        this.playSound();
    }

    handleDataUpdate(data) {
        // Update dashboard with real-time data
        this.updateDashboard(data.values);
    }

    showNotification(title, message) {
        // Show browser notification or in-app notification
        if (Notification.permission === 'granted') {
            new Notification(title, { body: message });
        }
    }

    playSound() {
        // Play notification sound
        const audio = new Audio('/notification.mp3');
        audio.play();
    }
}
```

### 4. Connection State Management & Auto-Reconnect

Handle connection states and implement automatic reconnection.

**Use Case**: Robust applications, mobile apps, unstable connections.

```javascript
class ReconnectingWebSocket {
    constructor(url, options = {}) {
        this.url = url;
        this.maxRetries = options.maxRetries || 5;
        this.retryDelay = options.retryDelay || 1000;
        this.retryCount = 0;
        this.shouldReconnect = true;

        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('Connected');
            this.retryCount = 0;
            this.onOpen?.();
        };

        this.ws.onmessage = (event) => {
            this.onMessage?.(event);
        };

        this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            this.onError?.(error);
        };

        this.ws.onclose = (event) => {
            console.log('Connection closed:', event.code);
            this.onClose?.(event);

            if (this.shouldReconnect && this.retryCount < this.maxRetries) {
                this.scheduleReconnect();
            }
        };
    }

    scheduleReconnect() {
        this.retryCount++;
        // Exponential backoff
        const delay = this.retryDelay * Math.pow(2, this.retryCount - 1);

        console.log(`Reconnecting in ${delay}ms (attempt ${this.retryCount}/${this.maxRetries})`);

        setTimeout(() => {
            this.connect();
        }, delay);
    }

    send(data) {
        if (this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(data);
        } else {
            console.warn('WebSocket not open. Message not sent.');
        }
    }

    close() {
        this.shouldReconnect = false;
        this.ws.close();
    }
}

// Usage
const ws = new ReconnectingWebSocket('wss://example.com/socket', {
    maxRetries: 10,
    retryDelay: 1000
});

ws.onMessage = (event) => {
    console.log('Received:', event.data);
};
```

### 5. Binary Data Transfer

Send and receive binary data (ArrayBuffer, Blob).

**Use Case**: File transfers, image streaming, audio/video data.

```javascript
class BinaryWebSocket {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.ws.binaryType = 'arraybuffer'; // or 'blob'

        this.ws.onmessage = (event) => {
            if (event.data instanceof ArrayBuffer) {
                this.handleArrayBuffer(event.data);
            } else if (event.data instanceof Blob) {
                this.handleBlob(event.data);
            } else {
                this.handleText(event.data);
            }
        };
    }

    // Send text as ArrayBuffer
    sendText(text) {
        const encoder = new TextEncoder();
        const buffer = encoder.encode(text);
        this.ws.send(buffer);
    }

    // Send file as Blob
    sendFile(file) {
        this.ws.send(file);
    }

    // Send custom binary data
    sendBinary(data) {
        const buffer = new ArrayBuffer(data.length);
        const view = new Uint8Array(buffer);

        for (let i = 0; i < data.length; i++) {
            view[i] = data[i];
        }

        this.ws.send(buffer);
    }

    handleArrayBuffer(buffer) {
        const view = new Uint8Array(buffer);
        console.log('Received bytes:', view.length);

        // Convert to text if needed
        const decoder = new TextDecoder();
        const text = decoder.decode(buffer);
        console.log('Decoded:', text);
    }

    handleBlob(blob) {
        console.log('Received blob:', blob.size, 'bytes');

        // Read blob content
        const reader = new FileReader();
        reader.onload = (event) => {
            console.log('Blob content:', event.target.result);
        };
        reader.readAsText(blob);
    }

    handleText(text) {
        console.log('Received text:', text);
    }
}
```

### 6. Multiple Connections & Performance Monitoring

Manage multiple WebSocket connections and monitor performance.

**Use Case**: Microservices, distributed systems, load testing.

```javascript
class WebSocketManager {
    constructor() {
        this.connections = new Map();
        this.stats = {
            totalMessages: 0,
            totalBytes: 0,
            startTime: Date.now()
        };
    }

    createConnection(id, url) {
        const ws = new WebSocket(url);

        const connectionData = {
            ws: ws,
            messageCount: 0,
            bytesSent: 0,
            bytesReceived: 0,
            latency: 0,
            createdAt: Date.now()
        };

        ws.onopen = () => {
            console.log(`Connection ${id} opened`);
        };

        ws.onmessage = (event) => {
            connectionData.messageCount++;
            connectionData.bytesReceived += event.data.length;
            this.stats.totalMessages++;
            this.stats.totalBytes += event.data.length;
        };

        ws.onclose = () => {
            console.log(`Connection ${id} closed`);
            this.connections.delete(id);
        };

        this.connections.set(id, connectionData);
        return ws;
    }

    sendToAll(message) {
        this.connections.forEach((data, id) => {
            if (data.ws.readyState === WebSocket.OPEN) {
                data.ws.send(message);
                data.bytesSent += message.length;
            }
        });
    }

    measureLatency(id) {
        const conn = this.connections.get(id);
        if (!conn || conn.ws.readyState !== WebSocket.OPEN) return;

        const startTime = Date.now();
        conn.ws.send(JSON.stringify({ type: 'ping', timestamp: startTime }));

        // Assuming server echoes back
        const originalHandler = conn.ws.onmessage;
        conn.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ping') {
                conn.latency = Date.now() - data.timestamp;
            }
            originalHandler(event);
        };
    }

    getStats() {
        const uptime = (Date.now() - this.stats.startTime) / 1000;
        const messagesPerSecond = this.stats.totalMessages / uptime;
        const bytesPerSecond = this.stats.totalBytes / uptime;

        return {
            activeConnections: this.connections.size,
            totalMessages: this.stats.totalMessages,
            totalBytes: this.stats.totalBytes,
            uptime: uptime,
            messagesPerSecond: messagesPerSecond.toFixed(2),
            bytesPerSecond: (bytesPerSecond / 1024).toFixed(2) + ' KB/s'
        };
    }

    closeAll() {
        this.connections.forEach((data) => {
            data.ws.close();
        });
        this.connections.clear();
    }
}

// Usage
const manager = new WebSocketManager();

// Create multiple connections
for (let i = 0; i < 5; i++) {
    manager.createConnection(i, 'wss://echo.websocket.org');
}

// Send to all
manager.sendToAll('Hello from all connections!');

// Get performance stats
setInterval(() => {
    console.log('Stats:', manager.getStats());
}, 1000);
```

## Real-World Use Cases

### 1. Live Stock Trading Platform

```javascript
class StockTicker {
    constructor() {
        this.ws = new WebSocket('wss://stock-api.example.com');
        this.subscriptions = new Set();

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.updateStockPrice(data.symbol, data.price, data.change);
        };
    }

    subscribe(symbols) {
        symbols.forEach(symbol => {
            this.subscriptions.add(symbol);
        });

        this.ws.send(JSON.stringify({
            type: 'subscribe',
            symbols: Array.from(this.subscriptions)
        }));
    }

    unsubscribe(symbols) {
        symbols.forEach(symbol => {
            this.subscriptions.delete(symbol);
        });

        this.ws.send(JSON.stringify({
            type: 'unsubscribe',
            symbols: symbols
        }));
    }

    updateStockPrice(symbol, price, change) {
        const element = document.getElementById(`stock-${symbol}`);
        if (element) {
            element.textContent = `${symbol}: $${price} (${change > 0 ? '+' : ''}${change}%)`;
            element.className = change > 0 ? 'price-up' : 'price-down';
        }
    }
}
```

### 2. Collaborative Code Editor

```javascript
class CollaborativeEditor {
    constructor(documentId) {
        this.ws = new WebSocket(`wss://collab-server.com/doc/${documentId}`);
        this.editor = null;
        this.isLocalChange = false;

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch(message.type) {
                case 'edit':
                    this.applyRemoteEdit(message);
                    break;
                case 'cursor':
                    this.showRemoteCursor(message);
                    break;
                case 'user_joined':
                    this.addUser(message.user);
                    break;
                case 'user_left':
                    this.removeUser(message.user);
                    break;
            }
        };
    }

    onLocalEdit(change) {
        this.isLocalChange = true;
        this.editor.applyChange(change);
        this.isLocalChange = false;

        // Send to other clients
        this.ws.send(JSON.stringify({
            type: 'edit',
            change: change,
            userId: this.userId
        }));
    }

    applyRemoteEdit(message) {
        if (!this.isLocalChange) {
            this.editor.applyChange(message.change);
        }
    }

    onCursorMove(position) {
        this.ws.send(JSON.stringify({
            type: 'cursor',
            position: position,
            userId: this.userId
        }));
    }

    showRemoteCursor(message) {
        // Show other users' cursors
        this.editor.showCursor(message.userId, message.position);
    }
}
```

### 3. Real-time Gaming

```javascript
class GameClient {
    constructor(gameId) {
        this.ws = new WebSocket(`wss://game-server.com/game/${gameId}`);
        this.playerId = null;
        this.gameState = {};

        this.ws.onopen = () => {
            this.ws.send(JSON.stringify({ type: 'join' }));
        };

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch(message.type) {
                case 'game_state':
                    this.gameState = message.state;
                    this.render();
                    break;

                case 'player_action':
                    this.handlePlayerAction(message);
                    break;

                case 'player_joined':
                    console.log(`Player ${message.playerId} joined`);
                    break;
            }
        };
    }

    sendPlayerAction(action, data) {
        this.ws.send(JSON.stringify({
            type: 'action',
            action: action,
            data: data
        }));
    }

    move(x, y) {
        this.sendPlayerAction('move', { x, y });
    }

    attack(targetId) {
        this.sendPlayerAction('attack', { targetId });
    }

    render() {
        // Render game state
        Object.values(this.gameState.players).forEach(player => {
            this.renderPlayer(player);
        });
    }
}
```

### 4. IoT Dashboard

```javascript
class IoTDashboard {
    constructor() {
        this.ws = new WebSocket('wss://iot-hub.com');
        this.devices = new Map();

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'sensor_data':
                    this.updateSensorData(data.deviceId, data.readings);
                    break;

                case 'device_status':
                    this.updateDeviceStatus(data.deviceId, data.status);
                    break;

                case 'alert':
                    this.showAlert(data);
                    break;
            }
        };
    }

    updateSensorData(deviceId, readings) {
        if (!this.devices.has(deviceId)) {
            this.devices.set(deviceId, {
                readings: [],
                status: 'online'
            });
        }

        const device = this.devices.get(deviceId);
        device.readings.push({
            ...readings,
            timestamp: Date.now()
        });

        // Keep only last 100 readings
        if (device.readings.length > 100) {
            device.readings.shift();
        }

        this.updateChart(deviceId, device.readings);
    }

    sendCommand(deviceId, command, params) {
        this.ws.send(JSON.stringify({
            type: 'command',
            deviceId: deviceId,
            command: command,
            params: params
        }));
    }

    showAlert(alert) {
        console.log(`[ALERT] ${alert.deviceId}: ${alert.message}`);
        // Show notification
        new Notification(`IoT Alert: ${alert.deviceId}`, {
            body: alert.message,
            icon: '/alert-icon.png'
        });
    }
}
```

### 5. Live Customer Support Chat

```javascript
class SupportChat {
    constructor(supportAgentId) {
        this.ws = new WebSocket('wss://support.example.com');
        this.agentId = supportAgentId;
        this.activeChats = new Map();

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            switch(message.type) {
                case 'new_chat':
                    this.handleNewChat(message.chatId, message.customer);
                    break;

                case 'customer_message':
                    this.handleCustomerMessage(message.chatId, message.text);
                    break;

                case 'chat_closed':
                    this.handleChatClosed(message.chatId);
                    break;

                case 'typing':
                    this.showTypingIndicator(message.chatId);
                    break;
            }
        };
    }

    handleNewChat(chatId, customer) {
        this.activeChats.set(chatId, {
            customer: customer,
            messages: [],
            startTime: Date.now()
        });

        this.displayChatRequest(chatId, customer);
    }

    acceptChat(chatId) {
        this.ws.send(JSON.stringify({
            type: 'accept_chat',
            chatId: chatId,
            agentId: this.agentId
        }));
    }

    sendMessage(chatId, text) {
        this.ws.send(JSON.stringify({
            type: 'agent_message',
            chatId: chatId,
            text: text,
            agentId: this.agentId
        }));

        const chat = this.activeChats.get(chatId);
        chat.messages.push({
            sender: 'agent',
            text: text,
            timestamp: Date.now()
        });
    }

    sendTypingNotification(chatId) {
        this.ws.send(JSON.stringify({
            type: 'agent_typing',
            chatId: chatId
        }));
    }

    closeChat(chatId) {
        this.ws.send(JSON.stringify({
            type: 'close_chat',
            chatId: chatId
        }));

        this.activeChats.delete(chatId);
    }
}
```

### 6. Live Video Streaming Chat

```javascript
class LiveStreamChat {
    constructor(streamId) {
        this.ws = new WebSocket(`wss://stream-server.com/chat/${streamId}`);
        this.messages = [];
        this.viewers = 0;

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            switch(data.type) {
                case 'message':
                    this.addMessage(data);
                    break;

                case 'viewer_count':
                    this.viewers = data.count;
                    this.updateViewerCount();
                    break;

                case 'donation':
                    this.showDonation(data);
                    break;

                case 'poll':
                    this.showPoll(data);
                    break;
            }
        };
    }

    sendMessage(text) {
        this.ws.send(JSON.stringify({
            type: 'message',
            text: text,
            username: this.username
        }));
    }

    addMessage(message) {
        this.messages.push(message);

        // Auto-scroll chat
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML += `
            <div class="chat-message">
                <span class="username">${message.username}</span>:
                <span class="text">${message.text}</span>
            </div>
        `;
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Keep only last 100 messages
        if (this.messages.length > 100) {
            this.messages.shift();
        }
    }

    showDonation(donation) {
        // Highlight donation message
        const alert = document.createElement('div');
        alert.className = 'donation-alert';
        alert.innerHTML = `
            <span>${donation.username} donated $${donation.amount}!</span>
            <p>${donation.message}</p>
        `;
        document.body.appendChild(alert);

        setTimeout(() => alert.remove(), 5000);
    }
}
```

## Advanced Patterns

### Heartbeat/Ping-Pong

Keep connection alive and detect disconnections.

```javascript
class HeartbeatWebSocket {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.heartbeatInterval = null;
        this.missedHeartbeats = 0;
        this.maxMissedHeartbeats = 3;

        this.ws.onopen = () => {
            this.startHeartbeat();
        };

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'pong') {
                this.missedHeartbeats = 0;
            } else {
                this.onMessage(data);
            }
        };

        this.ws.onclose = () => {
            this.stopHeartbeat();
        };
    }

    startHeartbeat() {
        this.heartbeatInterval = setInterval(() => {
            if (this.missedHeartbeats >= this.maxMissedHeartbeats) {
                console.log('Too many missed heartbeats. Reconnecting...');
                this.ws.close();
                return;
            }

            this.missedHeartbeats++;
            this.ws.send(JSON.stringify({ type: 'ping' }));
        }, 30000); // Every 30 seconds
    }

    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }
    }
}
```

### Message Queue with Offline Support

Queue messages when offline and send when reconnected.

```javascript
class QueuedWebSocket {
    constructor(url) {
        this.url = url;
        this.messageQueue = [];
        this.isConnected = false;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            this.isConnected = true;
            this.processQueue();
        };

        this.ws.onclose = () => {
            this.isConnected = false;
        };
    }

    send(message) {
        if (this.isConnected && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(message);
        } else {
            // Queue message for later
            this.messageQueue.push({
                message: message,
                timestamp: Date.now()
            });
        }
    }

    processQueue() {
        while (this.messageQueue.length > 0) {
            const item = this.messageQueue.shift();

            // Check if message is not too old (5 minutes)
            if (Date.now() - item.timestamp < 300000) {
                this.ws.send(item.message);
            }
        }
    }
}
```

### Request-Response Pattern

Implement request-response over WebSocket.

```javascript
class RpcWebSocket {
    constructor(url) {
        this.ws = new WebSocket(url);
        this.pendingRequests = new Map();
        this.requestId = 0;

        this.ws.onmessage = (event) => {
            const response = JSON.parse(event.data);

            if (response.id && this.pendingRequests.has(response.id)) {
                const { resolve, reject } = this.pendingRequests.get(response.id);
                this.pendingRequests.delete(response.id);

                if (response.error) {
                    reject(response.error);
                } else {
                    resolve(response.result);
                }
            }
        };
    }

    request(method, params) {
        return new Promise((resolve, reject) => {
            const id = ++this.requestId;

            this.pendingRequests.set(id, { resolve, reject });

            this.ws.send(JSON.stringify({
                id: id,
                method: method,
                params: params
            }));

            // Timeout after 30 seconds
            setTimeout(() => {
                if (this.pendingRequests.has(id)) {
                    this.pendingRequests.delete(id);
                    reject(new Error('Request timeout'));
                }
            }, 30000);
        });
    }
}

// Usage
const rpc = new RpcWebSocket('wss://api.example.com');

const result = await rpc.request('getUserData', { userId: 123 });
console.log(result);
```

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome  | All     | Full support |
| Firefox | All     | Full support |
| Safari  | All     | Full support |
| Edge    | All     | Full support |
| IE      | 10+     | Basic support |

**Support:** ~99% of users globally

### Feature Detection

```javascript
if ('WebSocket' in window) {
    const ws = new WebSocket('wss://example.com');
} else {
    console.error('WebSocket not supported');
    // Use fallback (long polling, etc.)
}
```

## Best Practices

### 1. Always Use WSS in Production

```javascript
// ✓ Good - Secure WebSocket
const ws = new WebSocket('wss://example.com/socket');

// ✗ Bad - Insecure (only for development)
const ws = new WebSocket('ws://example.com/socket');
```

### 2. Implement Reconnection Logic

```javascript
// ✓ Good - Auto-reconnect
class RobustWebSocket {
    constructor(url) {
        this.url = url;
        this.connect();
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onclose = () => {
            setTimeout(() => this.connect(), 1000);
        };
    }
}
```

### 3. Validate All Incoming Data

```javascript
// ✓ Good - Validate
ws.onmessage = (event) => {
    try {
        const data = JSON.parse(event.data);

        if (data.type && data.type === 'expected_type') {
            processData(data);
        }
    } catch (e) {
        console.error('Invalid message:', e);
    }
};

// ✗ Bad - No validation
ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    eval(data.code); // NEVER DO THIS!
};
```

### 4. Handle Errors Gracefully

```javascript
// ✓ Good
ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    showUserFriendlyMessage('Connection problem. Retrying...');
};

ws.onclose = (event) => {
    if (!event.wasClean) {
        console.log('Connection lost unexpectedly');
        attemptReconnect();
    }
};
```

### 5. Clean Up Connections

```javascript
// ✓ Good - Clean up
window.addEventListener('beforeunload', () => {
    if (ws) {
        ws.close(1000, 'Page unload');
    }
});
```

### 6. Use Heartbeats

```javascript
// ✓ Good - Keep connection alive
setInterval(() => {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
    }
}, 30000);
```

## Common Pitfalls

### 1. Not Checking readyState

```javascript
// ✗ Bad
ws.send('message'); // Might fail if not open

// ✓ Good
if (ws.readyState === WebSocket.OPEN) {
    ws.send('message');
}
```

### 2. Memory Leaks

```javascript
// ✗ Bad - Event listeners not removed
const ws = new WebSocket('wss://example.com');
ws.onmessage = handleMessage;
// Never disconnected or cleaned up

// ✓ Good
const ws = new WebSocket('wss://example.com');
const cleanup = () => {
    ws.close();
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;
};
```

### 3. Ignoring Errors

```javascript
// ✗ Bad
const ws = new WebSocket('wss://example.com');
// No error handler

// ✓ Good
const ws = new WebSocket('wss://example.com');
ws.onerror = (error) => {
    console.error('Error:', error);
    handleError(error);
};
```

## Security Considerations

### 1. Validate Origin

```javascript
// Server-side (Node.js example)
wss.on('connection', (ws, req) => {
    const origin = req.headers.origin;

    if (!allowedOrigins.includes(origin)) {
        ws.close(1008, 'Origin not allowed');
        return;
    }
});
```

### 2. Authenticate Connections

```javascript
// Send auth token
ws.onopen = () => {
    ws.send(JSON.stringify({
        type: 'auth',
        token: getAuthToken()
    }));
};
```

### 3. Rate Limiting

```javascript
// Client-side throttling
const throttle = (func, limit) => {
    let inThrottle;
    return function() {
        if (!inThrottle) {
            func.apply(this, arguments);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
};

const sendMessage = throttle((message) => {
    ws.send(message);
}, 1000); // Max 1 message per second
```

## Testing WebSocket

```javascript
describe('WebSocket', () => {
    let ws;

    beforeEach(() => {
        ws = new WebSocket('wss://echo.websocket.org');
    });

    afterEach(() => {
        ws.close();
    });

    test('should connect successfully', (done) => {
        ws.onopen = () => {
            expect(ws.readyState).toBe(WebSocket.OPEN);
            done();
        };
    });

    test('should send and receive messages', (done) => {
        ws.onopen = () => {
            ws.send('test message');
        };

        ws.onmessage = (event) => {
            expect(event.data).toBe('test message');
            done();
        };
    });
});
```

## Resources

- [MDN WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)
- [WebSocket RFC 6455](https://tools.ietf.org/html/rfc6455)
- [Can I Use](https://caniuse.com/websockets)
- [Echo Test Server](https://www.websocket.org/echo.html)

## Files

- **index.html** - Interactive demos page
- **style.css** - Complete styling
- **script.js** - All 6 demo implementations
- **README.md** - This documentation

## Running the Examples

1. Open `index.html` in a modern browser
2. Click "Connect" buttons to establish WebSocket connections
3. Interact with demos to send/receive messages
4. Monitor connection states and performance
5. Test with mock WebSocket echo servers

## License

Free to use for learning and projects.

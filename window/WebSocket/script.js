// Check for browser support
if (!window.WebSocket) {
    alert('WebSocket is not supported in this browser. Please update your browser.');
}

// WebSocket echo server URL
const ECHO_SERVER = 'wss://echo.websocket.org/.ws';

// ========================================
// Demo 1: Basic WebSocket Connection
// ========================================
let ws1 = null;
let sentCount1 = 0;
let receivedCount1 = 0;

const status1 = document.getElementById('status1');
const messageLog1 = document.getElementById('messageLog1');
const messageInput1 = document.getElementById('messageInput1');
const sendBtn1 = document.getElementById('sendBtn1');
const connectBtn1 = document.getElementById('connectBtn1');
const disconnectBtn1 = document.getElementById('disconnectBtn1');

function updateStatus1(status, text) {
    status1.className = `connection-status ${status}`;
    status1.querySelector('.status-text').textContent = text;
}

function addMessage1(type, message) {
    const messageEl = document.createElement('div');
    messageEl.className = `message ${type}`;
    const timestamp = new Date().toLocaleTimeString();
    messageEl.innerHTML = `<span class="time">${timestamp}</span> <span class="text">${message}</span>`;
    messageLog1.appendChild(messageEl);
    messageLog1.scrollTop = messageLog1.scrollHeight;
}

connectBtn1.addEventListener('click', () => {
    ws1 = new WebSocket(ECHO_SERVER);

    ws1.onopen = () => {
        updateStatus1('connected', 'Connected');
        addMessage1('system', '✓ Connected to server');
        sendBtn1.disabled = false;
        connectBtn1.disabled = true;
        disconnectBtn1.disabled = false;
    };

    ws1.onmessage = (event) => {
        receivedCount1++;
        document.getElementById('receivedCount1').textContent = receivedCount1;
        addMessage1('received', `◄ ${event.data}`);
    };

    ws1.onerror = (error) => {
        addMessage1('error', `✗ Error occurred`);
        console.error('WebSocket error:', error);
    };

    ws1.onclose = () => {
        updateStatus1('disconnected', 'Disconnected');
        addMessage1('system', '✗ Disconnected from server');
        sendBtn1.disabled = true;
        connectBtn1.disabled = false;
        disconnectBtn1.disabled = true;
    };
});

disconnectBtn1.addEventListener('click', () => {
    if (ws1) {
        ws1.close();
    }
});

sendBtn1.addEventListener('click', () => {
    const message = messageInput1.value.trim();
    if (message && ws1 && ws1.readyState === WebSocket.OPEN) {
        ws1.send(message);
        sentCount1++;
        document.getElementById('sentCount1').textContent = sentCount1;
        addMessage1('sent', `► ${message}`);
        messageInput1.value = '';
    }
});

messageInput1.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendBtn1.click();
    }
});

document.getElementById('clearLog1').addEventListener('click', () => {
    messageLog1.innerHTML = '';
    sentCount1 = 0;
    receivedCount1 = 0;
    document.getElementById('sentCount1').textContent = '0';
    document.getElementById('receivedCount1').textContent = '0';
});

// ========================================
// Demo 2: Real-time Chat
// ========================================
let chatWs = null;
const chatStatus = document.getElementById('chatStatus');
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const username = document.getElementById('username');

function updateChatStatus(status, text) {
    chatStatus.className = `connection-status ${status}`;
    chatStatus.querySelector('.status-text').textContent = text;
}

function addChatMessage(user, text, time, isOwn = false) {
    const messageEl = document.createElement('div');
    messageEl.className = `chat-message ${isOwn ? 'own' : ''}`;
    messageEl.innerHTML = `
        <div class="message-header">
            <span class="message-user">${user}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${text}</div>
    `;
    chatMessages.appendChild(messageEl);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

document.getElementById('chatConnect').addEventListener('click', () => {
    chatWs = new WebSocket(ECHO_SERVER);

    chatWs.onopen = () => {
        updateChatStatus('connected', 'Online');
        addChatMessage('System', 'Connected to chat server', new Date().toLocaleTimeString());
        document.getElementById('chatSend').disabled = false;
        document.getElementById('chatConnect').disabled = true;
        document.getElementById('chatDisconnect').disabled = false;
    };

    chatWs.onmessage = (event) => {
        try {
            const message = JSON.parse(event.data);
            addChatMessage(message.user, message.text, message.time, message.user === username.value);
        } catch (e) {
            // Echo server just echoes back, so we'll receive our own message
        }
    };

    chatWs.onclose = () => {
        updateChatStatus('disconnected', 'Offline');
        addChatMessage('System', 'Disconnected from chat server', new Date().toLocaleTimeString());
        document.getElementById('chatSend').disabled = true;
        document.getElementById('chatConnect').disabled = false;
        document.getElementById('chatDisconnect').disabled = true;
    };
});

document.getElementById('chatDisconnect').addEventListener('click', () => {
    if (chatWs) {
        chatWs.close();
    }
});

document.getElementById('chatSend').addEventListener('click', () => {
    sendChatMessage();
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
});

function sendChatMessage() {
    const text = chatInput.value.trim();
    if (text && chatWs && chatWs.readyState === WebSocket.OPEN) {
        const message = {
            user: username.value,
            text: text,
            time: new Date().toLocaleTimeString()
        };
        chatWs.send(JSON.stringify(message));
        addChatMessage(message.user, message.text, message.time, true);
        chatInput.value = '';
    }
}

document.getElementById('simulateUser').addEventListener('click', () => {
    const responses = [
        'Hello everyone!',
        'How are you doing?',
        'Great discussion!',
        'I agree with that',
        'Interesting point!'
    ];
    const randomUser = 'User' + Math.floor(Math.random() * 100);
    const randomText = responses[Math.floor(Math.random() * responses.length)];
    addChatMessage(randomUser, randomText, new Date().toLocaleTimeString(), false);
});

document.getElementById('clearChat').addEventListener('click', () => {
    chatMessages.innerHTML = '';
});

// ========================================
// Demo 3: Live Notifications
// ========================================
let notifWs = null;
let notifCount = 0;
let unreadCount = 0;
let dataInterval = null;

const notifStatus = document.getElementById('notifStatus');
const notificationsList = document.getElementById('notificationsList');

function updateNotifStatus(status, text) {
    notifStatus.className = `connection-status ${status}`;
    notifStatus.querySelector('.status-text').textContent = text;
}

function addNotification(title, message, type = 'info') {
    const empty = notificationsList.querySelector('.empty-state');
    if (empty) empty.remove();

    const notifEl = document.createElement('div');
    notifEl.className = `notification ${type}`;
    const time = new Date().toLocaleTimeString();
    notifEl.innerHTML = `
        <div class="notif-icon">${type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ'}</div>
        <div class="notif-content">
            <div class="notif-title">${title}</div>
            <div class="notif-message">${message}</div>
            <div class="notif-time">${time}</div>
        </div>
    `;
    notificationsList.insertBefore(notifEl, notificationsList.firstChild);

    notifCount++;
    unreadCount++;
    document.getElementById('notifCount').textContent = notifCount;
    document.getElementById('unreadCount').textContent = unreadCount;

    if (document.getElementById('soundEnabled').checked) {
        playNotificationSound();
    }
}

function playNotificationSound() {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
}

function updateLiveData() {
    document.getElementById('temperature').textContent = (20 + Math.random() * 10).toFixed(1) + '°C';
    document.getElementById('pressure').textContent = (1000 + Math.random() * 50).toFixed(0) + ' hPa';
    document.getElementById('humidity').textContent = (40 + Math.random() * 40).toFixed(0) + '%';
}

document.getElementById('startNotif').addEventListener('click', () => {
    notifWs = new WebSocket(ECHO_SERVER);

    notifWs.onopen = () => {
        updateNotifStatus('connected', 'Listening for updates');
        document.getElementById('startNotif').disabled = true;
        document.getElementById('stopNotif').disabled = false;

        // Simulate live data updates
        dataInterval = setInterval(updateLiveData, 2000);
    };

    notifWs.onclose = () => {
        updateNotifStatus('disconnected', 'Not listening');
        document.getElementById('startNotif').disabled = false;
        document.getElementById('stopNotif').disabled = true;
        if (dataInterval) {
            clearInterval(dataInterval);
        }
    };
});

document.getElementById('stopNotif').addEventListener('click', () => {
    if (notifWs) {
        notifWs.close();
    }
});

document.getElementById('triggerNotif').addEventListener('click', () => {
    const types = ['info', 'success', 'warning'];
    const titles = ['New Message', 'Update Available', 'System Alert', 'New Comment'];
    const messages = [
        'You have a new notification',
        'Your data has been updated',
        'Action required',
        'Someone mentioned you'
    ];

    const type = types[Math.floor(Math.random() * types.length)];
    const title = titles[Math.floor(Math.random() * titles.length)];
    const message = messages[Math.floor(Math.random() * messages.length)];

    addNotification(title, message, type);
});

document.getElementById('clearNotif').addEventListener('click', () => {
    notificationsList.innerHTML = '<div class="empty-state">No notifications yet</div>';
    notifCount = 0;
    unreadCount = 0;
    document.getElementById('notifCount').textContent = '0';
    document.getElementById('unreadCount').textContent = '0';
});

// ========================================
// Demo 4: Connection Management
// ========================================
let ws4 = null;
let reconnectAttempts = 0;
let reconnectTimer = null;
let uptimeInterval = null;
let connectedTime = null;

const stateIndicator = document.getElementById('stateIndicator');
const wsState = document.getElementById('wsState');
const readyState = document.getElementById('readyState');
const eventLog = document.getElementById('eventLog');

const stateNames = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED'];

function logEvent(message, type = 'info') {
    const eventEl = document.createElement('div');
    eventEl.className = `event-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    eventEl.textContent = `[${time}] ${message}`;
    eventLog.insertBefore(eventEl, eventLog.firstChild);

    // Keep only last 10 events
    while (eventLog.children.length > 10) {
        eventLog.removeChild(eventLog.lastChild);
    }
}

function updateConnectionState() {
    if (!ws4) {
        wsState.textContent = 'CLOSED';
        readyState.textContent = '3';
        stateIndicator.className = 'state-indicator disconnected';
        return;
    }

    const state = ws4.readyState;
    wsState.textContent = stateNames[state];
    readyState.textContent = state;
    document.getElementById('buffered').textContent = ws4.bufferedAmount;

    stateIndicator.className = `state-indicator ${state === WebSocket.OPEN ? 'connected' : state === WebSocket.CONNECTING ? 'connecting' : 'disconnected'}`;
}

function attemptReconnect() {
    const maxAttempts = parseInt(document.getElementById('maxReconnect').value);
    const autoReconnect = document.getElementById('autoReconnect').checked;

    if (!autoReconnect || reconnectAttempts >= maxAttempts) {
        logEvent(`Max reconnection attempts reached (${maxAttempts})`, 'error');
        return;
    }

    const delay = Math.min(30, Math.pow(2, reconnectAttempts)) * 1000; // Exponential backoff
    logEvent(`Reconnecting in ${delay / 1000} seconds... (attempt ${reconnectAttempts + 1}/${maxAttempts})`, 'warning');

    let countdown = delay / 1000;
    document.getElementById('retryTimer').textContent = `${countdown}s`;

    reconnectTimer = setInterval(() => {
        countdown--;
        document.getElementById('retryTimer').textContent = `${countdown}s`;

        if (countdown <= 0) {
            clearInterval(reconnectTimer);
            document.getElementById('retryTimer').textContent = '-';
            connect4();
        }
    }, 1000);
}

function connect4() {
    if (ws4 && ws4.readyState === WebSocket.OPEN) return;

    ws4 = new WebSocket(ECHO_SERVER);

    ws4.onopen = () => {
        logEvent('Connection established', 'success');
        reconnectAttempts = 0;
        document.getElementById('reconnectAttempts').textContent = '0';
        connectedTime = Date.now();

        uptimeInterval = setInterval(() => {
            const uptime = Math.floor((Date.now() - connectedTime) / 1000);
            document.getElementById('uptime').textContent = `${uptime}s`;
        }, 1000);

        updateConnectionState();
        document.getElementById('connect4').disabled = true;
        document.getElementById('disconnect4').disabled = false;
    };

    ws4.onclose = (event) => {
        logEvent(`Connection closed (code: ${event.code})`, 'warning');
        updateConnectionState();

        if (uptimeInterval) {
            clearInterval(uptimeInterval);
            document.getElementById('uptime').textContent = '0s';
        }

        document.getElementById('connect4').disabled = false;
        document.getElementById('disconnect4').disabled = true;

        if (document.getElementById('autoReconnect').checked && !event.wasClean) {
            reconnectAttempts++;
            document.getElementById('reconnectAttempts').textContent = reconnectAttempts;
            attemptReconnect();
        }
    };

    ws4.onerror = (error) => {
        logEvent('Connection error occurred', 'error');
        console.error('WebSocket error:', error);
    };

    setInterval(updateConnectionState, 100);
}

document.getElementById('connect4').addEventListener('click', () => {
    reconnectAttempts = 0;
    connect4();
});

document.getElementById('disconnect4').addEventListener('click', () => {
    if (ws4) {
        ws4.close();
    }
    if (reconnectTimer) {
        clearInterval(reconnectTimer);
        document.getElementById('retryTimer').textContent = '-';
    }
});

document.getElementById('forceDisconnect').addEventListener('click', () => {
    if (ws4 && ws4.readyState === WebSocket.OPEN) {
        logEvent('Simulating unexpected disconnect', 'warning');
        ws4.close();
    }
});

// ========================================
// Demo 5: Binary Data Transfer
// ========================================
let binaryWs = null;
let bytesSent = 0;
let bytesReceived = 0;

const binaryStatus = document.getElementById('binaryStatus');
const binaryLog = document.getElementById('binaryLog');

function updateBinaryStatus(status, text) {
    binaryStatus.className = `connection-status ${status}`;
    binaryStatus.querySelector('.status-text').textContent = text;
}

function logBinary(message, type = 'info') {
    const logEl = document.createElement('div');
    logEl.className = `log-entry ${type}`;
    const time = new Date().toLocaleTimeString();
    logEl.innerHTML = `[${time}] ${message}`;
    binaryLog.appendChild(logEl);
    binaryLog.scrollTop = binaryLog.scrollHeight;
}

document.getElementById('connectBinary').addEventListener('click', () => {
    binaryWs = new WebSocket(ECHO_SERVER);
    binaryWs.binaryType = document.getElementById('binaryType').value;

    binaryWs.onopen = () => {
        updateBinaryStatus('connected', 'Connected');
        logBinary('✓ Connected to server', 'success');
        document.getElementById('sendText').disabled = false;
        document.getElementById('sendArray').disabled = false;
        document.getElementById('sendBlob').disabled = false;
        document.getElementById('connectBinary').disabled = true;
        document.getElementById('disconnectBinary').disabled = false;
    };

    binaryWs.onmessage = (event) => {
        if (typeof event.data === 'string') {
            logBinary(`◄ Received text: "${event.data}"`, 'received');
            bytesReceived += event.data.length;
        } else if (event.data instanceof ArrayBuffer) {
            const view = new Uint8Array(event.data);
            logBinary(`◄ Received ArrayBuffer: ${view.length} bytes`, 'received');
            bytesReceived += view.length;
        } else if (event.data instanceof Blob) {
            logBinary(`◄ Received Blob: ${event.data.size} bytes`, 'received');
            bytesReceived += event.data.size;
        }
        document.getElementById('bytesReceived').textContent = bytesReceived;
    };

    binaryWs.onclose = () => {
        updateBinaryStatus('disconnected', 'Disconnected');
        logBinary('✗ Disconnected from server', 'warning');
        document.getElementById('sendText').disabled = true;
        document.getElementById('sendArray').disabled = true;
        document.getElementById('sendBlob').disabled = true;
        document.getElementById('connectBinary').disabled = false;
        document.getElementById('disconnectBinary').disabled = true;
    };
});

document.getElementById('disconnectBinary').addEventListener('click', () => {
    if (binaryWs) {
        binaryWs.close();
    }
});

document.getElementById('sendText').addEventListener('click', () => {
    const text = document.getElementById('textData').value;
    if (binaryWs && binaryWs.readyState === WebSocket.OPEN) {
        binaryWs.send(text);
        logBinary(`► Sent text: "${text}" (${text.length} bytes)`, 'sent');
        bytesSent += text.length;
        document.getElementById('bytesSent').textContent = bytesSent;
    }
});

document.getElementById('sendArray').addEventListener('click', () => {
    const text = document.getElementById('arrayData').value;
    const encoder = new TextEncoder();
    const buffer = encoder.encode(text).buffer;

    if (binaryWs && binaryWs.readyState === WebSocket.OPEN) {
        binaryWs.send(buffer);
        logBinary(`► Sent ArrayBuffer: ${buffer.byteLength} bytes`, 'sent');
        bytesSent += buffer.byteLength;
        document.getElementById('bytesSent').textContent = bytesSent;
    }
});

document.getElementById('sendBlob').addEventListener('click', () => {
    const file = document.getElementById('fileInput').files[0];
    if (!file) {
        alert('Please select a file first');
        return;
    }

    if (binaryWs && binaryWs.readyState === WebSocket.OPEN) {
        binaryWs.send(file);
        logBinary(`► Sent Blob (file): "${file.name}" (${file.size} bytes)`, 'sent');
        bytesSent += file.size;
        document.getElementById('bytesSent').textContent = bytesSent;
    }
});

document.getElementById('clearBinaryLog').addEventListener('click', () => {
    binaryLog.innerHTML = '';
    bytesSent = 0;
    bytesReceived = 0;
    document.getElementById('bytesSent').textContent = '0';
    document.getElementById('bytesReceived').textContent = '0';
});

document.getElementById('binaryType').addEventListener('change', (e) => {
    if (binaryWs) {
        binaryWs.binaryType = e.target.value;
        logBinary(`Binary type changed to: ${e.target.value}`, 'info');
    }
});

// ========================================
// Demo 6: Multiple Connections & Performance
// ========================================
const connections = new Map();
let connectionCounter = 0;
let performanceInterval = null;
let messageStats = { count: 0, lastTime: Date.now() };

const connectionsGrid = document.getElementById('connectionsGrid');

function createConnection() {
    const id = ++connectionCounter;
    const ws = new WebSocket(ECHO_SERVER);

    const connEl = document.createElement('div');
    connEl.className = 'connection-card';
    connEl.id = `conn-${id}`;
    connEl.innerHTML = `
        <div class="conn-header">
            <span class="conn-id">#${id}</span>
            <span class="conn-status">Connecting...</span>
        </div>
        <div class="conn-stats">
            <p>Messages: <strong>0</strong></p>
            <p>Latency: <strong>-</strong>ms</p>
        </div>
        <button class="btn-small btn-danger" onclick="closeConnection(${id})">Close</button>
    `;
    connectionsGrid.appendChild(connEl);

    ws.onopen = () => {
        connEl.querySelector('.conn-status').textContent = 'Open';
        connEl.classList.add('connected');
    };

    ws.onmessage = (event) => {
        const conn = connections.get(id);
        conn.messageCount++;
        conn.latency = Date.now() - conn.lastPing;
        connEl.querySelector('.conn-stats strong:first-child').textContent = conn.messageCount;
        connEl.querySelector('.conn-stats strong:last-child').textContent = conn.latency;
        messageStats.count++;
    };

    ws.onclose = () => {
        connEl.querySelector('.conn-status').textContent = 'Closed';
        connEl.classList.remove('connected');
        connEl.classList.add('closed');
        connections.delete(id);
        updatePerformanceMetrics();
    };

    connections.set(id, {
        ws: ws,
        messageCount: 0,
        bytesSent: 0,
        latency: 0,
        lastPing: Date.now()
    });

    updatePerformanceMetrics();
}

window.closeConnection = function(id) {
    const conn = connections.get(id);
    if (conn && conn.ws) {
        conn.ws.close();
    }
};

function updatePerformanceMetrics() {
    const activeConns = Array.from(connections.values()).filter(c => c.ws.readyState === WebSocket.OPEN).length;
    document.getElementById('activeConns').textContent = activeConns;

    const now = Date.now();
    const elapsed = (now - messageStats.lastTime) / 1000;
    const msgPerSec = elapsed > 0 ? (messageStats.count / elapsed).toFixed(1) : 0;
    document.getElementById('msgPerSec').textContent = msgPerSec;

    const dataPerSec = (msgPerSec * 100 / 1024).toFixed(2); // Assuming ~100 bytes per message
    document.getElementById('dataPerSec').textContent = dataPerSec;

    const latencies = Array.from(connections.values()).map(c => c.latency).filter(l => l > 0);
    const avgLatency = latencies.length > 0 ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(1) : 0;
    document.getElementById('avgLatency').textContent = avgLatency;

    if (performance.memory) {
        const memUsage = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        document.getElementById('memUsage').textContent = `${memUsage} MB`;
    }
}

document.getElementById('createConn').addEventListener('click', () => {
    createConnection();
});

document.getElementById('create5Conn').addEventListener('click', () => {
    for (let i = 0; i < 5; i++) {
        createConnection();
    }
});

document.getElementById('closeAllConn').addEventListener('click', () => {
    connections.forEach((conn, id) => {
        if (conn.ws) {
            conn.ws.close();
        }
    });
});

document.getElementById('sendAllConn').addEventListener('click', () => {
    const message = `Ping from all connections at ${Date.now()}`;
    connections.forEach((conn) => {
        if (conn.ws && conn.ws.readyState === WebSocket.OPEN) {
            conn.lastPing = Date.now();
            conn.ws.send(message);
        }
    });
});

document.getElementById('stressTest').addEventListener('click', () => {
    const logPerf = document.getElementById('logPerformance').checked;
    const startTime = Date.now();
    let sent = 0;

    connections.forEach((conn) => {
        if (conn.ws && conn.ws.readyState === WebSocket.OPEN) {
            for (let i = 0; i < 100; i++) {
                conn.ws.send(`Stress test message ${i}`);
                sent++;
            }
        }
    });

    const duration = Date.now() - startTime;
    if (logPerf) {
        console.log(`Stress test: Sent ${sent} messages in ${duration}ms (${(sent / duration * 1000).toFixed(0)} msg/s)`);
    }
});

// Update performance metrics periodically
performanceInterval = setInterval(() => {
    if (connections.size > 0) {
        updatePerformanceMetrics();
        messageStats.count = 0;
        messageStats.lastTime = Date.now();
    }
}, 1000);

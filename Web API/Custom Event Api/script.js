// ====================================
// Demo 1: Basic Custom Event
// ====================================

const messageInput = document.getElementById('messageInput');
const dispatchBasicBtn = document.getElementById('dispatchBasic');
const basicOutput = document.getElementById('basicOutput');

// Listen for custom event
document.addEventListener('customMessage', (e) => {
    const { message, timestamp } = e.detail;
    basicOutput.innerHTML = `
        <div class="event-received">
            <strong>Event Received!</strong><br>
            <strong>Message:</strong> ${message}<br>
            <strong>Time:</strong> ${new Date(timestamp).toLocaleTimeString()}<br>
            <strong>Event Type:</strong> ${e.type}<br>
            <strong>Bubbles:</strong> ${e.bubbles}
        </div>
    `;
    basicOutput.classList.add('highlight');
    setTimeout(() => basicOutput.classList.remove('highlight'), 500);
});

dispatchBasicBtn.addEventListener('click', () => {
    const message = messageInput.value || 'Hello from CustomEvent!';

    // Create and dispatch custom event
    const event = new CustomEvent('customMessage', {
        detail: {
            message: message,
            timestamp: Date.now(),
            sender: 'Demo 1'
        },
        bubbles: true,
        cancelable: true
    });

    document.dispatchEvent(event);
    messageInput.value = '';
});

// ====================================
// Demo 2: Component Communication
// ====================================

const componentA = document.getElementById('componentA');
const componentABtn = document.getElementById('componentABtn');
const componentB = document.getElementById('componentB');
const parentStatus = document.getElementById('parentStatus');
const messageList = document.getElementById('messageList');

let messageCount = 0;

// Parent component listens for child events
// Listen on document to catch events from any component
document.addEventListener('childMessage', (e) => {
    messageCount++;
    const { from, message, timestamp } = e.detail;

    parentStatus.textContent = `Received ${messageCount} message(s)`;

    const messageDiv = document.createElement('div');
    messageDiv.className = 'message-item';
    messageDiv.innerHTML = `
        <strong>From:</strong> ${from}<br>
        <strong>Message:</strong> ${message}<br>
        <strong>Time:</strong> ${new Date(timestamp).toLocaleTimeString()}
    `;

    messageList.insertBefore(messageDiv, messageList.firstChild);

    // Visual feedback on parent
    componentB.classList.add('event-received');
    setTimeout(() => componentB.classList.remove('event-received'), 500);
});

// Child component sends events
componentABtn.addEventListener('click', () => {
    const event = new CustomEvent('childMessage', {
        detail: {
            from: 'Component A',
            message: 'Hello Parent!',
            timestamp: Date.now()
        },
        bubbles: true  // Event bubbles up to document
    });

    // Dispatch on document for component communication
    document.dispatchEvent(event);

    // Visual feedback
    componentA.querySelector('.component-status').textContent = 'Message sent!';
    setTimeout(() => {
        componentA.querySelector('.component-status').textContent = 'Ready to send';
    }, 1000);
});

// ====================================
// Demo 3: Event Bubbling & Capturing
// ====================================

const level1 = document.getElementById('level1');
const level2 = document.getElementById('level2');
const level3 = document.getElementById('level3');
const bubbleBtn = document.getElementById('bubbleBtn');
const bubblesCheckbox = document.getElementById('bubblesCheckbox');
const bubblingOutput = document.getElementById('bubblingOutput');

let eventLog = [];

// Add listeners to all levels
[level1, level2, level3].forEach((level, index) => {
    level.addEventListener('bubbleEvent', (e) => {
        const levelName = ['Grandparent (Level 1)', 'Parent (Level 2)', 'Child (Level 3)'][index];
        eventLog.push(`✓ Event caught at ${levelName}`);

        // Visual feedback
        level.classList.add('event-caught');
        setTimeout(() => level.classList.remove('event-caught'), 600);

        updateBubblingOutput();
    });
});

bubbleBtn.addEventListener('click', () => {
    eventLog = [`Event dispatched from: Child (Level 3)`];

    const bubbles = bubblesCheckbox.checked;

    const event = new CustomEvent('bubbleEvent', {
        detail: {
            message: 'Bubbling test',
            timestamp: Date.now()
        },
        bubbles: bubbles,
        cancelable: true
    });

    level3.dispatchEvent(event);

    if (!bubbles) {
        eventLog.push('⚠️ Bubbling disabled - event stays at Level 3');
    }

    updateBubblingOutput();
});

function updateBubblingOutput() {
    bubblingOutput.innerHTML = `
        <div class="event-log">
            ${eventLog.map(log => `<div>${log}</div>`).join('')}
        </div>
    `;
}

// ====================================
// Demo 4: Event Bus (Pub/Sub)
// ====================================

class EventBus {
    constructor() {
        this.bus = document.createElement('div');
    }

    publish(eventName, data) {
        const event = new CustomEvent(eventName, {
            detail: data
        });
        this.bus.dispatchEvent(event);
    }

    subscribe(eventName, callback) {
        this.bus.addEventListener(eventName, callback);
    }

    unsubscribe(eventName, callback) {
        this.bus.removeEventListener(eventName, callback);
    }
}

const eventBus = new EventBus();

const topicInput = document.getElementById('topicInput');
const dataInput = document.getElementById('dataInput');
const publishBtn = document.getElementById('publishBtn');

// Create subscribers
const subscribers = [
    document.getElementById('subscriber1'),
    document.getElementById('subscriber2'),
    document.getElementById('subscriber3')
];

// Subscribe all subscribers to all topics
// We'll use a Map to track which topics each subscriber is listening to
const activeTopics = new Set();

subscribers.forEach((subscriber, index) => {
    const statusEl = subscriber.querySelector('.sub-status');

    // Create a generic handler that works for all events
    const handleEvent = (e) => {
        statusEl.innerHTML = `
            <strong>Event:</strong> ${e.type}<br>
            <strong>Data:</strong> ${e.detail.data}<br>
            <strong>Time:</strong> ${new Date(e.detail.timestamp).toLocaleTimeString()}
        `;
        subscriber.classList.add('event-received');
        setTimeout(() => subscriber.classList.remove('event-received'), 500);
    };

    // Subscribe to common topics by default
    ['userLogin', 'dataUpdate', 'notification'].forEach(topic => {
        eventBus.subscribe(topic, handleEvent);
        activeTopics.add(topic);
    });

    // Store the handler so we can subscribe to new topics dynamically
    subscriber._eventHandler = handleEvent;
});

publishBtn.addEventListener('click', () => {
    const topic = topicInput.value || 'userLogin';
    const data = dataInput.value || 'Default event data';

    // If this is a new topic, subscribe all subscribers to it
    if (!activeTopics.has(topic)) {
        subscribers.forEach(subscriber => {
            eventBus.subscribe(topic, subscriber._eventHandler);
        });
        activeTopics.add(topic);
    }

    // Publish the event
    eventBus.publish(topic, {
        data: data,
        timestamp: Date.now()
    });

    topicInput.value = '';
    dataInput.value = '';
});

// ====================================
// Demo 5: Form Validation Events
// ====================================

const validationForm = document.getElementById('validationForm');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const passwordInput = document.getElementById('passwordInput');
const validationOutput = document.getElementById('validationOutput');

const errorElements = {
    username: document.getElementById('usernameError'),
    email: document.getElementById('emailError'),
    password: document.getElementById('passwordError')
};

// Validation rules
const validators = {
    username: (value) => {
        if (value.length < 3) return 'Username must be at least 3 characters';
        if (!/^[a-zA-Z0-9_]+$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
        return null;
    },
    email: (value) => {
        if (!value) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
        return null;
    },
    password: (value) => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return null;
    }
};

// Listen for validation events
document.addEventListener('fieldValidated', (e) => {
    const { field, valid, errors } = e.detail;

    if (valid) {
        errorElements[field].textContent = '';
        document.getElementById(field + 'Input').classList.remove('error');
        document.getElementById(field + 'Input').classList.add('valid');
    } else {
        errorElements[field].textContent = errors[0];
        document.getElementById(field + 'Input').classList.add('error');
        document.getElementById(field + 'Input').classList.remove('valid');
    }
});

// Validate on input
[usernameInput, emailInput, passwordInput].forEach(input => {
    input.addEventListener('blur', () => {
        validateField(input);
    });
});

function validateField(input) {
    const fieldName = input.id.replace('Input', '');
    const error = validators[fieldName](input.value);

    const event = new CustomEvent('fieldValidated', {
        detail: {
            field: fieldName,
            valid: error === null,
            errors: error ? [error] : [],
            value: input.value
        },
        bubbles: true
    });

    input.dispatchEvent(event);
    return error === null;
}

validationForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate all fields
    const fields = [usernameInput, emailInput, passwordInput];
    const results = fields.map(field => validateField(field));
    const allValid = results.every(result => result === true);

    // Dispatch form validation event
    const event = new CustomEvent('formValidated', {
        detail: {
            valid: allValid,
            values: {
                username: usernameInput.value,
                email: emailInput.value,
                password: passwordInput.value
            },
            timestamp: Date.now()
        },
        bubbles: true
    });

    validationForm.dispatchEvent(event);

    if (allValid) {
        validationOutput.innerHTML = `
            <div class="success-message">
                ✓ Form validation successful!<br>
                All fields are valid.
            </div>
        `;
    } else {
        validationOutput.innerHTML = `
            <div class="error-message-box">
                ✗ Form validation failed!<br>
                Please fix the errors above.
            </div>
        `;
    }
});

// ====================================
// Demo 6: Shopping Cart Events
// ====================================

class ShoppingCart {
    constructor() {
        this.items = [];
        this.element = document.createElement('div');
    }

    addItem(item) {
        const existing = this.items.find(i => i.id === item.id);

        if (existing) {
            existing.quantity++;
        } else {
            this.items.push({ ...item, quantity: 1 });
        }

        this.dispatchEvent('cartUpdated', {
            action: 'add',
            item: item,
            total: this.getTotal(),
            itemCount: this.getTotalItems()
        });
    }

    removeItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        this.items = this.items.filter(i => i.id !== itemId);

        this.dispatchEvent('cartUpdated', {
            action: 'remove',
            item: item,
            total: this.getTotal(),
            itemCount: this.getTotalItems()
        });
    }

    clear() {
        this.items = [];
        this.dispatchEvent('cartCleared', {
            timestamp: Date.now()
        });
    }

    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    }

    getTotalItems() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.element.dispatchEvent(event);
        document.dispatchEvent(event); // Also dispatch globally
    }
}

const cart = new ShoppingCart();
const cartBadge = document.getElementById('cartBadge');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const clearCartBtn = document.getElementById('clearCart');
const cartOutput = document.getElementById('cartOutput');

// Listen for cart events
document.addEventListener('cartUpdated', (e) => {
    const { action, item, total, itemCount } = e.detail;

    // Update badge
    cartBadge.textContent = itemCount;
    cartBadge.style.display = itemCount > 0 ? 'inline' : 'none';

    // Update total
    cartTotal.textContent = total;

    // Update cart items display
    updateCartDisplay();

    // Update output log
    const actionText = action === 'add' ? 'Added to cart' : 'Removed from cart';
    const logEntry = `
        <div class="cart-log-entry">
            <strong>${actionText}:</strong> ${item.name} - $${item.price}<br>
            <strong>Total:</strong> $${total} | <strong>Items:</strong> ${itemCount}
        </div>
    `;
    cartOutput.innerHTML = logEntry + cartOutput.innerHTML;
});

document.addEventListener('cartCleared', (e) => {
    cartBadge.textContent = '0';
    cartBadge.style.display = 'none';
    cartTotal.textContent = '0';
    updateCartDisplay();

    cartOutput.innerHTML = `
        <div class="cart-log-entry">
            <strong>Cart cleared at ${new Date(e.detail.timestamp).toLocaleTimeString()}</strong>
        </div>
    `;
});

// Add to cart buttons
document.querySelectorAll('.add-to-cart').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const productEl = e.target.closest('.product-item');
        const item = {
            id: productEl.dataset.id,
            name: productEl.dataset.name,
            price: parseFloat(productEl.dataset.price)
        };

        cart.addItem(item);

        // Visual feedback
        btn.textContent = 'Added!';
        btn.classList.add('added');
        setTimeout(() => {
            btn.textContent = 'Add to Cart';
            btn.classList.remove('added');
        }, 1000);
    });
});

clearCartBtn.addEventListener('click', () => {
    if (cart.items.length > 0) {
        cart.clear();
    }
});

function updateCartDisplay() {
    if (cart.items.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Cart is empty</p>';
        return;
    }

    cartItems.innerHTML = cart.items.map(item => `
        <div class="cart-item">
            <span class="item-name">${item.name}</span>
            <span class="item-quantity">x${item.quantity}</span>
            <span class="item-price">$${item.price * item.quantity}</span>
            <button class="btn btn-small remove-item" data-id="${item.id}">×</button>
        </div>
    `).join('');

    // Add remove listeners
    cartItems.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            cart.removeItem(e.target.dataset.id);
        });
    });
}

// Initialize cart display
updateCartDisplay();

// ====================================
// Utility: Add visual feedback class
// ====================================

const style = document.createElement('style');
style.textContent = `
    .highlight {
        animation: highlight 0.5s ease;
    }

    @keyframes highlight {
        0%, 100% { background-color: transparent; }
        50% { background-color: rgba(76, 175, 80, 0.2); }
    }

    .event-caught {
        background-color: rgba(76, 175, 80, 0.3) !important;
        transition: background-color 0.3s;
    }

    .event-received {
        animation: pulse 0.5s ease;
    }

    @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
    }
`;
document.head.appendChild(style);

console.log('✓ CustomEvent demos loaded successfully!');
console.log('Try dispatching custom events in the console:');
console.log('document.dispatchEvent(new CustomEvent("test", { detail: { message: "Hello!" } }))');

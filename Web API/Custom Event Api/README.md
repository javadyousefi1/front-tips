# CustomEvent API

A comprehensive guide to the CustomEvent API with 6 practical examples demonstrating how to create, dispatch, and handle custom events in JavaScript.

## What is CustomEvent?

The **CustomEvent** interface allows you to create custom events with your own event types and custom data. It extends the standard Event interface and provides a way to communicate between different parts of your application in a decoupled, event-driven manner.

## Key Components

### 1. CustomEvent Constructor
Creates a new custom event with a specified type and optional data.

```javascript
const event = new CustomEvent('myEvent', {
    detail: { message: 'Hello World' },
    bubbles: true,
    cancelable: true
});
```

### 2. Event Dispatching
Fire the custom event on a target element.

```javascript
element.dispatchEvent(event);
```

### 3. Event Listening
Listen for and handle custom events.

```javascript
element.addEventListener('myEvent', (e) => {
    console.log(e.detail.message); // 'Hello World'
});
```

### 4. Event Detail Property
Access custom data passed with the event.

```javascript
event.detail // Contains your custom data
```

## CustomEvent vs Event

### Event (Standard)
```javascript
const event = new Event('click');
// Cannot attach custom data
```

### CustomEvent (Custom)
```javascript
const event = new CustomEvent('userLogin', {
    detail: { userId: 123, username: 'john' }
});
// Can attach any custom data via detail property
```

## Demos Included

### 1. Basic Custom Event
Learn how to create and dispatch a simple custom event.

**Use Case**: Notify other components when an action occurs.

```javascript
// Create custom event
const event = new CustomEvent('userAction', {
    detail: { action: 'click', timestamp: Date.now() }
});

// Listen for the event
document.addEventListener('userAction', (e) => {
    console.log('Action:', e.detail.action);
    console.log('Time:', e.detail.timestamp);
});

// Dispatch the event
document.dispatchEvent(event);
```

### 2. Component Communication
Use custom events for communication between components.

**Use Case**: Parent-child or sibling component communication without tight coupling.

```javascript
// Child component dispatches event
class ChildComponent {
    notify(data) {
        const event = new CustomEvent('childUpdate', {
            detail: data,
            bubbles: true // Event bubbles up
        });
        this.element.dispatchEvent(event);
    }
}

// Parent component listens
class ParentComponent {
    constructor() {
        this.element.addEventListener('childUpdate', (e) => {
            console.log('Child updated:', e.detail);
        });
    }
}
```

### 3. Event Bubbling & Capturing
Control how events propagate through the DOM.

**Use Case**: Handle events at different levels of the DOM hierarchy.

```javascript
const event = new CustomEvent('dataChange', {
    detail: { value: 42 },
    bubbles: true,      // Event bubbles up the DOM
    cancelable: true    // Can be cancelled with preventDefault()
});

// Listen at parent level
parent.addEventListener('dataChange', (e) => {
    console.log('Caught at parent:', e.detail.value);
});

// Dispatch from child
child.dispatchEvent(event);
```

### 4. Pub/Sub Pattern
Implement a publish-subscribe system using custom events.

**Use Case**: Decoupled communication across different modules.

```javascript
class EventBus {
    constructor() {
        this.bus = document.createElement('div');
    }

    publish(eventName, data) {
        const event = new CustomEvent(eventName, { detail: data });
        this.bus.dispatchEvent(event);
    }

    subscribe(eventName, callback) {
        this.bus.addEventListener(eventName, callback);
    }

    unsubscribe(eventName, callback) {
        this.bus.removeEventListener(eventName, callback);
    }
}

// Usage
const eventBus = new EventBus();

// Subscribe
eventBus.subscribe('userLogin', (e) => {
    console.log('User logged in:', e.detail.username);
});

// Publish
eventBus.publish('userLogin', { username: 'Alice' });
```

### 5. Form Validation Events
Create custom validation events for forms.

**Use Case**: Build reusable form validation with custom error messages.

```javascript
class FormValidator {
    validate(input, rules) {
        const errors = this.checkRules(input.value, rules);

        const event = new CustomEvent('validationComplete', {
            detail: {
                valid: errors.length === 0,
                errors: errors,
                field: input.name
            },
            bubbles: true
        });

        input.dispatchEvent(event);
    }
}

// Listen for validation
form.addEventListener('validationComplete', (e) => {
    if (!e.detail.valid) {
        showErrors(e.detail.field, e.detail.errors);
    }
});
```

### 6. State Management
Use events to manage application state changes.

**Use Case**: Notify all interested components when state changes.

```javascript
class Store {
    constructor(initialState) {
        this.state = initialState;
        this.element = document.createElement('div');
    }

    setState(newState) {
        const oldState = { ...this.state };
        this.state = { ...this.state, ...newState };

        const event = new CustomEvent('stateChange', {
            detail: {
                oldState,
                newState: this.state,
                changed: Object.keys(newState)
            }
        });

        this.element.dispatchEvent(event);
    }

    subscribe(callback) {
        this.element.addEventListener('stateChange', callback);
    }
}

// Usage
const store = new Store({ count: 0 });

store.subscribe((e) => {
    console.log('State changed:', e.detail.newState);
});

store.setState({ count: 1 });
```

## Real-World Use Cases

### 1. Modal/Dialog Communication

```javascript
class Modal {
    open(data) {
        this.show();

        const event = new CustomEvent('modalOpened', {
            detail: { modalId: this.id, data }
        });
        document.dispatchEvent(event);
    }

    close() {
        this.hide();

        const event = new CustomEvent('modalClosed', {
            detail: { modalId: this.id }
        });
        document.dispatchEvent(event);
    }
}

// Listen for modal events
document.addEventListener('modalOpened', (e) => {
    console.log('Modal opened:', e.detail.modalId);
    pauseBackgroundVideo();
});

document.addEventListener('modalClosed', (e) => {
    console.log('Modal closed:', e.detail.modalId);
    resumeBackgroundVideo();
});
```

### 2. Shopping Cart Updates

```javascript
class ShoppingCart {
    addItem(item) {
        this.items.push(item);

        const event = new CustomEvent('cartUpdated', {
            detail: {
                action: 'add',
                item: item,
                total: this.getTotal(),
                itemCount: this.items.length
            },
            bubbles: true
        });

        document.dispatchEvent(event);
    }

    removeItem(itemId) {
        this.items = this.items.filter(i => i.id !== itemId);

        const event = new CustomEvent('cartUpdated', {
            detail: {
                action: 'remove',
                itemId: itemId,
                total: this.getTotal(),
                itemCount: this.items.length
            },
            bubbles: true
        });

        document.dispatchEvent(event);
    }
}

// Update UI when cart changes
document.addEventListener('cartUpdated', (e) => {
    updateCartBadge(e.detail.itemCount);
    updateTotalDisplay(e.detail.total);

    if (e.detail.action === 'add') {
        showNotification(`Added ${e.detail.item.name} to cart`);
    }
});
```

### 3. Real-Time Notifications

```javascript
class NotificationService {
    notify(type, message, data = {}) {
        const event = new CustomEvent('notification', {
            detail: {
                type: type,        // 'info', 'success', 'warning', 'error'
                message: message,
                data: data,
                timestamp: Date.now()
            }
        });

        document.dispatchEvent(event);
    }
}

// Central notification handler
document.addEventListener('notification', (e) => {
    const { type, message, data } = e.detail;

    // Show toast notification
    showToast(type, message);

    // Log to analytics
    logEvent('notification_shown', { type, message });

    // Store in notification center
    addToNotificationCenter(e.detail);
});

// Usage throughout the app
const notifier = new NotificationService();
notifier.notify('success', 'Profile updated successfully');
notifier.notify('error', 'Failed to save changes', { field: 'email' });
```

### 4. Tab/Panel System

```javascript
class TabManager {
    switchTab(tabId) {
        // Hide all tabs
        this.hideAllTabs();

        // Show selected tab
        this.showTab(tabId);

        // Dispatch custom event
        const event = new CustomEvent('tabChanged', {
            detail: {
                previousTab: this.activeTab,
                currentTab: tabId,
                timestamp: Date.now()
            },
            bubbles: true
        });

        this.element.dispatchEvent(event);
        this.activeTab = tabId;
    }
}

// React to tab changes
document.addEventListener('tabChanged', (e) => {
    // Update URL
    history.pushState({}, '', `#${e.detail.currentTab}`);

    // Load tab content if needed
    if (needsLoading(e.detail.currentTab)) {
        loadTabContent(e.detail.currentTab);
    }

    // Track analytics
    trackTabView(e.detail.currentTab);
});
```

### 5. File Upload Progress

```javascript
class FileUploader {
    async upload(file) {
        const formData = new FormData();
        formData.append('file', file);

        // Dispatch upload started event
        this.dispatchEvent('uploadStarted', {
            fileName: file.name,
            fileSize: file.size
        });

        try {
            // Simulate progress updates
            for (let progress = 0; progress <= 100; progress += 10) {
                await this.delay(200);

                this.dispatchEvent('uploadProgress', {
                    fileName: file.name,
                    progress: progress
                });
            }

            this.dispatchEvent('uploadComplete', {
                fileName: file.name,
                url: '/uploads/' + file.name
            });

        } catch (error) {
            this.dispatchEvent('uploadError', {
                fileName: file.name,
                error: error.message
            });
        }
    }

    dispatchEvent(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        document.dispatchEvent(event);
    }
}

// Handle upload events
document.addEventListener('uploadStarted', (e) => {
    showProgressBar(e.detail.fileName);
});

document.addEventListener('uploadProgress', (e) => {
    updateProgressBar(e.detail.fileName, e.detail.progress);
});

document.addEventListener('uploadComplete', (e) => {
    hideProgressBar(e.detail.fileName);
    showSuccess(`Uploaded ${e.detail.fileName}`);
});
```

### 6. Game Events

```javascript
class Game {
    scorePoint(player, points) {
        this.score[player] += points;

        const event = new CustomEvent('scoreChanged', {
            detail: {
                player: player,
                points: points,
                totalScore: this.score[player],
                gameState: this.getState()
            }
        });

        this.element.dispatchEvent(event);

        // Check for win condition
        if (this.score[player] >= this.winningScore) {
            this.endGame(player);
        }
    }

    endGame(winner) {
        const event = new CustomEvent('gameEnded', {
            detail: {
                winner: winner,
                finalScores: this.score,
                duration: Date.now() - this.startTime
            }
        });

        this.element.dispatchEvent(event);
    }
}

// Listen for game events
game.element.addEventListener('scoreChanged', (e) => {
    updateScoreboard(e.detail.player, e.detail.totalScore);
    playScoreSound();
});

game.element.addEventListener('gameEnded', (e) => {
    showWinnerAnimation(e.detail.winner);
    saveGameStats(e.detail);
});
```

## Advanced Patterns

### Event Delegation with Custom Events

```javascript
class ListView {
    constructor(element) {
        this.element = element;

        // Single listener for all items
        this.element.addEventListener('itemAction', (e) => {
            this.handleItemAction(e.detail);
        });
    }

    handleItemAction(detail) {
        switch(detail.action) {
            case 'delete':
                this.deleteItem(detail.itemId);
                break;
            case 'edit':
                this.editItem(detail.itemId);
                break;
            case 'share':
                this.shareItem(detail.itemId);
                break;
        }
    }
}

// Child items dispatch events
class ListItem {
    onButtonClick(action) {
        const event = new CustomEvent('itemAction', {
            detail: {
                action: action,
                itemId: this.id,
                itemData: this.data
            },
            bubbles: true
        });

        this.element.dispatchEvent(event);
    }
}
```

### Custom Event with preventDefault

```javascript
// Dispatch cancellable event
function deleteItem(itemId) {
    const event = new CustomEvent('beforeDelete', {
        detail: { itemId },
        cancelable: true
    });

    const allowed = document.dispatchEvent(event);

    if (allowed) {
        // Event was not cancelled, proceed with deletion
        performDelete(itemId);
    }
}

// Listen and potentially cancel
document.addEventListener('beforeDelete', (e) => {
    if (itemIsImportant(e.detail.itemId)) {
        // Prevent deletion
        e.preventDefault();
        showWarning('Cannot delete important item');
    }
});
```

### Event Queue System

```javascript
class EventQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
        this.element = document.createElement('div');
    }

    enqueue(eventData) {
        this.queue.push(eventData);

        const event = new CustomEvent('eventQueued', {
            detail: {
                queueLength: this.queue.length,
                event: eventData
            }
        });

        this.element.dispatchEvent(event);

        if (!this.processing) {
            this.process();
        }
    }

    async process() {
        this.processing = true;

        while (this.queue.length > 0) {
            const eventData = this.queue.shift();

            const event = new CustomEvent('eventProcessing', {
                detail: eventData
            });
            this.element.dispatchEvent(event);

            await this.handleEvent(eventData);
        }

        this.processing = false;

        const event = new CustomEvent('queueEmpty', { detail: {} });
        this.element.dispatchEvent(event);
    }
}
```

### Typed Custom Events (TypeScript Pattern)

```javascript
// Create type-safe custom event system
class TypedEventTarget {
    constructor() {
        this.target = document.createElement('div');
    }

    emit(eventName, detail) {
        const event = new CustomEvent(eventName, { detail });
        this.target.dispatchEvent(event);
    }

    on(eventName, callback) {
        this.target.addEventListener(eventName, (e) => {
            callback(e.detail);
        });
    }

    off(eventName, callback) {
        this.target.removeEventListener(eventName, callback);
    }

    once(eventName, callback) {
        const handler = (e) => {
            callback(e.detail);
            this.off(eventName, handler);
        };
        this.on(eventName, handler);
    }
}

// Usage
const emitter = new TypedEventTarget();

emitter.on('userLogin', (data) => {
    console.log('User logged in:', data.username);
});

emitter.emit('userLogin', { username: 'Alice', userId: 123 });
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 15+     |
| Firefox | 11+     |
| Safari  | 6+      |
| Edge    | All     |
| IE      | 9+*     |

*IE requires polyfill for full support

## Polyfill for Older Browsers

```javascript
(function() {
    if (typeof window.CustomEvent === "function") return false;

    function CustomEvent(event, params) {
        params = params || { bubbles: false, cancelable: false, detail: null };
        const evt = document.createEvent('CustomEvent');
        evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
        return evt;
    }

    window.CustomEvent = CustomEvent;
})();
```

## Best Practices

### 1. Use Descriptive Event Names

```javascript
// ✓ Good
new CustomEvent('userLoginSuccess', { detail: user });
new CustomEvent('cart:itemAdded', { detail: item });
new CustomEvent('modal:opened', { detail: { modalId } });

// ✗ Bad
new CustomEvent('event1', { detail: data });
new CustomEvent('update', { detail: info });
```

### 2. Always Include Detail Object

```javascript
// ✓ Good
new CustomEvent('dataLoaded', {
    detail: {
        items: items,
        count: items.length,
        timestamp: Date.now()
    }
});

// ✗ Bad
new CustomEvent('dataLoaded'); // No data
```

### 3. Set Bubbling Appropriately

```javascript
// ✓ Good - Event should bubble up
new CustomEvent('formSubmitted', {
    detail: formData,
    bubbles: true  // Parent can catch it
});

// ✓ Good - Event is local
new CustomEvent('internalStateChange', {
    detail: state,
    bubbles: false  // Stay local
});
```

### 4. Handle Event Cleanup

```javascript
// ✓ Good
class Component {
    constructor() {
        this.handleEvent = this.handleEvent.bind(this);
        document.addEventListener('myEvent', this.handleEvent);
    }

    destroy() {
        document.removeEventListener('myEvent', this.handleEvent);
    }
}

// ✗ Bad - Memory leak
class Component {
    constructor() {
        document.addEventListener('myEvent', (e) => {
            // Anonymous function, can't remove
        });
    }
}
```

### 5. Namespace Your Events

```javascript
// ✓ Good - Avoid naming conflicts
const EVENTS = {
    USER_LOGIN: 'myApp:user:login',
    USER_LOGOUT: 'myApp:user:logout',
    CART_UPDATE: 'myApp:cart:update'
};

// ✗ Bad - Generic names can conflict
const EVENTS = {
    LOGIN: 'login',
    UPDATE: 'update'
};
```

### 6. Document Event Contracts

```javascript
/**
 * Dispatched when user completes login
 * @event userLogin
 * @type {CustomEvent}
 * @property {Object} detail - Event details
 * @property {string} detail.username - User's username
 * @property {number} detail.userId - User's ID
 * @property {string} detail.token - Auth token
 */
const event = new CustomEvent('userLogin', {
    detail: { username, userId, token }
});
```

## Common Pitfalls

### 1. Forgetting to Set Bubbles

```javascript
// ✗ Event won't bubble up to parent
const event = new CustomEvent('click', {
    detail: { x, y }
    // bubbles defaults to false
});

child.dispatchEvent(event);
parent.addEventListener('click', handler); // Won't trigger!
```

### 2. Modifying Event Detail

```javascript
// ✗ Detail object can be modified by listeners
const data = { count: 0 };
const event = new CustomEvent('update', { detail: data });
document.dispatchEvent(event);
// Listener might modify data.count!

// ✓ Clone data to prevent mutation
const event = new CustomEvent('update', {
    detail: JSON.parse(JSON.stringify(data))
});
```

### 3. Not Checking Event Type

```javascript
// ✗ Assumes all events are CustomEvents
element.addEventListener('click', (e) => {
    console.log(e.detail.value); // Undefined for regular clicks!
});

// ✓ Check event type
element.addEventListener('click', (e) => {
    if (e instanceof CustomEvent) {
        console.log(e.detail.value);
    }
});
```

### 4. Memory Leaks from Event Listeners

```javascript
// ✗ Creates new listener every render
function render() {
    document.addEventListener('myEvent', () => {
        // Memory leak!
    });
}

// ✓ Store reference and clean up
let listener = null;
function setup() {
    listener = (e) => handleEvent(e);
    document.addEventListener('myEvent', listener);
}
function cleanup() {
    document.removeEventListener('myEvent', listener);
}
```

### 5. Synchronous Event Cascade

```javascript
// ✗ Can cause stack overflow
document.addEventListener('eventA', () => {
    document.dispatchEvent(new CustomEvent('eventB'));
});

document.addEventListener('eventB', () => {
    document.dispatchEvent(new CustomEvent('eventA')); // Infinite loop!
});

// ✓ Use async dispatch or guards
let processing = false;
document.addEventListener('eventA', () => {
    if (!processing) {
        processing = true;
        setTimeout(() => {
            document.dispatchEvent(new CustomEvent('eventB'));
            processing = false;
        }, 0);
    }
});
```

## Testing Custom Events

### Test Event Dispatching

```javascript
test('should dispatch custom event', () => {
    const element = document.createElement('div');
    const handler = jest.fn();

    element.addEventListener('myEvent', handler);

    const event = new CustomEvent('myEvent', {
        detail: { value: 42 }
    });
    element.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
    expect(handler.mock.calls[0][0].detail.value).toBe(42);
});
```

### Test Event Bubbling

```javascript
test('should bubble up to parent', () => {
    const parent = document.createElement('div');
    const child = document.createElement('div');
    parent.appendChild(child);

    const handler = jest.fn();
    parent.addEventListener('myEvent', handler);

    const event = new CustomEvent('myEvent', {
        detail: { test: true },
        bubbles: true
    });
    child.dispatchEvent(event);

    expect(handler).toHaveBeenCalled();
});
```

## Resources

- [MDN CustomEvent](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent)
- [MDN EventTarget](https://developer.mozilla.org/en-US/docs/Web/API/EventTarget)
- [Event Reference](https://developer.mozilla.org/en-US/docs/Web/Events)

## Files

- **index.html** - Interactive demos page
- **style.css** - Styling for all demos
- **script.js** - All 6 demo implementations
- **README.md** - This documentation

## Running the Examples

Open `index.html` in a browser. All demos are fully interactive and demonstrate real-world scenarios.

## License

Free to use for learning and projects.

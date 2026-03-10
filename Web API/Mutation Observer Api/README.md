# MutationObserver API

A comprehensive guide to the MutationObserver API with 6 practical examples demonstrating how to efficiently observe and react to DOM changes.

## What is MutationObserver?

The **MutationObserver API** provides a way to watch for changes to the DOM tree. It can observe modifications to elements, attributes, and text content, providing notifications when changes occur. It's a modern, performant replacement for the deprecated Mutation Events.

## Key Concepts

### 1. Creating an Observer

Create an observer instance with a callback function.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        console.log('Mutation type:', mutation.type);
        console.log('Target:', mutation.target);
    });
});
```

### 2. Observing Elements

Start observing an element with configuration options.

```javascript
const target = document.querySelector('#myElement');

observer.observe(target, {
    childList: true,       // Watch for children changes
    attributes: true,      // Watch for attribute changes
    characterData: true,   // Watch for text changes
    subtree: true         // Watch all descendants
});
```

### 3. Configuration Options

Specify what changes to observe.

```javascript
const config = {
    childList: true,              // Children added/removed
    attributes: true,             // Attribute changes
    characterData: true,          // Text content changes
    subtree: true,                // Watch all descendants
    attributeOldValue: true,      // Record old attribute values
    characterDataOldValue: true,  // Record old text values
    attributeFilter: ['class', 'src'] // Watch specific attributes
};

observer.observe(target, config);
```

### 4. Processing Mutations

Handle mutations in the callback.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        switch(mutation.type) {
            case 'childList':
                console.log('Children changed');
                console.log('Added:', mutation.addedNodes);
                console.log('Removed:', mutation.removedNodes);
                break;

            case 'attributes':
                console.log('Attribute changed:', mutation.attributeName);
                break;

            case 'characterData':
                console.log('Text changed');
                break;
        }
    });
});
```

### 5. Disconnecting

Stop observing when done.

```javascript
observer.disconnect();
```

### 6. Taking Records

Get pending mutations synchronously.

```javascript
const pendingMutations = observer.takeRecords();
console.log('Pending mutations:', pendingMutations);
```

## Why Use MutationObserver?

### The Problem Without It

**Before MutationObserver**, tracking DOM changes required:
- Deprecated Mutation Events (poor performance)
- Polling with setInterval (inefficient)
- Manual tracking (error-prone)
- Overriding DOM methods (unreliable)
- Event delegation hacks
- High CPU usage and battery drain

### The Solution With MutationObserver

```javascript
// Efficient and simple!
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        console.log('DOM changed:', mutation);
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});
```

**Benefits:**
- ✅ High performance (batched callbacks)
- ✅ Asynchronous notifications
- ✅ Detailed mutation information
- ✅ Flexible configuration
- ✅ Excellent browser support
- ✅ No polling required
- ✅ Low memory footprint

## Demos Included

### 1. Basic DOM Mutations

Observe when child elements are added or removed.

**Use Case**: Track dynamic content, single-page apps, infinite scroll.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
            // Handle added nodes
            mutation.addedNodes.forEach(node => {
                console.log('Added:', node);
            });

            // Handle removed nodes
            mutation.removedNodes.forEach(node => {
                console.log('Removed:', node);
            });
        }
    });
});

observer.observe(container, {
    childList: true
});
```

### 2. Attribute Changes Detection

Detect when element attributes are modified.

**Use Case**: Track class changes, style modifications, data attribute updates.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
            const attrName = mutation.attributeName;
            const oldValue = mutation.oldValue;
            const newValue = mutation.target.getAttribute(attrName);

            console.log(`${attrName} changed from "${oldValue}" to "${newValue}"`);
        }
    });
});

observer.observe(element, {
    attributes: true,
    attributeOldValue: true,
    attributeFilter: ['class', 'data-state'] // Watch specific attributes
});
```

### 3. Text Content Monitoring

Monitor changes to text nodes within elements.

**Use Case**: Content editing, live validation, character counting.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'characterData') {
            const oldText = mutation.oldValue;
            const newText = mutation.target.textContent;

            console.log('Text changed');
            console.log('From:', oldText);
            console.log('To:', newText);

            updateCharacterCount(newText.length);
        }
    });
});

observer.observe(editableElement, {
    characterData: true,
    characterDataOldValue: true,
    subtree: true  // Watch text in all descendants
});
```

### 4. Deep Subtree Watching

Observe all changes within an entire DOM subtree.

**Use Case**: Monitor third-party widgets, complex components, entire sections.

```javascript
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        const depth = getElementDepth(mutation.target);

        console.log(`Mutation at depth ${depth}:`, {
            type: mutation.type,
            target: mutation.target,
            oldValue: mutation.oldValue
        });
    });
});

observer.observe(container, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true,  // Watch entire subtree!
    attributeOldValue: true,
    characterDataOldValue: true
});
```

### 5. Auto-Save Form Tracker

Track form changes and auto-save with MutationObserver.

**Use Case**: Auto-save drafts, track user input, recover unsaved work.

```javascript
let saveTimer;

const formObserver = new MutationObserver(mutations => {
    // Debounce save
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
        saveFormData();
    }, 1000);
});

// Observe all form fields
const formFields = document.querySelectorAll('input, textarea');
formFields.forEach(field => {
    // For better results, combine with input events
    field.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveTimer = setTimeout(saveFormData, 1000);
    });
});

function saveFormData() {
    const formData = new FormData(document.querySelector('form'));
    localStorage.setItem('draft', JSON.stringify(Object.fromEntries(formData)));
    console.log('Form auto-saved');
}
```

### 6. Performance Monitoring

Monitor mutation performance and batch processing.

**Use Case**: Debug performance, optimize observers, batch DOM updates.

```javascript
let mutationStats = {
    callbacks: 0,
    totalMutations: 0,
    processingTimes: []
};

const observer = new MutationObserver(mutations => {
    const startTime = performance.now();

    mutationStats.callbacks++;
    mutationStats.totalMutations += mutations.length;

    console.log(`Processing ${mutations.length} mutations in batch #${mutationStats.callbacks}`);

    // Process mutations
    mutations.forEach(mutation => {
        handleMutation(mutation);
    });

    const duration = performance.now() - startTime;
    mutationStats.processingTimes.push(duration);

    const avgTime = mutationStats.processingTimes.reduce((a, b) => a + b, 0) / mutationStats.processingTimes.length;

    console.log(`Processed in ${duration.toFixed(2)}ms (avg: ${avgTime.toFixed(2)}ms)`);
});

observer.observe(container, {
    childList: true,
    attributes: true,
    subtree: true
});
```

## Real-World Use Cases

### 1. Track Third-Party Script Changes

```javascript
class ThirdPartyMonitor {
    constructor(containerSelector) {
        this.container = document.querySelector(containerSelector);
        this.changes = [];

        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                this.changes.push({
                    type: mutation.type,
                    target: mutation.target,
                    timestamp: Date.now()
                });

                // Alert if suspicious changes
                if (this.isSuspicious(mutation)) {
                    this.alertSecurity(mutation);
                }
            });
        });

        this.observer.observe(this.container, {
            childList: true,
            attributes: true,
            subtree: true
        });
    }

    isSuspicious(mutation) {
        // Check for suspicious patterns
        const target = mutation.target;

        // Check for inline scripts
        if (target.tagName === 'SCRIPT' && !target.src) {
            return true;
        }

        // Check for suspicious attributes
        if (mutation.type === 'attributes') {
            const suspiciousAttrs = ['onclick', 'onerror', 'onload'];
            if (suspiciousAttrs.includes(mutation.attributeName)) {
                return true;
            }
        }

        return false;
    }

    alertSecurity(mutation) {
        console.error('Suspicious DOM change detected:', mutation);
        // Send to security monitoring system
    }

    disconnect() {
        this.observer.disconnect();
    }
}
```

### 2. Custom Element Lifecycle

```javascript
class SmartElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Observe own changes
        this.observer = new MutationObserver(mutations => {
            this.handleMutations(mutations);
        });
    }

    connectedCallback() {
        this.render();

        this.observer.observe(this, {
            attributes: true,
            childList: true,
            subtree: true
        });
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }

    handleMutations(mutations) {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                this.attributeChangedCallback(
                    mutation.attributeName,
                    mutation.oldValue,
                    this.getAttribute(mutation.attributeName)
                );
            }

            if (mutation.type === 'childList') {
                this.childrenChangedCallback(
                    Array.from(mutation.addedNodes),
                    Array.from(mutation.removedNodes)
                );
            }
        });
    }

    attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} changed: ${oldValue} → ${newValue}`);
        this.render();
    }

    childrenChangedCallback(added, removed) {
        console.log('Children changed:', { added, removed });
    }

    render() {
        // Render logic
    }
}
```

### 3. Analytics & User Behavior Tracking

```javascript
class DOMAnalytics {
    constructor() {
        this.interactions = [];

        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                this.trackMutation(mutation);
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            attributes: true,
            subtree: true,
            attributeFilter: ['class', 'style', 'data-state']
        });
    }

    trackMutation(mutation) {
        const event = {
            type: mutation.type,
            target: this.getElementPath(mutation.target),
            timestamp: Date.now()
        };

        if (mutation.type === 'attributes') {
            event.attribute = mutation.attributeName;
            event.oldValue = mutation.oldValue;
            event.newValue = mutation.target.getAttribute(mutation.attributeName);
        }

        this.interactions.push(event);

        // Send to analytics
        this.sendToAnalytics(event);
    }

    getElementPath(element) {
        const path = [];
        let current = element;

        while (current && current !== document.body) {
            let selector = current.tagName.toLowerCase();

            if (current.id) {
                selector += `#${current.id}`;
            } else if (current.className) {
                selector += `.${current.className.split(' ').join('.')}`;
            }

            path.unshift(selector);
            current = current.parentElement;
        }

        return path.join(' > ');
    }

    sendToAnalytics(event) {
        // Send to analytics service
        console.log('Analytics event:', event);
    }
}
```

### 4. Live Content Validator

```javascript
class ContentValidator {
    constructor(element) {
        this.element = element;
        this.errors = [];

        this.observer = new MutationObserver(mutations => {
            this.validate();
        });

        this.observer.observe(this.element, {
            characterData: true,
            childList: true,
            subtree: true
        });
    }

    validate() {
        this.errors = [];
        const content = this.element.textContent;

        // Check for profanity
        const profanityPattern = /bad|words|here/gi;
        if (profanityPattern.test(content)) {
            this.errors.push('Content contains inappropriate language');
        }

        // Check for length
        if (content.length > 5000) {
            this.errors.push('Content exceeds maximum length');
        }

        // Check for required keywords
        if (!content.toLowerCase().includes('important')) {
            this.errors.push('Content missing required keywords');
        }

        this.updateValidationUI();
    }

    updateValidationUI() {
        if (this.errors.length > 0) {
            this.element.classList.add('invalid');
            this.showErrors();
        } else {
            this.element.classList.remove('invalid');
            this.hideErrors();
        }
    }

    showErrors() {
        console.error('Validation errors:', this.errors);
    }

    hideErrors() {
        console.log('Content valid');
    }
}
```

### 5. Undo/Redo System

```javascript
class DOMUndoRedo {
    constructor(container) {
        this.container = container;
        this.history = [];
        this.currentIndex = -1;
        this.isUndoRedo = false;

        this.observer = new MutationObserver(mutations => {
            if (this.isUndoRedo) return;

            // Record mutation for undo
            this.recordMutation(mutations);
        });

        this.observer.observe(this.container, {
            childList: true,
            attributes: true,
            characterData: true,
            subtree: true,
            attributeOldValue: true,
            characterDataOldValue: true
        });
    }

    recordMutation(mutations) {
        // Remove any future history if we're not at the end
        if (this.currentIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.currentIndex + 1);
        }

        this.history.push({
            mutations: mutations.map(m => ({
                type: m.type,
                target: m.target,
                oldValue: m.oldValue,
                addedNodes: Array.from(m.addedNodes),
                removedNodes: Array.from(m.removedNodes),
                attributeName: m.attributeName
            })),
            timestamp: Date.now()
        });

        this.currentIndex++;
    }

    undo() {
        if (this.currentIndex < 0) return;

        this.isUndoRedo = true;
        const entry = this.history[this.currentIndex];

        // Reverse mutations
        entry.mutations.reverse().forEach(mutation => {
            this.reverseMutation(mutation);
        });

        this.currentIndex--;
        this.isUndoRedo = false;
    }

    redo() {
        if (this.currentIndex >= this.history.length - 1) return;

        this.isUndoRedo = true;
        this.currentIndex++;
        const entry = this.history[this.currentIndex];

        // Reapply mutations
        entry.mutations.forEach(mutation => {
            this.reapplyMutation(mutation);
        });

        this.isUndoRedo = false;
    }

    reverseMutation(mutation) {
        // Implementation to reverse specific mutation
        switch(mutation.type) {
            case 'childList':
                // Remove added nodes, restore removed nodes
                break;
            case 'attributes':
                mutation.target.setAttribute(mutation.attributeName, mutation.oldValue);
                break;
            case 'characterData':
                mutation.target.textContent = mutation.oldValue;
                break;
        }
    }

    reapplyMutation(mutation) {
        // Implementation to reapply mutation
    }
}
```

### 6. Lazy Load Images on DOM Change

```javascript
class LazyLoadObserver {
    constructor() {
        this.observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === 1) {
                            this.processNode(node);
                        }
                    });
                }
            });
        });

        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Process existing images
        this.processNode(document.body);
    }

    processNode(node) {
        // Find all images with data-src
        const images = node.querySelectorAll ? node.querySelectorAll('img[data-src]') : [];

        images.forEach(img => {
            this.observeImage(img);
        });

        // Check if node itself is an image
        if (node.tagName === 'IMG' && node.dataset.src) {
            this.observeImage(node);
        }
    }

    observeImage(img) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        });

        imageObserver.observe(img);
    }

    loadImage(img) {
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
        console.log('Lazy loaded:', img.src);
    }
}
```

## Advanced Patterns

### Debounced Observer

```javascript
class DebouncedMutationObserver {
    constructor(callback, delay = 100) {
        this.callback = callback;
        this.delay = delay;
        this.timeout = null;
        this.pendingMutations = [];

        this.observer = new MutationObserver(mutations => {
            this.pendingMutations.push(...mutations);

            clearTimeout(this.timeout);
            this.timeout = setTimeout(() => {
                this.callback(this.pendingMutations);
                this.pendingMutations = [];
            }, this.delay);
        });
    }

    observe(target, options) {
        this.observer.observe(target, options);
    }

    disconnect() {
        clearTimeout(this.timeout);
        this.observer.disconnect();
    }
}

// Usage
const debouncedObserver = new DebouncedMutationObserver(mutations => {
    console.log(`${mutations.length} mutations after debounce`);
}, 500);

debouncedObserver.observe(document.body, { childList: true, subtree: true });
```

### React Hook

```javascript
import { useEffect, useRef } from 'react';

function useMutationObserver(callback, options) {
    const targetRef = useRef(null);

    useEffect(() => {
        if (!targetRef.current) return;

        const observer = new MutationObserver(callback);
        observer.observe(targetRef.current, options);

        return () => observer.disconnect();
    }, [callback, options]);

    return targetRef;
}

// Usage
function MyComponent() {
    const handleMutations = (mutations) => {
        console.log('Mutations:', mutations);
    };

    const ref = useMutationObserver(handleMutations, {
        childList: true,
        subtree: true
    });

    return <div ref={ref}>Content to observe</div>;
}
```

### Vue Composable

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useMutationObserver(callback, options) {
    const target = ref(null);
    let observer = null;

    const observe = () => {
        if (!target.value) return;

        observer = new MutationObserver(callback);
        observer.observe(target.value, options);
    };

    onMounted(observe);

    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return target;
}

// Usage in component
export default {
    setup() {
        const handleMutations = (mutations) => {
            console.log('Mutations:', mutations);
        };

        const target = useMutationObserver(handleMutations, {
            childList: true,
            attributes: true
        });

        return { target };
    }
};
```

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome  | 26+     | Full support |
| Firefox | 14+     | Full support |
| Safari  | 6.1+    | Full support |
| Edge    | 12+     | Full support |
| IE      | 11      | Full support |
| Opera   | 15+     | Full support |

**Support:** ~99% of users globally

### Feature Detection

```javascript
if ('MutationObserver' in window) {
    const observer = new MutationObserver(callback);
    observer.observe(target, config);
} else {
    console.warn('MutationObserver not supported');
    // Fallback to polling or Mutation Events
}
```

## Best Practices

### 1. Be Specific with Configuration

```javascript
// ✓ Good - Only observe what you need
observer.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'data-state'] // Specific attributes
});

// ✗ Bad - Observing everything
observer.observe(element, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
});
```

### 2. Disconnect When Done

```javascript
// ✓ Good - Clean up
class Component {
    constructor(element) {
        this.observer = new MutationObserver(this.handleMutations);
        this.observer.observe(element, config);
    }

    destroy() {
        this.observer.disconnect();
    }
}

// ✗ Bad - Never disconnected
const observer = new MutationObserver(callback);
observer.observe(element, config);
// Memory leak!
```

### 3. Avoid Infinite Loops

```javascript
// ✗ Bad - Creates infinite loop!
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        // Modifying observed element triggers observer again!
        mutation.target.classList.add('modified');
    });
});

// ✓ Good - Check before modifying
const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (!mutation.target.classList.contains('modified')) {
            mutation.target.classList.add('modified');
        }
    });
});

// ✓ Better - Disconnect temporarily
const observer = new MutationObserver(mutations => {
    observer.disconnect();

    mutations.forEach(mutation => {
        mutation.target.classList.add('modified');
    });

    observer.observe(target, config);
});
```

### 4. Use attributeFilter

```javascript
// ✓ Good - Watch specific attributes
observer.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'hidden']
});

// ✗ Bad - Watch all attributes
observer.observe(element, {
    attributes: true
});
```

### 5. Batch DOM Updates

```javascript
// ✓ Good - Batch updates
const fragment = document.createDocumentFragment();
for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    fragment.appendChild(div);
}
container.appendChild(fragment); // Single mutation

// ✗ Bad - Individual updates
for (let i = 0; i < 100; i++) {
    const div = document.createElement('div');
    container.appendChild(div); // 100 mutations!
}
```

### 6. Debounce Expensive Operations

```javascript
// ✓ Good - Debounce heavy operations
let timeout;
const observer = new MutationObserver(mutations => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        expensiveOperation(mutations);
    }, 100);
});
```

## Common Pitfalls

### 1. Observing Too Much

```javascript
// ✗ Observing entire document
observer.observe(document.body, {
    childList: true,
    attributes: true,
    subtree: true
});

// ✓ Observe specific container
observer.observe(container, {
    childList: true
});
```

### 2. Not Using takeRecords()

```javascript
// ✓ Process pending mutations before disconnect
const pending = observer.takeRecords();
if (pending.length > 0) {
    callback(pending);
}
observer.disconnect();
```

### 3. Synchronous Expectations

```javascript
// ✗ Mutations are async
element.classList.add('new-class');
// Observer callback hasn't run yet!

// ✓ Use Promise or setTimeout
element.classList.add('new-class');
await new Promise(resolve => setTimeout(resolve, 0));
// Now observer has run
```

## Performance Optimization

### 1. Limit Scope

```javascript
// Observe specific container, not entire document
observer.observe(container, options);
```

### 2. Use Filters

```javascript
// Only watch specific attributes
observer.observe(element, {
    attributes: true,
    attributeFilter: ['class', 'data-state']
});
```

### 3. Process Asynchronously

```javascript
const observer = new MutationObserver(mutations => {
    requestIdleCallback(() => {
        processMutations(mutations);
    });
});
```

## Resources

- [MDN MutationObserver](https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver)
- [W3C Specification](https://dom.spec.whatwg.org/#mutation-observers)
- [Can I Use](https://caniuse.com/mutationobserver)

## Files

- **index.html** - Interactive demos page with 6 examples
- **style.css** - Comprehensive styling
- **script.js** - Complete implementations
- **README.md** - This documentation

## Running the Examples

1. Open `index.html` in a modern browser
2. Interact with each demo
3. Watch mutations in real-time
4. Check console for detailed logging

## License

Free to use for learning and projects.

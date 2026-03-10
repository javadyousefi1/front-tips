# AbortController API

A comprehensive guide to the AbortController API with 6 practical examples demonstrating how to cancel asynchronous operations in JavaScript.

## What is AbortController?

The **AbortController** interface allows you to abort one or more asynchronous operations (like fetch requests, event listeners, or custom async tasks) when needed. It provides a way to cancel operations that are no longer needed, saving resources and improving user experience.

## Key Components

### 1. AbortController
The controller object that manages the abort operation.

```javascript
const controller = new AbortController();
```

### 2. AbortSignal
The signal property that communicates with abortable APIs.

```javascript
const signal = controller.signal;
```

### 3. abort() Method
The method that triggers the cancellation.

```javascript
controller.abort();
```

### 4. AbortError
The error thrown when an operation is aborted.

```javascript
try {
    await fetch(url, { signal });
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Request was cancelled');
    }
}
```

## Demos Included

### 1. Basic Fetch Abort
Learn how to cancel an ongoing fetch request.

**Use Case**: User navigates away before data loads.

```javascript
const controller = new AbortController();

fetch('https://api.example.com/data', {
    signal: controller.signal
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => {
    if (error.name === 'AbortError') {
        console.log('Fetch aborted');
    }
});

// Cancel the request
controller.abort();
```

### 2. Fetch with Timeout
Automatically abort requests that take too long.

**Use Case**: Poor network conditions, prevent hanging requests.

```javascript
const controller = new AbortController();

// Auto-abort after 5 seconds
setTimeout(() => controller.abort(), 5000);

try {
    const response = await fetch(url, { signal: controller.signal });
    const data = await response.json();
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Request timed out');
    }
}
```

**Better pattern with cleanup**:

```javascript
async function fetchWithTimeout(url, timeout = 5000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return await response.json();
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}
```

### 3. Abort Multiple Requests
Cancel several simultaneous requests with one controller.

**Use Case**: User searches, then types again (cancel previous search results).

```javascript
const controller = new AbortController();

// Start multiple requests with the same signal
const requests = [
    fetch('/api/users', { signal: controller.signal }),
    fetch('/api/posts', { signal: controller.signal }),
    fetch('/api/comments', { signal: controller.signal })
];

Promise.all(requests)
    .then(responses => Promise.all(responses.map(r => r.json())))
    .then(data => console.log(data))
    .catch(error => {
        if (error.name === 'AbortError') {
            console.log('All requests cancelled');
        }
    });

// Abort all requests at once
controller.abort();
```

### 4. Abort Event Listeners
Remove event listeners using AbortController instead of removeEventListener.

**Use Case**: Clean up listeners when component unmounts (React, Vue, etc.).

```javascript
const controller = new AbortController();
const { signal } = controller;

// Add multiple listeners with the same signal
button.addEventListener('click', handleClick, { signal });
input.addEventListener('input', handleInput, { signal });
window.addEventListener('resize', handleResize, { signal });

// Remove ALL listeners at once
controller.abort();
```

**Advantages**:
- No need to keep references to handler functions
- Clean up multiple listeners with one call
- Perfect for component lifecycle management

### 5. Abort Long-Running Operations
Cancel CPU-intensive or long async operations.

**Use Case**: User cancels a large file processing operation.

```javascript
async function processLargeFile(file, signal) {
    const chunks = splitIntoChunks(file);

    for (let i = 0; i < chunks.length; i++) {
        // Check if aborted
        if (signal.aborted) {
            throw new DOMException('Processing aborted', 'AbortError');
        }

        await processChunk(chunks[i]);

        // Yield to browser
        await new Promise(resolve => setTimeout(resolve, 0));
    }
}

const controller = new AbortController();
processLargeFile(file, controller.signal)
    .catch(error => {
        if (error.name === 'AbortError') {
            console.log('Processing cancelled');
        }
    });

// User clicks cancel
controller.abort();
```

### 6. Abort Chained Operations
Cancel a sequence of dependent async operations.

**Use Case**: Multi-step wizard, user goes back to previous step.

```javascript
const controller = new AbortController();
const { signal } = controller;

try {
    // Step 1
    const user = await fetch('/api/user', { signal }).then(r => r.json());

    // Step 2
    const profile = await fetch(`/api/profile/${user.id}`, { signal }).then(r => r.json());

    // Step 3
    const posts = await fetch(`/api/posts/${user.id}`, { signal }).then(r => r.json());

    console.log('All steps completed');

} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Chain aborted at some step');
    }
}

// Abort anywhere in the chain
controller.abort();
```

## Real-World Use Cases

### 1. Search with Debounce

```javascript
let searchController = null;

async function searchProducts(query) {
    // Cancel previous search
    if (searchController) {
        searchController.abort();
    }

    // Create new controller
    searchController = new AbortController();

    try {
        const response = await fetch(`/api/search?q=${query}`, {
            signal: searchController.signal
        });
        const results = await response.json();
        displayResults(results);
    } catch (error) {
        if (error.name !== 'AbortError') {
            console.error('Search failed:', error);
        }
    }
}

// User types "iphone"
searchInput.addEventListener('input', (e) => {
    searchProducts(e.target.value);
});
```

### 2. React Component Cleanup

```javascript
function UserProfile({ userId }) {
    useEffect(() => {
        const controller = new AbortController();

        fetch(`/api/users/${userId}`, {
            signal: controller.signal
        })
        .then(response => response.json())
        .then(data => setUser(data))
        .catch(error => {
            if (error.name !== 'AbortError') {
                setError(error);
            }
        });

        // Cleanup on unmount
        return () => controller.abort();
    }, [userId]);
}
```

### 3. Infinite Scroll

```javascript
let loadMoreController = null;

async function loadMoreItems() {
    // Cancel previous load
    if (loadMoreController) {
        loadMoreController.abort();
    }

    loadMoreController = new AbortController();

    try {
        const response = await fetch(`/api/items?page=${currentPage}`, {
            signal: loadMoreController.signal
        });
        const items = await response.json();
        appendItems(items);
        currentPage++;
    } catch (error) {
        if (error.name !== 'AbortError') {
            showError(error);
        }
    }
}
```

### 4. File Upload with Cancel

```javascript
async function uploadFile(file) {
    const controller = new AbortController();

    // Add cancel button handler
    cancelButton.onclick = () => controller.abort();

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
            signal: controller.signal
        });

        const result = await response.json();
        console.log('Upload complete:', result);

    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Upload cancelled');
        } else {
            console.error('Upload failed:', error);
        }
    }
}
```

### 5. Polling with Stop

```javascript
async function pollForUpdates(signal) {
    while (!signal.aborted) {
        try {
            const response = await fetch('/api/status', { signal });
            const data = await response.json();

            updateUI(data);

            // Wait 5 seconds before next poll
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(resolve, 5000);
                signal.addEventListener('abort', () => {
                    clearTimeout(timeout);
                    reject(new DOMException('Aborted', 'AbortError'));
                });
            });

        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Polling stopped');
                break;
            }
        }
    }
}

const controller = new AbortController();
pollForUpdates(controller.signal);

// Stop polling when user leaves page
window.addEventListener('beforeunload', () => controller.abort());
```

## Advanced Patterns

### Combining Multiple Signals

```javascript
function combineSignals(...signals) {
    const controller = new AbortController();

    for (const signal of signals) {
        if (signal.aborted) {
            controller.abort();
            break;
        }
        signal.addEventListener('abort', () => controller.abort());
    }

    return controller.signal;
}

// Usage
const userController = new AbortController();
const timeoutController = new AbortController();

setTimeout(() => timeoutController.abort(), 5000);

const combinedSignal = combineSignals(
    userController.signal,
    timeoutController.signal
);

fetch(url, { signal: combinedSignal });
```

### Abort with Reason

```javascript
const controller = new AbortController();

// Abort with custom reason (modern browsers)
controller.abort('User cancelled the operation');

// Check abort reason
signal.addEventListener('abort', () => {
    console.log('Aborted:', signal.reason);
});
```

### Creating Abortable Promises

```javascript
function delay(ms, signal) {
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(resolve, ms);

        signal?.addEventListener('abort', () => {
            clearTimeout(timeout);
            reject(new DOMException('Aborted', 'AbortError'));
        });
    });
}

// Usage
const controller = new AbortController();

delay(5000, controller.signal)
    .then(() => console.log('Done'))
    .catch(error => console.log(error.name)); // 'AbortError'

controller.abort();
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 66+     |
| Firefox | 57+     |
| Safari  | 12.1+   |
| Edge    | 16+     |

## Best Practices

### 1. Always Handle AbortError

```javascript
// ✓ Good
try {
    await fetch(url, { signal });
} catch (error) {
    if (error.name === 'AbortError') {
        // Handle abort separately
        return;
    }
    // Handle other errors
}

// ✗ Bad
try {
    await fetch(url, { signal });
} catch (error) {
    // Treating all errors the same
    showError(error);
}
```

### 2. Clean Up Timeouts

```javascript
// ✓ Good
const timeoutId = setTimeout(() => controller.abort(), 5000);
try {
    await fetch(url, { signal: controller.signal });
} finally {
    clearTimeout(timeoutId); // Always clear
}

// ✗ Bad
setTimeout(() => controller.abort(), 5000);
await fetch(url, { signal: controller.signal });
// Timeout keeps running
```

### 3. Check aborted Before Expensive Operations

```javascript
// ✓ Good
async function process(signal) {
    for (let item of items) {
        if (signal.aborted) {
            throw new DOMException('Aborted', 'AbortError');
        }
        await expensiveOperation(item);
    }
}

// ✗ Bad
async function process(signal) {
    // Only catches at fetch points
    for (let item of items) {
        await expensiveOperation(item);
    }
}
```

### 4. Don't Reuse Controllers

```javascript
// ✓ Good
function makeRequest() {
    const controller = new AbortController();
    return fetch(url, { signal: controller.signal });
}

// ✗ Bad
const controller = new AbortController();
function makeRequest() {
    // Can't abort individual requests
    return fetch(url, { signal: controller.signal });
}
```

### 5. Use Signal for Event Listeners

```javascript
// ✓ Good
const controller = new AbortController();
element.addEventListener('click', handler, { signal: controller.signal });
controller.abort(); // Clean

// ✗ Bad
element.addEventListener('click', handler);
element.removeEventListener('click', handler); // Need to keep handler reference
```

## Common Pitfalls

### 1. Forgetting to Pass Signal

```javascript
// ✗ Forgot to pass signal
const controller = new AbortController();
fetch(url); // Can't be aborted!
controller.abort(); // Does nothing
```

### 2. Not Checking for AbortError

```javascript
// ✗ Will show error to user when aborted
fetch(url, { signal })
    .catch(error => showErrorToUser(error));
```

### 3. Aborting After Request Completes

```javascript
// ✗ Unnecessary abort
const response = await fetch(url, { signal });
controller.abort(); // Request already done
```

## Testing

### Test AbortController in Jest

```javascript
test('should abort fetch request', async () => {
    const controller = new AbortController();

    const fetchPromise = fetch('https://example.com', {
        signal: controller.signal
    });

    controller.abort();

    await expect(fetchPromise).rejects.toThrow('AbortError');
});
```

## Resources

- [MDN AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [MDN AbortSignal](https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal)
- [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)

## Files

- **index.html** - Interactive demos page
- **style.css** - Styling for all demos
- **script.js** - All 6 demo implementations
- **README.md** - This documentation

## Running the Examples

Open `index.html` in a browser (requires internet for API calls). All demos are fully interactive and demonstrate real-world scenarios.

## License

Free to use for learning and projects.

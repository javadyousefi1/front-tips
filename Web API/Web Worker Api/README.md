# Web Worker API

A practical demonstration of Web Workers that shows how to run CPU-intensive tasks in the background without blocking the user interface.

## What are Web Workers?

Web Workers allow you to run JavaScript in background threads, separate from the main execution thread. This prevents long-running scripts from blocking the UI and keeps your application responsive.

## Features Demonstrated

- Creating and terminating Web Workers
- Message passing between main thread and worker
- Progress updates from background tasks
- Comparing performance: with vs without Web Workers
- Real-time UI responsiveness testing

## Files

- **index.html** - Main page with UI controls and demo
- **style.css** - Styling for the demo interface
- **script.js** - Main thread code that creates and communicates with the worker
- **worker.js** - Web Worker code that performs calculations

## How It Works

### 1. Creating a Worker

```javascript
// Main thread (script.js)
const worker = new Worker('worker.js');
```

### 2. Sending Messages to Worker

```javascript
// Send data to worker
worker.postMessage({ range: 100000 });
```

### 3. Receiving Messages from Worker

```javascript
// Listen for messages from worker
worker.onmessage = function(e) {
    const { type, data } = e.data;
    // Handle different message types
};
```

### 4. Worker Code

```javascript
// Worker thread (worker.js)
self.onmessage = function(e) {
    const { range } = e.data;
    // Perform calculations

    // Send results back
    self.postMessage({
        type: 'complete',
        data: { primes }
    });
};
```

### 5. Terminating a Worker

```javascript
// Stop the worker when done
worker.terminate();
```

## Demo: Prime Number Calculator

This demo calculates prime numbers up to a specified range. You can run the calculation:

- **With Web Worker**: Calculation runs in background, UI stays responsive
- **Without Web Worker**: Calculation blocks main thread, UI freezes

### Try It

1. Open `index.html` in a browser
2. Enter a number (try 100,000 or higher)
3. Click "Start with Worker" and try interacting with the slider
4. Notice the UI remains responsive!
5. Now try "Start without Worker" and see the difference
6. The UI will freeze until calculation completes

## Key Concepts

### Worker Scope

Workers run in a separate global context and **cannot access**:
- The DOM (no `document` or `window`)
- Parent page variables
- Some browser APIs

Workers **can use**:
- `setTimeout` / `setInterval`
- `fetch` for HTTP requests
- `IndexedDB` for storage
- `importScripts()` to load external scripts
- Math and other built-in JavaScript objects

### Message Types

This demo uses structured messages with types:

```javascript
// Progress update
{ type: 'progress', data: { progress: 50, checked: 50000 } }

// Completion
{ type: 'complete', data: { primes: [...], time: 2.5 } }

// Error
{ type: 'error', data: { message: 'Error details' } }
```

### Error Handling

```javascript
worker.onerror = function(error) {
    console.error('Worker error:', error.message);
};
```

## Use Cases

Web Workers are ideal for:

- Heavy computations (mathematical calculations, data processing)
- Image/video processing
- Large dataset filtering and sorting
- Cryptographic operations
- Background data fetching and caching
- Syntax highlighting and code parsing
- Game physics calculations

## Browser Support

Web Workers are supported in all modern browsers:
- Chrome 4+
- Firefox 3.5+
- Safari 4+
- Edge (all versions)
- Opera 10.6+

## Performance Tips

1. **Don't overuse workers** - Creating workers has overhead. Don't create a worker for trivial tasks.

2. **Reuse workers** - Instead of creating new workers repeatedly, keep a worker alive and send it multiple tasks.

3. **Transfer data efficiently** - For large data, use `Transferable Objects` to transfer ownership instead of copying:

```javascript
// Transfer ArrayBuffer ownership (zero-copy)
worker.postMessage({ buffer }, [buffer]);
```

4. **Worker pools** - For multiple tasks, create a pool of workers to distribute work:

```javascript
const workerPool = [
    new Worker('worker.js'),
    new Worker('worker.js'),
    new Worker('worker.js')
];
```

## Limitations

- **No DOM access** - Workers can't manipulate the page directly
- **Same-origin policy** - Worker scripts must be from the same origin
- **File protocol** - Some browsers restrict workers when using `file://` protocol. Use a local server instead.
- **Memory overhead** - Each worker creates a new thread with its own memory

## Testing Locally

To test this example:

```bash
# Simple HTTP server (Python 3)
python -m http.server 8000

# Or with Node.js
npx http-server

# Or with PHP
php -S localhost:8000
```

Then open `http://localhost:8000` in your browser.

## Advanced Topics

### Shared Workers

Multiple pages can share a single worker:

```javascript
const sharedWorker = new SharedWorker('shared-worker.js');
sharedWorker.port.postMessage('Hello');
```

### Service Workers

Special type of worker for offline functionality and caching (see separate Service Worker example).

### Worklets

Lightweight workers for specific tasks:
- **Paint Worklet** - Custom CSS painting
- **Animation Worklet** - Smooth animations
- **Audio Worklet** - Audio processing

## Resources

- [MDN Web Workers API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API)
- [HTML Living Standard - Workers](https://html.spec.whatwg.org/multipage/workers.html)
- [Using Web Workers (MDN Guide)](https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API/Using_web_workers)

## License

Free to use for learning and projects.

# 🎯 Prioritized Task Scheduling API - Complete Guide

## 📚 Table of Contents
- [Introduction](#introduction)
- [What Problem Does It Solve?](#what-problem-does-it-solve)
- [How It Works](#how-it-works)
- [Priority Levels](#priority-levels)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Real-World Use Cases](#real-world-use-cases)
- [Browser Support](#browser-support)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)

---

## 🌟 Introduction

The **Prioritized Task Scheduling API** (`scheduler.postTask()`) is a modern web API that allows developers to schedule JavaScript tasks with different priority levels. This ensures that critical tasks (like user interactions) execute before less important tasks (like analytics).

### Why Is This Important?

Modern web applications often need to handle multiple tasks simultaneously:
- Responding to user clicks
- Fetching data from APIs
- Processing analytics
- Rendering UI updates
- Background computations

Without prioritization, all these tasks compete equally for CPU time, which can make your app feel sluggish. The Prioritized Task Scheduling API solves this by letting you **tell the browser which tasks matter most**.

---

## ❓ What Problem Does It Solve?

### The Problem

Consider this scenario without prioritization:

```javascript
// All these run at the same priority!
setTimeout(() => trackAnalytics(), 0);      // Not urgent
setTimeout(() => updateUserProfile(), 0);   // Critical!
setTimeout(() => prefetchData(), 0);        // Can wait
setTimeout(() => handleButtonClick(), 0);   // Very urgent!
```

The browser doesn't know which task is more important, so they might execute in the wrong order, causing:
- UI freezes
- Delayed user interactions
- Poor user experience

### The Solution

With the Prioritized Task Scheduling API:

```javascript
// Critical user interaction - runs FIRST
scheduler.postTask(() => handleButtonClick(), {
    priority: 'user-blocking'
});

// Important UI update - runs SECOND
scheduler.postTask(() => updateUserProfile(), {
    priority: 'user-visible'
});

// Non-critical tasks - run LAST
scheduler.postTask(() => trackAnalytics(), {
    priority: 'background'
});
scheduler.postTask(() => prefetchData(), {
    priority: 'background'
});
```

Now the browser knows the order of importance and can schedule tasks intelligently!

---

## ⚙️ How It Works

The API provides a global `scheduler` object with the `postTask()` method:

```javascript
scheduler.postTask(callback, options)
```

**Parameters:**
- `callback`: Function to execute
- `options`: Configuration object
  - `priority`: Task priority level (`'user-blocking'`, `'user-visible'`, `'background'`)
  - `signal`: AbortSignal for task cancellation
  - `delay`: Minimum delay before execution (in milliseconds)

**Returns:** A Promise that resolves with the callback's return value

---

## 🎚️ Priority Levels

### 1. `user-blocking` (Highest Priority) 🔴

**When to use:** Tasks that MUST complete immediately to prevent blocking user interaction

**Examples:**
- Responding to button clicks
- Keyboard input handling
- Touch/mouse event responses
- Critical UI updates that users expect instantly

```javascript
scheduler.postTask(() => {
    button.textContent = 'Clicked!';
}, { priority: 'user-blocking' });
```

**Characteristics:**
- Executes as soon as possible
- Can delay other work
- Use sparingly - only for truly critical tasks

---

### 2. `user-visible` (Default Priority) 🟡

**When to use:** Tasks that affect what users see, but aren't immediately blocking

**Examples:**
- Fetching and displaying API data
- Rendering non-critical UI components
- Image loading and display
- Form validation feedback

```javascript
scheduler.postTask(async () => {
    const data = await fetch('/api/user');
    displayUserData(data);
}, { priority: 'user-visible' });
```

**Characteristics:**
- Default priority (if not specified)
- Balanced between responsiveness and throughput
- Good for most user-facing tasks

---

### 3. `background` (Lowest Priority) 🟢

**When to use:** Tasks that don't affect immediate user experience

**Examples:**
- Analytics tracking
- Logging
- Cache warming
- Prefetching data for future use
- Background synchronization

```javascript
scheduler.postTask(() => {
    analytics.track('page_view', { page: '/home' });
}, { priority: 'background' });
```

**Characteristics:**
- Executes when main thread is idle
- Won't block critical or visible tasks
- Perfect for "nice to have" operations

---

## 🚀 Basic Usage

### Example 1: Simple Task Scheduling

```javascript
// Schedule a background task
const result = await scheduler.postTask(() => {
    console.log('This runs in the background');
    return 42;
}, { priority: 'background' });

console.log(result); // 42
```

### Example 2: Multiple Priorities

```javascript
// These will execute in priority order, regardless of when scheduled

scheduler.postTask(() => {
    console.log('3. Background task');
}, { priority: 'background' });

scheduler.postTask(() => {
    console.log('1. User-blocking task');
}, { priority: 'user-blocking' });

scheduler.postTask(() => {
    console.log('2. User-visible task');
}, { priority: 'user-visible' });

// Output:
// 1. User-blocking task
// 2. User-visible task
// 3. Background task
```

### Example 3: Async Tasks

```javascript
const data = await scheduler.postTask(async () => {
    const response = await fetch('/api/data');
    return response.json();
}, { priority: 'user-visible' });

console.log(data);
```

---

## 🔥 Advanced Features

### 1. Task Abortion with TaskController

Cancel tasks that are no longer needed:

```javascript
const controller = new TaskController();

const taskPromise = scheduler.postTask(() => {
    // Long-running task
    for (let i = 0; i < 1000000; i++) {
        if (controller.signal.aborted) {
            throw new DOMException('Task aborted', 'AbortError');
        }
        // Do work...
    }
}, { signal: controller.signal });

// Abort the task
controller.abort();

try {
    await taskPromise;
} catch (error) {
    if (error.name === 'AbortError') {
        console.log('Task was cancelled');
    }
}
```

### 2. Dynamic Priority Changes

Change task priority while it's queued:

```javascript
const controller = new TaskController({ priority: 'background' });

scheduler.postTask(() => {
    console.log('Task executing');
}, { signal: controller.signal });

// User interaction makes this task more urgent
controller.setPriority('user-blocking');
```

### 3. Task Delays

Schedule tasks to run after a minimum delay:

```javascript
scheduler.postTask(() => {
    console.log('Runs after at least 1 second');
}, {
    priority: 'background',
    delay: 1000
});
```

### 4. Yielding to Main Thread

Break up long tasks to keep UI responsive:

```javascript
async function processLargeDataset(items) {
    for (let i = 0; i < items.length; i++) {
        processItem(items[i]);

        // Yield every 100 items to prevent blocking
        if (i % 100 === 0) {
            await scheduler.yield();
        }
    }
}
```

---

## 💼 Real-World Use Cases

### Use Case 1: Optimizing Page Load

```javascript
async function optimizedPageLoad() {
    // 1. CRITICAL: Render above-the-fold content
    await scheduler.postTask(() => {
        renderHeader();
        renderMainContent();
    }, { priority: 'user-blocking' });

    // 2. IMPORTANT: Load visible images and data
    scheduler.postTask(async () => {
        await loadImages();
        await fetchUserData();
    }, { priority: 'user-visible' });

    // 3. BACKGROUND: Non-critical tasks
    scheduler.postTask(() => {
        initializeAnalytics();
        prefetchNextPage();
        warmupCache();
    }, { priority: 'background' });
}
```

### Use Case 2: Search with Autocomplete

```javascript
let searchController = null;

async function handleSearchInput(query) {
    // Cancel previous search
    if (searchController) {
        searchController.abort();
    }

    searchController = new TaskController();

    // High priority: Update UI immediately
    scheduler.postTask(() => {
        showLoadingSpinner();
    }, { priority: 'user-blocking' });

    // Medium priority: Fetch results
    try {
        const results = await scheduler.postTask(async () => {
            const response = await fetch(`/api/search?q=${query}`);
            return response.json();
        }, {
            priority: 'user-visible',
            signal: searchController.signal
        });

        displayResults(results);
    } catch (error) {
        if (error.name === 'AbortError') {
            console.log('Search cancelled');
        }
    }

    // Low priority: Track search
    scheduler.postTask(() => {
        analytics.track('search', { query });
    }, { priority: 'background' });
}
```

### Use Case 3: Image Processing

```javascript
async function processImages(images) {
    const results = [];

    for (let i = 0; i < images.length; i++) {
        const result = await scheduler.postTask(() => {
            return applyFilters(images[i]);
        }, { priority: 'background' });

        results.push(result);

        // Update progress (higher priority)
        await scheduler.postTask(() => {
            updateProgressBar((i + 1) / images.length * 100);
        }, { priority: 'user-visible' });
    }

    return results;
}
```

### Use Case 4: Gaming - Frame-by-Frame Rendering

```javascript
class Game {
    async gameLoop() {
        while (this.running) {
            // Critical: Render frame
            await scheduler.postTask(() => {
                this.render();
            }, { priority: 'user-blocking' });

            // Important: Update game state
            await scheduler.postTask(() => {
                this.update();
            }, { priority: 'user-visible' });

            // Background: Save game state
            scheduler.postTask(() => {
                this.saveState();
            }, { priority: 'background' });

            // Wait for next frame
            await scheduler.yield();
        }
    }
}
```

---

## 🌐 Browser Support

### Current Support (as of 2025)

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 94+ | ✅ Full |
| Edge | 94+ | ✅ Full |
| Opera | 80+ | ✅ Full |
| Safari | ❌ | Not yet |
| Firefox | ❌ | Not yet |

### Feature Detection

Always check for support before using:

```javascript
if ('scheduler' in window && 'postTask' in scheduler) {
    // Use the API
    scheduler.postTask(() => {
        console.log('Supported!');
    }, { priority: 'background' });
} else {
    // Fallback
    setTimeout(() => {
        console.log('Using fallback');
    }, 0);
}
```

### Polyfill

A simple polyfill for demonstration:

```javascript
if (!('scheduler' in window)) {
    window.scheduler = {
        postTask(callback, options = {}) {
            return new Promise((resolve) => {
                const delay = options.priority === 'user-blocking' ? 0 :
                             options.priority === 'user-visible' ? 10 : 100;
                setTimeout(() => resolve(callback()), delay);
            });
        }
    };
}
```

---

## ✅ Best Practices

### 1. Use Appropriate Priorities

**❌ Bad:**
```javascript
// Everything is user-blocking!
scheduler.postTask(trackAnalytics, { priority: 'user-blocking' });
scheduler.postTask(prefetchData, { priority: 'user-blocking' });
```

**✅ Good:**
```javascript
// Appropriate priorities
scheduler.postTask(trackAnalytics, { priority: 'background' });
scheduler.postTask(prefetchData, { priority: 'background' });
scheduler.postTask(handleClick, { priority: 'user-blocking' });
```

### 2. Batch Background Tasks

**❌ Bad:**
```javascript
// Too many individual tasks
items.forEach(item => {
    scheduler.postTask(() => process(item), { priority: 'background' });
});
```

**✅ Good:**
```javascript
// Batch processing
scheduler.postTask(() => {
    items.forEach(item => process(item));
}, { priority: 'background' });
```

### 3. Cancel Obsolete Tasks

**❌ Bad:**
```javascript
// Old searches keep running
function search(query) {
    scheduler.postTask(() => performSearch(query));
}
```

**✅ Good:**
```javascript
// Cancel previous searches
let controller = null;
function search(query) {
    if (controller) controller.abort();
    controller = new TaskController();
    scheduler.postTask(() => performSearch(query), {
        signal: controller.signal
    });
}
```

### 4. Don't Overuse user-blocking

**❌ Bad:**
```javascript
// Too many critical tasks
scheduler.postTask(updateUI, { priority: 'user-blocking' });
scheduler.postTask(fetchData, { priority: 'user-blocking' });
scheduler.postTask(processData, { priority: 'user-blocking' });
```

**✅ Good:**
```javascript
// Only truly critical tasks
scheduler.postTask(updateUI, { priority: 'user-blocking' });
scheduler.postTask(fetchData, { priority: 'user-visible' });
scheduler.postTask(processData, { priority: 'background' });
```

### 5. Combine with Other APIs

```javascript
// Combine with requestIdleCallback for better performance
if (navigator.scheduling?.isInputPending()) {
    // Input pending, yield to process it
    await scheduler.yield();
} else {
    // No input, continue with background work
    doBackgroundWork();
}
```

---

## ⚠️ Common Pitfalls

### 1. Making Everything High Priority

**Problem:** If everything is urgent, nothing is urgent.

**Solution:** Reserve `user-blocking` for truly critical tasks (user interactions). Most tasks should be `user-visible` or `background`.

### 2. Forgetting to Await

**Problem:**
```javascript
scheduler.postTask(() => fetchData());
console.log(data); // undefined!
```

**Solution:**
```javascript
const data = await scheduler.postTask(() => fetchData());
console.log(data); // Correct!
```

### 3. Not Handling Abortion

**Problem:**
```javascript
controller.abort();
await taskPromise; // Unhandled rejection!
```

**Solution:**
```javascript
try {
    await taskPromise;
} catch (error) {
    if (error.name === 'AbortError') {
        // Handle cancellation
    }
}
```

### 4. Blocking in Background Tasks

**Problem:**
```javascript
scheduler.postTask(() => {
    // This still blocks!
    for (let i = 0; i < 999999999; i++) {}
}, { priority: 'background' });
```

**Solution:**
```javascript
// Yield periodically
scheduler.postTask(async () => {
    for (let i = 0; i < 999999999; i++) {
        if (i % 1000 === 0) await scheduler.yield();
    }
}, { priority: 'background' });
```

---

## 📖 Quick Reference

### Syntax
```javascript
const result = await scheduler.postTask(callback, {
    priority: 'user-blocking' | 'user-visible' | 'background',
    signal: abortSignal,
    delay: milliseconds
});
```

### Priority Selection Guide

| Task Type | Priority | Example |
|-----------|----------|---------|
| Critical UI updates | `user-blocking` | Button clicks, input |
| Data fetching | `user-visible` | API calls, rendering |
| Analytics | `background` | Tracking, logging |
| Prefetching | `background` | Cache warming |
| Heavy computation | `background` | Data processing |

---

## 🎓 Learning Path

1. **Start Simple:** Run the Basic Demo (Demo 1)
2. **Understand Priorities:** Experiment with different priority levels
3. **Learn UI Optimization:** Try the UI Updates Demo (Demo 2)
4. **Practice with Data:** Run the Data Processing Demo (Demo 3)
5. **Master Control:** Learn task abortion (Demo 4)
6. **Real-World Application:** Study the Real-World Demo (Demo 5)
7. **Compare Approaches:** Run the Comparison Demo (Demo 6)

---

## 🔗 Additional Resources

- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Scheduler)
- [Web.dev Article](https://web.dev/priority-hints/)
- [Chrome Platform Status](https://chromestatus.com/feature/6031161734201344)
- [WICG Specification](https://wicg.github.io/scheduling-apis/)

---

## 📝 Summary

The **Prioritized Task Scheduling API** is a powerful tool for building responsive web applications. Key takeaways:

✅ Use `user-blocking` for critical user interactions
✅ Use `user-visible` for important but not urgent tasks
✅ Use `background` for non-critical operations
✅ Cancel obsolete tasks with TaskController
✅ Always feature-detect before using
✅ Don't make everything high priority

**Remember:** Good task prioritization = Better user experience! 🚀

---

**Happy Coding!** 🎯

# 👁️ Intersection Observer API - Complete Guide

## 📚 Table of Contents
- [Introduction](#introduction)
- [What Problem Does It Solve?](#what-problem-does-it-solve)
- [How It Works](#how-it-works)
- [Core Concepts](#core-concepts)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Real-World Use Cases](#real-world-use-cases)
- [Browser Support](#browser-support)
- [Best Practices](#best-practices)
- [Common Pitfalls](#common-pitfalls)

---

## 🌟 Introduction

The **Intersection Observer API** is a powerful web API that allows you to asynchronously observe changes in the intersection of a target element with an ancestor element or the viewport. In simpler terms, it tells you when an element enters or leaves the visible area of the screen.

### Why Is This Important?

Traditional methods of detecting element visibility (like scroll event listeners) are:
- **Performance killers** - They run on every scroll event
- **Janky** - Can cause stuttering and poor user experience
- **Complex** - Require manual calculations with `getBoundingClientRect()`
- **Battery draining** - Constantly checking positions wastes resources

The Intersection Observer API solves all these problems by providing a **performant, efficient, and easy-to-use** way to observe element visibility.

---

## ❓ What Problem Does It Solve?

### The Old Way (Bad)

```javascript
// DON'T DO THIS - Performance nightmare!
window.addEventListener('scroll', () => {
    const element = document.querySelector('.image');
    const rect = element.getBoundingClientRect();
    const isVisible = rect.top >= 0 && rect.bottom <= window.innerHeight;

    if (isVisible) {
        loadImage(element);
    }
});
```

**Problems:**
- Runs on EVERY scroll event (hundreds of times per second)
- Forces layout recalculation with `getBoundingClientRect()`
- Blocks the main thread
- Drains battery on mobile devices

### The New Way (Good)

```javascript
// Modern, performant approach
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadImage(entry.target);
        }
    });
});

observer.observe(document.querySelector('.image'));
```

**Benefits:**
- Runs asynchronously (doesn't block main thread)
- Only fires when visibility actually changes
- Optimized by the browser
- Battery efficient

---

## ⚙️ How It Works

The Intersection Observer API works by observing when a **target element** intersects with:
- The viewport (browser window)
- A parent scrollable container
- A specific ancestor element

When the intersection changes, a **callback function** is triggered with detailed information about the intersection.

### Visual Explanation

```
┌─────────────────────────────────────┐
│         Viewport (Root)             │
│                                     │
│    ┌─────────────────┐             │
│    │                 │             │
│    │  Target Element │  ← Visible  │
│    │                 │             │
│    └─────────────────┘             │
│                                     │
└─────────────────────────────────────┘

When target enters or exits the viewport,
the callback is triggered!
```

---

## 🎯 Core Concepts

### 1. Target Element
The element you want to observe (e.g., an image, div, section).

### 2. Root Element
The element used as the viewport for checking visibility:
- Default: Browser viewport
- Custom: Any scrollable ancestor element

### 3. Root Margin
Grows or shrinks the root's bounding box before computing intersections.

```javascript
// Trigger 50px before element enters viewport
rootMargin: '50px'

// Different margins for each side (top, right, bottom, left)
rootMargin: '10px 20px 30px 40px'
```

### 4. Threshold
Defines at what percentage of visibility the callback should trigger.

```javascript
threshold: 0      // Trigger as soon as 1px is visible
threshold: 0.5    // Trigger when 50% is visible
threshold: 1.0    // Trigger when 100% is visible
threshold: [0, 0.25, 0.5, 0.75, 1]  // Multiple thresholds
```

### 5. Intersection Ratio
The percentage of the target element that's visible (0.0 to 1.0).

---

## 🚀 Basic Usage

### Example 1: Simple Visibility Detection

```javascript
// Create observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            console.log('Element is visible!');
            entry.target.classList.add('visible');
        } else {
            console.log('Element is hidden!');
            entry.target.classList.remove('visible');
        }
    });
});

// Observe an element
const element = document.querySelector('.box');
observer.observe(element);
```

### Example 2: Lazy Loading Images

```javascript
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;  // Load actual image
            img.classList.add('loaded');
            imageObserver.unobserve(img);  // Stop observing after load
        }
    });
});

// Observe all images with data-src
document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
});
```

### Example 3: Infinite Scroll

```javascript
const loadMoreObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            loadMoreContent();
        }
    });
}, {
    rootMargin: '100px'  // Trigger 100px before reaching bottom
});

const loadMoreTrigger = document.querySelector('.load-more-trigger');
loadMoreObserver.observe(loadMoreTrigger);
```

---

## 🔥 Advanced Features

### 1. Custom Root Element

Observe intersections within a scrollable container:

```javascript
const scrollContainer = document.querySelector('.scroll-container');

const observer = new IntersectionObserver((entries) => {
    // Handle intersections
}, {
    root: scrollContainer,  // Use custom container instead of viewport
    threshold: 0.5
});
```

### 2. Multiple Thresholds

Get notified at multiple visibility levels:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        console.log(`Visibility: ${entry.intersectionRatio * 100}%`);

        if (entry.intersectionRatio >= 0.75) {
            entry.target.classList.add('mostly-visible');
        }
    });
}, {
    threshold: [0, 0.25, 0.5, 0.75, 1.0]
});
```

### 3. Root Margin for Early Loading

Load content before it becomes visible:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            preloadContent(entry.target);
        }
    });
}, {
    rootMargin: '200px 0px'  // Trigger 200px before entering viewport
});
```

### 4. Observing Multiple Elements

```javascript
const observer = new IntersectionObserver(callback);

// Observe multiple elements
document.querySelectorAll('.observe-me').forEach(element => {
    observer.observe(element);
});
```

### 5. Stopping Observation

```javascript
// Stop observing a specific element
observer.unobserve(element);

// Stop observing all elements
observer.disconnect();
```

---

## 💼 Real-World Use Cases

### Use Case 1: Lazy Loading Images

**Problem:** Loading all images at once slows down page load.

**Solution:**
```javascript
const lazyImageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.onload = () => img.classList.add('loaded');
            lazyImageObserver.unobserve(img);
        }
    });
}, {
    rootMargin: '50px'  // Load slightly before visible
});

document.querySelectorAll('img[data-src]').forEach(img => {
    lazyImageObserver.observe(img);
});
```

**HTML:**
```html
<img data-src="high-res-image.jpg" src="placeholder.jpg" alt="Lazy loaded">
```

---

### Use Case 2: Scroll-Based Animations

**Problem:** Want elements to animate when they enter the viewport.

**Solution:**
```javascript
const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            animationObserver.unobserve(entry.target);  // Animate only once
        }
    });
}, {
    threshold: 0.2  // Trigger when 20% visible
});

document.querySelectorAll('.animate-on-scroll').forEach(element => {
    animationObserver.observe(element);
});
```

**CSS:**
```css
.animate-on-scroll {
    opacity: 0;
    transform: translateY(50px);
    transition: opacity 0.6s, transform 0.6s;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}
```

---

### Use Case 3: Infinite Scroll

**Problem:** Loading all content at once is inefficient.

**Solution:**
```javascript
let page = 1;
let isLoading = false;

const infiniteScrollObserver = new IntersectionObserver((entries) => {
    const sentinel = entries[0];

    if (sentinel.isIntersecting && !isLoading) {
        isLoading = true;
        loadMoreItems(page)
            .then(items => {
                appendItems(items);
                page++;
                isLoading = false;
            });
    }
}, {
    rootMargin: '100px'  // Load before user reaches bottom
});

// Observe a sentinel element at the bottom
const sentinel = document.querySelector('.scroll-sentinel');
infiniteScrollObserver.observe(sentinel);
```

---

### Use Case 4: View Tracking / Analytics

**Problem:** Track which sections users actually view.

**Solution:**
```javascript
const viewTracker = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const sectionId = entry.target.id;

            // Track that user viewed this section
            analytics.track('section_viewed', {
                section: sectionId,
                timestamp: Date.now()
            });

            viewTracker.unobserve(entry.target);  // Track only once
        }
    });
}, {
    threshold: 0.5  // Consider viewed when 50% visible
});

document.querySelectorAll('section').forEach(section => {
    viewTracker.observe(section);
});
```

---

### Use Case 5: Video Auto-Play

**Problem:** Play videos only when visible, pause when not.

**Solution:**
```javascript
const videoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const video = entry.target;

        if (entry.isIntersecting) {
            video.play();
        } else {
            video.pause();
        }
    });
}, {
    threshold: 0.5  // Play when 50% visible
});

document.querySelectorAll('video').forEach(video => {
    videoObserver.observe(video);
});
```

---

### Use Case 6: Sticky Header Detection

**Problem:** Know when a sticky header is "stuck" to apply different styles.

**Solution:**
```javascript
const header = document.querySelector('.header');
const sentinel = document.createElement('div');
sentinel.style.height = '1px';
header.parentElement.insertBefore(sentinel, header);

const stickyObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle('stuck', !entry.isIntersecting);
}, {
    threshold: 1
});

stickyObserver.observe(sentinel);
```

---

## 🌐 Browser Support

### Current Support (as of 2025)

| Browser | Version | Support |
|---------|---------|---------|
| Chrome | 51+ | ✅ Full |
| Edge | 15+ | ✅ Full |
| Firefox | 55+ | ✅ Full |
| Safari | 12.1+ | ✅ Full |
| Opera | 38+ | ✅ Full |

**Support:** ~97% of all users globally

### Feature Detection

Always check for support:

```javascript
if ('IntersectionObserver' in window) {
    // Use Intersection Observer
    const observer = new IntersectionObserver(callback);
    observer.observe(element);
} else {
    // Fallback for old browsers
    element.classList.add('visible');  // Show immediately
}
```

### Polyfill

For older browsers, use the official polyfill:

```html
<script src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver"></script>
```

---

## ✅ Best Practices

### 1. Unobserve After One-Time Events

**❌ Bad:**
```javascript
// Keeps observing even after loading
observer.observe(img);
```

**✅ Good:**
```javascript
// Stop observing after loading
if (entry.isIntersecting) {
    loadImage(entry.target);
    observer.unobserve(entry.target);  // Clean up
}
```

---

### 2. Use Root Margin for Preloading

**❌ Bad:**
```javascript
// Loads only when visible (user sees loading)
const observer = new IntersectionObserver(callback);
```

**✅ Good:**
```javascript
// Preloads before visible (seamless experience)
const observer = new IntersectionObserver(callback, {
    rootMargin: '200px'
});
```

---

### 3. Choose Appropriate Thresholds

**❌ Bad:**
```javascript
// Too sensitive - fires too often
threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
```

**✅ Good:**
```javascript
// Meaningful thresholds
threshold: [0, 0.5, 1]  // Entering, halfway, fully visible
```

---

### 4. Reuse Observers

**❌ Bad:**
```javascript
// Creates multiple observers for the same task
images.forEach(img => {
    const observer = new IntersectionObserver(callback);
    observer.observe(img);
});
```

**✅ Good:**
```javascript
// One observer for all similar elements
const observer = new IntersectionObserver(callback);
images.forEach(img => observer.observe(img));
```

---

### 5. Clean Up Observers

```javascript
// When component unmounts or page changes
observer.disconnect();  // Stop all observations
```

---

### 6. Handle Rapid Visibility Changes

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // Check if still intersecting (prevents race conditions)
        if (entry.isIntersecting && entry.intersectionRatio > 0) {
            loadContent(entry.target);
        }
    });
});
```

---

## ⚠️ Common Pitfalls

### 1. Forgetting to Unobserve

**Problem:** Memory leaks from observing too many elements.

**Solution:**
```javascript
if (entry.isIntersecting) {
    doOnce(entry.target);
    observer.unobserve(entry.target);  // Always clean up!
}
```

---

### 2. Not Checking isIntersecting

**Problem:** Callback fires both when entering AND leaving.

```javascript
// BAD - Fires when leaving viewport too!
observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        loadImage(entry.target);  // Might load when leaving!
    });
});
```

**Solution:**
```javascript
// GOOD - Only when entering
observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {  // Check this!
            loadImage(entry.target);
        }
    });
});
```

---

### 3. Wrong Root Element

**Problem:** Observing with wrong container.

```javascript
// BAD - Won't work if element is in scrollable container
const observer = new IntersectionObserver(callback);  // Uses viewport
```

**Solution:**
```javascript
// GOOD - Specify the correct scrollable container
const observer = new IntersectionObserver(callback, {
    root: document.querySelector('.scroll-container')
});
```

---

### 4. Not Handling Disconnection

**Problem:** Observer keeps running after component unmounts.

```javascript
// In React/Vue/Angular
useEffect(() => {
    const observer = new IntersectionObserver(callback);
    observer.observe(element);

    // MUST return cleanup function
    return () => observer.disconnect();
}, []);
```

---

### 5. Performance Issues with Too Many Thresholds

**Problem:**
```javascript
// BAD - Callback fires 100 times per element!
threshold: Array.from({ length: 100 }, (_, i) => i / 100)
```

**Solution:**
```javascript
// GOOD - Only necessary thresholds
threshold: [0, 0.25, 0.5, 0.75, 1]
```

---

## 📖 Quick Reference

### Syntax

```javascript
const observer = new IntersectionObserver(callback, options);

// Callback signature
function callback(entries, observer) {
    entries.forEach(entry => {
        // entry.target - The observed element
        // entry.isIntersecting - Boolean: is element visible?
        // entry.intersectionRatio - Number: how much is visible (0-1)
        // entry.boundingClientRect - Element's bounding rectangle
        // entry.intersectionRect - Intersection rectangle
        // entry.rootBounds - Root element's bounding rectangle
        // entry.time - Timestamp when intersection occurred
    });
}

// Options
const options = {
    root: null,              // Element to use as viewport (null = browser viewport)
    rootMargin: '0px',       // Margin around root
    threshold: 0             // 0-1, or array of values
};
```

### Methods

```javascript
observer.observe(element);        // Start observing
observer.unobserve(element);      // Stop observing specific element
observer.disconnect();            // Stop observing all elements
observer.takeRecords();           // Get all pending intersection records
```

---

## 🎓 Demo Examples

This repository includes 6 interactive demos:

1. **Basic Detection** - Simple visibility tracking
2. **Lazy Loading** - Load images on demand
3. **Scroll Animations** - Animate elements on scroll
4. **Infinite Scroll** - Load more content automatically
5. **Video Auto-Play** - Play/pause based on visibility
6. **Threshold Demo** - Understand intersection ratios

---

## 🔗 Additional Resources

- [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev Guide](https://web.dev/intersectionobserver/)
- [Can I Use](https://caniuse.com/intersectionobserver)
- [Polyfill](https://github.com/w3c/IntersectionObserver/tree/main/polyfill)

---

## 📝 Summary

The **Intersection Observer API** is essential for modern web development:

✅ **Performance** - No more scroll event listeners
✅ **Battery Efficient** - Runs only when needed
✅ **Easy to Use** - Simple, intuitive API
✅ **Versatile** - Lazy loading, animations, tracking, infinite scroll
✅ **Well Supported** - Works in all modern browsers

**Remember:** If you need to know when something enters or leaves the viewport, use Intersection Observer! 👁️

---

**Happy Observing!** 🚀

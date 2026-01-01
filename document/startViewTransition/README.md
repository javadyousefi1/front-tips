# View Transitions API (document.startViewTransition)

A comprehensive guide to the View Transitions API with 6 practical examples demonstrating how to create smooth, animated transitions between different states of your web application.

## What is the View Transitions API?

The **View Transitions API** provides a way to create smooth, animated transitions when updating the DOM. It allows you to animate changes between two states of your page automatically, without writing complex animation code.

## Key Concepts

### 1. Starting a Transition

The API provides a simple method to wrap your DOM updates.

```javascript
document.startViewTransition(() => {
    // Update the DOM here
    updateThePage();
});
```

### 2. How It Works

1. The browser captures the current state (old snapshot)
2. Your callback runs and updates the DOM
3. The browser captures the new state (new snapshot)
4. The browser automatically animates between the two states

### 3. View Transition Names

You can control which elements transition by giving them unique names.

```css
.hero-image {
    view-transition-name: hero;
}

.title {
    view-transition-name: title;
}
```

### 4. Customizing Animations

Control the animation with CSS.

```css
::view-transition-old(hero) {
    animation: fade-out 0.3s ease-out;
}

::view-transition-new(hero) {
    animation: fade-in 0.3s ease-in;
}
```

## Why Use View Transitions API?

### The Problem Without It

**Before View Transitions API**, creating smooth page transitions required:
- Complex JavaScript animation libraries
- Manual state management
- Careful coordination of timing
- FLIP animations (First, Last, Invert, Play)
- Heavy performance overhead

### The Solution With View Transitions API

```javascript
// Simple and automatic!
document.startViewTransition(() => {
    // Just update the DOM
    document.querySelector('.content').innerHTML = newContent;
});
// Browser handles all the animation magic!
```

**Benefits:**
- ✅ Simple API - just one function call
- ✅ Automatic animations - browser handles everything
- ✅ Smooth transitions - uses the FLIP technique internally
- ✅ CSS customizable - full control over animations
- ✅ Great performance - uses compositor when possible
- ✅ Accessible - respects prefers-reduced-motion

## Demos Included

### 1. Basic Fade Transition
Simple fade in/out when changing content.

**Use Case**: Smoothly swap content sections.

```javascript
function changeContent(newContent) {
    document.startViewTransition(() => {
        document.querySelector('.content').textContent = newContent;
    });
}
```

### 2. Image Gallery Transition
Smooth transitions between gallery images.

**Use Case**: Create beautiful image galleries with smooth transitions.

```javascript
const images = ['image1.jpg', 'image2.jpg', 'image3.jpg'];
let currentIndex = 0;

function nextImage() {
    document.startViewTransition(() => {
        currentIndex = (currentIndex + 1) % images.length;
        document.querySelector('.gallery-image').src = images[currentIndex];
    });
}
```

### 3. List Item Transitions
Animate items when adding or removing from a list.

**Use Case**: Todo lists, shopping carts, notification lists.

```javascript
function addItem(text) {
    document.startViewTransition(() => {
        const list = document.querySelector('.todo-list');
        const item = document.createElement('li');
        item.textContent = text;
        item.style.viewTransitionName = `item-${Date.now()}`;
        list.appendChild(item);
    });
}

function removeItem(element) {
    document.startViewTransition(() => {
        element.remove();
    });
}
```

### 4. Theme Switcher
Smooth dark/light mode transitions.

**Use Case**: Theme switching without jarring flashes.

```javascript
function toggleTheme() {
    document.startViewTransition(() => {
        const html = document.documentElement;
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', newTheme);
    });
}
```

### 5. Card Expand/Collapse
Expand cards to full view with smooth transitions.

**Use Case**: Product cards, blog post previews, media galleries.

```javascript
function expandCard(card) {
    document.startViewTransition(() => {
        // Remove expanded class from all cards
        document.querySelectorAll('.card.expanded').forEach(c => {
            c.classList.remove('expanded');
        });

        // Add expanded class to clicked card
        card.classList.add('expanded');
    });
}
```

### 6. Page Navigation
Create SPA-like navigation with smooth transitions.

**Use Case**: Multi-page feel in single-page apps.

```javascript
function navigateTo(page) {
    document.startViewTransition(() => {
        // Hide all pages
        document.querySelectorAll('.page').forEach(p => {
            p.classList.remove('active');
        });

        // Show target page
        document.querySelector(`#${page}`).classList.add('active');

        // Update URL
        history.pushState(null, '', `#${page}`);
    });
}
```

## Real-World Use Cases

### 1. E-commerce Product Viewer

```javascript
class ProductViewer {
    showProductDetails(productId) {
        document.startViewTransition(async () => {
            // Fetch product data
            const product = await fetchProduct(productId);

            // Update DOM
            document.querySelector('.product-grid').style.display = 'none';
            document.querySelector('.product-detail').style.display = 'block';
            document.querySelector('.product-detail').innerHTML = renderProduct(product);
        });
    }

    backToGrid() {
        document.startViewTransition(() => {
            document.querySelector('.product-detail').style.display = 'none';
            document.querySelector('.product-grid').style.display = 'grid';
        });
    }
}
```

**CSS for smooth product transitions:**

```css
.product-image {
    view-transition-name: product-image;
}

.product-title {
    view-transition-name: product-title;
}

::view-transition-old(product-image),
::view-transition-new(product-image) {
    animation-duration: 0.5s;
}
```

### 2. Article Reader

```javascript
function showArticle(articleId) {
    document.startViewTransition(async () => {
        const article = await fetchArticle(articleId);

        document.querySelector('.article-list').hidden = true;
        document.querySelector('.article-view').hidden = false;
        document.querySelector('.article-content').innerHTML = article.content;
    });
}

// CSS
.article-hero {
    view-transition-name: article-hero;
}

::view-transition-old(article-hero) {
    animation: slide-out-left 0.3s ease-out;
}

::view-transition-new(article-hero) {
    animation: slide-in-right 0.3s ease-in;
}
```

### 3. Dashboard Widget Expansion

```javascript
class Dashboard {
    expandWidget(widgetId) {
        const widget = document.querySelector(`#${widgetId}`);

        document.startViewTransition(() => {
            if (widget.classList.contains('expanded')) {
                widget.classList.remove('expanded');
            } else {
                // Collapse all other widgets
                document.querySelectorAll('.widget.expanded').forEach(w => {
                    w.classList.remove('expanded');
                });
                widget.classList.add('expanded');
            }
        });
    }
}

// CSS
.widget {
    view-transition-name: var(--widget-name);
}

.widget-1 { --widget-name: widget-1; }
.widget-2 { --widget-name: widget-2; }
```

### 4. Settings Panel

```javascript
function openSettings() {
    document.startViewTransition(() => {
        document.querySelector('.main-view').classList.add('settings-open');
        document.querySelector('.settings-panel').classList.add('active');
    });
}

function closeSettings() {
    document.startViewTransition(() => {
        document.querySelector('.main-view').classList.remove('settings-open');
        document.querySelector('.settings-panel').classList.remove('active');
    });
}

// CSS
.settings-panel {
    view-transition-name: settings;
}

::view-transition-old(settings) {
    animation: slide-out-right 0.3s ease;
}

::view-transition-new(settings) {
    animation: slide-in-right 0.3s ease;
}
```

### 5. Image Lightbox

```javascript
function openLightbox(imageSrc) {
    const lightbox = document.querySelector('.lightbox');
    const lightboxImage = lightbox.querySelector('img');

    document.startViewTransition(() => {
        lightboxImage.src = imageSrc;
        lightbox.classList.add('active');
    });
}

function closeLightbox() {
    document.startViewTransition(() => {
        document.querySelector('.lightbox').classList.remove('active');
    });
}

// CSS
.lightbox-image {
    view-transition-name: lightbox-image;
}

.lightbox {
    view-transition-name: lightbox-overlay;
}
```

### 6. Tabbed Interface

```javascript
function switchTab(tabId) {
    document.startViewTransition(() => {
        // Deactivate all tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.classList.remove('active');
        });

        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });

        // Activate selected tab
        document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
        document.querySelector(`#${tabId}`).classList.add('active');
    });
}
```

## Advanced Patterns

### 1. Async Transitions with Loading States

```javascript
async function updateWithLoading(updateFn) {
    const transition = document.startViewTransition(async () => {
        // Show loading state
        document.querySelector('.loader').classList.add('active');

        try {
            await updateFn();
        } finally {
            document.querySelector('.loader').classList.remove('active');
        }
    });

    // Wait for transition to finish
    await transition.finished;
}

// Usage
await updateWithLoading(async () => {
    const data = await fetch('/api/data');
    renderData(data);
});
```

### 2. Conditional Transitions

```javascript
function updateContent(content, shouldAnimate = true) {
    const updateDOM = () => {
        document.querySelector('.content').innerHTML = content;
    };

    if (shouldAnimate && document.startViewTransition) {
        document.startViewTransition(updateDOM);
    } else {
        updateDOM();
    }
}
```

### 3. Accessibility - Respecting User Preferences

```javascript
function updateWithTransition(updateFn) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !document.startViewTransition) {
        updateFn();
        return;
    }

    document.startViewTransition(updateFn);
}
```

### 4. Custom Animation Control

```javascript
function customTransition(updateFn, duration = 500) {
    document.documentElement.style.setProperty('--transition-duration', `${duration}ms`);

    const transition = document.startViewTransition(updateFn);

    return transition;
}

// CSS
::view-transition-old(root),
::view-transition-new(root) {
    animation-duration: var(--transition-duration, 300ms);
}
```

### 5. Transition Events

```javascript
async function transitionWithCallbacks(updateFn, { onStart, onFinish, onError }) {
    if (onStart) onStart();

    try {
        const transition = document.startViewTransition(updateFn);

        await transition.ready;
        console.log('Transition started');

        await transition.finished;
        console.log('Transition finished');

        if (onFinish) onFinish();
    } catch (error) {
        console.error('Transition failed:', error);
        if (onError) onError(error);
    }
}
```

### 6. Named Transitions for Multiple Elements

```javascript
function createListTransition(items) {
    document.startViewTransition(() => {
        const list = document.querySelector('.list');

        // Clear existing items
        list.innerHTML = '';

        // Add new items with unique transition names
        items.forEach((item, index) => {
            const element = document.createElement('div');
            element.textContent = item.text;
            element.style.viewTransitionName = `item-${item.id}`;
            list.appendChild(element);
        });
    });
}

// CSS
[style*="view-transition-name"] {
    contain: layout;
}
```

## CSS Animation Customization

### Default Animations

```css
/* Root transition (whole page) */
::view-transition-old(root) {
    animation: fade-out 0.3s ease-out;
}

::view-transition-new(root) {
    animation: fade-in 0.3s ease-in;
}

/* Custom animations */
@keyframes fade-out {
    to { opacity: 0; }
}

@keyframes fade-in {
    from { opacity: 0; }
}
```

### Slide Transitions

```css
.page-content {
    view-transition-name: page-content;
}

::view-transition-old(page-content) {
    animation: slide-out-left 0.4s ease;
}

::view-transition-new(page-content) {
    animation: slide-in-right 0.4s ease;
}

@keyframes slide-out-left {
    to { transform: translateX(-100%); }
}

@keyframes slide-in-right {
    from { transform: translateX(100%); }
}
```

### Scale and Fade

```css
.modal {
    view-transition-name: modal;
}

::view-transition-old(modal) {
    animation: scale-down 0.3s ease;
}

::view-transition-new(modal) {
    animation: scale-up 0.3s ease;
}

@keyframes scale-up {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
}

@keyframes scale-down {
    to {
        opacity: 0;
        transform: scale(0.8);
    }
}
```

### Complex Multi-Element Transitions

```css
/* Hero image transitions */
.hero-image {
    view-transition-name: hero-image;
}

::view-transition-old(hero-image),
::view-transition-new(hero-image) {
    animation-duration: 0.5s;
    animation-timing-function: ease-in-out;
}

/* Title transitions */
.title {
    view-transition-name: title;
}

::view-transition-old(title) {
    animation: fade-out 0.2s ease-out;
}

::view-transition-new(title) {
    animation: slide-in-up 0.4s 0.1s ease-out backwards;
}

@keyframes slide-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
}
```

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 111+    |
| Edge    | 111+    |
| Safari  | 18+     |
| Firefox | Not yet (in development) |
| Opera   | 97+     |

**Support:** ~70% of users globally (rapidly growing)

### Feature Detection

```javascript
if (document.startViewTransition) {
    // Use View Transitions API
    document.startViewTransition(() => {
        updateDOM();
    });
} else {
    // Fallback - just update DOM
    updateDOM();
}
```

### Polyfill Approach

```javascript
// Simple fallback wrapper
if (!document.startViewTransition) {
    document.startViewTransition = (callback) => {
        callback();
        return {
            finished: Promise.resolve(),
            ready: Promise.resolve(),
            updateCallbackDone: Promise.resolve()
        };
    };
}
```

## Best Practices

### 1. Use Meaningful Transition Names

```javascript
// ✓ Good - Descriptive names
.product-image { view-transition-name: product-image; }
.user-avatar { view-transition-name: user-avatar; }

// ✗ Bad - Generic names
.image { view-transition-name: img; }
.card { view-transition-name: card; }
```

### 2. Ensure Unique Transition Names

```javascript
// ✓ Good - Unique names
items.forEach((item, index) => {
    element.style.viewTransitionName = `item-${item.id}`;
});

// ✗ Bad - Duplicate names (only one will transition)
items.forEach(item => {
    element.style.viewTransitionName = 'item';
});
```

### 3. Clean Up Transition Names

```javascript
// ✓ Good - Remove transition name after use
function transitionElement(element) {
    const tempName = `temp-${Date.now()}`;
    element.style.viewTransitionName = tempName;

    document.startViewTransition(() => {
        // Update
    }).finished.then(() => {
        element.style.viewTransitionName = '';
    });
}
```

### 4. Handle Errors

```javascript
// ✓ Good - Handle transition errors
try {
    const transition = document.startViewTransition(() => {
        updateDOM();
    });

    await transition.finished;
} catch (error) {
    console.error('Transition failed:', error);
    // Fallback behavior
}
```

### 5. Respect User Preferences

```javascript
// ✓ Good - Check for reduced motion
const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

function safeTransition(updateFn) {
    if (mediaQuery.matches || !document.startViewTransition) {
        updateFn();
    } else {
        document.startViewTransition(updateFn);
    }
}
```

### 6. Keep Transitions Short

```javascript
// ✓ Good - Short, snappy transitions (200-400ms)
::view-transition-old(root) {
    animation-duration: 300ms;
}

// ✗ Bad - Too long, feels slow
::view-transition-old(root) {
    animation-duration: 2s; /* Too slow! */
}
```

## Common Pitfalls

### 1. Forgetting Feature Detection

```javascript
// ✗ Bad - Will crash in unsupported browsers
document.startViewTransition(() => {
    updateDOM();
});

// ✓ Good - Always check support
if (document.startViewTransition) {
    document.startViewTransition(() => updateDOM());
} else {
    updateDOM();
}
```

### 2. Duplicate Transition Names

```css
/* ✗ Bad - Two elements with same name */
.header { view-transition-name: header; }
.footer { view-transition-name: header; } /* Conflict! */

/* ✓ Good - Unique names */
.header { view-transition-name: page-header; }
.footer { view-transition-name: page-footer; }
```

### 3. Not Waiting for Async Operations

```javascript
// ✗ Bad - DOM updates before data is ready
document.startViewTransition(() => {
    fetchData().then(data => {
        render(data); // Too late!
    });
});

// ✓ Good - Wait for async operations
document.startViewTransition(async () => {
    const data = await fetchData();
    render(data);
});
```

### 4. Transitioning Too Many Elements

```javascript
// ✗ Bad - Too many named transitions
document.querySelectorAll('.item').forEach((item, i) => {
    item.style.viewTransitionName = `item-${i}`;
});
// 100+ elements = slow transitions

// ✓ Good - Transition only what's visible
const visibleItems = getVisibleItems();
visibleItems.forEach((item, i) => {
    item.style.viewTransitionName = `item-${i}`;
});
```

### 5. Forgetting to Remove Transition Names

```javascript
// ✗ Bad - Transition name stays forever
element.style.viewTransitionName = 'unique-name';

// ✓ Good - Clean up after transition
const transition = document.startViewTransition(() => {
    element.style.viewTransitionName = 'unique-name';
    // Update DOM
});

transition.finished.then(() => {
    element.style.viewTransitionName = '';
});
```

## Performance Tips

### 1. Use CSS Containment

```css
.transitioned-element {
    view-transition-name: element;
    contain: layout; /* Improves performance */
}
```

### 2. Avoid Expensive Operations During Transition

```javascript
// ✗ Bad - Heavy computation during transition
document.startViewTransition(() => {
    heavyCalculation();
    updateDOM();
});

// ✓ Good - Do heavy work before transition
const result = heavyCalculation();
document.startViewTransition(() => {
    updateDOM(result);
});
```

### 3. Transition Only What Changes

```javascript
// ✓ Good - Specific transition names
.card-image { view-transition-name: card-image; }
.card-title { view-transition-name: card-title; }

// ✗ Bad - Transitioning entire page
.page { view-transition-name: entire-page; }
```

## Resources

- [MDN View Transitions API](https://developer.mozilla.org/en-US/docs/Web/API/View_Transitions_API)
- [Chrome Developers Guide](https://developer.chrome.com/docs/web-platform/view-transitions/)
- [Can I Use](https://caniuse.com/view-transitions)
- [Web API Specification](https://drafts.csswg.org/css-view-transitions/)

## Files

- **index.html** - Interactive demos page with 6 examples
- **style.css** - Styling and transition animations
- **script.js** - All demo implementations
- **README.md** - This documentation

## Running the Examples

Open `index.html` in a browser that supports View Transitions API (Chrome 111+, Edge 111+, Safari 18+). Each demo is interactive and demonstrates different aspects of the API.

## License

Free to use for learning and projects.

# ResizeObserver API

A comprehensive guide to the ResizeObserver API with 6 practical examples demonstrating how to efficiently observe element size changes.

## What is ResizeObserver?

The **ResizeObserver API** provides a performant mechanism for observing changes to an element's size. Unlike the legacy `window.resize` event, ResizeObserver notifies you when individual elements change dimensions, making it perfect for responsive components and container queries.

## Key Concepts

### 1. Creating an Observer

Create an observer instance with a callback function.

```javascript
const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
        console.log('Element resized:', entry.target);
    }
});
```

### 2. Observing Elements

Start observing an element's size changes.

```javascript
const element = document.querySelector('.my-element');
observer.observe(element);
```

### 3. Entry Properties

Access detailed size information from entries.

```javascript
observer = new ResizeObserver(entries => {
    for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const borderBoxSize = entry.borderBoxSize[0];
        const contentBoxSize = entry.contentBoxSize[0];
    }
});
```

### 4. Unobserving Elements

Stop observing a specific element.

```javascript
observer.unobserve(element);
```

### 5. Disconnecting Observer

Stop observing all elements.

```javascript
observer.disconnect();
```

## Why Use ResizeObserver?

### The Problem Without It

**Before ResizeObserver**, tracking element size changes required:
- Polling with setInterval (inefficient)
- Window resize events (not element-specific)
- MutationObserver (doesn't track size)
- Manual size checks on every frame
- CSS transitions/animations hacks
- Poor performance and battery drain

### The Solution With ResizeObserver

```javascript
// Simple and efficient!
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        const { width, height } = entry.contentRect;
        console.log(`New size: ${width}x${height}`);
    });
});

observer.observe(myElement);
```

**Benefits:**
- ✅ High performance (native browser API)
- ✅ Element-specific notifications
- ✅ No polling required
- ✅ Works with CSS animations
- ✅ Automatic debouncing
- ✅ Multiple box model support
- ✅ Better than window.resize

## Demos Included

### 1. Basic Resize Detection

Detect when an element's size changes.

**Use Case**: Track user-resized panels, textareas, or draggable elements.

```javascript
const resizeObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const { width, height } = entry.contentRect;

        console.log(`Element resized to: ${width}x${height}`);

        // Update UI
        element.textContent = `${Math.round(width)}x${Math.round(height)}`;
    }
});

resizeObserver.observe(element);
```

### 2. Responsive Text Sizing

Automatically adjust font size based on container width.

**Use Case**: Adaptive typography, fluid headlines, responsive logos.

```javascript
const textObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;

        // Calculate responsive font size
        const fontSize = Math.max(16, Math.min(80, width / 8));

        entry.target.style.fontSize = `${fontSize}px`;
    }
});

textObserver.observe(container);
```

### 3. Container Queries Simulation

Apply different styles based on container size (like CSS Container Queries).

**Use Case**: Component-based responsive design, card layouts, widgets.

```javascript
const containerObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;
        const element = entry.target;

        // Remove all size classes
        element.classList.remove('small', 'medium', 'large');

        // Add appropriate class based on width
        if (width < 400) {
            element.classList.add('small');
        } else if (width < 600) {
            element.classList.add('medium');
        } else {
            element.classList.add('large');
        }
    }
});

containerObserver.observe(adaptiveContainer);
```

```css
/* Different layouts based on container size */
.card-grid.small {
    grid-template-columns: 1fr;
}

.card-grid.medium {
    grid-template-columns: repeat(2, 1fr);
}

.card-grid.large {
    grid-template-columns: repeat(3, 1fr);
}
```

### 4. Canvas Auto-Resize

Automatically redraw canvas when container resizes.

**Use Case**: Charts, graphs, data visualizations, games.

```javascript
const canvasObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const canvas = entry.target;
        const { width, height } = entry.contentRect;

        // Update canvas resolution
        canvas.width = width;
        canvas.height = height;

        // Redraw content
        redrawCanvas(canvas);
    }
});

canvasObserver.observe(canvasWrapper);

function redrawCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    // ... drawing code
}
```

### 5. Resizable Sidebar

Detect sidebar resize and adjust main content accordingly.

**Use Case**: Split panes, resizable panels, dashboard layouts.

```javascript
const sidebarObserver = new ResizeObserver(entries => {
    for (const entry of entries) {
        const sidebarWidth = entry.contentRect.width;
        const totalWidth = entry.target.parentElement.offsetWidth;
        const mainWidth = totalWidth - sidebarWidth;

        // Update main content width
        mainContent.style.width = `${mainWidth}px`;

        // Calculate percentage
        const percentage = (sidebarWidth / totalWidth * 100).toFixed(1);
        console.log(`Sidebar: ${percentage}% of total width`);
    }
});

sidebarObserver.observe(sidebar);
```

### 6. Multiple Elements Observation

Efficiently observe multiple elements with a single observer.

**Use Case**: Grid systems, card collections, dynamic lists.

```javascript
// Single observer for all elements
const multiObserver = new ResizeObserver(entries => {
    console.log(`Processing ${entries.length} resized elements`);

    for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const element = entry.target;

        // Update each element
        element.querySelector('.size').textContent =
            `${Math.round(width)}×${Math.round(height)}`;
    }
});

// Observe all items
const items = document.querySelectorAll('.grid-item');
items.forEach(item => multiObserver.observe(item));
```

## Real-World Use Cases

### 1. Responsive Component Library

```javascript
class ResponsiveCard extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        this.observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;

            // Update layout based on width
            if (width < 300) {
                this.setAttribute('layout', 'compact');
            } else if (width < 500) {
                this.setAttribute('layout', 'normal');
            } else {
                this.setAttribute('layout', 'expanded');
            }
        });
    }

    connectedCallback() {
        this.observer.observe(this);
    }

    disconnectedCallback() {
        this.observer.disconnect();
    }
}

customElements.define('responsive-card', ResponsiveCard);
```

### 2. Chart Library Integration

```javascript
class ResponsiveChart {
    constructor(container) {
        this.container = container;
        this.canvas = container.querySelector('canvas');
        this.chart = null;

        this.observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                this.handleResize(entry.contentRect);
            }
        });

        this.observer.observe(this.container);
        this.initChart();
    }

    handleResize(rect) {
        if (!this.chart) return;

        // Update canvas dimensions
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;

        // Redraw chart
        this.chart.resize();
        this.chart.update();
    }

    initChart() {
        // Initialize chart library (e.g., Chart.js)
        this.chart = new Chart(this.canvas, {
            // ... chart config
        });
    }

    destroy() {
        this.observer.disconnect();
        this.chart.destroy();
    }
}
```

### 3. Masonry Layout

```javascript
class MasonryGrid {
    constructor(container) {
        this.container = container;
        this.items = Array.from(container.children);

        this.observer = new ResizeObserver(entries => {
            // Debounce layout recalculation
            clearTimeout(this.layoutTimeout);
            this.layoutTimeout = setTimeout(() => {
                this.calculateLayout();
            }, 100);
        });

        // Observe container
        this.observer.observe(this.container);

        // Observe each item
        this.items.forEach(item => {
            this.observer.observe(item);
        });
    }

    calculateLayout() {
        const containerWidth = this.container.offsetWidth;
        const columnCount = Math.floor(containerWidth / 250);
        const columnWidth = containerWidth / columnCount;

        // Calculate positions
        const columnHeights = new Array(columnCount).fill(0);

        this.items.forEach(item => {
            // Find shortest column
            const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));

            // Position item
            item.style.transform = `translate(${shortestColumn * columnWidth}px, ${columnHeights[shortestColumn]}px)`;

            // Update column height
            columnHeights[shortestColumn] += item.offsetHeight + 10;
        });

        // Update container height
        this.container.style.height = `${Math.max(...columnHeights)}px`;
    }

    destroy() {
        this.observer.disconnect();
    }
}
```

### 4. Adaptive Image Loading

```javascript
class ResponsiveImage {
    constructor(img) {
        this.img = img;
        this.sources = {
            small: img.dataset.srcSmall,
            medium: img.dataset.srcMedium,
            large: img.dataset.srcLarge
        };

        this.observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            this.loadAppropriateImage(width);
        });

        this.observer.observe(this.img.parentElement);
    }

    loadAppropriateImage(width) {
        let src;

        if (width < 400) {
            src = this.sources.small;
        } else if (width < 800) {
            src = this.sources.medium;
        } else {
            src = this.sources.large;
        }

        // Only load if different
        if (this.img.src !== src) {
            this.img.src = src;
        }
    }
}

// Usage
document.querySelectorAll('.responsive-img').forEach(img => {
    new ResponsiveImage(img);
});
```

### 5. Virtual Scrolling

```javascript
class VirtualList {
    constructor(container) {
        this.container = container;
        this.itemHeight = 50;
        this.visibleItems = 0;

        this.observer = new ResizeObserver(entries => {
            const height = entries[0].contentRect.height;
            this.visibleItems = Math.ceil(height / this.itemHeight);
            this.render();
        });

        this.observer.observe(this.container);
    }

    render() {
        const scrollTop = this.container.scrollTop;
        const startIndex = Math.floor(scrollTop / this.itemHeight);
        const endIndex = startIndex + this.visibleItems;

        // Render only visible items
        this.renderItems(startIndex, endIndex);
    }

    renderItems(start, end) {
        // ... render logic
    }
}
```

### 6. Responsive Typography System

```javascript
class FluidTypography {
    constructor(element, options = {}) {
        this.element = element;
        this.minSize = options.minSize || 16;
        this.maxSize = options.maxSize || 72;
        this.minWidth = options.minWidth || 320;
        this.maxWidth = options.maxWidth || 1200;

        this.observer = new ResizeObserver(entries => {
            const width = entries[0].contentRect.width;
            this.updateFontSize(width);
        });

        this.observer.observe(this.element.parentElement);
    }

    updateFontSize(width) {
        // Clamp width between min and max
        const clampedWidth = Math.max(this.minWidth, Math.min(this.maxWidth, width));

        // Calculate font size using linear interpolation
        const ratio = (clampedWidth - this.minWidth) / (this.maxWidth - this.minWidth);
        const fontSize = this.minSize + (this.maxSize - this.minSize) * ratio;

        this.element.style.fontSize = `${fontSize}px`;
    }

    destroy() {
        this.observer.disconnect();
    }
}

// Usage
const heading = new FluidTypography(document.querySelector('h1'), {
    minSize: 24,
    maxSize: 72,
    minWidth: 320,
    maxWidth: 1200
});
```

## Advanced Patterns

### Debounced Resize Handler

```javascript
class DebouncedResizeObserver {
    constructor(callback, delay = 100) {
        this.callback = callback;
        this.delay = delay;
        this.timeouts = new WeakMap();

        this.observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                // Clear existing timeout for this element
                if (this.timeouts.has(entry.target)) {
                    clearTimeout(this.timeouts.get(entry.target));
                }

                // Set new timeout
                const timeout = setTimeout(() => {
                    this.callback([entry]);
                    this.timeouts.delete(entry.target);
                }, this.delay);

                this.timeouts.set(entry.target, timeout);
            });
        });
    }

    observe(element) {
        this.observer.observe(element);
    }

    unobserve(element) {
        this.observer.unobserve(element);
        if (this.timeouts.has(element)) {
            clearTimeout(this.timeouts.get(element));
            this.timeouts.delete(element);
        }
    }

    disconnect() {
        this.observer.disconnect();
        // Clear all timeouts
        this.timeouts = new WeakMap();
    }
}

// Usage
const debouncedObserver = new DebouncedResizeObserver(entries => {
    console.log('Debounced resize:', entries);
}, 200);

debouncedObserver.observe(element);
```

### React Hook

```javascript
import { useEffect, useRef, useState } from 'react';

function useResizeObserver(ref) {
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new ResizeObserver(entries => {
            const { width, height } = entries[0].contentRect;
            setDimensions({ width, height });
        });

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref]);

    return dimensions;
}

// Usage in component
function MyComponent() {
    const containerRef = useRef(null);
    const { width, height } = useResizeObserver(containerRef);

    return (
        <div ref={containerRef}>
            Size: {width}x{height}
        </div>
    );
}
```

### Vue Composable

```javascript
import { ref, onMounted, onUnmounted } from 'vue';

export function useResizeObserver(target) {
    const width = ref(0);
    const height = ref(0);
    let observer = null;

    const observe = () => {
        if (!target.value) return;

        observer = new ResizeObserver(entries => {
            const { width: w, height: h } = entries[0].contentRect;
            width.value = w;
            height.value = h;
        });

        observer.observe(target.value);
    };

    onMounted(observe);

    onUnmounted(() => {
        if (observer) {
            observer.disconnect();
        }
    });

    return { width, height };
}

// Usage in component
export default {
    setup() {
        const container = ref(null);
        const { width, height } = useResizeObserver(container);

        return { container, width, height };
    }
};
```

### Threshold-Based Notification

```javascript
class ThresholdResizeObserver {
    constructor(thresholds = [400, 600, 800]) {
        this.thresholds = thresholds.sort((a, b) => a - b);
        this.currentThresholds = new WeakMap();
        this.callbacks = new Map();

        this.observer = new ResizeObserver(entries => {
            entries.forEach(entry => {
                this.checkThresholds(entry);
            });
        });
    }

    checkThresholds(entry) {
        const width = entry.contentRect.width;
        const element = entry.target;
        const currentThreshold = this.currentThresholds.get(element);

        // Find new threshold
        let newThreshold = null;
        for (const threshold of this.thresholds) {
            if (width >= threshold) {
                newThreshold = threshold;
            } else {
                break;
            }
        }

        // If threshold changed, trigger callback
        if (newThreshold !== currentThreshold) {
            this.currentThresholds.set(element, newThreshold);
            const callback = this.callbacks.get(element);

            if (callback) {
                callback({
                    width,
                    threshold: newThreshold,
                    previousThreshold: currentThreshold
                });
            }
        }
    }

    observe(element, callback) {
        this.callbacks.set(element, callback);
        this.observer.observe(element);
    }

    unobserve(element) {
        this.observer.unobserve(element);
        this.callbacks.delete(element);
        this.currentThresholds.delete(element);
    }

    disconnect() {
        this.observer.disconnect();
        this.callbacks.clear();
        this.currentThresholds = new WeakMap();
    }
}

// Usage
const thresholdObserver = new ThresholdResizeObserver([400, 600, 800]);

thresholdObserver.observe(element, ({ width, threshold, previousThreshold }) => {
    console.log(`Width crossed ${threshold}px threshold (was ${previousThreshold}px)`);
});
```

## Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome  | 64+     | Full support |
| Firefox | 69+     | Full support |
| Safari  | 13.1+   | Full support |
| Edge    | 79+     | Full support |
| Opera   | 51+     | Full support |

**Support:** ~95% of users globally

### Feature Detection

```javascript
if ('ResizeObserver' in window) {
    // Use ResizeObserver
    const observer = new ResizeObserver(entries => {
        // Handle resize
    });
    observer.observe(element);
} else {
    // Fallback to window.resize or polyfill
    console.warn('ResizeObserver not supported');

    // Load polyfill
    import('resize-observer-polyfill').then(module => {
        const ResizeObserver = module.default;
        // Use polyfill
    });
}
```

### Polyfill

```html
<!-- Include polyfill for older browsers -->
<script src="https://unpkg.com/resize-observer-polyfill@1.5.1/dist/ResizeObserver.js"></script>
```

Or via npm:

```bash
npm install resize-observer-polyfill
```

```javascript
import ResizeObserver from 'resize-observer-polyfill';

const observer = new ResizeObserver(entries => {
    // Works in all browsers
});
```

## Best Practices

### 1. Use Single Observer for Multiple Elements

```javascript
// ✓ Good - Single observer
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        handleResize(entry);
    });
});

elements.forEach(el => observer.observe(el));

// ✗ Bad - Multiple observers
elements.forEach(el => {
    const observer = new ResizeObserver(entries => {
        handleResize(entries[0]);
    });
    observer.observe(el);
});
```

### 2. Clean Up Observers

```javascript
// ✓ Good - Disconnect when done
class MyComponent {
    constructor(element) {
        this.observer = new ResizeObserver(this.handleResize);
        this.observer.observe(element);
    }

    destroy() {
        this.observer.disconnect();
    }
}

// ✗ Bad - Memory leak
class MyComponent {
    constructor(element) {
        this.observer = new ResizeObserver(this.handleResize);
        this.observer.observe(element);
        // Never disconnected!
    }
}
```

### 3. Avoid Heavy Operations

```javascript
// ✓ Good - Use requestAnimationFrame for rendering
const observer = new ResizeObserver(entries => {
    requestAnimationFrame(() => {
        entries.forEach(entry => {
            // Heavy DOM operations here
            updateLayout(entry);
        });
    });
});

// ✗ Bad - Heavy sync operations
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        // Causes layout thrashing
        element.offsetHeight;
        element.style.height = '100px';
        element.offsetWidth;
        element.style.width = '100px';
    });
});
```

### 4. Use Appropriate Box Model

```javascript
// ✓ Good - Specify box model
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        // Use border-box for total element size
        const borderBoxSize = entry.borderBoxSize?.[0];
        if (borderBoxSize) {
            const width = borderBoxSize.inlineSize;
            const height = borderBoxSize.blockSize;
        }
    });
});

// Also valid - contentRect (content-box)
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        const { width, height } = entry.contentRect;
    });
});
```

### 5. Debounce Expensive Calculations

```javascript
// ✓ Good - Debounce heavy operations
let timeout;
const observer = new ResizeObserver(entries => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
        expensiveCalculation(entries);
    }, 100);
});

// ✗ Bad - Run expensive operation on every resize
const observer = new ResizeObserver(entries => {
    expensiveCalculation(entries); // Called too frequently
});
```

## Common Pitfalls

### 1. Infinite Loop

```javascript
// ✗ Bad - Creates infinite loop!
const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
        // Resizing the observed element triggers observer again!
        entry.target.style.width = `${entry.contentRect.width + 10}px`;
    }
});

// ✓ Good - Only update if needed
const observer = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;
        const desiredWidth = calculateDesiredWidth();

        // Only update if different
        if (Math.abs(width - desiredWidth) > 1) {
            entry.target.style.width = `${desiredWidth}px`;
        }
    }
});
```

### 2. Not Cleaning Up

```javascript
// ✗ Bad - Observer never disconnected
function setupComponent(element) {
    const observer = new ResizeObserver(handleResize);
    observer.observe(element);
    // Component removed but observer still active!
}

// ✓ Good - Clean up
function setupComponent(element) {
    const observer = new ResizeObserver(handleResize);
    observer.observe(element);

    return () => observer.disconnect(); // Return cleanup function
}
```

### 3. Accessing offsetWidth/Height in Callback

```javascript
// ✗ Bad - Causes layout thrashing
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        const height = entry.target.offsetHeight; // Forces layout!
        const width = entry.target.offsetWidth;   // Forces layout!
    });
});

// ✓ Good - Use contentRect
const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
        const { width, height } = entry.contentRect; // No layout!
    });
});
```

### 4. Observing Too Many Elements

```javascript
// ✗ Bad - Observing 1000+ elements
const observer = new ResizeObserver(handleResize);
document.querySelectorAll('.item').forEach(item => {
    observer.observe(item); // Could be thousands!
});

// ✓ Good - Observe container instead
const observer = new ResizeObserver(handleResize);
observer.observe(container); // One observation
```

## Performance Considerations

### 1. Batch Updates

```javascript
const observer = new ResizeObserver(entries => {
    // Batch all updates in one animation frame
    requestAnimationFrame(() => {
        const updates = entries.map(entry => ({
            element: entry.target,
            size: entry.contentRect
        }));

        // Apply all updates at once
        applyUpdates(updates);
    });
});
```

### 2. Minimize Observed Elements

```javascript
// Instead of observing every card
const cards = document.querySelectorAll('.card');
cards.forEach(card => observer.observe(card)); // Many observations

// Observe the grid container
const grid = document.querySelector('.grid');
observer.observe(grid); // Single observation
```

### 3. Use Web Workers for Calculations

```javascript
const worker = new Worker('resize-calculations.js');

const observer = new ResizeObserver(entries => {
    // Send data to worker
    worker.postMessage({
        sizes: entries.map(e => ({
            width: e.contentRect.width,
            height: e.contentRect.height
        }))
    });
});

worker.onmessage = (e) => {
    // Apply results from worker
    applyCalculations(e.data);
};
```

## Testing ResizeObserver

### Manual Testing

```javascript
// Test helper
function testResize(element, width, height) {
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
}

// Run tests
console.log('Testing resize detection...');
testResize(element, 400, 300);
setTimeout(() => testResize(element, 800, 600), 1000);
```

### Automated Testing (Jest)

```javascript
describe('ResizeObserver', () => {
    let observer;
    let callback;

    beforeEach(() => {
        callback = jest.fn();
        observer = new ResizeObserver(callback);
    });

    afterEach(() => {
        observer.disconnect();
    });

    test('should trigger on element resize', async () => {
        const element = document.createElement('div');
        document.body.appendChild(element);

        observer.observe(element);

        // Trigger resize
        element.style.width = '500px';

        // Wait for observer
        await new Promise(resolve => setTimeout(resolve, 100));

        expect(callback).toHaveBeenCalled();

        document.body.removeChild(element);
    });
});
```

## Resources

- [MDN ResizeObserver](https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver)
- [W3C Specification](https://drafts.csswg.org/resize-observer/)
- [Can I Use](https://caniuse.com/resizeobserver)
- [Polyfill](https://github.com/que-etc/resize-observer-polyfill)
- [Web.dev Article](https://web.dev/resize-observer/)

## Files

- **index.html** - Interactive demos page with 6 examples
- **style.css** - Comprehensive styling for all demos
- **script.js** - Complete implementations of all 6 demos
- **README.md** - This documentation

## Running the Examples

1. Open `index.html` in a **modern browser**
2. Interact with the demos
3. **Resize elements** by dragging, clicking buttons, or using sliders
4. **Open DevTools console** to see detailed logging
5. Observe how ResizeObserver efficiently tracks size changes

## License

Free to use for learning and projects.

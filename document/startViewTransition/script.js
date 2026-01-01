// ============================================
// View Transitions API - Interactive Demos
// ============================================

// Check browser support
const supportsViewTransitions = 'startViewTransition' in document;

// Update support status
document.addEventListener('DOMContentLoaded', () => {
    const statusEl = document.getElementById('support-status');
    if (supportsViewTransitions) {
        statusEl.textContent = '✓ Your browser supports View Transitions API!';
        statusEl.style.color = '#10b981';
    } else {
        statusEl.textContent = '✗ Your browser does not support View Transitions API yet.';
        statusEl.style.color = '#ef4444';
    }
});

// Helper function to safely use view transitions with fallback
function safeViewTransition(updateCallback) {
    if (supportsViewTransitions) {
        return document.startViewTransition(updateCallback);
    } else {
        updateCallback();
        return {
            finished: Promise.resolve(),
            ready: Promise.resolve(),
            updateCallbackDone: Promise.resolve()
        };
    }
}

// ============================================
// Demo 1: Basic Fade Transition
// ============================================

const demo1Content = document.getElementById('demo1-content');
const demo1Btn = document.getElementById('demo1-btn');
const demo1Reset = document.getElementById('demo1-reset');

const contents = [
    {
        title: 'Original Content',
        text: 'Click the button to see a smooth fade transition to new content.'
    },
    {
        title: 'Updated Content',
        text: 'This is the new content! Notice how smoothly it faded in. The browser automatically handles the animation.'
    },
    {
        title: 'Another Update',
        text: 'And here is another piece of content. Each transition is smooth and automatic!'
    },
    {
        title: 'Final Content',
        text: 'Last one! The View Transitions API makes these smooth changes effortless.'
    }
];

let currentContentIndex = 0;

demo1Btn.addEventListener('click', () => {
    currentContentIndex = (currentContentIndex + 1) % contents.length;
    const newContent = contents[currentContentIndex];

    safeViewTransition(() => {
        demo1Content.innerHTML = `
            <h3>${newContent.title}</h3>
            <p>${newContent.text}</p>
        `;
    });
});

demo1Reset.addEventListener('click', () => {
    currentContentIndex = 0;
    safeViewTransition(() => {
        demo1Content.innerHTML = `
            <h3>${contents[0].title}</h3>
            <p>${contents[0].text}</p>
        `;
    });
});

// ============================================
// Demo 2: Image Gallery Transition
// ============================================

const demo2Gallery = document.getElementById('demo2-gallery');
const demo2Counter = document.getElementById('demo2-counter');
const demo2Prev = document.getElementById('demo2-prev');
const demo2Next = document.getElementById('demo2-next');

const galleryImages = [
    { gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', label: 'Image 1' },
    { gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', label: 'Image 2' },
    { gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', label: 'Image 3' },
    { gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', label: 'Image 4' }
];

let currentImageIndex = 0;

function updateGallery(newIndex) {
    const image = galleryImages[newIndex];

    safeViewTransition(() => {
        demo2Gallery.innerHTML = `
            <div class="gallery-image" style="background: ${image.gradient};">
                <span class="image-label">${image.label}</span>
            </div>
        `;
        demo2Counter.textContent = `${newIndex + 1} / ${galleryImages.length}`;
        currentImageIndex = newIndex;
    });
}

demo2Next.addEventListener('click', () => {
    const newIndex = (currentImageIndex + 1) % galleryImages.length;
    updateGallery(newIndex);
});

demo2Prev.addEventListener('click', () => {
    const newIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
    updateGallery(newIndex);
});

// ============================================
// Demo 3: List Item Transitions
// ============================================

const demo3Input = document.getElementById('demo3-input');
const demo3Add = document.getElementById('demo3-add');
const demo3List = document.getElementById('demo3-list');

let taskIdCounter = 3;

function addTask(text) {
    if (!text.trim()) return;

    safeViewTransition(() => {
        const li = document.createElement('li');
        li.className = 'todo-item';
        li.style.viewTransitionName = `task-${taskIdCounter++}`;
        li.innerHTML = `
            <span>${text}</span>
            <button class="btn-remove">×</button>
        `;

        demo3List.appendChild(li);

        // Add remove listener
        li.querySelector('.btn-remove').addEventListener('click', () => {
            removeTask(li);
        });

        // Clear transition name after animation
        setTimeout(() => {
            li.style.viewTransitionName = '';
        }, 500);
    });

    demo3Input.value = '';
}

function removeTask(element) {
    const tempName = `task-remove-${Date.now()}`;
    element.style.viewTransitionName = tempName;

    safeViewTransition(() => {
        element.remove();
    });
}

demo3Add.addEventListener('click', () => {
    addTask(demo3Input.value);
});

demo3Input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask(demo3Input.value);
    }
});

// Add remove listeners to existing items
demo3List.querySelectorAll('.btn-remove').forEach(btn => {
    btn.addEventListener('click', () => {
        removeTask(btn.closest('.todo-item'));
    });
});

// ============================================
// Demo 4: Theme Switcher
// ============================================

const demo4Preview = document.getElementById('demo4-preview');
const demo4Toggle = document.getElementById('demo4-toggle');
const demo4Current = document.getElementById('demo4-current');

demo4Toggle.addEventListener('click', () => {
    const currentTheme = demo4Preview.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    safeViewTransition(() => {
        demo4Preview.setAttribute('data-theme', newTheme);
        demo4Current.textContent = `Current: ${newTheme.charAt(0).toUpperCase() + newTheme.slice(1)}`;
    });
});

// ============================================
// Demo 5: Card Expand/Collapse
// ============================================

const demo5Grid = document.getElementById('demo5-grid');
const cards = demo5Grid.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('click', () => {
        const cardId = card.getAttribute('data-card-id');

        safeViewTransition(() => {
            // If this card is already expanded, collapse it
            if (card.classList.contains('expanded')) {
                card.classList.remove('expanded');
                card.style.viewTransitionName = '';
            } else {
                // Collapse all other cards
                cards.forEach(c => {
                    c.classList.remove('expanded');
                    c.style.viewTransitionName = '';
                });

                // Expand this card
                card.classList.add('expanded');
                card.style.viewTransitionName = `card-${cardId}`;
            }
        });
    });
});

// ============================================
// Demo 6: Page Navigation
// ============================================

const navButtons = document.querySelectorAll('.nav-btn');
const pages = document.querySelectorAll('.page');

navButtons.forEach(button => {
    button.addEventListener('click', () => {
        const targetPage = button.getAttribute('data-page');

        safeViewTransition(() => {
            // Update nav buttons
            navButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Update pages
            pages.forEach(page => {
                page.classList.remove('active');
            });

            document.getElementById(`page-${targetPage}`).classList.add('active');
        });
    });
});

// ============================================
// Advanced Examples (Console Demos)
// ============================================

// Example 1: Transition with callbacks
window.demo_transitionWithCallbacks = async function() {
    console.log('Starting transition with callbacks...');

    const transition = safeViewTransition(() => {
        console.log('Updating DOM...');
        demo1Content.innerHTML = `
            <h3>Callback Demo</h3>
            <p>This transition was triggered with callbacks!</p>
        `;
    });

    try {
        await transition.ready;
        console.log('Transition ready - animation starting');

        await transition.finished;
        console.log('Transition finished - animation complete');
    } catch (error) {
        console.error('Transition failed:', error);
    }
};

// Example 2: Conditional transitions based on user preference
window.demo_respectReducedMotion = function() {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    console.log('Prefers reduced motion:', prefersReducedMotion);

    if (prefersReducedMotion) {
        console.log('User prefers reduced motion - skipping transition');
        demo1Content.innerHTML = `
            <h3>No Animation</h3>
            <p>Respecting your motion preferences - no animation used.</p>
        `;
    } else {
        safeViewTransition(() => {
            demo1Content.innerHTML = `
                <h3>Animated Update</h3>
                <p>You don't have reduced motion preference - smooth animation applied!</p>
            `;
        });
    }
};

// Example 3: Custom transition duration
window.demo_customDuration = function(duration = 1000) {
    console.log(`Setting custom transition duration: ${duration}ms`);

    document.documentElement.style.setProperty('--custom-duration', `${duration}ms`);

    safeViewTransition(() => {
        demo1Content.innerHTML = `
            <h3>Custom Duration</h3>
            <p>This transition took ${duration}ms!</p>
        `;
    });

    // Reset to default after transition
    setTimeout(() => {
        document.documentElement.style.removeProperty('--custom-duration');
    }, duration + 100);
};

// Example 4: Multiple simultaneous transitions
window.demo_multipleTransitions = function() {
    console.log('Triggering multiple element transitions...');

    safeViewTransition(() => {
        // Update demo 1 content
        demo1Content.innerHTML = `
            <h3>Multi-Element Transition</h3>
            <p>Multiple elements transitioning simultaneously!</p>
        `;

        // Update gallery
        updateGallery((currentImageIndex + 1) % galleryImages.length);
    });
};

// Example 5: Programmatic card expansion
window.demo_expandAllCards = function() {
    console.log('Expanding all cards with staggered transitions...');

    cards.forEach((card, index) => {
        setTimeout(() => {
            const cardId = card.getAttribute('data-card-id');

            safeViewTransition(() => {
                card.classList.add('expanded');
                card.style.viewTransitionName = `card-${cardId}`;
            });
        }, index * 150); // Stagger by 150ms
    });
};

window.demo_collapseAllCards = function() {
    console.log('Collapsing all cards...');

    safeViewTransition(() => {
        cards.forEach(card => {
            card.classList.remove('expanded');
            card.style.viewTransitionName = '';
        });
    });
};

// Log available demo functions
console.log('%cView Transitions API - Console Demos Available:', 'color: #667eea; font-size: 16px; font-weight: bold;');
console.log('Try these functions in the console:');
console.log('  demo_transitionWithCallbacks() - See transition lifecycle');
console.log('  demo_respectReducedMotion() - Test reduced motion support');
console.log('  demo_customDuration(1000) - Set custom duration (ms)');
console.log('  demo_multipleTransitions() - Transition multiple elements');
console.log('  demo_expandAllCards() - Expand all cards with stagger');
console.log('  demo_collapseAllCards() - Collapse all cards');

// ============================================
// Performance Monitoring
// ============================================

if (supportsViewTransitions && performance.mark) {
    // Monitor transition performance
    let transitionCount = 0;

    const originalStartViewTransition = document.startViewTransition.bind(document);

    document.startViewTransition = function(callback) {
        transitionCount++;
        const id = `transition-${transitionCount}`;

        performance.mark(`${id}-start`);

        const transition = originalStartViewTransition(callback);

        transition.finished.then(() => {
            performance.mark(`${id}-end`);
            performance.measure(id, `${id}-start`, `${id}-end`);

            const measure = performance.getEntriesByName(id)[0];
            console.log(`Transition ${transitionCount} took ${measure.duration.toFixed(2)}ms`);
        });

        return transition;
    };
}

// ============================================
// Utility Functions
// ============================================

// Function to demonstrate error handling
window.demo_errorHandling = async function() {
    try {
        const transition = safeViewTransition(() => {
            // Intentionally cause an error
            throw new Error('Demo error in transition');
        });

        await transition.finished;
    } catch (error) {
        console.error('Caught transition error:', error);
        alert('Transition error handled gracefully!');
    }
};

// Function to demonstrate async updates
window.demo_asyncUpdate = async function() {
    console.log('Starting async transition...');

    const transition = safeViewTransition(async () => {
        // Simulate async data fetch
        demo1Content.innerHTML = '<h3>Loading...</h3>';

        await new Promise(resolve => setTimeout(resolve, 1000));

        demo1Content.innerHTML = `
            <h3>Async Data Loaded</h3>
            <p>This content was fetched asynchronously during the transition!</p>
        `;
    });

    await transition.finished;
    console.log('Async transition complete');
};

// Add these to the console help
console.log('  demo_errorHandling() - Test error handling');
console.log('  demo_asyncUpdate() - Test async data updates');

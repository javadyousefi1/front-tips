# Web Animations API

A comprehensive guide to the Web Animations API with 6 practical examples demonstrating how to create powerful, performant animations using JavaScript's `animate(keyframes, options)` method.

## What is the Web Animations API?

The **Web Animations API** provides a unified, powerful way to create and control animations in JavaScript. It combines the performance benefits of CSS animations with the flexibility and control of JavaScript, giving you the best of both worlds.

## Key Method: element.animate()

The core method that creates animations on any element.

```javascript
const animation = element.animate(keyframes, options);
```

### Syntax

```javascript
element.animate(keyframes, options)
```

**Parameters:**
- **keyframes**: Array of objects defining the animation states
- **options**: Object or number (duration) defining animation behavior

**Returns:** An `Animation` object with full playback control

## Keyframes

Keyframes define the animation's visual states over time.

### Array Format

```javascript
element.animate([
    { transform: 'translateX(0px)' },      // From (0%)
    { transform: 'translateX(100px)' }     // To (100%)
], {
    duration: 1000
});
```

### Object Format with Offsets

```javascript
element.animate([
    { transform: 'scale(1)', offset: 0 },       // 0%
    { transform: 'scale(1.5)', offset: 0.5 },   // 50%
    { transform: 'scale(1)', offset: 1 }        // 100%
], {
    duration: 2000
});
```

### Multiple Properties

```javascript
element.animate([
    {
        opacity: 0,
        transform: 'translateY(-20px) scale(0.5)',
        backgroundColor: '#ff0000'
    },
    {
        opacity: 1,
        transform: 'translateY(0px) scale(1)',
        backgroundColor: '#00ff00'
    }
], {
    duration: 1000
});
```

## Options

Options control the animation timing and behavior.

### Basic Options

```javascript
{
    duration: 1000,          // Animation length in milliseconds
    easing: 'ease-in-out',   // Timing function
    delay: 0,                // Delay before starting (ms)
    iterations: 1,           // Number of times to repeat (Infinity for loop)
    direction: 'normal',     // 'normal', 'reverse', 'alternate', 'alternate-reverse'
    fill: 'none'            // 'none', 'forwards', 'backwards', 'both'
}
```

### Shorthand (Duration Only)

```javascript
element.animate(keyframes, 1000); // Just duration
```

### All Available Options

```javascript
{
    // Timing
    duration: 1000,               // Duration in ms or 'auto'
    delay: 0,                     // Delay before start (ms)
    endDelay: 0,                  // Delay after end (ms)

    // Repetition
    iterations: 1,                // Number or Infinity
    iterationStart: 0,            // Starting iteration (0-1)

    // Direction
    direction: 'normal',          // 'normal', 'reverse', 'alternate', 'alternate-reverse'

    // Fill mode
    fill: 'none',                 // 'none', 'forwards', 'backwards', 'both', 'auto'

    // Easing
    easing: 'linear',             // CSS easing function

    // Composite
    composite: 'replace',         // 'replace', 'add', 'accumulate'
    iterationComposite: 'replace' // 'replace', 'accumulate'
}
```

## Animation Object Methods

The returned `Animation` object provides full control.

### Playback Control

```javascript
const animation = element.animate(keyframes, options);

animation.play();        // Start or resume
animation.pause();       // Pause
animation.reverse();     // Reverse direction
animation.cancel();      // Cancel and reset
animation.finish();      // Jump to end
```

### Properties

```javascript
animation.playbackRate = 2;      // Double speed
animation.playbackRate = 0.5;    // Half speed
animation.playbackRate = -1;     // Play backwards

animation.currentTime = 500;     // Jump to 500ms
animation.startTime;             // When animation started
```

### Events

```javascript
animation.onfinish = () => {
    console.log('Animation complete!');
};

animation.oncancel = () => {
    console.log('Animation cancelled');
};

// Or using addEventListener
animation.addEventListener('finish', () => {
    console.log('Finished!');
});
```

### Promises

```javascript
// Wait for animation to finish
animation.finished.then(() => {
    console.log('Animation done!');
});

// Wait for animation to be ready
animation.ready.then(() => {
    console.log('Animation ready to play');
});
```

## Demos Included

### 1. Basic Fade & Slide Animation
Simple opacity and transform animations.

**Use Case**: Page element entrance animations.

```javascript
const box = document.querySelector('.box');

box.animate([
    { opacity: 0, transform: 'translateY(-50px)' },
    { opacity: 1, transform: 'translateY(0px)' }
], {
    duration: 800,
    easing: 'ease-out',
    fill: 'forwards'
});
```

### 2. Bounce Effect
Create elastic, bouncing animations.

**Use Case**: Button clicks, notifications, attention grabbers.

```javascript
button.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(1.3)' },
    { transform: 'scale(0.9)' },
    { transform: 'scale(1.1)' },
    { transform: 'scale(1)' }
], {
    duration: 600,
    easing: 'ease-in-out'
});
```

### 3. Continuous Rotation
Infinite spinning animations.

**Use Case**: Loading spinners, rotating icons.

```javascript
const spinner = document.querySelector('.spinner');

spinner.animate([
    { transform: 'rotate(0deg)' },
    { transform: 'rotate(360deg)' }
], {
    duration: 2000,
    iterations: Infinity,
    easing: 'linear'
});
```

### 4. Playback Control
Control animation playback dynamically.

**Use Case**: Interactive animations, pause/resume functionality.

```javascript
const animation = element.animate(keyframes, options);

pauseBtn.onclick = () => animation.pause();
playBtn.onclick = () => animation.play();
reverseBtn.onclick = () => animation.reverse();
speedBtn.onclick = () => animation.playbackRate *= 2;
```

### 5. Chained Animations
Sequence multiple animations.

**Use Case**: Multi-step animation sequences.

```javascript
async function animateSequence(element) {
    // Step 1: Fade in
    await element.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 500,
        fill: 'forwards'
    }).finished;

    // Step 2: Slide right
    await element.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(200px)' }
    ], {
        duration: 800,
        fill: 'forwards'
    }).finished;

    // Step 3: Rotate
    await element.animate([
        { transform: 'translateX(200px) rotate(0deg)' },
        { transform: 'translateX(200px) rotate(360deg)' }
    ], {
        duration: 600,
        fill: 'forwards'
    }).finished;
}
```

### 6. Complex Multi-Property Animation
Animate multiple properties simultaneously.

**Use Case**: Rich, complex UI transitions.

```javascript
card.animate([
    {
        opacity: 0,
        transform: 'perspective(1000px) rotateY(-90deg) scale(0.5)',
        filter: 'blur(10px)',
        offset: 0
    },
    {
        opacity: 1,
        transform: 'perspective(1000px) rotateY(0deg) scale(1)',
        filter: 'blur(0px)',
        offset: 1
    }
], {
    duration: 1200,
    easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
    fill: 'forwards'
});
```

## Real-World Use Cases

### 1. Loading Spinner

```javascript
function createSpinner() {
    const spinner = document.querySelector('.spinner');

    return spinner.animate([
        { transform: 'rotate(0deg)' },
        { transform: 'rotate(360deg)' }
    ], {
        duration: 1000,
        iterations: Infinity,
        easing: 'linear'
    });
}

// Usage
const spinnerAnimation = createSpinner();

// Stop when loading complete
fetch('/api/data')
    .then(response => response.json())
    .then(data => {
        spinnerAnimation.cancel();
        showData(data);
    });
```

### 2. Notification Toast

```javascript
function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Slide in from bottom
    const slideIn = toast.animate([
        { transform: 'translateY(100%)', opacity: 0 },
        { transform: 'translateY(0%)', opacity: 1 }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    });

    // Wait 3 seconds, then slide out
    slideIn.finished.then(() => {
        setTimeout(() => {
            toast.animate([
                { transform: 'translateY(0%)', opacity: 1 },
                { transform: 'translateY(100%)', opacity: 0 }
            ], {
                duration: 300,
                easing: 'ease-in',
                fill: 'forwards'
            }).finished.then(() => {
                toast.remove();
            });
        }, 3000);
    });
}

showToast('Changes saved!');
```

### 3. Page Transition

```javascript
async function transitionPage(newContent) {
    const page = document.querySelector('.page');

    // Fade out current content
    await page.animate([
        { opacity: 1, transform: 'translateX(0px)' },
        { opacity: 0, transform: 'translateX(-50px)' }
    ], {
        duration: 300,
        easing: 'ease-in',
        fill: 'forwards'
    }).finished;

    // Update content
    page.innerHTML = newContent;

    // Fade in new content
    await page.animate([
        { opacity: 0, transform: 'translateX(50px)' },
        { opacity: 1, transform: 'translateX(0px)' }
    ], {
        duration: 300,
        easing: 'ease-out',
        fill: 'forwards'
    }).finished;
}
```

### 4. Scroll-Triggered Animation

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.animate([
                {
                    opacity: 0,
                    transform: 'translateY(50px)'
                },
                {
                    opacity: 1,
                    transform: 'translateY(0px)'
                }
            ], {
                duration: 800,
                easing: 'ease-out',
                fill: 'forwards'
            });

            observer.unobserve(entry.target);
        }
    });
});

document.querySelectorAll('.animate-on-scroll').forEach(el => {
    observer.observe(el);
});
```

### 5. Attention Seeker (Shake)

```javascript
function shakeElement(element) {
    return element.animate([
        { transform: 'translateX(0px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(-10px)' },
        { transform: 'translateX(10px)' },
        { transform: 'translateX(0px)' }
    ], {
        duration: 500,
        easing: 'ease-in-out'
    });
}

// Shake on error
if (formHasErrors) {
    shakeElement(formElement);
}
```

### 6. Modal Dialog Animation

```javascript
function openModal(modal) {
    modal.style.display = 'block';

    // Backdrop fade in
    const backdrop = modal.querySelector('.backdrop');
    backdrop.animate([
        { opacity: 0 },
        { opacity: 1 }
    ], {
        duration: 200,
        fill: 'forwards'
    });

    // Dialog slide & scale in
    const dialog = modal.querySelector('.dialog');
    return dialog.animate([
        {
            opacity: 0,
            transform: 'scale(0.7) translateY(-50px)'
        },
        {
            opacity: 1,
            transform: 'scale(1) translateY(0px)'
        }
    ], {
        duration: 300,
        easing: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
        fill: 'forwards'
    });
}

async function closeModal(modal) {
    const dialog = modal.querySelector('.dialog');
    const backdrop = modal.querySelector('.backdrop');

    // Animate out
    const dialogAnim = dialog.animate([
        {
            opacity: 1,
            transform: 'scale(1) translateY(0px)'
        },
        {
            opacity: 0,
            transform: 'scale(0.7) translateY(-50px)'
        }
    ], {
        duration: 200,
        easing: 'ease-in',
        fill: 'forwards'
    });

    const backdropAnim = backdrop.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 200,
        fill: 'forwards'
    });

    await Promise.all([dialogAnim.finished, backdropAnim.finished]);
    modal.style.display = 'none';
}
```

### 7. Typing Effect Animation

```javascript
function typeText(element, text, speed = 50) {
    element.textContent = '';
    let index = 0;

    return new Promise((resolve) => {
        const interval = setInterval(() => {
            element.textContent += text[index];
            index++;

            if (index >= text.length) {
                clearInterval(interval);
                resolve();
            }
        }, speed);
    });
}

// Or using Web Animations API for cursor blink
function addBlinkingCursor(element) {
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.className = 'cursor';
    element.appendChild(cursor);

    cursor.animate([
        { opacity: 1 },
        { opacity: 0 }
    ], {
        duration: 600,
        iterations: Infinity,
        direction: 'alternate'
    });
}
```

### 8. Progress Bar Animation

```javascript
function animateProgress(progressBar, targetPercent) {
    return progressBar.animate([
        { width: progressBar.style.width || '0%' },
        { width: targetPercent + '%' }
    ], {
        duration: 1000,
        easing: 'ease-out',
        fill: 'forwards'
    });
}

// Usage
animateProgress(progressElement, 75).finished.then(() => {
    console.log('Progress complete!');
});
```

## Advanced Patterns

### Dynamic Keyframe Generation

```javascript
function createWaveAnimation(element, amplitude, frequency) {
    const keyframes = [];
    const steps = 50;

    for (let i = 0; i <= steps; i++) {
        const progress = i / steps;
        const y = Math.sin(progress * frequency * Math.PI * 2) * amplitude;

        keyframes.push({
            transform: `translateY(${y}px)`,
            offset: progress
        });
    }

    return element.animate(keyframes, {
        duration: 2000,
        iterations: Infinity
    });
}

createWaveAnimation(element, 20, 3);
```

### Animation Groups

```javascript
function animateGroup(elements, keyframes, options) {
    const animations = [];

    elements.forEach((element, index) => {
        const staggerDelay = index * 100; // Stagger by 100ms

        const animation = element.animate(keyframes, {
            ...options,
            delay: options.delay + staggerDelay
        });

        animations.push(animation);
    });

    // Return promise that resolves when all complete
    return Promise.all(animations.map(a => a.finished));
}

// Usage
const items = document.querySelectorAll('.list-item');
animateGroup(items, [
    { opacity: 0, transform: 'translateX(-50px)' },
    { opacity: 1, transform: 'translateX(0px)' }
], {
    duration: 500,
    delay: 0,
    fill: 'forwards'
});
```

### Custom Easing Functions

```javascript
// Elastic easing
const elasticEasing = 'cubic-bezier(0.68, -0.55, 0.265, 1.55)';

element.animate(keyframes, {
    duration: 800,
    easing: elasticEasing
});

// Common custom easings
const easings = {
    easeInBack: 'cubic-bezier(0.6, -0.28, 0.735, 0.045)',
    easeOutBack: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    easeInOutBack: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    easeInCirc: 'cubic-bezier(0.6, 0.04, 0.98, 0.335)',
    easeOutCirc: 'cubic-bezier(0.075, 0.82, 0.165, 1)',
    easeInOutCirc: 'cubic-bezier(0.785, 0.135, 0.15, 0.86)'
};
```

### Animation Timeline

```javascript
class AnimationTimeline {
    constructor() {
        this.animations = [];
    }

    add(element, keyframes, options, offset = 0) {
        this.animations.push({
            element,
            keyframes,
            options: { ...options, delay: (options.delay || 0) + offset }
        });
        return this;
    }

    async play() {
        const animations = this.animations.map(({ element, keyframes, options }) =>
            element.animate(keyframes, options)
        );

        await Promise.all(animations.map(a => a.finished));
    }
}

// Usage
const timeline = new AnimationTimeline();

timeline
    .add(title, fadeInKeyframes, { duration: 500 }, 0)
    .add(subtitle, slideInKeyframes, { duration: 500 }, 200)
    .add(button, bounceKeyframes, { duration: 600 }, 400)
    .play();
```

## Easing Functions

Common easing functions you can use:

```javascript
// Linear
'linear'

// Ease variations
'ease'
'ease-in'
'ease-out'
'ease-in-out'

// Cubic bezier (custom)
'cubic-bezier(0.4, 0.0, 0.2, 1)'

// Steps (for frame-by-frame animation)
'steps(4, end)'
'steps(10, start)'
```

### Easing Visualizer Reference

- **linear**: Constant speed
- **ease**: Slow start, fast middle, slow end
- **ease-in**: Slow start, accelerates
- **ease-out**: Fast start, decelerates
- **ease-in-out**: Slow start and end
- **cubic-bezier(x1, y1, x2, y2)**: Custom curve

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 36+     |
| Firefox | 48+     |
| Safari  | 13.1+   |
| Edge    | 79+     |
| Opera   | 23+     |

**Support:** ~95% of users globally

### Feature Detection

```javascript
if (Element.prototype.animate) {
    // Use Web Animations API
    element.animate(keyframes, options);
} else {
    // Fallback to CSS animations
    element.classList.add('animated');
}
```

### Polyfill

For older browsers:

```html
<script src="https://cdn.jsdelivr.net/npm/web-animations-js@2.3.2/web-animations.min.js"></script>
```

## Best Practices

### 1. Use `fill: 'forwards'` to Persist End State

```javascript
// ✓ Good - Animation persists
element.animate(keyframes, {
    duration: 1000,
    fill: 'forwards'  // Keeps final state
});

// ✗ Bad - Snaps back to original
element.animate(keyframes, {
    duration: 1000
    // No fill, element jumps back
});
```

### 2. Clean Up Animations

```javascript
// ✓ Good - Cancel when done
const animation = element.animate(keyframes, options);

window.addEventListener('beforeunload', () => {
    animation.cancel();
});

// Or store reference and cancel when needed
elementData.animation = animation;

function cleanup() {
    if (elementData.animation) {
        elementData.animation.cancel();
    }
}
```

### 3. Use Promises for Sequences

```javascript
// ✓ Good - Clean async/await
async function animateSequence() {
    await step1Animation.finished;
    await step2Animation.finished;
    await step3Animation.finished;
}

// ✗ Bad - Callback hell
step1Animation.onfinish = () => {
    step2Animation.onfinish = () => {
        step3Animation.onfinish = () => {
            // Nested mess
        };
    };
};
```

### 4. Prefer Transform & Opacity for Performance

```javascript
// ✓ Good - GPU accelerated
element.animate([
    { opacity: 0, transform: 'translateX(0px)' },
    { opacity: 1, transform: 'translateX(100px)' }
], options);

// ✗ Bad - Triggers layout recalculation
element.animate([
    { left: '0px', top: '0px' },
    { left: '100px', top: '100px' }
], options);
```

### 5. Store Animation References

```javascript
// ✓ Good - Can control later
const animations = new Map();

function startAnimation(id, element, keyframes, options) {
    const animation = element.animate(keyframes, options);
    animations.set(id, animation);
    return animation;
}

function stopAnimation(id) {
    const animation = animations.get(id);
    if (animation) {
        animation.cancel();
        animations.delete(id);
    }
}
```

## Common Pitfalls

### 1. Forgetting `fill: 'forwards'`

```javascript
// ✗ Animation jumps back to start
element.animate([
    { opacity: 0 },
    { opacity: 1 }
], 1000);

// ✓ Stays at end state
element.animate([
    { opacity: 0 },
    { opacity: 1 }
], {
    duration: 1000,
    fill: 'forwards'
});
```

### 2. Not Handling Promises

```javascript
// ✗ Might cause issues if animation is cancelled
animation.finished.then(() => {
    doSomething(); // Might never run if cancelled
});

// ✓ Handle cancellation
animation.finished
    .then(() => doSomething())
    .catch(err => console.log('Animation cancelled'));
```

### 3. Animating Expensive Properties

```javascript
// ✗ Bad - Forces layout
element.animate([
    { width: '100px', height: '100px' },
    { width: '200px', height: '200px' }
], 1000);

// ✓ Good - Use transform
element.animate([
    { transform: 'scale(1)' },
    { transform: 'scale(2)' }
], 1000);
```

### 4. Not Cancelling Infinite Animations

```javascript
// ✗ Memory leak
element.animate(keyframes, {
    iterations: Infinity
});
// Never cancelled!

// ✓ Store and cancel when needed
const spinner = element.animate(keyframes, {
    iterations: Infinity
});

// Later...
spinner.cancel();
```

## Performance Tips

### 1. Use `will-change` for Complex Animations

```css
.animated-element {
    will-change: transform, opacity;
}
```

### 2. Limit Simultaneous Animations

```javascript
// Limit number of active animations
const MAX_ANIMATIONS = 20;
const activeAnimations = new Set();

function startAnimation(animation) {
    if (activeAnimations.size >= MAX_ANIMATIONS) {
        // Cancel oldest
        const oldest = activeAnimations.values().next().value;
        oldest.cancel();
        activeAnimations.delete(oldest);
    }

    activeAnimations.add(animation);

    animation.finished.finally(() => {
        activeAnimations.delete(animation);
    });
}
```

### 3. Use `requestAnimationFrame` for Updates

```javascript
function updateProgress(animation, progressElement) {
    function update() {
        const progress = (animation.currentTime / animation.effect.getTiming().duration) * 100;
        progressElement.textContent = Math.round(progress) + '%';

        if (animation.playState !== 'finished') {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
```

## Resources

- [MDN Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Can I Use](https://caniuse.com/web-animation)
- [Polyfill](https://github.com/web-animations/web-animations-js)
- [Easing Functions Cheat Sheet](https://easings.net/)

## Files

- **index.html** - Interactive demos page
- **style.css** - Styling for all demos
- **script.js** - All 6 demo implementations
- **README.md** - This documentation

## Running the Examples

Open `index.html` in a browser to interact with all 6 animation demos!

## License

Free to use for learning and projects.

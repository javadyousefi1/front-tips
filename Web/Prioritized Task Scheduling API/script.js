/**
 * Prioritized Task Scheduling API - Complete Examples
 * From Simple to Advanced
 */

// ========================================
// UTILITY FUNCTIONS
// ========================================

/**
 * Helper function to add log to output div
 */
function addLog(outputId, message, type = 'info') {
    const output = document.getElementById(outputId);
    const logDiv = document.createElement('div');
    logDiv.className = `log-${type}`;
    logDiv.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    output.appendChild(logDiv);
    output.scrollTop = output.scrollHeight;

    // Also log to console for detailed debugging
    console.log(`[${type.toUpperCase()}] ${message}`);
}

/**
 * Helper to clear output
 */
function clearOutput(outputId) {
    document.getElementById(outputId).innerHTML = '';
}

/**
 * Helper to simulate heavy computation
 */
function heavyComputation(iterations = 1000000) {
    let result = 0;
    for (let i = 0; i < iterations; i++) {
        result += Math.sqrt(i);
    }
    return result;
}

/**
 * Helper to simulate async operation
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ========================================
// BROWSER SUPPORT CHECK
// ========================================

function checkBrowserSupport() {
    const supportInfo = document.getElementById('supportInfo');

    if ('scheduler' in window && 'postTask' in scheduler) {
        supportInfo.innerHTML = `
            <span class="success">✅ Your browser supports the Prioritized Task Scheduling API!</span><br>
            <small>You can use all demos on this page.</small>
        `;
    } else {
        supportInfo.innerHTML = `
            <span class="error">❌ Your browser does NOT support this API yet.</span><br>
            <small>Try Chrome 94+, Edge 94+, or Opera 80+</small><br>
            <small>A polyfill will be simulated for demonstration purposes.</small>
        `;

        // Simple polyfill for demonstration
        if (!('scheduler' in window)) {
            window.scheduler = {
                postTask: function(callback, options = {}) {
                    return new Promise((resolve) => {
                        const delay = options.priority === 'user-blocking' ? 0 :
                                     options.priority === 'user-visible' ? 10 : 100;
                        setTimeout(() => resolve(callback()), delay);
                    });
                }
            };
        }
    }
}

// ========================================
// DEMO 1: BASIC PRIORITY DEMONSTRATION (SIMPLE)
// ========================================

async function runBasicDemo() {
    const btn = document.getElementById('basicDemo');
    btn.disabled = true;
    clearOutput('basicOutput');

    addLog('basicOutput', '🚀 Starting basic priority demonstration...', 'info');
    addLog('basicOutput', 'Scheduling 3 tasks with different priorities', 'info');

    try {
        // Schedule tasks with different priorities
        // They will execute in priority order: user-blocking > user-visible > background

        scheduler.postTask(() => {
            addLog('basicOutput', '🟢 Background task executed (lowest priority)', 'background');
            return 'Background task complete';
        }, { priority: 'background' });

        scheduler.postTask(() => {
            addLog('basicOutput', '🟡 User-visible task executed (medium priority)', 'visible');
            return 'User-visible task complete';
        }, { priority: 'user-visible' });

        scheduler.postTask(() => {
            addLog('basicOutput', '🔴 User-blocking task executed (highest priority)', 'blocking');
            return 'User-blocking task complete';
        }, { priority: 'user-blocking' });

        await delay(100);
        addLog('basicOutput', '✅ Notice the execution order: blocking → visible → background', 'info');

    } catch (error) {
        addLog('basicOutput', `❌ Error: ${error.message}`, 'error');
    }

    btn.disabled = false;
}

// ========================================
// DEMO 2: UI UPDATES PRIORITY (INTERMEDIATE)
// ========================================

async function runUIDemo() {
    const btn = document.getElementById('uiDemo');
    btn.disabled = true;
    clearOutput('uiOutput');

    const criticalCounter = document.getElementById('criticalCounter');
    const backgroundCounter = document.getElementById('backgroundCounter');

    let criticalCount = 0;
    let backgroundCount = 0;

    addLog('uiOutput', '🎨 Starting UI updates demo...', 'info');
    addLog('uiOutput', 'Critical UI updates use user-blocking priority', 'blocking');
    addLog('uiOutput', 'Background updates use background priority', 'background');

    // Simulate 20 updates
    for (let i = 0; i < 20; i++) {
        // Critical UI update (user-blocking)
        scheduler.postTask(() => {
            criticalCount++;
            criticalCounter.textContent = `Counter: ${criticalCount}`;
            criticalCounter.parentElement.classList.add('loading');
            setTimeout(() => criticalCounter.parentElement.classList.remove('loading'), 100);
        }, { priority: 'user-blocking' });

        // Background processing (background)
        scheduler.postTask(() => {
            backgroundCount++;
            backgroundCounter.textContent = `Processing: ${backgroundCount}`;
            // Simulate heavy work
            heavyComputation(100000);
        }, { priority: 'background' });
    }

    // Wait for all tasks to complete
    await delay(1000);

    addLog('uiOutput', `✅ Critical counter updated ${criticalCount} times`, 'blocking');
    addLog('uiOutput', `✅ Background processed ${backgroundCount} items`, 'background');
    addLog('uiOutput', '💡 Critical UI stayed responsive while background work happened!', 'info');

    btn.disabled = false;
}

// ========================================
// DEMO 3: DATA PROCESSING (INTERMEDIATE)
// ========================================

async function runDataDemo() {
    const btn = document.getElementById('dataDemo');
    btn.disabled = true;
    clearOutput('dataOutput');

    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalItems = 10000;
    const batchSize = 100;
    let processedItems = 0;

    addLog('dataOutput', `📊 Processing ${totalItems} items in batches of ${batchSize}...`, 'info');
    addLog('dataOutput', 'Using background priority to avoid blocking UI', 'background');

    progressBar.style.background = '#e0e0e0';

    // Process data in batches using background priority
    for (let i = 0; i < totalItems; i += batchSize) {
        await scheduler.postTask(async () => {
            // Simulate batch processing
            for (let j = i; j < Math.min(i + batchSize, totalItems); j++) {
                // Process item
                Math.sqrt(j) * Math.random();
                processedItems++;
            }

            // Update progress (this runs as background task, won't block UI)
            const progress = (processedItems / totalItems) * 100;
            progressBar.style.background = `linear-gradient(90deg, #667eea ${progress}%, #e0e0e0 ${progress}%)`;
            progressText.textContent = `Processing: ${processedItems} / ${totalItems} (${Math.round(progress)}%)`;

        }, { priority: 'background' });

        // Small delay to allow UI updates
        await delay(10);
    }

    addLog('dataOutput', `✅ Successfully processed ${processedItems} items`, 'background');
    addLog('dataOutput', '💡 UI remained responsive during processing!', 'info');
    progressText.textContent = `Complete! Processed ${totalItems} items`;

    btn.disabled = false;
}

// ========================================
// DEMO 4: TASK ABORTION & CONTROL (ADVANCED)
// ========================================

let currentTaskController = null;

async function startAbortableTask() {
    const startBtn = document.getElementById('startAbortDemo');
    const abortBtn = document.getElementById('abortTask');
    startBtn.disabled = true;
    abortBtn.disabled = false;
    clearOutput('abortOutput');

    // Create a TaskController (similar to AbortController)
    currentTaskController = new TaskController();

    addLog('abortOutput', '🚀 Starting long-running task...', 'info');
    addLog('abortOutput', 'This task will run for 10 seconds unless aborted', 'visible');

    try {
        // Schedule a long task with the controller's signal
        await scheduler.postTask(async () => {
            for (let i = 1; i <= 10; i++) {
                // Check if task was aborted
                if (currentTaskController.signal.aborted) {
                    throw new DOMException('Task was aborted', 'AbortError');
                }

                addLog('abortOutput', `⏳ Working... Step ${i}/10`, 'visible');
                await delay(1000);
            }

            addLog('abortOutput', '✅ Task completed successfully!', 'background');

        }, {
            priority: 'user-visible',
            signal: currentTaskController.signal
        });

    } catch (error) {
        if (error.name === 'AbortError') {
            addLog('abortOutput', '🛑 Task was aborted by user!', 'error');
        } else {
            addLog('abortOutput', `❌ Error: ${error.message}`, 'error');
        }
    }

    startBtn.disabled = false;
    abortBtn.disabled = true;
    currentTaskController = null;
}

function abortTask() {
    if (currentTaskController) {
        addLog('abortOutput', '⚠️ Aborting task...', 'warning');
        currentTaskController.abort();
    }
}

// TaskController polyfill if not available
if (typeof TaskController === 'undefined') {
    window.TaskController = class TaskController {
        constructor() {
            this.signal = {
                aborted: false,
                addEventListener: () => {},
                removeEventListener: () => {}
            };
        }
        abort() {
            this.signal.aborted = true;
        }
    };
}

// ========================================
// DEMO 5: REAL-WORLD APP SIMULATION (ADVANCED)
// ========================================

async function runRealWorldDemo() {
    const btn = document.getElementById('realWorldDemo');
    btn.disabled = true;
    clearOutput('realWorldOutput');

    const userMetric = document.getElementById('userMetric');
    const apiMetric = document.getElementById('apiMetric');
    const analyticsMetric = document.getElementById('analyticsMetric');
    const cacheMetric = document.getElementById('cacheMetric');

    let userCount = 0;
    let apiCount = 0;
    let analyticsCount = 0;
    let cacheProgress = 0;

    addLog('realWorldOutput', '🌐 Simulating real-world application load...', 'info');

    // User-blocking: Critical user interactions (highest priority)
    addLog('realWorldOutput', '🔴 Handling critical user interactions...', 'blocking');
    for (let i = 0; i < 5; i++) {
        scheduler.postTask(async () => {
            userCount++;
            userMetric.textContent = `${userCount} handled`;
            addLog('realWorldOutput', `User click #${userCount} handled immediately`, 'blocking');
            await delay(50);
        }, { priority: 'user-blocking' });
    }

    // User-visible: API calls and data fetching (medium priority)
    addLog('realWorldOutput', '🟡 Fetching data from APIs...', 'visible');
    for (let i = 0; i < 3; i++) {
        scheduler.postTask(async () => {
            // Simulate API call
            await delay(200);
            apiCount++;
            apiMetric.textContent = `${apiCount} completed`;
            addLog('realWorldOutput', `API call #${apiCount} completed`, 'visible');
        }, { priority: 'user-visible' });
    }

    // Background: Analytics tracking (low priority)
    addLog('realWorldOutput', '🟢 Sending analytics events...', 'background');
    for (let i = 0; i < 10; i++) {
        scheduler.postTask(async () => {
            analyticsCount++;
            analyticsMetric.textContent = `${analyticsCount} sent`;
            heavyComputation(50000); // Simulate processing
        }, { priority: 'background' });
    }

    // Background: Cache warmup (lowest priority)
    addLog('realWorldOutput', '🟢 Warming up cache...', 'background');
    for (let i = 0; i < 20; i++) {
        scheduler.postTask(async () => {
            cacheProgress += 5;
            cacheMetric.textContent = `${cacheProgress}% complete`;
            heavyComputation(30000);
        }, { priority: 'background' });
    }

    // Wait for all tasks
    await delay(2000);

    addLog('realWorldOutput', '✅ All tasks completed!', 'info');
    addLog('realWorldOutput', '💡 Notice how critical tasks finished first, then API calls, then analytics', 'info');

    btn.disabled = false;
}

// ========================================
// DEMO 6: PRIORITY COMPARISON (ADVANCED)
// ========================================

async function runComparisonDemo() {
    const btn = document.getElementById('comparisonDemo');
    btn.disabled = true;

    const withoutPriority = document.getElementById('withoutPriority');
    const withPriority = document.getElementById('withPriority');

    withoutPriority.innerHTML = '';
    withPriority.innerHTML = '';

    console.log('🔬 Starting comparison demo...');

    // WITHOUT PRIORITIES (setTimeout - execution order unpredictable)
    const tasks = [
        { name: 'Analytics Event', type: 'background', color: '#d4edda' },
        { name: 'Button Click', type: 'blocking', color: '#ffe5e5' },
        { name: 'API Response', type: 'visible', color: '#fff3cd' },
        { name: 'Prefetch Data', type: 'background', color: '#d4edda' },
        { name: 'UI Update', type: 'blocking', color: '#ffe5e5' },
    ];

    console.log('Without priorities (setTimeout):');
    tasks.forEach((task, index) => {
        setTimeout(() => {
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.background = task.color;
            item.textContent = `${index + 1}. ${task.name}`;
            withoutPriority.appendChild(item);
            console.log(`  ${index + 1}. ${task.name}`);
        }, Math.random() * 100);
    });

    // WITH PRIORITIES (scheduler.postTask - correct order guaranteed)
    await delay(200);
    console.log('With priorities (scheduler.postTask):');

    const priorityMap = {
        'blocking': 'user-blocking',
        'visible': 'user-visible',
        'background': 'background'
    };

    let executionOrder = 0;

    tasks.forEach(task => {
        scheduler.postTask(() => {
            executionOrder++;
            const item = document.createElement('div');
            item.className = 'timeline-item';
            item.style.background = task.color;
            item.textContent = `${executionOrder}. ${task.name} [${task.type}]`;
            withPriority.appendChild(item);
            console.log(`  ${executionOrder}. ${task.name} [${task.type}]`);
        }, { priority: priorityMap[task.type] });
    });

    await delay(500);

    console.log('✅ Comparison complete!');
    console.log('Notice how WITH priorities, blocking tasks execute first, then visible, then background');

    btn.disabled = false;
}

// ========================================
// EVENT LISTENERS
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Check browser support
    checkBrowserSupport();

    // Demo 1: Basic
    document.getElementById('basicDemo').addEventListener('click', runBasicDemo);

    // Demo 2: UI Updates
    document.getElementById('uiDemo').addEventListener('click', runUIDemo);

    // Demo 3: Data Processing
    document.getElementById('dataDemo').addEventListener('click', runDataDemo);

    // Demo 4: Task Abortion
    document.getElementById('startAbortDemo').addEventListener('click', startAbortableTask);
    document.getElementById('abortTask').addEventListener('click', abortTask);
    document.getElementById('abortTask').disabled = true;

    // Demo 5: Real-world
    document.getElementById('realWorldDemo').addEventListener('click', runRealWorldDemo);

    // Demo 6: Comparison
    document.getElementById('comparisonDemo').addEventListener('click', runComparisonDemo);

    console.log('🎯 Prioritized Task Scheduling API Demo Ready!');
    console.log('Click any demo button to see examples');
});

// ========================================
// ADDITIONAL EXAMPLES FOR LEARNING
// ========================================

/**
 * Example: Dynamic Priority Change
 * You can change task priority dynamically using TaskController
 */
function exampleDynamicPriority() {
    const controller = new TaskController({ priority: 'background' });

    scheduler.postTask(() => {
        console.log('This task started as background priority');
    }, { signal: controller.signal });

    // Change priority dynamically
    controller.setPriority('user-blocking');
    console.log('Priority changed to user-blocking!');
}

/**
 * Example: Yielding to Main Thread
 * Use scheduler.yield() to break up long tasks
 */
async function exampleYielding() {
    for (let i = 0; i < 100; i++) {
        // Do some work
        heavyComputation(10000);

        // Yield to main thread every 10 iterations
        if (i % 10 === 0) {
            await scheduler.yield();
        }
    }
}

/**
 * Example: Prioritizing Multiple Tasks
 */
async function exampleMultipleTasks() {
    // High priority: Update UI
    const uiTask = scheduler.postTask(() => {
        document.body.style.background = 'lightblue';
    }, { priority: 'user-blocking' });

    // Medium priority: Fetch data
    const dataTask = scheduler.postTask(async () => {
        const response = await fetch('/api/data');
        return response.json();
    }, { priority: 'user-visible' });

    // Low priority: Log analytics
    const analyticsTask = scheduler.postTask(() => {
        console.log('User visited page');
    }, { priority: 'background' });

    // Wait for all
    await Promise.all([uiTask, dataTask, analyticsTask]);
}

// Export for console experimentation
window.schedulerExamples = {
    exampleDynamicPriority,
    exampleYielding,
    exampleMultipleTasks,
};

console.log('💡 Try these examples in console: window.schedulerExamples');

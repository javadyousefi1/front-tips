// ============================================
// Demo 1: Basic Fetch Abort
// ============================================

let fetchController = null;

document.getElementById('startFetch').addEventListener('click', async () => {
    const output = document.getElementById('fetchOutput');

    // Create a new AbortController
    fetchController = new AbortController();

    output.textContent = 'Fetching data... (This will take 5 seconds)';
    output.className = 'output loading';

    try {
        // Pass the signal to fetch
        const response = await fetch('https://httpbin.org/delay/5', {
            signal: fetchController.signal
        });

        const data = await response.json();

        output.textContent = `✓ Success! Received data:\n${JSON.stringify(data, null, 2)}`;
        output.className = 'output success';

    } catch (error) {
        if (error.name === 'AbortError') {
            output.textContent = '✗ Request was aborted!';
            output.className = 'output error';
        } else {
            output.textContent = `✗ Error: ${error.message}`;
            output.className = 'output error';
        }
    }
});

document.getElementById('abortFetch').addEventListener('click', () => {
    if (fetchController) {
        fetchController.abort();
        fetchController = null;
    }
});

// ============================================
// Demo 2: Fetch with Timeout
// ============================================

document.getElementById('startTimeout').addEventListener('click', async () => {
    const output = document.getElementById('timeoutOutput');
    const timeout = parseInt(document.getElementById('timeoutInput').value) * 1000;

    const controller = new AbortController();

    // Set up automatic timeout
    const timeoutId = setTimeout(() => {
        controller.abort();
    }, timeout);

    output.textContent = `Fetching with ${timeout / 1000}s timeout...`;
    output.className = 'output loading';

    try {
        const response = await fetch('https://httpbin.org/delay/5', {
            signal: controller.signal
        });

        clearTimeout(timeoutId); // Clear timeout if request succeeds

        const data = await response.json();
        output.textContent = `✓ Request completed within timeout!\n${JSON.stringify(data, null, 2)}`;
        output.className = 'output success';

    } catch (error) {
        clearTimeout(timeoutId);

        if (error.name === 'AbortError') {
            output.textContent = `✗ Request timed out after ${timeout / 1000} seconds!`;
            output.className = 'output error';
        } else {
            output.textContent = `✗ Error: ${error.message}`;
            output.className = 'output error';
        }
    }
});

// ============================================
// Demo 3: Multiple Requests
// ============================================

let multipleController = null;

document.getElementById('startMultiple').addEventListener('click', async () => {
    const requestList = document.getElementById('requestList');
    requestList.innerHTML = '';

    // Create single controller for all requests
    multipleController = new AbortController();

    const urls = [
        'https://httpbin.org/delay/2',
        'https://httpbin.org/delay/3',
        'https://httpbin.org/delay/4',
        'https://httpbin.org/delay/1',
        'https://httpbin.org/delay/2'
    ];

    // Start all requests with the same signal
    urls.forEach((url, index) => {
        const item = document.createElement('div');
        item.className = 'request-item loading';
        item.innerHTML = `
            <span>Request ${index + 1}</span>
            <span>Loading...</span>
        `;
        requestList.appendChild(item);

        fetchWithStatus(url, multipleController.signal, item, index + 1);
    });
});

async function fetchWithStatus(url, signal, element, number) {
    try {
        const response = await fetch(url, { signal });
        await response.json();

        element.className = 'request-item completed';
        element.innerHTML = `
            <span>Request ${number}</span>
            <span>✓ Completed</span>
        `;

    } catch (error) {
        if (error.name === 'AbortError') {
            element.className = 'request-item aborted';
            element.innerHTML = `
                <span>Request ${number}</span>
                <span>✗ Aborted</span>
            `;
        } else {
            element.className = 'request-item aborted';
            element.innerHTML = `
                <span>Request ${number}</span>
                <span>✗ Error</span>
            `;
        }
    }
}

document.getElementById('abortMultiple').addEventListener('click', () => {
    if (multipleController) {
        multipleController.abort();
        multipleController = null;
    }
});

// ============================================
// Demo 4: Event Listeners
// ============================================

let eventController = null;

document.getElementById('addListeners').addEventListener('click', () => {
    const output = document.getElementById('eventOutput');

    // Remove previous listeners if any
    if (eventController) {
        eventController.abort();
    }

    // Create new controller
    eventController = new AbortController();
    const { signal } = eventController;

    output.textContent = '✓ Event listeners added! Try interacting with the boxes above.\n';
    output.className = 'output success';

    // Add click listener
    document.getElementById('clickBox').addEventListener('click', () => {
        output.textContent += `[${new Date().toLocaleTimeString()}] Click detected!\n`;
    }, { signal });

    // Add hover listeners
    const hoverBox = document.getElementById('hoverBox');
    hoverBox.addEventListener('mouseenter', () => {
        output.textContent += `[${new Date().toLocaleTimeString()}] Mouse entered!\n`;
        hoverBox.classList.add('hovered');
    }, { signal });

    hoverBox.addEventListener('mouseleave', () => {
        output.textContent += `[${new Date().toLocaleTimeString()}] Mouse left!\n`;
        hoverBox.classList.remove('hovered');
    }, { signal });

    // Add input listener
    document.getElementById('inputBox').addEventListener('input', (e) => {
        output.textContent += `[${new Date().toLocaleTimeString()}] Input: "${e.target.value}"\n`;
    }, { signal });
});

document.getElementById('removeListeners').addEventListener('click', () => {
    const output = document.getElementById('eventOutput');

    if (eventController) {
        eventController.abort();
        eventController = null;

        // Clean up hover state
        document.getElementById('hoverBox').classList.remove('hovered');

        output.textContent = '✗ All event listeners removed!';
        output.className = 'output error';
    } else {
        output.textContent = 'No active listeners to remove.';
        output.className = 'output';
    }
});

// ============================================
// Demo 5: Long Running Operation
// ============================================

let operationController = null;

document.getElementById('startOperation').addEventListener('click', async () => {
    const output = document.getElementById('operationOutput');
    const progressBar = document.getElementById('operationProgress');
    const progressText = document.getElementById('operationProgressText');

    operationController = new AbortController();
    const { signal } = operationController;

    output.textContent = 'Running heavy calculation...';
    output.className = 'output loading';

    try {
        const result = await heavyCalculation(signal, (progress) => {
            progressBar.style.width = progress + '%';
            progressText.textContent = progress + '%';
        });

        output.textContent = `✓ Calculation complete!\nProcessed ${result.toLocaleString()} numbers`;
        output.className = 'output success';

    } catch (error) {
        if (error.name === 'AbortError') {
            output.textContent = '✗ Operation was aborted!';
            output.className = 'output error';
        } else {
            output.textContent = `✗ Error: ${error.message}`;
            output.className = 'output error';
        }
    }
});

async function heavyCalculation(signal, onProgress) {
    const total = 1000000;
    let processed = 0;

    for (let i = 0; i < total; i++) {
        // Check if aborted
        if (signal.aborted) {
            throw new DOMException('Operation aborted', 'AbortError');
        }

        // Simulate work
        Math.sqrt(i);
        processed++;

        // Update progress every 10000 iterations
        if (i % 10000 === 0) {
            const progress = Math.round((i / total) * 100);
            onProgress(progress);

            // Yield to browser to keep UI responsive
            await new Promise(resolve => setTimeout(resolve, 0));
        }
    }

    onProgress(100);
    return processed;
}

document.getElementById('abortOperation').addEventListener('click', () => {
    if (operationController) {
        operationController.abort();
        operationController = null;
    }
});

// ============================================
// Demo 6: Chained Operations
// ============================================

let chainController = null;

document.getElementById('startChain').addEventListener('click', async () => {
    const output = document.getElementById('chainOutput');
    const step1 = document.getElementById('step1');
    const step2 = document.getElementById('step2');
    const step3 = document.getElementById('step3');

    // Reset steps
    [step1, step2, step3].forEach(step => {
        step.className = 'step';
    });

    chainController = new AbortController();
    const { signal } = chainController;

    output.textContent = 'Starting chain of operations...\n';
    output.className = 'output loading';

    try {
        // Step 1: Fetch user
        step1.className = 'step active';
        output.textContent += 'Step 1: Fetching user...\n';

        const userResponse = await fetch('https://jsonplaceholder.typicode.com/users/1', { signal });
        const user = await userResponse.json();

        step1.className = 'step completed';
        output.textContent += `✓ Got user: ${user.name}\n\n`;

        // Step 2: Fetch user's posts
        step2.className = 'step active';
        output.textContent += 'Step 2: Fetching posts...\n';

        const postsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts?userId=${user.id}`, { signal });
        const posts = await postsResponse.json();

        step2.className = 'step completed';
        output.textContent += `✓ Got ${posts.length} posts\n\n`;

        // Step 3: Fetch comments for first post
        step3.className = 'step active';
        output.textContent += 'Step 3: Fetching comments...\n';

        const commentsResponse = await fetch(`https://jsonplaceholder.typicode.com/posts/${posts[0].id}/comments`, { signal });
        const comments = await commentsResponse.json();

        step3.className = 'step completed';
        output.textContent += `✓ Got ${comments.length} comments\n\n`;

        output.textContent += '✓ All steps completed successfully!';
        output.className = 'output success';

    } catch (error) {
        // Mark current and remaining steps as aborted
        [step1, step2, step3].forEach(step => {
            if (!step.classList.contains('completed')) {
                step.className = 'step aborted';
            }
        });

        if (error.name === 'AbortError') {
            output.textContent += '\n✗ Chain was aborted!';
            output.className = 'output error';
        } else {
            output.textContent += `\n✗ Error: ${error.message}`;
            output.className = 'output error';
        }
    }
});

document.getElementById('abortChain').addEventListener('click', () => {
    if (chainController) {
        chainController.abort();
        chainController = null;
    }
});

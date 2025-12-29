// DOM Elements
const rangeInput = document.getElementById('rangeInput');
const startWorkerBtn = document.getElementById('startWorker');
const startNoWorkerBtn = document.getElementById('startNoWorker');
const stopWorkerBtn = document.getElementById('stopWorker');
const statusDiv = document.getElementById('status');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const outputDiv = document.getElementById('output');
const testSlider = document.getElementById('testSlider');
const sliderValue = document.getElementById('sliderValue');

// Worker reference
let worker = null;

// Update slider value display
testSlider.addEventListener('input', (e) => {
    sliderValue.textContent = e.target.value;
});

// Start calculation with Web Worker
startWorkerBtn.addEventListener('click', () => {
    const range = parseInt(rangeInput.value);

    if (range < 1000 || range > 10000000) {
        alert('Please enter a value between 1,000 and 10,000,000');
        return;
    }

    // Create a new worker
    worker = new Worker('worker.js');

    // Set up message handler
    worker.onmessage = function(e) {
        const { type, data } = e.data;

        switch (type) {
            case 'progress':
                updateProgress(data.progress, data.checked, data.found);
                break;

            case 'complete':
                handleComplete(data.primes, data.time, true);
                break;

            case 'error':
                handleError(data.message);
                break;
        }
    };

    // Handle worker errors
    worker.onerror = function(error) {
        handleError(`Worker error: ${error.message}`);
    };

    // Start the calculation
    worker.postMessage({ range });

    // Update UI
    updateStatus('Calculating with Web Worker...', 'running');
    outputDiv.textContent = 'Processing...';
});

// Start calculation WITHOUT Web Worker (blocks UI)
startNoWorkerBtn.addEventListener('click', () => {
    const range = parseInt(rangeInput.value);

    if (range < 1000 || range > 10000000) {
        alert('Please enter a value between 1,000 and 10,000,000');
        return;
    }

    updateStatus('Calculating WITHOUT Web Worker (UI will freeze)...', 'running');
    outputDiv.textContent = 'Processing... (Notice how the UI is frozen!)';

    // Use setTimeout to allow UI to update before blocking
    setTimeout(() => {
        const startTime = performance.now();
        const primes = calculatePrimesSync(range);
        const endTime = performance.now();
        const time = ((endTime - startTime) / 1000).toFixed(2);

        handleComplete(primes, time, false);
    }, 100);
});

// Stop the worker
stopWorkerBtn.addEventListener('click', () => {
    if (worker) {
        worker.terminate();
        worker = null;
    }

    updateStatus('Calculation stopped', 'error');
    progressBar.style.width = '0%';
    progressText.textContent = '0%';
});

// Synchronous prime calculation (blocks UI)
function calculatePrimesSync(max) {
    const primes = [];

    for (let num = 2; num <= max; num++) {
        let isPrime = true;

        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(num);
        }
    }

    return primes;
}

// Update progress bar and status
function updateProgress(progress, checked, found) {
    progressBar.style.width = progress + '%';
    progressText.textContent = progress + '%';
    statusDiv.textContent = `Checked: ${checked.toLocaleString()} | Found: ${found.toLocaleString()} primes`;
}

// Handle completion
function handleComplete(primes, time, usedWorker) {
    const method = usedWorker ? 'Web Worker' : 'Main Thread';

    updateStatus(`✓ Calculation complete using ${method}!`, 'success');

    const firstTen = primes.slice(0, 10).join(', ');
    const lastTen = primes.slice(-10).join(', ');

    outputDiv.textContent = `Found ${primes.length.toLocaleString()} prime numbers in ${time} seconds

Method: ${method}
First 10 primes: ${firstTen}
Last 10 primes: ${lastTen}

${usedWorker ? '✓ UI remained responsive during calculation!' : '⚠ UI was frozen during calculation!'}`;

    progressBar.style.width = '100%';
    progressText.textContent = '100%';

    if (worker) {
        worker.terminate();
        worker = null;
    }
}

// Handle errors
function handleError(message) {
    updateStatus(`Error: ${message}`, 'error');
    outputDiv.textContent = `Error: ${message}`;

    if (worker) {
        worker.terminate();
        worker = null;
    }
}

// Update status display
function updateStatus(message, type = '') {
    statusDiv.textContent = message;
    statusDiv.className = 'status' + (type ? ' ' + type : '');
}

// Initial state
updateStatus('Ready to calculate...');
outputDiv.textContent = 'Click "Start with Worker" to see Web Workers in action!\n\nTry interacting with the slider above during calculation to see the difference between using and not using a Web Worker.';

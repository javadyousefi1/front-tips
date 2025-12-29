// Web Worker for calculating prime numbers
// This runs in a separate thread, keeping the UI responsive

// Listen for messages from the main thread
self.onmessage = function(e) {
    const { range } = e.data;

    try {
        calculatePrimes(range);
    } catch (error) {
        // Send error back to main thread
        self.postMessage({
            type: 'error',
            data: { message: error.message }
        });
    }
};

// Calculate prime numbers and send progress updates
function calculatePrimes(max) {
    const primes = [];
    const startTime = performance.now();
    const updateInterval = Math.floor(max / 100); // Update progress 100 times

    for (let num = 2; num <= max; num++) {
        let isPrime = true;

        // Check if number is prime
        for (let i = 2; i <= Math.sqrt(num); i++) {
            if (num % i === 0) {
                isPrime = false;
                break;
            }
        }

        if (isPrime) {
            primes.push(num);
        }

        // Send progress update periodically
        if (num % updateInterval === 0 || num === max) {
            const progress = Math.round((num / max) * 100);

            self.postMessage({
                type: 'progress',
                data: {
                    progress,
                    checked: num,
                    found: primes.length
                }
            });
        }
    }

    const endTime = performance.now();
    const time = ((endTime - startTime) / 1000).toFixed(2);

    // Send final results
    self.postMessage({
        type: 'complete',
        data: {
            primes,
            time
        }
    });
}

// Note: Web Workers have their own global scope
// - No access to DOM (no document or window)
// - No access to parent page variables
// - Communication only through messages
// - Can use: setTimeout, setInterval, fetch, IndexedDB, etc.

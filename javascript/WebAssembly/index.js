// Pure JavaScript version - sums numbers from 1 to n
function sumUptoJS(n) {
    let sum = 0;
    for (let i = 1; i <= n; i++) {
        sum += i;
    }
    return sum;
}

// Main function to run the performance comparison
async function runComparison() {
    const button = document.getElementById('runBtn');
    const resultsDiv = document.getElementById('results');

    button.disabled = true;
    button.textContent = 'Running tests...';
    resultsDiv.innerHTML = '';

    const n = 100_000_000;  // 100 million - now using i64 WASM!

    // Run JavaScript version
    console.time("JS sum");
    const startJS = performance.now();
    const resultJS = sumUptoJS(n);
    const endJS = performance.now();
    const timeJS = endJS - startJS;
    console.timeEnd("JS sum");

    resultsDiv.innerHTML += `
        <div class="result">
            <h2>Pure JavaScript</h2>
            <div class="value">Result: ${resultJS.toLocaleString()}</div>
            <div class="time">${timeJS.toFixed(2)} ms</div>
        </div>
    `;

    // Small delay to see JS result first
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
        // Run WebAssembly version
        const bytes = await fetch("sum.wasm").then(r => r.arrayBuffer());
        const { instance } = await WebAssembly.instantiate(bytes);

        console.time("WASM sum");
        const startWASM = performance.now();
        const resultWASM = instance.exports.sum_upto(BigInt(n));  // i64 requires BigInt
        const endWASM = performance.now();
        const timeWASM = endWASM - startWASM;
        console.timeEnd("WASM sum");

        resultsDiv.innerHTML += `
            <div class="result">
                <h2>WebAssembly (i64)</h2>
                <div class="value">Result: ${Number(resultWASM).toLocaleString()}</div>
                <div class="time">${timeWASM.toFixed(2)} ms</div>
            </div>
        `;

        // Show comparison
        const speedup = (timeJS / timeWASM).toFixed(2);
        const faster = timeWASM < timeJS ? 'WebAssembly' : 'JavaScript';
        const percentage = timeWASM < timeJS
            ? ((1 - timeWASM / timeJS) * 100).toFixed(1)
            : ((1 - timeJS / timeWASM) * 100).toFixed(1);

        resultsDiv.innerHTML += `
            <div class="comparison">
                <div class="faster">${faster} is faster!</div>
                <div style="margin-top: 10px;">
                    ${timeWASM < timeJS
                        ? `WebAssembly is ${speedup}x faster (${percentage}% improvement)`
                        : `JavaScript is ${(timeWASM / timeJS).toFixed(2)}x faster`
                    }
                </div>
            </div>
        `;

    } catch (error) {
        resultsDiv.innerHTML += `
            <div class="result" style="background: #ffe6e6;">
                <h2>WebAssembly Error</h2>
                <div class="value" style="color: #c0392b;">
                    ${error.message}<br>
                    Make sure to serve this file via a web server (not file://)
                </div>
            </div>
        `;
        console.error("WASM Error:", error);
    }

    button.disabled = false;
    button.textContent = 'Run Performance Test Again';
}

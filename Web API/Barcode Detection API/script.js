// ===========================================================================
// Barcode Detection API Demo
// ===========================================================================

let detector = null;
let cameraStream = null;
let scanInterval = null;

// ===========================================================================
// Init
// ===========================================================================
document.addEventListener('DOMContentLoaded', () => {
    checkSupport();
    setupImageScan();
    setupCamera();
    setupFormats();
});

function checkSupport() {
    const banner = document.getElementById('supportBanner');
    if ('BarcodeDetector' in window) {
        banner.textContent = '✅ Barcode Detection API is supported in your browser!';
        banner.className = 'support-banner supported';
        // Create detector with common formats
        detector = new BarcodeDetector({
            formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'aztec', 'data_matrix']
        });
    } else {
        banner.textContent = '❌ Barcode Detection API not supported. Try Chrome or Edge on desktop/Android.';
        banner.className = 'support-banner not-supported';
    }
}

// ===========================================================================
// Demo 1: Scan from Image
// ===========================================================================
function setupImageScan() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput  = document.getElementById('fileInput');
    const img        = document.getElementById('previewImg');
    const result     = document.getElementById('result1');

    // Click to open file picker
    uploadArea.addEventListener('click', () => fileInput.click());

    // Drag & drop
    uploadArea.addEventListener('dragover', e => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
    uploadArea.addEventListener('drop', e => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) processImageFile(file);
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) processImageFile(fileInput.files[0]);
    });

    async function processImageFile(file) {
        if (!file.type.startsWith('image/')) return showToast('Please upload an image');

        const url = URL.createObjectURL(file);
        img.src = url;
        img.style.display = 'block';
        uploadArea.style.display = 'none';
        result.innerHTML = '<p class="muted">Scanning...</p>';

        img.onload = async () => {
            if (!detector) {
                result.innerHTML = '<p class="error">BarcodeDetector not supported.</p>';
                return;
            }
            try {
                const barcodes = await detector.detect(img);
                renderResults(result, barcodes);
                drawOverlay(img, barcodes);
            } catch (e) {
                result.innerHTML = `<p class="error">Error: ${e.message}</p>`;
            }
            URL.revokeObjectURL(url);
        };
    }
}

function renderResults(container, barcodes) {
    if (barcodes.length === 0) {
        container.innerHTML = '<p class="warning">No barcode detected. Try a clearer image.</p>';
        return;
    }
    container.innerHTML = barcodes.map(b => `
        <div class="barcode-result">
            <div class="barcode-format">${b.format}</div>
            <div class="barcode-value">${b.rawValue}</div>
            ${isURL(b.rawValue) ? `<a href="${b.rawValue}" target="_blank" rel="noopener" class="barcode-link">Open Link →</a>` : ''}
        </div>
    `).join('');
}

function drawOverlay(img, barcodes) {
    if (barcodes.length === 0) return;
    console.log(img , barcodes);
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width  = img.naturalWidth;
    canvas.height = img.naturalHeight;
    canvas.style.display = 'block';
    canvas.style.maxWidth = '100%';

    ctx.drawImage(img, 0, 0);
    img.style.display = 'none';

    barcodes.forEach(b => {
        const { x, y, width, height } = b.boundingBox;
        ctx.strokeStyle = '#00C853';
        ctx.lineWidth = Math.max(3, canvas.width * 0.004);
        ctx.strokeRect(x, y, width, height);

        ctx.fillStyle = 'rgba(0,200,83,0.15)';
        ctx.fillRect(x, y, width, height);

        ctx.fillStyle = '#00C853';
        ctx.font = `bold ${Math.max(14, canvas.width * 0.02)}px sans-serif`;
        ctx.fillText(b.rawValue.slice(0, 40), x, y - 8);
    });
}

// ===========================================================================
// Demo 2: Live Camera Scan
// ===========================================================================
function setupCamera() {
    const startBtn  = document.getElementById('startCameraBtn');
    const stopBtn   = document.getElementById('stopCameraBtn');
    const video     = document.getElementById('cameraFeed');
    const overlay   = document.getElementById('scanOverlay');
    const result    = document.getElementById('result2');
    let lastValue   = null;

    startBtn.addEventListener('click', async () => {
        if (!detector) {
            showToast('BarcodeDetector not supported');
            return;
        }
        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            video.srcObject = cameraStream;
            overlay.style.display = 'block';
            startBtn.disabled = true;
            stopBtn.disabled  = false;
            result.innerHTML  = '<p class="muted">Scanning — point at a QR code or barcode...</p>';

            scanInterval = setInterval(async () => {
                if (video.readyState < 2) return;
                try {
                    const barcodes = await detector.detect(video);
                    if (barcodes.length > 0 && barcodes[0].rawValue !== lastValue) {
                        lastValue = barcodes[0].rawValue;
                        renderResults(result, barcodes);
                        showToast('Barcode detected!');
                    }
                } catch (e) { /* ignore mid-frame errors */ }
            }, 400);

        } catch (e) {
            result.innerHTML = `<p class="error">Camera error: ${e.message}</p>`;
        }
    });

    stopBtn.addEventListener('click', () => stopCamera(startBtn, stopBtn, overlay));
}

function stopCamera(startBtn, stopBtn, overlay) {
    clearInterval(scanInterval);
    if (cameraStream) {
        cameraStream.getTracks().forEach(t => t.stop());
        cameraStream = null;
    }
    const video = document.getElementById('cameraFeed');
    video.srcObject = null;
    if (overlay) overlay.style.display = 'none';
    if (startBtn) startBtn.disabled = false;
    if (stopBtn)  stopBtn.disabled  = true;
}

// ===========================================================================
// Demo 3: Supported Formats
// ===========================================================================
function setupFormats() {
    document.getElementById('getFormatsBtn').addEventListener('click', async () => {
        const grid = document.getElementById('formatsGrid');

        if (!('BarcodeDetector' in window)) {
            grid.innerHTML = '<p class="error">BarcodeDetector not supported.</p>';
            return;
        }

        const formats = await BarcodeDetector.getSupportedFormats();
        grid.innerHTML = formats.map(f => `<span class="format-tag">${f}</span>`).join('');
    });
}

// ===========================================================================
// Utilities
// ===========================================================================
function isURL(str) {
    try { return ['http:', 'https:'].includes(new URL(str).protocol); }
    catch { return false; }
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

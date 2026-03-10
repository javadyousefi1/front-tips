// Check for browser support
if (!window.ResizeObserver) {
    alert('ResizeObserver is not supported in this browser. Please update your browser.');
}

// ========================================
// Demo 1: Basic Resize Detection
// ========================================
const box1 = document.getElementById('box1');
const sizeDisplay1 = document.getElementById('sizeDisplay1');
const resizeCount1 = document.getElementById('resizeCount1');
const contentBox1 = document.getElementById('contentBox1');
const borderBox1 = document.getElementById('borderBox1');

let count1 = 0;

const observer1 = new ResizeObserver(entries => {
    for (const entry of entries) {
        count1++;
        resizeCount1.textContent = count1;

        const contentRect = entry.contentRect;
        const borderBoxSize = entry.borderBoxSize?.[0];
        const contentBoxSize = entry.contentBoxSize?.[0];

        sizeDisplay1.innerHTML = `
            Width: ${Math.round(contentRect.width)}px<br>
            Height: ${Math.round(contentRect.height)}px
        `;

        if (contentBoxSize) {
            contentBox1.textContent = `${Math.round(contentBoxSize.inlineSize)} × ${Math.round(contentBoxSize.blockSize)}`;
        }

        if (borderBoxSize) {
            borderBox1.textContent = `${Math.round(borderBoxSize.inlineSize)} × ${Math.round(borderBoxSize.blockSize)}`;
        }
    }
});

observer1.observe(box1);

// Make box1 resizable
let isResizing = false;
let startX, startY, startWidth, startHeight;

box1.querySelector('.resize-handle').addEventListener('mousedown', (e) => {
    isResizing = true;
    startX = e.clientX;
    startY = e.clientY;
    startWidth = box1.offsetWidth;
    startHeight = box1.offsetHeight;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;

    const width = startWidth + (e.clientX - startX);
    const height = startHeight + (e.clientY - startY);

    box1.style.width = Math.max(150, width) + 'px';
    box1.style.height = Math.max(100, height) + 'px';
});

document.addEventListener('mouseup', () => {
    isResizing = false;
});

document.getElementById('resetBox1').addEventListener('click', () => {
    box1.style.width = '300px';
    box1.style.height = '200px';
    count1 = 0;
    resizeCount1.textContent = '0';
});

// ========================================
// Demo 2: Responsive Text Sizing
// ========================================
const textContainer = document.getElementById('textContainer');
const responsiveText = document.getElementById('responsiveText');
const containerWidth = document.getElementById('containerWidth');
const fontSize = document.getElementById('fontSize');

const observer2 = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;
        containerWidth.textContent = Math.round(width);

        // Calculate responsive font size (between 16px and 80px)
        const calculatedSize = Math.max(16, Math.min(80, width / 8));
        responsiveText.style.fontSize = `${calculatedSize}px`;
        fontSize.textContent = Math.round(calculatedSize);
    }
});

observer2.observe(textContainer);

document.getElementById('smallContainer').addEventListener('click', () => {
    textContainer.style.width = '200px';
});

document.getElementById('mediumContainer').addEventListener('click', () => {
    textContainer.style.width = '400px';
});

document.getElementById('largeContainer').addEventListener('click', () => {
    textContainer.style.width = '600px';
});

document.getElementById('resetContainer').addEventListener('click', () => {
    textContainer.style.width = '400px';
});

// ========================================
// Demo 3: Container Queries Simulation
// ========================================
const adaptiveContainer = document.getElementById('adaptiveContainer');
const cardGrid = document.getElementById('cardGrid');
const layoutInfo = document.getElementById('layoutInfo');
const containerSlider = document.getElementById('containerSlider');
const sliderValue = document.getElementById('sliderValue');

const observer3 = new ResizeObserver(entries => {
    for (const entry of entries) {
        const width = entry.contentRect.width;

        // Apply different layouts based on width
        let layout = '';
        if (width < 400) {
            cardGrid.className = 'card-grid layout-small';
            layout = 'Small (1 column)';
        } else if (width < 600) {
            cardGrid.className = 'card-grid layout-medium';
            layout = 'Medium (2 columns)';
        } else {
            cardGrid.className = 'card-grid layout-large';
            layout = 'Large (3 columns)';
        }

        layoutInfo.innerHTML = `Layout: <strong>${layout}</strong> (${Math.round(width)}px)`;
    }
});

observer3.observe(adaptiveContainer);

containerSlider.addEventListener('input', (e) => {
    const value = e.target.value;
    sliderValue.textContent = value;
    adaptiveContainer.style.width = `${value}px`;
});

// ========================================
// Demo 4: Canvas Auto-Resize
// ========================================
const canvasWrapper = document.getElementById('canvasWrapper');
const chart = document.getElementById('chart');
const canvasSize = document.getElementById('canvasSize');
const redrawCount = document.getElementById('redrawCount');

let redraws = 0;
let animationId = null;

function drawChart(canvas) {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = '#1a202c';
    ctx.fillRect(0, 0, width, height);

    // Draw some bars
    const bars = 8;
    const barWidth = width / bars;
    const maxHeight = height - 40;

    for (let i = 0; i < bars; i++) {
        const barHeight = Math.random() * maxHeight;
        const x = i * barWidth;
        const y = height - barHeight - 20;

        // Gradient
        const gradient = ctx.createLinearGradient(x, y, x, height);
        gradient.addColorStop(0, '#667eea');
        gradient.addColorStop(1, '#764ba2');

        ctx.fillStyle = gradient;
        ctx.fillRect(x + 5, y, barWidth - 10, barHeight);

        // Value label
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(Math.round(barHeight), x + barWidth / 2, height - 5);
    }

    redraws++;
    redrawCount.textContent = redraws;
}

const observer4 = new ResizeObserver(entries => {
    for (const entry of entries) {
        const { width, height } = entry.contentRect;

        // Update canvas resolution
        chart.width = width;
        chart.height = height;

        canvasSize.textContent = `${Math.round(width)} × ${Math.round(height)}`;

        // Redraw
        drawChart(chart);
    }
});

observer4.observe(canvasWrapper);

document.getElementById('toggleFullWidth').addEventListener('click', () => {
    if (canvasWrapper.style.width === '100%') {
        canvasWrapper.style.width = '500px';
    } else {
        canvasWrapper.style.width = '100%';
    }
});

document.getElementById('animateCanvas').addEventListener('click', () => {
    if (animationId) return;

    let growing = true;
    let currentWidth = 500;

    function animate() {
        if (growing) {
            currentWidth += 2;
            if (currentWidth >= 700) growing = false;
        } else {
            currentWidth -= 2;
            if (currentWidth <= 300) growing = true;
        }

        canvasWrapper.style.width = `${currentWidth}px`;
        animationId = requestAnimationFrame(animate);
    }

    animate();
});

document.getElementById('stopAnimation').addEventListener('click', () => {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
});

// ========================================
// Demo 5: Resizable Sidebar
// ========================================
const sidebar = document.getElementById('sidebar');
const sidebarResizer = document.getElementById('sidebarResizer');
const mainContent = document.getElementById('mainContent');
const sidebarWidth = document.getElementById('sidebarWidth');
const mainWidth = document.getElementById('mainWidth');
const sidebarPercent = document.getElementById('sidebarPercent');

const observer5 = new ResizeObserver(entries => {
    for (const entry of entries) {
        const sWidth = entry.contentRect.width;
        const totalWidth = entry.target.parentElement.offsetWidth;
        const mWidth = totalWidth - sWidth;
        const percent = ((sWidth / totalWidth) * 100).toFixed(1);

        sidebarWidth.textContent = Math.round(sWidth);
        mainWidth.textContent = Math.round(mWidth);
        sidebarPercent.textContent = percent;
    }
});

observer5.observe(sidebar);

// Make sidebar resizable
let isSidebarResizing = false;
let sidebarStartX, sidebarStartWidth;

sidebarResizer.addEventListener('mousedown', (e) => {
    isSidebarResizing = true;
    sidebarStartX = e.clientX;
    sidebarStartWidth = sidebar.offsetWidth;
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isSidebarResizing) return;

    const width = sidebarStartWidth + (e.clientX - sidebarStartX);
    sidebar.style.width = Math.max(100, Math.min(600, width)) + 'px';
});

document.addEventListener('mouseup', () => {
    isSidebarResizing = false;
});

document.getElementById('collapseSidebar').addEventListener('click', () => {
    sidebar.style.width = '50px';
});

document.getElementById('expandSidebar').addEventListener('click', () => {
    sidebar.style.width = '400px';
});

document.getElementById('resetSidebar').addEventListener('click', () => {
    sidebar.style.width = '250px';
});

// ========================================
// Demo 6: Multiple Elements Performance
// ========================================
const observedItems = document.querySelectorAll('.observed-item');
const totalObs = document.getElementById('totalObs');
const activeElements = document.getElementById('activeElements');
const lastUpdate = document.getElementById('lastUpdate');
const logUpdates = document.getElementById('logUpdates');

let observationCount = 0;

const observer6 = new ResizeObserver(entries => {
    observationCount += entries.length;
    totalObs.textContent = observationCount;

    const now = new Date().toLocaleTimeString();
    lastUpdate.textContent = now;

    if (logUpdates.checked) {
        console.log(`[${now}] Processing ${entries.length} resize events`);
    }

    for (const entry of entries) {
        const element = entry.target;
        const { width, height } = entry.contentRect;
        const index = element.dataset.index;

        // Update element size display
        element.innerHTML = `
            Item ${index}<br>
            <small>${Math.round(width)}×${Math.round(height)}</small>
        `;

        if (logUpdates.checked) {
            console.log(`  Element ${index}: ${Math.round(width)}×${Math.round(height)}`);
        }
    }
});

// Observe all items
observedItems.forEach(item => observer6.observe(item));

document.getElementById('randomResize').addEventListener('click', () => {
    observedItems.forEach(item => {
        const randomWidth = 80 + Math.random() * 120;
        const randomHeight = 80 + Math.random() * 120;
        item.style.width = `${randomWidth}px`;
        item.style.height = `${randomHeight}px`;
    });
});

document.getElementById('syncResize').addEventListener('click', () => {
    let width = 100;
    const interval = setInterval(() => {
        width += 5;
        if (width > 180) {
            clearInterval(interval);
            return;
        }

        observedItems.forEach(item => {
            item.style.width = `${width}px`;
            item.style.height = `${width}px`;
        });
    }, 50);
});

document.getElementById('resetGrid').addEventListener('click', () => {
    observedItems.forEach(item => {
        item.style.width = '120px';
        item.style.height = '120px';
    });
});

// Initialize canvas on load
window.addEventListener('load', () => {
    drawChart(chart);
});

// ========================================
// Intersection Observer API - Examples
// ========================================

console.log('👁️ Intersection Observer API Examples Loaded');

// Stats tracking
const stats = {
    activeObservers: 0,
    observedElements: 0,
    imagesLoaded: 0,
    animationsTriggered: 0
};

function updateStats() {
    document.getElementById('active-observers').textContent = stats.activeObservers;
    document.getElementById('observed-elements').textContent = stats.observedElements;
    document.getElementById('images-loaded').textContent = stats.imagesLoaded;
    document.getElementById('animations-triggered').textContent = stats.animationsTriggered;
}

// ========================================
// Demo 1: Basic Visibility Detection
// ========================================

function initBasicDetection() {
    console.log('📦 Initializing Basic Detection Demo...');

    const observeBoxes = document.querySelectorAll('.observe-box');

    const basicObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const box = entry.target;
            const status = box.querySelector('.status');
            const boxName = box.dataset.name;

            if (entry.isIntersecting) {
                box.classList.add('visible');
                status.textContent = '✅ Visible!';
                status.style.color = '#10b981';
                console.log(`✅ ${boxName} entered viewport`);
            } else {
                box.classList.remove('visible');
                status.textContent = '❌ Hidden';
                status.style.color = '#ef4444';
                console.log(`❌ ${boxName} left viewport`);
            }
        });
    }, {
        threshold: 0.1, // Trigger when 10% visible
        rootMargin: '0px'
    });

    observeBoxes.forEach(box => {
        basicObserver.observe(box);
        stats.observedElements++;
    });

    stats.activeObservers++;
    updateStats();

    console.log(`✅ Observing ${observeBoxes.length} boxes`);
}

// ========================================
// Demo 2: Lazy Loading Images
// ========================================

function initLazyLoading() {
    console.log('🖼️ Initializing Lazy Loading Demo...');

    const lazyImages = document.querySelectorAll('.lazy-image');

    const lazyImageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                const src = img.dataset.src;

                console.log(`🖼️ Loading image: ${src}`);

                // Add loading class
                img.classList.add('loading');

                // Load the actual image
                img.src = src;

                img.onload = () => {
                    img.classList.remove('loading');
                    img.classList.add('loaded');
                    stats.imagesLoaded++;
                    updateStats();
                    console.log(`✅ Image loaded successfully`);
                };

                img.onerror = () => {
                    img.classList.remove('loading');
                    img.classList.add('error');
                    console.error('❌ Image failed to load');
                };

                // Stop observing this image
                lazyImageObserver.unobserve(img);
                stats.observedElements--;
                updateStats();
            }
        });
    }, {
        rootMargin: '50px', // Load 50px before entering viewport
        threshold: 0.01
    });

    lazyImages.forEach(img => {
        lazyImageObserver.observe(img);
        stats.observedElements++;
    });

    stats.activeObservers++;
    updateStats();

    console.log(`✅ Observing ${lazyImages.length} lazy images`);
}

// ========================================
// Demo 3: Scroll Animations
// ========================================

function initScrollAnimations() {
    console.log('✨ Initializing Scroll Animations Demo...');

    const animateBoxes = document.querySelectorAll('.animate-box');

    const animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const box = entry.target;
                const animation = box.dataset.animation;

                // Trigger animation
                box.classList.add('visible');

                stats.animationsTriggered++;
                updateStats();

                console.log(`✨ Animation triggered: ${animation}`);

                // Unobserve after animation (one-time animation)
                animationObserver.unobserve(box);
                stats.observedElements--;
                updateStats();
            }
        });
    }, {
        threshold: 0.2, // Trigger when 20% visible
        rootMargin: '-50px' // Trigger slightly after entering viewport
    });

    animateBoxes.forEach(box => {
        animationObserver.observe(box);
        stats.observedElements++;
    });

    stats.activeObservers++;
    updateStats();

    console.log(`✅ Observing ${animateBoxes.length} animated elements`);
}

// ========================================
// Demo 4: Infinite Scroll
// ========================================

function initInfiniteScroll() {
    console.log('♾️ Initializing Infinite Scroll Demo...');

    const infiniteItemsContainer = document.querySelector('.infinite-items');
    const sentinel = document.querySelector('.scroll-sentinel');

    let page = 1;
    let isLoading = false;

    // Generate random items
    function generateItems(count, pageNum) {
        const items = [];
        const startNum = (pageNum - 1) * count + 1;

        for (let i = 0; i < count; i++) {
            items.push({
                id: startNum + i,
                title: `Item ${startNum + i}`,
                description: `This is item number ${startNum + i} loaded via infinite scroll`
            });
        }

        return items;
    }

    // Add items to DOM
    function addItems(items) {
        items.forEach(item => {
            const itemElement = document.createElement('div');
            itemElement.className = 'infinite-item';
            itemElement.innerHTML = `
                <h4>${item.title}</h4>
                <p>${item.description}</p>
            `;
            infiniteItemsContainer.appendChild(itemElement);
        });
    }

    // Load initial items
    const initialItems = generateItems(5, page);
    addItems(initialItems);
    page++;

    // Intersection Observer for infinite scroll
    const infiniteScrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                isLoading = true;
                sentinel.classList.add('loading');

                console.log(`♾️ Loading page ${page}...`);

                // Simulate loading delay
                setTimeout(() => {
                    const newItems = generateItems(5, page);
                    addItems(newItems);

                    console.log(`✅ Loaded ${newItems.length} items (page ${page})`);

                    page++;
                    isLoading = false;
                    sentinel.classList.remove('loading');

                    // Stop after 5 pages for demo
                    if (page > 5) {
                        infiniteScrollObserver.unobserve(sentinel);
                        sentinel.innerHTML = '<p style="text-align: center; color: #64748b;">End of content</p>';
                        stats.activeObservers--;
                        stats.observedElements--;
                        updateStats();
                        console.log('✅ Infinite scroll complete');
                    }
                }, 1000);
            }
        });
    }, {
        rootMargin: '100px', // Load 100px before reaching sentinel
        threshold: 0
    });

    infiniteScrollObserver.observe(sentinel);
    stats.activeObservers++;
    stats.observedElements++;
    updateStats();

    console.log('✅ Infinite scroll observer active');
}

// ========================================
// Demo 5: Video Auto-Play
// ========================================

function initVideoAutoPlay() {
    console.log('🎥 Initializing Video Auto-Play Demo...');

    const videos = document.querySelectorAll('.auto-play-video');
    const videoStatus = document.getElementById('video-status-1');

    const videoObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const video = entry.target;

            if (entry.isIntersecting) {
                // Play video when visible
                video.play()
                    .then(() => {
                        videoStatus.textContent = '▶️ Playing';
                        videoStatus.style.color = '#10b981';
                        console.log('🎥 Video playing');
                    })
                    .catch(err => {
                        console.error('❌ Video play failed:', err);
                    });
            } else {
                // Pause video when not visible
                video.pause();
                videoStatus.textContent = '⏸️ Paused';
                videoStatus.style.color = '#64748b';
                console.log('⏸️ Video paused');
            }
        });
    }, {
        threshold: 0.5 // Play when 50% visible
    });

    videos.forEach(video => {
        videoObserver.observe(video);
        stats.observedElements++;
    });

    stats.activeObservers++;
    updateStats();

    console.log(`✅ Observing ${videos.length} videos`);
}

// ========================================
// Demo 6: Threshold Visualization
// ========================================

function initThresholdVisualization() {
    console.log('📊 Initializing Threshold Visualization Demo...');

    const thresholdBox = document.querySelector('.threshold-box');
    const ratioValue = document.getElementById('ratio-value');
    const progressFill = document.getElementById('progress-fill');
    const thresholdStatus = document.getElementById('threshold-status');

    // Create observer with multiple thresholds
    const thresholds = [];
    for (let i = 0; i <= 1.0; i += 0.01) {
        thresholds.push(i);
    }

    const thresholdObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const ratio = entry.intersectionRatio;
            const percentage = Math.round(ratio * 100);

            // Update UI
            ratioValue.textContent = `${percentage}%`;
            progressFill.style.width = `${percentage}%`;

            // Update status and colors
            if (ratio === 0) {
                thresholdStatus.textContent = 'Not visible';
                thresholdStatus.style.color = '#ef4444';
                progressFill.style.background = '#ef4444';
            } else if (ratio < 0.25) {
                thresholdStatus.textContent = 'Barely visible';
                thresholdStatus.style.color = '#f59e0b';
                progressFill.style.background = '#f59e0b';
            } else if (ratio < 0.5) {
                thresholdStatus.textContent = 'Partially visible';
                thresholdStatus.style.color = '#eab308';
                progressFill.style.background = '#eab308';
            } else if (ratio < 0.75) {
                thresholdStatus.textContent = 'Mostly visible';
                thresholdStatus.style.color = '#84cc16';
                progressFill.style.background = '#84cc16';
            } else if (ratio < 1.0) {
                thresholdStatus.textContent = 'Almost fully visible';
                thresholdStatus.style.color = '#22c55e';
                progressFill.style.background = '#22c55e';
            } else {
                thresholdStatus.textContent = 'Fully visible!';
                thresholdStatus.style.color = '#10b981';
                progressFill.style.background = '#10b981';
            }

            console.log(`📊 Intersection ratio: ${percentage}%`);
        });
    }, {
        threshold: thresholds
    });

    thresholdObserver.observe(thresholdBox);
    stats.activeObservers++;
    stats.observedElements++;
    updateStats();

    console.log('✅ Threshold visualization active');
}

// ========================================
// Feature Detection
// ========================================

function checkSupport() {
    if (!('IntersectionObserver' in window)) {
        console.error('❌ Intersection Observer API not supported!');
        alert('Your browser does not support Intersection Observer API. Please use a modern browser.');
        return false;
    }

    console.log('✅ Intersection Observer API supported!');
    return true;
}

// ========================================
// Smooth Scroll for Navigation
// ========================================

function initSmoothScroll() {
    document.querySelectorAll('.demo-nav a').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ========================================
// Initialize All Demos
// ========================================

function init() {
    console.log('🚀 Initializing all demos...');

    // Check browser support
    if (!checkSupport()) {
        return;
    }

    // Initialize smooth scrolling
    initSmoothScroll();

    // Initialize all demos
    initBasicDetection();
    initLazyLoading();
    initScrollAnimations();
    initInfiniteScroll();
    initVideoAutoPlay();
    initThresholdVisualization();

    console.log('✅ All demos initialized successfully!');
    console.log('📊 Total observers:', stats.activeObservers);
    console.log('📊 Total elements:', stats.observedElements);
}

// ========================================
// Run on DOM Ready
// ========================================

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// ========================================
// Performance Monitoring
// ========================================

window.addEventListener('load', () => {
    console.log('⚡ Page fully loaded');

    // Log performance metrics
    if (window.performance) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log(`⚡ Page load time: ${pageLoadTime}ms`);
    }
});

// ========================================
// Cleanup on page unload
// ========================================

window.addEventListener('beforeunload', () => {
    console.log('👋 Cleaning up observers...');
    // Observers are automatically cleaned up, but you could explicitly disconnect them here
});

// ===========================================================================
// Badging API Demo
// ===========================================================================

let unreadCount = 0;
let autoModeActive = false;
let pendingMessages = 0;
let deferredInstallPrompt = null;

// ===========================================================================
// PWA Install Prompt
// ===========================================================================
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;

    // Show install banner
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'flex';
});

window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    const banner = document.getElementById('installBanner');
    if (banner) banner.style.display = 'none';
    showToast('✅ App installed! Badge will now appear on your OS icon.');
});

// ===========================================================================
// Support Check
// ===========================================================================
document.addEventListener('DOMContentLoaded', () => {
    const banner = document.getElementById('supportBanner');
    const supported = 'setAppBadge' in navigator;

    if (supported) {
        banner.textContent = '✅ Badging API is supported in your browser!';
        banner.className = 'support-banner supported';
    } else {
        banner.textContent = '❌ Badging API is not supported in this browser (try Chrome or Edge)';
        banner.className = 'support-banner not-supported';
    }

    setupDemo1();
    setupDemo2();
    setupDemo3();
    setupInstallButton();
});

// ===========================================================================
// PWA Install Button
// ===========================================================================
function setupInstallButton() {
    const btn = document.getElementById('installBtn');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        if (!deferredInstallPrompt) {
            showToast('Install prompt not available. Already installed or not eligible.');
            return;
        }
        deferredInstallPrompt.prompt();
        const { outcome } = await deferredInstallPrompt.userChoice;
        if (outcome === 'accepted') {
            showToast('Installing app...');
        } else {
            showToast('Install dismissed');
        }
        deferredInstallPrompt = null;
    });
}

// ===========================================================================
// Demo 1: Manual Badge Control
// ===========================================================================
function setupDemo1() {
    document.getElementById('setBadgeBtn').addEventListener('click', async () => {
        const count = parseInt(document.getElementById('badgeCount').value) || 0;
        try {
            await navigator.setAppBadge(count);
            log('output1', `Badge set to ${count}`, 'success');
            showToast(`Badge set to ${count}`);
        } catch (e) {
            log('output1', `Error: ${e.message}`, 'error');
        }
    });

    document.getElementById('setDotBtn').addEventListener('click', async () => {
        try {
            await navigator.setAppBadge();
            log('output1', 'Badge set to dot (no number)', 'success');
            showToast('Badge dot set');
        } catch (e) {
            log('output1', `Error: ${e.message}`, 'error');
        }
    });

    document.getElementById('clearBadgeBtn').addEventListener('click', async () => {
        try {
            await navigator.clearAppBadge();
            log('output1', 'Badge cleared', 'success');
            showToast('Badge cleared');
        } catch (e) {
            log('output1', `Error: ${e.message}`, 'error');
        }
    });
}

// ===========================================================================
// Demo 2: Unread Counter
// ===========================================================================
function setupDemo2() {
    updateBadgePreview();

    document.getElementById('newMessageBtn').addEventListener('click', async () => {
        unreadCount++;
        updateBadgePreview();
        try {
            await navigator.setAppBadge(unreadCount);
            log('output2', `New message! Badge count: ${unreadCount}`, 'success');
        } catch (e) {
            log('output2', `Badge not supported, count: ${unreadCount}`, 'warning');
        }
    });

    document.getElementById('readAllBtn').addEventListener('click', async () => {
        unreadCount = 0;
        updateBadgePreview();
        try {
            await navigator.clearAppBadge();
            log('output2', 'All messages read. Badge cleared.', 'success');
        } catch (e) {
            log('output2', 'All read. (Badge API not supported)', 'warning');
        }
    });
}

function updateBadgePreview() {
    const preview = document.getElementById('badgePreview');
    if (unreadCount === 0) {
        preview.textContent = '';
        preview.classList.remove('visible');
    } else {
        preview.textContent = unreadCount > 99 ? '99+' : unreadCount;
        preview.classList.add('visible');
    }
}

// ===========================================================================
// Demo 3: Visibility-Based Badge
// ===========================================================================
function setupDemo3() {
    const startBtn = document.getElementById('startAutoBtn');
    const stopBtn  = document.getElementById('stopAutoBtn');

    startBtn.addEventListener('click', () => {
        autoModeActive = true;
        pendingMessages = 0;
        startBtn.disabled = true;
        stopBtn.disabled = false;
        log('output3', 'Auto mode ON — switch to another tab to trigger the badge!', 'success');
        document.addEventListener('visibilitychange', handleVisibility);
    });

    stopBtn.addEventListener('click', async () => {
        autoModeActive = false;
        startBtn.disabled = false;
        stopBtn.disabled = true;
        document.removeEventListener('visibilitychange', handleVisibility);
        await navigator.clearAppBadge().catch(() => {});
        log('output3', 'Auto mode stopped. Badge cleared.', 'warning');
    });
}

async function handleVisibility() {
    if (!autoModeActive) return;

    if (document.hidden) {
        // Tab hidden — simulate a pending message and show badge
        pendingMessages++;
        try {
            await navigator.setAppBadge(pendingMessages);
            log('output3', `Tab hidden — badge set to ${pendingMessages}`, 'success');
        } catch (e) {
            log('output3', 'Tab hidden — badge API not supported', 'warning');
        }
    } else {
        // User returned — clear badge
        pendingMessages = 0;
        try {
            await navigator.clearAppBadge();
            log('output3', 'Welcome back! Badge cleared.', 'success');
        } catch (e) {
            log('output3', 'Welcome back! (Badge API not supported)', 'warning');
        }
    }
}

// ===========================================================================
// Utilities
// ===========================================================================
function log(outputId, message, type = 'info') {
    const el = document.getElementById(outputId);
    if (!el) return;
    const cls = type === 'success' ? 'success' : type === 'error' ? 'error' : type === 'warning' ? 'warning' : '';
    const time = new Date().toLocaleTimeString();
    el.innerHTML = `<span class="${cls}">[${time}] ${message}</span>\n` + (el.innerHTML === 'Click a button to see the result...' || el.innerHTML.includes('Click') ? '' : el.innerHTML);
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2500);
}

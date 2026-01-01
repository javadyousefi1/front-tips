// Check for browser support
if (!window.MutationObserver) {
    alert('MutationObserver is not supported in this browser. Please update your browser.');
}

// ========================================
// Demo 1: Basic DOM Mutations
// ========================================
const target1 = document.getElementById('target1');
const logContent1 = document.getElementById('logContent1');
const mutationCount1 = document.getElementById('mutationCount1');
let count1 = 0;
let itemCounter = 4;

const observer1 = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        count1++;
        mutationCount1.textContent = count1;

        if (mutation.type === 'childList') {
            let logMessage = '';

            if (mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        logMessage += `✅ Added: ${node.textContent}\n`;
                    }
                });
            }

            if (mutation.removedNodes.length > 0) {
                mutation.removedNodes.forEach(node => {
                    if (node.nodeType === 1) {
                        logMessage += `❌ Removed: ${node.textContent}\n`;
                    }
                });
            }

            const timestamp = new Date().toLocaleTimeString();
            logContent1.innerHTML += `<div class="log-entry">[${timestamp}] ${logMessage}</div>`;
            logContent1.scrollTop = logContent1.scrollHeight;
        }
    });
});

observer1.observe(target1, {
    childList: true
});

document.getElementById('addNode1').addEventListener('click', () => {
    const newItem = document.createElement('div');
    newItem.className = 'item';
    newItem.textContent = `Item ${itemCounter++}`;
    target1.appendChild(newItem);
});

document.getElementById('removeNode1').addEventListener('click', () => {
    if (target1.children.length > 0) {
        target1.removeChild(target1.lastElementChild);
    }
});

document.getElementById('clearNodes1').addEventListener('click', () => {
    target1.innerHTML = '';
});

document.getElementById('clearLog1').addEventListener('click', () => {
    logContent1.innerHTML = 'Waiting for mutations...';
    count1 = 0;
    mutationCount1.textContent = '0';
});

// ========================================
// Demo 2: Attribute Changes
// ========================================
const attrBox = document.getElementById('attrBox');
const attrList = document.getElementById('attrList');
const attrLog = document.getElementById('attrLog');
const trackOldValue = document.getElementById('trackOldValue');

let classToggle = false;
let styleIndex = 0;
let dataCounter = 0;

const styles = [
    { background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' },
    { background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: 'white' },
    { background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' },
    { background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }
];

function updateAttributeList() {
    const attrs = Array.from(attrBox.attributes);
    attrList.innerHTML = attrs.map(attr =>
        `<li><code>${attr.name}</code>: ${attr.value}</li>`
    ).join('');
}

const observer2 = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'attributes') {
            const attrName = mutation.attributeName;
            const oldValue = mutation.oldValue;
            const newValue = mutation.target.getAttribute(attrName);
            const timestamp = new Date().toLocaleTimeString();

            let logEntry = `<div class="log-entry">[${timestamp}] <strong>${attrName}</strong> changed`;

            if (trackOldValue.checked && oldValue !== null) {
                logEntry += `<br>From: <code>${oldValue}</code><br>To: <code>${newValue}</code>`;
            }

            logEntry += '</div>';

            attrLog.innerHTML = logEntry + attrLog.innerHTML;
            updateAttributeList();
        }
    });
});

observer2.observe(attrBox, {
    attributes: true,
    attributeOldValue: true
});

updateAttributeList();

document.getElementById('changeClass').addEventListener('click', () => {
    classToggle = !classToggle;
    if (classToggle) {
        attrBox.classList.add('highlighted');
    } else {
        attrBox.classList.remove('highlighted');
    }
});

document.getElementById('changeStyle').addEventListener('click', () => {
    const style = styles[styleIndex % styles.length];
    attrBox.style.background = style.background;
    attrBox.style.color = style.color;
    styleIndex++;
});

document.getElementById('changeData').addEventListener('click', () => {
    dataCounter++;
    attrBox.setAttribute('data-count', dataCounter);
    attrBox.setAttribute('data-timestamp', Date.now());
});

document.getElementById('resetAttrs').addEventListener('click', () => {
    attrBox.className = 'attribute-box';
    attrBox.style.background = '';
    attrBox.style.color = '';
    attrBox.removeAttribute('data-count');
    attrBox.removeAttribute('data-timestamp');
    updateAttributeList();
});

// ========================================
// Demo 3: Text Content Monitoring
// ========================================
const editableBox = document.getElementById('editableBox');
const charCount = document.getElementById('charCount');
const wordCount = document.getElementById('wordCount');
const textMutations = document.getElementById('textMutations');
const textLog = document.getElementById('textLog');

let textMutCount = 0;

function updateTextStats() {
    const text = editableBox.textContent;
    charCount.textContent = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0);
    wordCount.textContent = words.length;
}

const observer3 = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        if (mutation.type === 'characterData' || mutation.type === 'childList') {
            textMutCount++;
            textMutations.textContent = textMutCount;

            const timestamp = new Date().toLocaleTimeString();
            const oldText = mutation.oldValue || '';
            const newText = mutation.target.textContent || editableBox.textContent;

            if (oldText !== newText) {
                const logEntry = `<div class="log-entry">
                    [${timestamp}] Text changed<br>
                    <small>Old: "${oldText.substring(0, 50)}..."</small><br>
                    <small>New: "${newText.substring(0, 50)}..."</small>
                </div>`;

                textLog.innerHTML = logEntry + textLog.innerHTML;

                // Keep only last 5 entries
                const entries = textLog.querySelectorAll('.log-entry');
                if (entries.length > 5) {
                    entries[entries.length - 1].remove();
                }
            }

            updateTextStats();
        }
    });
});

observer3.observe(editableBox, {
    characterData: true,
    characterDataOldValue: true,
    childList: true,
    subtree: true
});

updateTextStats();

document.getElementById('appendText').addEventListener('click', () => {
    editableBox.textContent += ' More text added!';
});

document.getElementById('replaceText').addEventListener('click', () => {
    editableBox.textContent = 'This is replacement text. Type to continue...';
});

document.getElementById('clearText').addEventListener('click', () => {
    editableBox.textContent = '';
});

// ========================================
// Demo 4: Subtree Observation
// ========================================
const treeContainer = document.getElementById('treeContainer');
const totalMutations = document.getElementById('totalMutations');
const level0 = document.getElementById('level0');
const level1 = document.getElementById('level1');
const level2 = document.getElementById('level2');

let treeMutations = { total: 0, level0: 0, level1: 0, level2: 0 };
let nodeCounter = 1;

const observer4 = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
        treeMutations.total++;

        const level = mutation.target.dataset.level || mutation.target.closest('[data-level]')?.dataset.level;

        if (level === '0') treeMutations.level0++;
        else if (level === '1') treeMutations.level1++;
        else if (level === '2') treeMutations.level2++;

        totalMutations.textContent = treeMutations.total;
        level0.textContent = treeMutations.level0;
        level1.textContent = treeMutations.level1;
        level2.textContent = treeMutations.level2;
    });
});

observer4.observe(treeContainer, {
    childList: true,
    attributes: true,
    characterData: true,
    subtree: true
});

document.getElementById('addChild').addEventListener('click', () => {
    const rootChildren = treeContainer.querySelector('[data-level="0"] > .tree-children');
    const newNode = document.createElement('div');
    newNode.className = 'tree-node';
    newNode.dataset.level = '1';
    newNode.innerHTML = `<span class="node-label">Child ${nodeCounter++}</span>`;
    rootChildren.appendChild(newNode);
});

document.getElementById('addGrandchild').addEventListener('click', () => {
    const child2 = treeContainer.querySelectorAll('[data-level="1"]')[1];
    let grandchildContainer = child2.querySelector('.tree-children');

    if (!grandchildContainer) {
        grandchildContainer = document.createElement('div');
        grandchildContainer.className = 'tree-children';
        child2.appendChild(grandchildContainer);
    }

    const newNode = document.createElement('div');
    newNode.className = 'tree-node';
    newNode.dataset.level = '2';
    newNode.innerHTML = `<span class="node-label">Grandchild ${nodeCounter++}</span>`;
    grandchildContainer.appendChild(newNode);
});

document.getElementById('modifyDeep').addEventListener('click', () => {
    const deepNode = treeContainer.querySelector('[data-level="2"]');
    if (deepNode) {
        deepNode.classList.toggle('modified');
        const label = deepNode.querySelector('.node-label');
        label.textContent = `Modified ${nodeCounter++}`;
    }
});

document.getElementById('resetTree').addEventListener('click', () => {
    location.reload();
});

// ========================================
// Demo 5: Auto-Save Form
// ========================================
const autoSaveForm = document.getElementById('autoSaveForm');
const formName = document.getElementById('formName');
const formEmail = document.getElementById('formEmail');
const formMessage = document.getElementById('formMessage');
const saveStatus = document.getElementById('saveStatus');
const saveLog = document.getElementById('saveLog');
const autoSaveEnabled = document.getElementById('autoSaveEnabled');

let saveTimer;
let saveCount = 0;

function saveFormData() {
    if (!autoSaveEnabled.checked) return;

    const formData = {
        name: formName.value,
        email: formEmail.value,
        message: formMessage.value,
        timestamp: new Date().toISOString()
    };

    localStorage.setItem('autoSaveForm', JSON.stringify(formData));

    saveCount++;
    const timestamp = new Date().toLocaleTimeString();

    saveStatus.classList.add('saving');
    saveStatus.querySelector('.status-text').textContent = 'Saving...';

    setTimeout(() => {
        saveStatus.classList.remove('saving');
        saveStatus.classList.add('saved');
        saveStatus.querySelector('.status-text').textContent = 'Saved';

        const logEntry = `<div class="log-entry">[${timestamp}] Auto-save #${saveCount}</div>`;
        saveLog.innerHTML = logEntry + saveLog.innerHTML;

        setTimeout(() => {
            saveStatus.classList.remove('saved');
            saveStatus.querySelector('.status-text').textContent = 'All changes saved';
        }, 2000);
    }, 500);
}

// Track input changes via MutationObserver on value attribute
const formFields = [formName, formEmail, formMessage];

const observer5 = new MutationObserver(mutations => {
    clearTimeout(saveTimer);
    saveStatus.classList.remove('saved');
    saveStatus.querySelector('.status-text').textContent = 'Unsaved changes...';

    saveTimer = setTimeout(() => {
        saveFormData();
    }, 1500);
});

// Also listen to input events (more reliable for form fields)
formFields.forEach(field => {
    field.addEventListener('input', () => {
        clearTimeout(saveTimer);
        saveStatus.classList.remove('saved');
        saveStatus.querySelector('.status-text').textContent = 'Unsaved changes...';

        if (autoSaveEnabled.checked) {
            saveTimer = setTimeout(() => {
                saveFormData();
            }, 1500);
        }
    });
});

document.getElementById('manualSave').addEventListener('click', () => {
    saveFormData();
});

document.getElementById('loadData').addEventListener('click', () => {
    const saved = localStorage.getItem('autoSaveForm');
    if (saved) {
        const data = JSON.parse(saved);
        formName.value = data.name || '';
        formEmail.value = data.email || '';
        formMessage.value = data.message || '';
        alert('Data loaded successfully!');
    } else {
        alert('No saved data found.');
    }
});

document.getElementById('clearForm').addEventListener('click', () => {
    formName.value = '';
    formEmail.value = '';
    formMessage.value = '';
});

// ========================================
// Demo 6: Performance Monitor
// ========================================
const perfContainer = document.getElementById('perfContainer');
const perfGrid = document.getElementById('perfGrid');
const callbackCount = document.getElementById('callbackCount');
const totalMutCount = document.getElementById('totalMutCount');
const avgBatch = document.getElementById('avgBatch');
const avgTime = document.getElementById('avgTime');
const lastBatch = document.getElementById('lastBatch');
const logPerf = document.getElementById('logPerf');

let perfStats = {
    callbacks: 0,
    totalMutations: 0,
    processingTimes: [],
    batchSizes: []
};

const observer6 = new MutationObserver(mutations => {
    const startTime = performance.now();

    perfStats.callbacks++;
    perfStats.totalMutations += mutations.length;
    perfStats.batchSizes.push(mutations.length);

    callbackCount.textContent = perfStats.callbacks;
    totalMutCount.textContent = perfStats.totalMutations;
    lastBatch.textContent = mutations.length;

    const avgBatchSize = (perfStats.totalMutations / perfStats.callbacks).toFixed(1);
    avgBatch.textContent = avgBatchSize;

    // Process mutations
    mutations.forEach(mutation => {
        // Simulate some processing
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
                if (node.nodeType === 1) {
                    node.style.animation = 'fadeIn 0.3s';
                }
            });
        }
    });

    const duration = performance.now() - startTime;
    perfStats.processingTimes.push(duration);

    const avgProcessingTime = (perfStats.processingTimes.reduce((a, b) => a + b, 0) / perfStats.processingTimes.length).toFixed(2);
    avgTime.textContent = avgProcessingTime;

    if (logPerf.checked) {
        console.log(`[MutationObserver] Callback #${perfStats.callbacks}: ${mutations.length} mutations in ${duration.toFixed(2)}ms`);
    }
});

observer6.observe(perfGrid, {
    childList: true,
    attributes: true,
    subtree: true
});

document.getElementById('addMany').addEventListener('click', () => {
    for (let i = 0; i < 50; i++) {
        const item = document.createElement('div');
        item.className = 'perf-item';
        item.textContent = Math.floor(Math.random() * 100);
        perfGrid.appendChild(item);
    }
});

document.getElementById('modifyMany').addEventListener('click', () => {
    const items = perfGrid.querySelectorAll('.perf-item');
    for (let i = 0; i < Math.min(20, items.length); i++) {
        const item = items[Math.floor(Math.random() * items.length)];
        item.classList.toggle('modified');
        item.textContent = Math.floor(Math.random() * 100);
    }
});

document.getElementById('batchChanges').addEventListener('click', () => {
    // Create a document fragment to batch DOM changes
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < 100; i++) {
        const item = document.createElement('div');
        item.className = 'perf-item';
        item.textContent = i;
        fragment.appendChild(item);
    }

    // Single DOM update - triggers one observer callback
    perfGrid.appendChild(fragment);
});

document.getElementById('resetPerf').addEventListener('click', () => {
    perfGrid.innerHTML = '';
    perfStats = {
        callbacks: 0,
        totalMutations: 0,
        processingTimes: [],
        batchSizes: []
    };
    callbackCount.textContent = '0';
    totalMutCount.textContent = '0';
    avgBatch.textContent = '0';
    avgTime.textContent = '0';
    lastBatch.textContent = '0';
});

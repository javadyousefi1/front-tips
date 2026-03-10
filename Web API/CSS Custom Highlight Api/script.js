// ===========================================================================
// CSS Custom Highlight API Demo
// ===========================================================================

document.addEventListener('DOMContentLoaded', () => {
    checkSupport();
    setupSearchHighlight();
    setupLayerHighlights();
    setupSelectionHighlight();
});

// ===========================================================================
// Support Check
// ===========================================================================
function checkSupport() {
    const banner = document.getElementById('supportBanner');
    if ('highlights' in CSS) {
        banner.textContent = '✅ CSS Custom Highlight API is supported!';
        banner.className = 'support-banner supported';
    } else {
        banner.textContent = '❌ Not supported. Try Chrome 105+, Edge 105+, or Safari 17.2+.';
        banner.className = 'support-banner not-supported';
    }
}

// ===========================================================================
// Demo 1: Search Highlight
// ===========================================================================
function setupSearchHighlight() {
    const input   = document.getElementById('searchInput');
    const content = document.getElementById('textContent');
    const counter = document.getElementById('matchCount');

    input.addEventListener('input', () => {
        const query = input.value.trim();
        CSS.highlights.delete('search-results');
        counter.textContent = '';

        if (!query || !('highlights' in CSS)) return;

        const ranges = findTextRanges(content, query);
        counter.textContent = `${ranges.length} match${ranges.length !== 1 ? 'es' : ''}`;

        if (ranges.length) {
            CSS.highlights.set('search-results', new Highlight(...ranges));
        }
    });
}

// ===========================================================================
// Demo 2: Multiple Layers
// ===========================================================================
const LAYER_WORDS = {
    keywords: ['JavaScript', 'programming', 'language', 'web', 'development', 'functional'],
    errors:   ['TypeError', 'ReferenceError', 'SyntaxError', 'errors'],
    names:    ['Brendan Eich', 'Douglas Crockford', 'Ryan Dahl']
};

const activeLayerRanges = {};

function setupLayerHighlights() {
    const content = document.getElementById('layerContent');

    document.querySelectorAll('.layer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const layer = btn.dataset.layer;
            btn.classList.toggle('active');

            if (btn.classList.contains('active')) {
                const words = LAYER_WORDS[layer];
                const ranges = words.flatMap(word => findTextRanges(content, word));
                activeLayerRanges[layer] = ranges;
                if (ranges.length) CSS.highlights.set(layer, new Highlight(...ranges));
            } else {
                CSS.highlights.delete(layer);
                delete activeLayerRanges[layer];
            }
        });
    });

    document.getElementById('clearLayersBtn').addEventListener('click', () => {
        ['keywords', 'errors', 'names'].forEach(l => CSS.highlights.delete(l));
        document.querySelectorAll('.layer-btn').forEach(b => b.classList.remove('active'));
    });
}

// ===========================================================================
// Demo 3: Selection → Persistent Highlight
// ===========================================================================
function setupSelectionHighlight() {
    const content = document.getElementById('selectionContent');
    const counter = document.getElementById('selectionCount');
    const savedRanges = [];

    document.addEventListener('selectionchange', () => {
        const sel = window.getSelection();
        if (!sel || sel.isCollapsed || !sel.rangeCount) return;

        // Only save selections inside our target area
        const range = sel.getRangeAt(0);
        if (!content.contains(range.commonAncestorContainer)) return;

        savedRanges.push(range.cloneRange());
        counter.textContent = `${savedRanges.length} highlight${savedRanges.length !== 1 ? 's' : ''} saved`;

        if ('highlights' in CSS) {
            CSS.highlights.set('saved-selection', new Highlight(...savedRanges));
        }
    });

    document.getElementById('clearSelectionBtn').addEventListener('click', () => {
        savedRanges.length = 0;
        CSS.highlights.delete('saved-selection');
        counter.textContent = '0 highlights saved';
    });
}

// ===========================================================================
// Utility: Find all text ranges for a search term inside a container
// ===========================================================================
function findTextRanges(container, searchTerm) {
    const ranges = [];
    const lower  = searchTerm.toLowerCase();
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
        const text = node.textContent.toLowerCase();
        let idx = 0;
        while ((idx = text.indexOf(lower, idx)) !== -1) {
            const range = new Range();
            range.setStart(node, idx);
            range.setEnd(node, idx + searchTerm.length);
            ranges.push(range);
            idx += searchTerm.length;
        }
    }

    return ranges;
}

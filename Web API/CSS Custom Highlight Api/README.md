# ✏️ CSS Custom Highlight API

## What Is It?

The **CSS Custom Highlight API** lets you style arbitrary text ranges with CSS — without wrapping them in DOM elements like `<span>`. It's perfect for search highlighting, spell-check underlining, code syntax highlighting, and custom text selections.

```
Text → Range → Highlight → CSS.highlights.set('name', highlight) → ::highlight(name) { color: red }
```

---

## Core API

```javascript
// 1. Create a Range over some text
const range = new Range();
range.setStart(textNode, 5);   // start offset in the text node
range.setEnd(textNode, 10);    // end offset

// 2. Create a Highlight from one or more ranges
const highlight = new Highlight(range1, range2);

// 3. Register it in the CSS highlights registry
CSS.highlights.set('my-highlight', highlight);

// 4. Style it with CSS
// ::highlight(my-highlight) { background-color: yellow; color: black; }

// 5. Remove a highlight
CSS.highlights.delete('my-highlight');

// 6. Clear all highlights
CSS.highlights.clear();
```

---

## CSS Pseudo-Element

```css
/* Target a registered highlight by name */
::highlight(search-results) {
    background-color: yellow;
    color: black;
}

::highlight(spelling-error) {
    text-decoration: underline wavy red;
    color: inherit;
}

::highlight(important) {
    background-color: #ff6b6b;
    color: white;
    font-weight: bold;
}
```

**Supported CSS properties inside `::highlight()`:**
`color`, `background-color`, `text-decoration`, `text-shadow`, `caret-color`

---

## Find All Occurrences Example

```javascript
function highlightWord(container, word) {
    CSS.highlights.clear();
    if (!word.trim()) return;

    const ranges = [];
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT);

    let node;
    while ((node = walker.nextNode())) {
        const text = node.textContent.toLowerCase();
        const search = word.toLowerCase();
        let idx = 0;

        while ((idx = text.indexOf(search, idx)) !== -1) {
            const range = new Range();
            range.setStart(node, idx);
            range.setEnd(node, idx + search.length);
            ranges.push(range);
            idx += search.length;
        }
    }

    if (ranges.length) {
        CSS.highlights.set('search-results', new Highlight(...ranges));
    }
}
```

---

## Multiple Highlight Layers

```javascript
// Layer 1 — search results
CSS.highlights.set('search', new Highlight(...searchRanges));

// Layer 2 — spelling errors
CSS.highlights.set('spelling', new Highlight(...errorRanges));

// Layer 3 — important terms
CSS.highlights.set('important', new Highlight(...keywordRanges));
```

```css
::highlight(search)    { background-color: #fff176; }
::highlight(spelling)  { text-decoration: underline wavy red; }
::highlight(important) { background-color: #ef9a9a; font-weight: bold; }
```

---

## Browser Support

| Browser | Support |
|---------|---------|
| Chrome 105+ | ✅ |
| Edge 105+ | ✅ |
| Safari 17.2+ | ✅ |
| Firefox | ❌ (behind flag) |

---

## Resources
- [MDN CSS Custom Highlight API](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Custom_Highlight_API)
- [Can I Use](https://caniuse.com/mdn-api_highlight)

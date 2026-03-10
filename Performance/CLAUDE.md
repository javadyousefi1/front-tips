# Claude Instructions — performance/

When the user provides a link to an MDN Performance page, fetch it and create
`performance/<TopicName>/index.html` using the exact design system below.
No external dependencies. One self-contained HTML file.

---

## Folder convention

```
performance/
  <TopicName>/        ← match the MDN page title (PascalCase, no spaces)
    index.html
```

---

## HTML skeleton

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Page Title} — MDN</title>
  <style>/* paste design system below */</style>
</head>
<body>
  <header>…</header>
  <main>
    <nav class="toc">…</nav>
    <!-- sections -->
  </main>
</body>
</html>
```

---

## Design system — copy this CSS exactly

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:             #0f1117;
  --surface:        #1a1d27;
  --surface2:       #22263a;
  --border:         #2e3250;
  --text:           #e2e8f0;
  --muted:          #94a3b8;
  --accent:         #6c8ef7;   /* blue  — subsection titles, links */
  --accent2:        #a78bfa;   /* purple — section titles, fa label */
  --green:          #4ade80;
  --yellow:         #facc15;
  --red:            #f87171;
  --code-bg:        #12151f;
  --persian-bg:     #1e2535;
  --persian-border: #3b4a7a;
  --persian-text:   #c4b5fd;
  --radius:         10px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  padding: 0 1rem 4rem;
}

/* Header */
header { max-width: 860px; margin: 0 auto; padding: 3rem 0 2rem; border-bottom: 1px solid var(--border); }
header .label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.12em; color: var(--accent); margin-bottom: 0.5rem; }
header h1 { font-size: 2.2rem; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 0.75rem; }
header .source { font-size: 0.8rem; color: var(--muted); }
header .source a { color: var(--accent); text-decoration: none; }

main { max-width: 860px; margin: 0 auto; }

/* Sections */
.section { margin-top: 3rem; }
.section-title { font-size: 1.5rem; font-weight: 700; color: var(--accent2); margin-bottom: 1.5rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
.subsection-title { font-size: 1.15rem; font-weight: 600; color: var(--accent); margin: 1.75rem 0 0.75rem; }

/* Content block (English) */
.block { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; margin-bottom: 1rem; }
.block p { color: var(--text); margin-bottom: 0.5rem; }
.block p:last-of-type { margin-bottom: 0; }

/* Persian summary card */
.fa {
  background: var(--persian-bg);
  border: 1px solid var(--persian-border);
  border-radius: var(--radius);
  padding: 0.85rem 1.25rem;
  margin-top: 0.5rem;
  margin-bottom: 1.25rem;
  direction: rtl;
  text-align: right;
  font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', sans-serif;
  font-size: 0.92rem;
  line-height: 1.9;
  color: var(--persian-text);
  position: relative;
}
.fa::before {
  content: '🇮🇷 خلاصه';
  display: block;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--accent2);
  margin-bottom: 0.4rem;
  direction: rtl;
}

/* Code */
pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: var(--radius); padding: 1rem 1.25rem; overflow-x: auto; font-size: 0.88rem; line-height: 1.6; margin: 0.75rem 0; }
code { font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; color: #93c5fd; }
.comment { color: #6b7280; }
.keyword { color: #c084fc; }
.string  { color: #86efac; }
.fn      { color: #67e8f9; }

/* Lists */
ul, ol { padding-left: 1.5rem; margin: 0.5rem 0; }
li { margin-bottom: 0.3rem; color: var(--text); }

/* Badges */
.badge { display: inline-block; font-size: 0.7rem; padding: 0.15rem 0.5rem; border-radius: 999px; font-weight: 600; margin-right: 0.35rem; text-transform: uppercase; letter-spacing: 0.05em; }
.badge-good { background: #14532d; color: var(--green); }
.badge-bad  { background: #450a0a; color: var(--red);   }
.badge-note { background: #1c1917; color: var(--yellow); }

/* Note / Tip callout */
.note { border-left: 3px solid var(--yellow); background: #1c1917; border-radius: 0 var(--radius) var(--radius) 0; padding: 0.75rem 1rem; font-size: 0.9rem; color: #fde68a; margin: 0.75rem 0; }

strong { color: #f1f5f9; font-weight: 600; }

/* TOC */
.toc { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 1.25rem 1.5rem; margin-top: 2rem; }
.toc h2 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 0.75rem; }
.toc ol { padding-left: 1.2rem; }
.toc a { color: var(--accent); text-decoration: none; font-size: 0.9rem; }
.toc a:hover { text-decoration: underline; }

hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }

@media (max-width: 600px) {
  header h1 { font-size: 1.5rem; }
  .section-title { font-size: 1.2rem; }
}
```

---

## Component patterns

### Header
```html
<header>
  <div class="label">MDN Web Docs — Web Performance</div>
  <h1>{Page Title}</h1>
  <div class="source">
    Source: <a href="{url}" target="_blank">developer.mozilla.org</a>
    &nbsp;|&nbsp; Dark mode &nbsp;|&nbsp; English + Persian summary
  </div>
</header>
```

### Table of contents
```html
<nav class="toc">
  <h2>Table of Contents</h2>
  <ol>
    <li><a href="#section-id">Section Title</a></li>
  </ol>
</nav>
```

### Section
```html
<section class="section" id="section-id">
  <h2 class="section-title">1. Section Title</h2>

  <!-- optional subsection -->
  <h3 class="subsection-title">1.1 Subsection Title</h3>

  <!-- English content block -->
  <div class="block">
    <p>…full English paragraph…</p>
    <ul><li>…</li></ul>
  </div>

  <!-- Persian summary — immediately after every .block -->
  <div class="fa">…Persian summary 2–4 sentences…</div>
</section>
```

### Code block (with syntax spans)
```html
<pre><code><span class="comment">// comment</span>
<span class="keyword">function</span> <span class="fn">name</span>() {
  <span class="keyword">return</span> <span class="string">'value'</span>;
}</code></pre>
```

### Note / Tip callout
```html
<div class="note">
  <span class="badge badge-note">Note</span>
  Callout text here.
</div>
```

### Section separator
```html
<hr />
```

---

## Content rules

- **One `.block` + one `.fa` per logical paragraph/sub-section** — never skip the `.fa`
- Persian summary: natural Farsi, RTL — **cover every important point in the block, no exceptions**
  - Do NOT compress or drop technical details, numbers, API names, steps, or list items
  - Length follows the content: a block with 6 bullet points needs 6 points in Farsi too
  - 2–4 sentences is a minimum floor, not a cap — write more if the block demands it
- Numbered sections: `1.`, `1.1`, `1.2` etc. in both headings and TOC anchors
- Code blocks: always include `<span>` color classes — no bare text in `<code>`
- Use `.badge-good` / `.badge-bad` / `.badge-note` inside `.note` divs as appropriate
- `<hr />` between every top-level `<section>`
- No external scripts, fonts, or stylesheets — fully self-contained

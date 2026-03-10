# Claude Instructions — Network/

When the user asks for the next topic or provides a topic number, create
`Network/<N>-<Topic_Name>/index.html` using the exact design system below.
Refer to `network-concepts.md` for the full topic list and sub-points.
No external dependencies. One self-contained HTML file per topic.

---

## Folder convention

```
Network/
  network-concepts.md        ← source topic list (Persian)
  CLAUDE.md                  ← this file
  1-How_Internet_Works/
    index.html
  2-IP_Address/
    index.html
  ...
```

---

## HTML skeleton

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{Topic Title} — Network Concepts</title>
  <style>/* blue design system below */</style>
</head>
<body>
  <header>…</header>
  <div class="layout">
    <aside class="toc">…</aside>
    <main>…sections…</main>
  </div>
</body>
</html>
```

---

## Design system — BLUE theme (copy this CSS exactly)

```css
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --bg:             #060b14;
  --surface:        #0d1626;
  --surface2:       #152035;
  --border:         #1e3557;
  --text:           #dde6f0;
  --muted:          #8aa3c0;
  --accent:         #38bdf8;   /* sky blue — links, subsection titles */
  --accent2:        #7dd3fc;   /* lighter blue — section titles */
  --accent3:        #0ea5e9;   /* mid blue — highlights */
  --green:          #34d399;
  --yellow:         #fbbf24;
  --red:            #f87171;
  --code-bg:        #05080f;
  --persian-bg:     #0a1929;
  --persian-border: #1a4266;
  --persian-text:   #93c5fd;
  --radius:         10px;
}

body {
  background: var(--bg);
  color: var(--text);
  font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
  font-size: 16px;
  line-height: 1.75;
  padding: 0;
}

/* Header */
header {
  background: linear-gradient(135deg, #060b14 0%, #0d1f3c 100%);
  border-bottom: 1px solid var(--border);
  padding: 2.5rem 2rem 2rem;
}
.header-inner { max-width: 1100px; margin: 0 auto; }
header .topic-num {
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.15em;
  color: var(--accent3); margin-bottom: 0.4rem;
}
header h1 { font-size: 2rem; font-weight: 700; color: #fff; line-height: 1.2; margin-bottom: 0.5rem; }
header .meta { font-size: 0.8rem; color: var(--muted); display: flex; gap: 1rem; flex-wrap: wrap; }
header .meta a { color: var(--accent); text-decoration: none; }

/* Two-column layout */
.layout {
  max-width: 1100px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 220px 1fr;
  gap: 2.5rem;
  padding: 2rem 1.5rem 4rem;
  align-items: start;
}

/* Sticky TOC sidebar */
.toc {
  position: sticky;
  top: 1.5rem;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.25rem;
}
.toc h2 {
  font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.12em;
  color: var(--muted); margin-bottom: 0.75rem;
}
.toc ol { padding-left: 1.1rem; }
.toc li { margin-bottom: 0.4rem; }
.toc a { color: var(--accent); text-decoration: none; font-size: 0.85rem; line-height: 1.4; }
.toc a:hover { color: var(--accent2); text-decoration: underline; }

/* Sections */
.section { margin-top: 2.5rem; }
.section:first-child { margin-top: 0; }

.section-title {
  font-size: 1.4rem; font-weight: 700; color: var(--accent2);
  margin-bottom: 1.25rem; padding-bottom: 0.4rem;
  border-bottom: 1px solid var(--border);
}
.subsection-title {
  font-size: 1.05rem; font-weight: 600; color: var(--accent);
  margin: 1.5rem 0 0.65rem;
}

/* Content block (English) */
.block {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.2rem 1.4rem;
  margin-bottom: 0.85rem;
}
.block p { color: var(--text); margin-bottom: 0.5rem; }
.block p:last-of-type { margin-bottom: 0; }

/* Persian summary */
.fa {
  background: var(--persian-bg);
  border: 1px solid var(--persian-border);
  border-radius: var(--radius);
  padding: 0.85rem 1.25rem;
  margin-top: 0.4rem;
  margin-bottom: 1.25rem;
  direction: rtl; text-align: right;
  font-family: 'Segoe UI', Tahoma, 'Noto Sans Arabic', sans-serif;
  font-size: 0.92rem; line-height: 1.9;
  color: var(--persian-text);
}
.fa::before {
  content: '🇮🇷 خلاصه';
  display: block; font-size: 0.7rem; text-transform: uppercase;
  letter-spacing: 0.1em; color: var(--accent2);
  margin-bottom: 0.4rem; direction: rtl;
}

/* SVG diagram wrapper */
.diagram {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin: 0.75rem 0 1.25rem;
  overflow-x: auto;
  text-align: center;
}
.diagram figcaption {
  font-size: 0.8rem; color: var(--muted);
  margin-top: 0.75rem; text-align: center;
}

/* Code */
pre { background: var(--code-bg); border: 1px solid var(--border); border-radius: var(--radius);
  padding: 1rem 1.25rem; overflow-x: auto; font-size: 0.88rem; line-height: 1.6; margin: 0.75rem 0; }
code { font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace; color: #93c5fd; }
.comment { color: #4a6080; }
.keyword { color: #38bdf8; }
.string  { color: #34d399; }
.fn      { color: #7dd3fc; }

/* Lists */
ul, ol { padding-left: 1.5rem; margin: 0.5rem 0; }
li { margin-bottom: 0.3rem; color: var(--text); }

/* Badges */
.badge { display: inline-block; font-size: 0.7rem; padding: 0.15rem 0.5rem;
  border-radius: 999px; font-weight: 600; margin-right: 0.35rem;
  text-transform: uppercase; letter-spacing: 0.05em; }
.badge-good { background: #064e3b; color: var(--green); }
.badge-bad  { background: #450a0a; color: var(--red); }
.badge-note { background: #1c1405; color: var(--yellow); }
.badge-info { background: #0c2744; color: var(--accent); }

/* Note callout */
.note { border-left: 3px solid var(--accent3); background: #081828;
  border-radius: 0 var(--radius) var(--radius) 0;
  padding: 0.75rem 1rem; font-size: 0.9rem; color: #bae6fd; margin: 0.75rem 0; }

strong { color: #f0f6ff; font-weight: 600; }
em { color: var(--muted); font-style: italic; }

hr { border: none; border-top: 1px solid var(--border); margin: 2.5rem 0; }

/* Table */
.table-wrap { overflow-x: auto; margin: 0.75rem 0; }
table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
thead tr { background: var(--surface2); }
th { color: var(--accent); text-align: left; padding: 0.6rem 1rem;
  border-bottom: 2px solid var(--border); font-weight: 600; white-space: nowrap; }
td { padding: 0.55rem 1rem; border-bottom: 1px solid var(--border); color: var(--text); }
tr:last-child td { border-bottom: none; }
tr:hover td { background: var(--surface2); }

@media (max-width: 720px) {
  .layout { grid-template-columns: 1fr; }
  .toc { position: static; }
  header h1 { font-size: 1.5rem; }
}
```

---

## Component patterns

### Header
```html
<header>
  <div class="header-inner">
    <div class="topic-num">Topic {N} — Network Concepts</div>
    <h1>{Topic Title}</h1>
    <div class="meta">
      <span>Network for Frontend Developers</span>
      <a href="https://…" target="_blank">MDN Reference</a>
    </div>
  </div>
</header>
```

### Two-column layout
```html
<div class="layout">
  <aside class="toc">
    <h2>Contents</h2>
    <ol>
      <li><a href="#section-id">Section</a></li>
    </ol>
  </aside>
  <main>
    <!-- sections here -->
  </main>
</div>
```

### Section
```html
<section class="section" id="section-id">
  <h2 class="section-title">1. Section Title</h2>

  <h3 class="subsection-title">1.1 Subsection</h3>

  <div class="block">
    <p>Full English content…</p>
  </div>
  <div class="fa">خلاصه فارسی کامل — همه نکات مهم را پوشش بده</div>

  <figure class="diagram">
    <svg>…inline SVG…</svg>
    <figcaption>Caption text</figcaption>
  </figure>
</section>
```

### Note callout
```html
<div class="note">
  <span class="badge badge-info">Note</span>
  Callout text.
</div>
```

---

## SVG diagram rules

- Always inline SVG — no external images or img tags
- Use the same color palette: `#38bdf8` (accent), `#152035` (box fill), `#1e3557` (border), `#dde6f0` (text)
- Keep diagrams simple and readable
- Add `<figcaption>` below every diagram
- Wrap in `<figure class="diagram">`

---

## Content rules

- Cover every sub-point listed in `network-concepts.md` for that topic
- One `.block` + one `.fa` per logical concept — never skip `.fa`
- Persian summary: cover every important point, number, term, and step — no compression
- Use SVG diagrams wherever a visual makes the concept clearer
- Numbered sections match the topic outline: 1., 1.1, 1.2 etc.
- `<hr />` between major sections
- No external scripts, fonts, or stylesheets — fully self-contained

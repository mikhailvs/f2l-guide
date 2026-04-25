# Frontend Fix Plan — F2L Guide
_Prepared 2026-04-24 · covers issues P1-1, P1-2, P1-3, P1-5, P1-6, A11Y-1 through A11Y-9, UX-3, UX-4, STD-4_

---

## Table of Contents

1. [Architecture Decisions First](#architecture-decisions-first)
2. [P1-1 — Play Button Wrong API](#p1-1--play-button-wrong-api)
3. [P1-2 — 404 Missing Stylesheets and Nav](#p1-2--404-missing-stylesheets-and-nav)
4. [P1-3 — Double renderCases() on Filter Click](#p1-3--double-rendercases-on-filter-click)
5. [P1-5 — Inline onclick on Reset Progress](#p1-5--inline-onclick-on-reset-progress)
6. [P1-6 — Dead CSS for Move Chip Colors](#p1-6--dead-css-for-move-chip-colors)
7. [A11Y-1 — No Skip Link](#a11y-1--no-skip-link)
8. [A11Y-2 — Filter Buttons Missing aria-pressed](#a11y-2--filter-buttons-missing-aria-pressed)
9. [A11Y-3 — aria-valuenow Never Updated](#a11y-3--aria-valuenow-never-updated)
10. [A11Y-4 — aria-live Flood on Card Grid](#a11y-4--aria-live-flood-on-card-grid)
11. [A11Y-5 — Mobile Menu Escape + Focus Management](#a11y-5--mobile-menu-escape--focus-management)
12. [A11Y-6 — twisty-player Loses Accessible Name](#a11y-6--twisty-player-loses-accessible-name)
13. [A11Y-7 — --text-subtle Contrast Failure](#a11y-7----text-subtle-contrast-failure)
14. [A11Y-8 — F-face and L-face Chip Contrast](#a11y-8--f-face-and-l-face-chip-contrast)
15. [A11Y-9 — prefers-reduced-motion Doesn't Reach twisty-player](#a11y-9--prefers-reduced-motion-doesnt-reach-twisty-player)
16. [UX-3 — Filter Bar Not Sticky](#ux-3--filter-bar-not-sticky)
17. [UX-4 — "Learned" Filter Mixed with Category Filters](#ux-4--learned-filter-mixed-with-category-filters)
18. [STD-4 — transition:all on Filter/Learned Buttons](#std-4--transitionall-on-filterlearned-buttons)

---

## Architecture Decisions First

These four questions affect multiple issues. Decide them before touching any code.

### Hash routing vs. JS state

**Decision: Drop hash routing. Manage filter state purely in JS; use `history.replaceState` for shareability.**

The current design uses `location.hash` as the source of truth for the active filter.
That causes P1-3 (double render) and requires the `hashchange` listener, which adds
accidental complexity. Hashes were the right call for SPAs in 2012; for a single static
page that already loads all case data from one JSON file, there is no navigational benefit
to hash routing, only cost.

Replace the pattern with:

1. `setFilter(id)` becomes the only entry point. It updates `activeFilter`, calls
   `renderCases()` once, calls `updateFilterButtons()` once, and calls
   `history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id)`.
   That last call keeps URL shareability (users can copy a URL with `#easy`) without
   routing through the `hashchange` event.
2. On page load, read `location.hash` once inside `init()` to restore the initial
   filter, then never again.
3. Remove the `window.addEventListener('hashchange', applyFilterFromHash)` listener
   entirely. Remove `applyFilterFromHash()` — its logic collapses into `init()`.

This is a three-line net deletion once the dust settles.

### Card DOM destruction vs. CSS hide/show

**Decision: Keep DOM destruction (innerHTML = '') for now, but do it smarter.**

The temptation is to build all 41 cards once, then toggle `hidden` on them during
filter changes. For a plain HTML/CSS site that would be the clear winner. For this
site it is actively harmful:

- Each card contains a `twisty-player` custom element that is lazy-initialized by
  an `IntersectionObserver`. Keeping 41 players in the DOM at all times means the
  observer fires on all visible ones simultaneously after a filter change, even
  cards that were just brought back into view from a "hidden" state.
- More critically: when a card is hidden via `display:none`, its `twisty-player`
  loses its layout box. When un-hidden, the element may need to re-initialize its
  WebGL context. The behavior is implementation-defined in cubing.js and is not safe
  to rely on.
- The actual performance cost of rebuilding 17 cards (the worst filter case,
  "Both in Top") is negligible — it is string concatenation and DOM insertion, not
  layout-heavy work.

The one genuine improvement available: add a `DocumentFragment` build step so the
grid gets a single `appendChild(fragment)` rather than 17 separate `appendChild`
calls. This eliminates 16 intermediate reflows. Change in `renderCases()`:

```js
const fragment = document.createDocumentFragment();
visible.forEach(c => fragment.appendChild(buildCard(c, learned.has(c.id))));
grid.replaceChildren(fragment); // replaceChildren is cleaner than innerHTML=''
```

`grid.replaceChildren()` is supported in all evergreen browsers and is semantically
clearer than `innerHTML = ''` followed by a loop of appends.

### CSS vs. JS for move chip colors

**Decision: JS wins. Remove the dead CSS declarations and centralize color in JS.**

Currently `renderAlg()` in `cases.js` sets `style="background:${bg};color:${color}"`
using the `FACE_COLORS` / `FACE_TEXT` maps, while `components.css` also has
`.move-R { color:#fff }`, `.move-F { color:#fff }` etc. The CSS declarations are
completely dead — they are overridden by inline style on every single element.

The question is: which side should own the truth? The answer is JS, for one concrete
reason: the F and L chips need different text colors after A11Y-8 is fixed (see
below), and that fix has to go into the `FACE_TEXT` map regardless. Splitting the
same information between a JS map and a CSS block guarantees they will diverge again.

The fix for P1-6 / A11Y-8 together:
- Update `FACE_COLORS` and `FACE_TEXT` in `cases.js`.
- Strip the per-face color overrides from `.move-R`, `.move-F`, `.move-L`, `.move-B`
  in `components.css`. Keep only structural properties (size, padding, radius, font).
- The `.move-U` and `.move-D` chip colors in CSS also have no effect (JS sets them
  inline). Remove the background declarations too. The `.move` base class CSS should
  contain only layout/typography; all color comes from JS.

### --text-subtle replacement tokens

The current `--text-subtle: #555566` fails WCAG AA contrast (2.05–2.62:1) on every
background it appears on. The fix cannot simply be "use --text-muted (#888899)" across
the board — that would make secondary labels (case IDs, "MAIN ALGORITHM" labels,
recognition toggle text) the same visual weight as body text, collapsing the hierarchy.

**Two-token solution:**

| Token | Value | Contrast vs. --bg-base | Contrast vs. --bg-surface | Contrast vs. --bg-elevated | Use |
|-------|-------|------------------------|---------------------------|----------------------------|-----|
| `--text-subtle` | `#7a7a8c` | 4.61:1 | 4.15:1 | 3.75:1 | Replaces old value. Passes AA on bg-base/surface. |
| `--text-subtle-plus` | `#8e8ea0` | 5.52:1 | 4.97:1 | 4.54:1 | Use where text sits on --bg-elevated. |

`#7a7a8c` is the minimum bump that clears 4.5:1 on `--bg-base` (the most common
background). It fails by a hair on `--bg-elevated` (3.75:1), which is why
`--text-subtle-plus` exists for those contexts.

In practice, the elements that sit on `--bg-elevated` are: `.case-id` inside a card
(card background is `--bg-surface`, not elevated — this is fine), and the `.case-alg-label`
inside a card. Both are on `--bg-surface` (#1a1a24), giving 4.15:1, which falls just
short of AA. Using `--text-subtle-plus` (#8e8ea0) for `.case-id` and `.case-alg-label`
gives 4.97:1 on surface — clean pass.

Simplified rule:
- `--text-subtle` (#7a7a8c) for: `.recognition-toggle`, `.alt-toggle`, footer text
  (these sit on `--bg-base`).
- `--text-subtle-plus` (#8e8ea0) for: `.case-id`, `.case-alg-label`, any notes text
  inside cards (these sit on `--bg-surface`).

Add `--text-subtle-plus` to `tokens.css`. Update CSS usages accordingly.

---

## P1-1 — Play Button Wrong API

**File:** `js/viewer.js`, lines 35–41

**Problem:** `player.experimentalModel.twistySceneModel.puzzleManager.clear?.()` is a
deep internal API path that silently no-ops via optional chaining. The player does not
reset, so Play runs from wherever the animation was paused rather than from the start.

**Fix:** Replace the entire play button handler body. The public API is `player.timestamp`
and `player.play()`. Setting `timestamp = 0` rewinds the player; calling `play()` starts
it.

```js
// BEFORE (lines 35–41)
playBtn?.addEventListener('click', async () => {
  const player = card.querySelector('twisty-player');
  if (!player) return;
  await player.experimentalModel.twistySceneModel.puzzleManager.clear?.();
  player.timestamp = 0;
  player.play();
});

// AFTER
playBtn?.addEventListener('click', () => {
  const player = card.querySelector('twisty-player');
  if (!player) return;
  player.timestamp = 0;
  player.play();
});
```

Remove the `async` keyword — it was only there to await the broken internal call.

**Design decision required:** None. This is a straight API correction.

---

## P1-2 — 404 Missing Stylesheets and Nav

**File:** `404.html`

**Problem:** Missing `<link rel="stylesheet" href="styles/components.css">`, missing
`<script src="js/nav.js">`, and missing nav links and hamburger button in the header.
The "Go Home" `.btn.btn-primary` renders as plain unstyled text.

**Fix:** Three changes to `404.html`:

1. Add `components.css` to `<head>` (after `layout.css`):
```html
<link rel="stylesheet" href="styles/components.css">
```

2. Expand the `<nav>` to include the full link list and hamburger (copy from
   `cases.html` lines 19–31):
```html
<nav class="nav-inner" aria-label="Main navigation">
  <a href="index.html" class="nav-logo">F2L<span>Guide</span></a>
  <div class="nav-links" role="list">
    <a href="index.html" role="listitem">Home</a>
    <a href="cases.html" role="listitem">All Cases</a>
    <a href="about.html" role="listitem">About F2L</a>
  </div>
  <button class="nav-menu-btn" aria-label="Toggle menu" aria-expanded="false">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <rect y="3" width="20" height="2" rx="1"/>
      <rect y="9" width="20" height="2" rx="1"/>
      <rect y="15" width="20" height="2" rx="1"/>
    </svg>
  </button>
</nav>
```

3. Add `nav.js` before `</body>`:
```html
<script src="js/nav.js"></script>
```

**Design decision required:** None.

---

## P1-3 — Double renderCases() on Every Filter Click

**Files:** `js/cases.js`, lines 27–65

**Problem:** `setFilter()` calls `renderCases()` directly, then sets `location.hash`,
which triggers `hashchange`, which calls `applyFilterFromHash()`, which calls
`renderCases()` a second time. Two full DOM rebuilds per click.

**Fix:** Apply the architecture decision above (drop `hashchange` routing).

Replace the relevant section of `cases.js`:

```js
// REMOVE this line from init():
window.addEventListener('hashchange', applyFilterFromHash);

// REPLACE init() body:
async function init() {
  const res = await fetch('data/f2l-cases.json');
  const { cases } = await res.json();
  allCases = cases;

  renderFilterBar();
  renderProgressBar(allCases.length);

  // Read hash once on load for shareability; no ongoing listener needed.
  const hash = location.hash.replace('#', '') || 'all';
  activeFilter = CATEGORIES.find(c => c.id === hash) ? hash : 'all';
  renderCases();
  updateFilterButtons();
}

// REPLACE setFilter():
function setFilter(id) {
  activeFilter = id;
  history.replaceState(null, '', id === 'all' ? location.pathname : '#' + id);
  renderCases();
  updateFilterButtons();
}

// DELETE applyFilterFromHash() entirely.
```

This reduces two renders to one and eliminates the `hashchange` listener. URL
shareability is preserved via `history.replaceState`.

**Design decision required:** None beyond the architecture decision above.

---

## P1-5 — Inline onclick on Reset Progress

**File:** `cases.html`, lines 52–57

**Problem:** The Reset button uses an inline `onclick` that:
- Hardcodes the localStorage key `'f2l-learned'` (already defined as `STORAGE_KEY`
  in `progress.js` — duplication that will drift)
- Uses `browser confirm()` (blocks the main thread, unstyled, inaccessible)
- Calls `location.reload()` rather than using the exported `resetProgress()` function

**Fix — two parts:**

**Part 1:** Replace the inline button in `cases.html`. Remove the `onclick` entirely.
Give the button an ID and drop the inline style (use a CSS class):

```html
<!-- BEFORE -->
<button
  onclick="if(confirm('Reset all progress?')){localStorage.removeItem('f2l-learned');location.reload();}"
  style="font-size:var(--text-xs);color:var(--text-subtle);padding:0;background:none;border:none;cursor:pointer;white-space:nowrap;"
  aria-label="Reset all progress">
  Reset
</button>

<!-- AFTER -->
<button id="reset-progress-btn" class="reset-btn" aria-label="Reset all progress">
  Reset
</button>
```

Add `.reset-btn` to `components.css`:
```css
.reset-btn {
  font-size: var(--text-xs);
  color: var(--text-subtle);
  padding: 0;
  white-space: nowrap;
  transition: color var(--transition-fast);
}
.reset-btn:hover { color: var(--text-muted); }
```

**Part 2:** Wire the button in `cases.js` inside `init()`, after the DOM is ready.
Import `resetProgress` (already exported from `progress.js`):

```js
// Already imported at top of cases.js — add resetProgress to the import:
import { getLearnedSet, setLearned, renderProgressBar, resetProgress } from './progress.js';

// In init(), after renderFilterBar():
const resetBtn = document.getElementById('reset-progress-btn');
resetBtn?.addEventListener('click', () => {
  if (!window.confirm('Reset all progress?')) return; // confirm() is acceptable for now; replace with modal dialog in a future UX pass
  resetProgress();
  renderProgressBar(allCases.length);
  refreshLearnedCount();
  renderCases();
});
```

Note: `window.confirm()` is kept for now as a one-line gate. A future UX pass can
replace it with a non-blocking confirmation pattern. The key fix here is removing
the hardcoded localStorage key and the `location.reload()`.

**Design decision required:** Whether to address the `confirm()` dialog now or defer.
Recommendation: defer to a UX polish pass — the goal here is eliminating the key
duplication and module bypass.

---

## P1-6 — Dead CSS for Move Chip Colors

**Files:** `js/cases.js` (FACE_COLORS, FACE_TEXT maps), `styles/components.css`
(`.move-R`, `.move-F`, etc.)

**Problem:** `renderAlg()` sets `style="background:${bg};color:${color}"` on every
chip, making the per-face color rules in CSS completely dead. This is addressed jointly
with A11Y-8 — see that section for the combined fix.

---

## A11Y-1 — No Skip Link

**File:** `cases.html` (primary fix), also `index.html`, `about.html`, `404.html`

**Problem:** No skip-to-main-content link. On cases.html there are 7 filter buttons
between the nav and the first case card, making keyboard navigation from the top
brutally slow.

**Fix:** Add a skip link as the very first element inside `<body>` on each page.

In `base.css`, add:
```css
.skip-link {
  position: absolute;
  top: -999px;
  left: var(--space-4);
  padding: var(--space-2) var(--space-4);
  background: var(--accent);
  color: #000;
  font-weight: 700;
  border-radius: var(--radius);
  z-index: 9999;
  text-decoration: none;
}
.skip-link:focus {
  top: var(--space-2);
}
```

In each HTML file, as the first child of `<body>`:
```html
<a href="#main-content" class="skip-link">Skip to main content</a>
```

In `cases.html`, change:
```html
<!-- BEFORE -->
<main>

<!-- AFTER -->
<main id="main-content">
```

Apply the same `id="main-content"` to the `<main>` element on all pages.

**Design decision required:** None.

---

## A11Y-2 — Filter Buttons Missing aria-pressed

**File:** `js/cases.js`, `renderFilterBar()` (line 43) and `updateFilterButtons()`
(lines 67–71)

**Problem:** Active filter state is communicated by CSS class only. Screen reader users
have no way to know which filter is selected.

**Fix — two changes:**

In `renderFilterBar()`, set initial `aria-pressed` on each button:
```js
// BEFORE (line 47):
btn.setAttribute('aria-label', `Filter by ${cat.label}`);

// AFTER:
btn.setAttribute('aria-label', `Filter by ${cat.label}`);
btn.setAttribute('aria-pressed', cat.id === activeFilter ? 'true' : 'false');
```

In `updateFilterButtons()`, sync `aria-pressed` alongside the CSS class:
```js
// BEFORE:
function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.filter === activeFilter);
  });
}

// AFTER:
function updateFilterButtons() {
  document.querySelectorAll('.filter-btn').forEach(btn => {
    const isActive = btn.dataset.filter === activeFilter;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });
}
```

**Design decision required:** None. `aria-pressed` on toggle buttons is the correct
ARIA pattern for this case (a group of exclusive toggles, not a true radio group).
Using `role="radio"` / `radiogroup` would require more ARIA wiring and is not worth
it for 7 buttons.

---

## A11Y-3 — aria-valuenow Never Updated

**File:** `js/progress.js`, `renderProgressBar()` (lines 22–30)

**Problem:** The `aria-valuenow` attribute on the progress bar track is set to `"0"`
in the HTML and never updated by `renderProgressBar()`. Screen readers always announce
"0 of 41."

**Fix:** Add a single line to `renderProgressBar()`:

```js
// BEFORE (line 27–28):
wrap.querySelector('.progress-bar-fill').style.width = pct + '%';
const lbl = wrap.querySelector('.progress-label');

// AFTER:
const track = wrap.querySelector('[role="progressbar"]');
if (track) track.setAttribute('aria-valuenow', String(count));
wrap.querySelector('.progress-bar-fill').style.width = pct + '%';
const lbl = wrap.querySelector('.progress-label');
```

**Design decision required:** None.

---

## A11Y-4 — aria-live Flood on Card Grid

**File:** `cases.html`, line 69; `styles/components.css` (cases-count section)

**Problem:** `aria-live="polite"` on `.cases-grid` causes every card's `aria-label`
to be announced when the filter changes — up to 17 announcements in a row for the
"Both in Top" filter.

**Fix:** Move the live region to `.cases-count`, which already contains the summary
"Showing X of 41 cases". That single sentence is the correct thing to announce.

In `cases.html`:
```html
<!-- BEFORE (line 69): -->
<div class="cases-grid" role="list" aria-live="polite" aria-label="F2L cases"></div>

<!-- AFTER: -->
<div class="cases-grid" role="list" aria-label="F2L cases"></div>
```

In `cases.html`, update the count paragraph:
```html
<!-- BEFORE (line 65): -->
<p class="cases-count">Showing <strong>41</strong> of 41 cases</p>

<!-- AFTER: -->
<p class="cases-count" role="status" aria-live="polite" aria-atomic="true">
  Showing <strong>41</strong> of 41 cases
</p>
```

`role="status"` is equivalent to `aria-live="polite"` + `aria-atomic="true"` but
the explicit `aria-atomic` ensures the whole sentence is announced, not just the
changed number fragment.

Remove `aria-live="polite"` from `.cases-grid`. The grid keeps `role="list"` and
`aria-label` for structural semantics.

**Design decision required:** None.

---

## A11Y-5 — Mobile Menu Escape + Focus Management

**File:** `js/nav.js`

**Problem:** No Escape key handler, no focus movement into menu on open, no focus
return on close. Keyboard users who open the mobile menu are stranded.

**Fix:** Rewrite `nav.js` with proper focus management:

```js
const btn = document.querySelector('.nav-menu-btn');
const links = document.querySelector('.nav-links');

if (btn && links) {
  const firstLink = links.querySelector('a');

  btn.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(open));
    if (open && firstLink) {
      firstLink.focus();
    }
  });

  // Escape closes the menu and returns focus to the toggle button
  links.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && links.classList.contains('open')) {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
      btn.focus();
    }
  });

  // Click outside closes the menu
  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !links.contains(e.target)) {
      links.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    }
  });
}

// Mark active nav link (unchanged)
const path = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  const href = a.getAttribute('href');
  if (href === path || (path === '' && href === 'index.html')) {
    a.classList.add('active');
    a.ariaCurrent = 'page';
  }
});
```

**Design decision required:** The mobile menu currently has no `role` or `aria-controls`
wiring between the button and the link list. Since the button already has `aria-expanded`
and the visual relationship is clear, adding `aria-controls` pointing to the `.nav-links`
id would be the correct completion — add `id="main-nav"` to `.nav-links` and
`aria-controls="main-nav"` to the button in all HTML files.

---

## A11Y-6 — twisty-player Loses Accessible Name After Init

**File:** `js/viewer.js`, `initPlayer()` (lines 17–28)

**Problem:** The `.viewer-placeholder` has `role="img"` and `aria-label="3D cube
diagram for {name}"`. When `placeholder.replaceWith(player)` is called, the new
`<twisty-player>` element has neither attribute — the accessible name is gone.

**Fix:** Copy both attributes from the placeholder to the player before replacing:

```js
// BEFORE (lines 28):
placeholder.replaceWith(player);

// AFTER:
player.setAttribute('role', placeholder.getAttribute('role') || 'img');
const label = placeholder.getAttribute('aria-label');
if (label) player.setAttribute('aria-label', label);
placeholder.replaceWith(player);
```

This is a two-line addition. The placeholder already has the correct label text
built in `buildCard()` — no data needs to flow back through any other layer.

**Design decision required:** None. Custom elements can hold arbitrary ARIA attributes;
the browser treats them the same as on a `<div>`.

---

## A11Y-7 — --text-subtle Contrast Failure

**File:** `styles/tokens.css`, `styles/components.css`

See the "Architecture Decisions" section for the full rationale and numbers.

**Change 1 — `tokens.css`:** Update `--text-subtle` and add `--text-subtle-plus`:

```css
/* BEFORE */
--text-subtle:  #555566;

/* AFTER */
--text-subtle:      #7a7a8c;   /* 4.61:1 on --bg-base, 4.15:1 on --bg-surface */
--text-subtle-plus: #8e8ea0;   /* 5.52:1 on --bg-base, 4.97:1 on --bg-surface */
```

**Change 2 — `components.css`:** Update elements inside cards to use `--text-subtle-plus`:

```css
/* .case-id — sits on --bg-surface */
.case-id {
  color: var(--text-subtle-plus);  /* was var(--text-subtle) */
}

/* .case-alg-label — sits on --bg-surface */
.case-alg-label {
  color: var(--text-subtle-plus);  /* was var(--text-subtle) */
}
```

All other existing uses of `var(--text-subtle)` (`.recognition-toggle`, `.alt-toggle`,
`.reset-btn`, footer text) sit on `--bg-base` and are correct with the updated value.

**Change 3 — `cases.js`:** The inline notes style in `buildCard()` uses
`color:var(--text-subtle)` on notes text inside cards. Update to `--text-subtle-plus`:

```js
// In buildCard(), two places — the mainAlg.notes and altAlg.notes lines:
// BEFORE:
`<div style="font-size:var(--text-xs);color:var(--text-subtle);margin-top:4px;">`

// AFTER:
`<div style="font-size:var(--text-xs);color:var(--text-subtle-plus);margin-top:4px;">`
```

**Design decision required:** The two-token approach is a judgment call. An alternative
is a single value that passes on the worst background (`--bg-elevated`: needs ≥4.5:1,
which requires ≥#8e8ea0). Using `#8e8ea0` everywhere would be simpler and safer.
Recommendation: use the two-token approach only if visual hierarchy between "subtle"
and "muted" labels matters to the designer. If that distinction is not intentional,
collapse to a single `--text-subtle: #8e8ea0` and be done with it.

---

## A11Y-8 — F-face and L-face Chip Contrast

**Files:** `js/cases.js` (`FACE_TEXT` map, lines 14–15), `styles/components.css`
(`.move-F`, `.move-L` declarations)

**Problem:**
- F face: white (#fff) on green (#30A030) = 3.39:1 (fails AA 4.5:1)
- L face: white (#fff) on orange (#E07820) = 3.05:1 (fails AA 4.5:1)
- The `opacity: 0.82` and `opacity: 0.65` modifiers for prime/double moves make
  both worse.

**Decision: Use dark text (#1a1a00 / near-black) on F and L, not a color change.**

Rationale: The face colors are canonical (green = F, orange = L) and are shown in
twisty-player. Changing the chip background to a darker shade would diverge from the
actual cube colors and confuse learners cross-referencing the 3D viewer. Dark text on
the existing colors passes comfortably:

- `#1a1a00` on `#30A030` (F green): 7.21:1 — excellent
- `#1a1a00` on `#E07820` (L orange): 6.14:1 — excellent

**Fix — `cases.js` FACE_TEXT map (line 15):**

```js
// BEFORE:
const FACE_TEXT = { U: '#000', R: '#fff', F: '#fff', D: '#000', L: '#fff', B: '#fff' };

// AFTER:
const FACE_TEXT = { U: '#000', R: '#fff', F: '#1a1a00', D: '#000', L: '#1a1a00', B: '#fff' };
```

**Fix — `components.css` (P1-6 cleanup, per architecture decision):**

Remove all per-face color and background declarations. The `.move` base class keeps
only structural properties:

```css
/* REMOVE these entire rules: */
.move-U  { background: var(--face-U); }
.move-R  { background: var(--face-R); color: #fff; }
.move-F  { background: var(--face-F); color: #fff; }
.move-D  { background: var(--face-D); }
.move-L  { background: var(--face-L); color: #fff; }
.move-B  { background: var(--face-B); color: #fff; }
```

The `.move` base class `color: #000` fallback (line 221) can remain as a defensive
default, but it will never be reached since JS always sets an explicit color.

**Design decision required:** Confirm that `#1a1a00` (a very dark warm black) is
preferred over pure `#000000` for the F and L chips. Either passes easily; `#1a1a00`
is slightly warmer and reads more naturally on the colored backgrounds. If the designer
wants pure black for consistency with the U and D faces, use `#000` for all four faces.

---

## A11Y-9 — prefers-reduced-motion Doesn't Reach twisty-player

**File:** `js/viewer.js`

**Problem:** `base.css` suppresses CSS transitions/animations via
`prefers-reduced-motion: reduce`, but `twisty-player` renders via `requestAnimationFrame`
inside its own Shadow DOM. The CSS rule has zero effect on the player's playback.

**Fix:** In `wireViewerControls()`, check the media query before calling `player.play()`.
If reduced motion is preferred, use `player.jumpToEnd()` instead (jumps directly to the
solved state with no animation):

```js
export function wireViewerControls(card) {
  const playBtn = card.querySelector('[data-action="play"]');
  const resetBtn = card.querySelector('[data-action="reset"]');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  playBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.timestamp = 0;
    if (prefersReducedMotion.matches) {
      player.jumpToEnd();
    } else {
      player.play();
    }
  });

  resetBtn?.addEventListener('click', () => {
    const player = card.querySelector('twisty-player');
    if (!player) return;
    player.timestamp = 0;
  });
}
```

The `prefersReducedMotion` MediaQueryList is created once per card (inside
`wireViewerControls`) and evaluated at click time, so it always reflects the current
system preference — no need to listen for changes.

For the `initPlayer()` path (auto-play is not enabled, so the player simply sits at
`timestamp = 0` after init), no change is needed. The player does not animate on load.

**Design decision required:** Confirm that "show final solved state immediately" is the
right reduced-motion behavior. An alternative is to not respond to Play at all and show
a static final image, but `jumpToEnd()` is the more informative response — the learner
still sees the solved state.

---

## UX-3 — Filter Bar Not Sticky

**File:** `styles/components.css`, `.filter-bar` rule (lines 58–64)

**Problem:** Scrolling down to case 20 and switching categories requires scrolling back
to the top. The filter bar was called out as "sticky at top" in the original phase plan.

**Fix:** Make `.filter-bar` sticky. It needs a background so it doesn't bleed over
cards, a `z-index` to stay above card content, and a top offset equal to `--nav-height`
so it clears the fixed site header.

```css
/* BEFORE: */
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
}

/* AFTER: */
.filter-bar {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  flex-wrap: wrap;
  margin-bottom: var(--space-6);
  position: sticky;
  top: var(--nav-height);
  z-index: 10;
  background: var(--bg-base);
  padding: var(--space-3) 0;
  /* Extend background to cover edge-bleed when sticky */
  margin-left: calc(var(--space-4) * -1);
  margin-right: calc(var(--space-4) * -1);
  padding-left: var(--space-4);
  padding-right: var(--space-4);
}
```

The negative margin + matching padding trick ("padding-compensated bleed") prevents
a gap between the sticky bar and the viewport edges on mobile without wrapping the
bar in an extra full-width container.

**Design decision required:** Verify that the nav header is actually `position: fixed`
or `position: sticky` with `height: var(--nav-height)`. If it is not fixed, `top: 0`
should be used instead of `top: var(--nav-height)`. Check `layout.css`.

---

## UX-4 — "Learned" Filter Mixed with Category Filters

**File:** `js/cases.js`, `renderFilterBar()` (lines 34–51); `styles/components.css`

**Problem:** "Learned" is a learner-state filter (did I mark this?), while the other
6 buttons are content-category filters (what is this case?). Grouping them together
implies they are the same kind of thing. A user scanning the bar for "Easy" has to
parse past "Learned" every time.

**Fix — JS:** Separate "Learned" from the category group in `renderFilterBar()`.
Add a visual divider using a `<span>` separator element:

```js
function renderFilterBar() {
  const bar = document.querySelector('.filter-bar');
  if (!bar) return;

  CATEGORIES.forEach(cat => {
    const count = cat.id === 'all' ? allCases.length
                : cat.id === 'learned' ? getLearnedSet().size
                : allCases.filter(c => c.category === cat.id).length;

    // Insert separator before the learned button
    if (cat.id === 'learned') {
      const sep = document.createElement('span');
      sep.className = 'filter-sep';
      sep.setAttribute('aria-hidden', 'true');
      bar.appendChild(sep);
    }

    const btn = document.createElement('button');
    btn.className = 'filter-btn' + (cat.id === 'learned' ? ' filter-btn-learned' : '');
    btn.dataset.filter = cat.id;
    btn.setAttribute('aria-label', `Filter by ${cat.label}`);
    btn.setAttribute('aria-pressed', cat.id === activeFilter ? 'true' : 'false');
    btn.innerHTML = `${cat.label} <span class="count">${count}</span>`;
    btn.addEventListener('click', () => setFilter(cat.id));
    bar.appendChild(btn);
  });
}
```

**Fix — CSS:** Style the separator and learned button variant:

```css
.filter-sep {
  width: 1px;
  height: 24px;
  background: var(--border-strong);
  flex-shrink: 0;
  align-self: center;
}

.filter-btn-learned {
  border-color: rgba(52, 211, 153, 0.25);
  color: var(--text-muted);
}
.filter-btn-learned:hover {
  border-color: rgba(52, 211, 153, 0.5);
  color: var(--success);
}
.filter-btn-learned.active {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.4);
  color: var(--success);
}
```

The green tint on the "Learned" button echoes the `.learned-btn.done` and
`.case-card.learned` visual language already in the design. The separator is
`aria-hidden` — screen reader users navigating by button already encounter the
buttons in order; the separator adds no semantic value.

**Design decision required:** Whether to put "Learned" before or after "All". Current
position is last. Moving it to second (All | Learned | separator | Easy | …) groups
the two "status" filters together. Recommendation: leave it last — "All" and "Learned"
are conceptually different axes and the current order already establishes that.

---

## STD-4 — transition:all on Filter/Learned Buttons

**File:** `styles/components.css`, `.filter-btn` (line 77) and `.learned-btn` (line 247)

**Problem:** `transition: all var(--transition-fast)` animates every CSS property,
including layout-affecting ones like `width`, `height`, and `padding`. This can cause
unexpected animation on filter count changes and is a performance footgun.

**Fix:** Replace `transition: all` with an explicit property list in both rules.

```css
/* .filter-btn (line 77) — BEFORE: */
transition: all var(--transition-fast);

/* AFTER: */
transition: background var(--transition-fast),
            color var(--transition-fast),
            border-color var(--transition-fast);
```

```css
/* .learned-btn (line 247) — BEFORE: */
transition: all var(--transition-fast);

/* AFTER: */
transition: background var(--transition-fast),
            color var(--transition-fast),
            border-color var(--transition-fast);
```

These match the pattern already used on `.btn` (lines 11–13 of components.css), which
was correctly written with explicit properties from the start.

**Design decision required:** None.

---

## Implementation Order

Apply fixes in this order to minimize merge conflicts and catch regressions early:

| Step | Issues | Rationale |
|------|--------|-----------|
| 1 | STD-4 | Zero-risk CSS-only change; establishes clean baseline |
| 2 | P1-2 | Isolated HTML-only change; unblocks 404 visual testing |
| 3 | P1-3 (architecture) | Changes cases.js flow; do this before any JS edits that layer on top |
| 4 | P1-5 | Now that init() is clean from step 3, add the reset button wiring |
| 5 | P1-1, A11Y-9 | viewer.js is self-contained; fix both Play API issues together |
| 6 | A11Y-6 | Completes the viewer.js pass |
| 7 | P1-6 + A11Y-8 | One combined cases.js + CSS change for chip colors |
| 8 | A11Y-7 | tokens.css + CSS updates; do after chip colors so contrast is checkable together |
| 9 | A11Y-1 | Skip link is HTML + CSS; base.css change affects all pages |
| 10 | A11Y-2 | aria-pressed wiring in cases.js renderFilterBar / updateFilterButtons |
| 11 | A11Y-3 | One line in progress.js |
| 12 | A11Y-4 | Move aria-live from grid to count element |
| 13 | A11Y-5 | nav.js rewrite; all pages affected |
| 14 | UX-3 | CSS sticky; visual QA needed on all viewports |
| 15 | UX-4 | renderFilterBar + CSS; builds on A11Y-2 aria-pressed already in place |

---

## Files Changed Summary

| File | Issues Addressed |
|------|-----------------|
| `js/viewer.js` | P1-1, A11Y-6, A11Y-9 |
| `js/cases.js` | P1-3, P1-5, P1-6, A11Y-2, A11Y-4 (count element), A11Y-7 (inline notes), A11Y-8, UX-4 |
| `js/progress.js` | A11Y-3 |
| `js/nav.js` | A11Y-5 |
| `cases.html` | P1-3 (remove hashchange), P1-5 (button markup), A11Y-1, A11Y-4, UX-4 (count markup) |
| `404.html` | P1-2 |
| `styles/tokens.css` | A11Y-7 |
| `styles/components.css` | P1-6, STD-4, A11Y-7, A11Y-8, UX-3, UX-4 |
| `styles/base.css` | A11Y-1 (skip-link styles) |

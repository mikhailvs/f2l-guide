# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Comprehensive static site teaching all 41 F2L (First Two Layers) cases of the CFOP Rubik's cube method. No build step — pure HTML/CSS/JS served from any static host.

## Running Locally

```bash
python3 -m http.server 8000
# or
npx serve .
```

Open `http://localhost:8000`. All pages must be served over HTTP (not `file://`) for ES module imports and `fetch()` to work.

## Architecture

**No framework, no bundler.** Three pages, one data file, two JS modules.

| File | Role |
|------|------|
| `index.html` | Landing page — what F2L is, start-here links |
| `cases.html` | Core page — filterable grid of all 41 cases |
| `about.html` | Notation guide, prerequisites, how to use the site |
| `data/f2l-cases.json` | Single source of truth for all 41 cases |
| `js/cases.js` | Renders case cards from JSON, filter logic, hash routing |
| `js/progress.js` | localStorage progress tracking (learned/unlearned per case ID) |
| `js/viewer.js` | twisty-player lazy-init via IntersectionObserver |
| `js/nav.js` | Mobile menu toggle |
| `styles/tokens.css` | CSS custom properties — colors, type scale, spacing |
| `styles/base.css` | Reset + global styles |
| `styles/layout.css` | Header, nav, footer, page grid |
| `styles/components.css` | Case cards, filter buttons, algorithm chips, progress bar |

## Data Schema

Each entry in `data/f2l-cases.json`:

```jsonc
{
  "id": "f2l-01",
  "name": "Easy Case 1",
  "category": "easy",          // easy | corner-in-slot | edge-in-top | both-in-top | advanced
  "slot": "FR",                // FR | FL | BR | BL (all algs target FR slot)
  "scramble": "...",           // WCA notation setup scramble
  "recognition": "...",        // plain-text hint for spotting the case
  "algorithms": [
    { "label": "Main", "moves": "U R U' R'", "notes": "" },
    { "label": "Alt",  "moves": "...",        "notes": "..." }
  ]
}
```

All scrambles set up the case relative to the **FR slot**. All algorithms assume white cross on bottom, yellow on top.

## Key Conventions

- **Move notation chips**: each move token rendered as `<span class="move move-R">R</span>` — CSS class encodes face color
- **Face colors** (CSS vars): `--face-U` yellow, `--face-R` red, `--face-F` green, `--face-D` white, `--face-L` orange, `--face-B` blue
- **Lazy loading**: `<twisty-player>` elements are only initialized when their card enters the viewport (IntersectionObserver in `viewer.js`) — never initialize all 41 at once
- **Progress storage**: `localStorage` key `f2l-learned` → JSON array of case IDs
- **Filter routing**: active category filter reflected in `location.hash` (e.g. `cases.html#both-in-top`) for shareable links

## twisty-player

Loaded from CDN — no local install:

```html
<script type="module" src="https://cdn.cubing.net/js/cubing/twisty"></script>
```

Usage per case card:

```html
<twisty-player
  puzzle="3x3x3"
  alg="U R U' R'"
  experimental-setup-alg="SETUP_SCRAMBLE"
  hint-facelets="none"
  back-view="none"
  control-panel="none"
></twisty-player>
```

## Design Tokens (reference)

```
--bg-base: #0f0f13       --text-primary: #f0f0f5
--bg-surface: #1a1a24    --text-muted: #888899
--bg-elevated: #25253a   --accent: #FFD500
```

## Plan

Phased implementation tracked in `plan/`. Current phases:

1. `02-phase-1-scaffold.md` — HTML shell, design system, responsive layout
2. `03-phase-2-data.md` — complete `f2l-cases.json` for all 41 cases
3. `04-phase-3-visualization.md` — twisty-player integration + lazy loading
4. `05-phase-4-browser.md` — filter bar, case grid, algorithm chips
5. `06-phase-5-learning.md` — progress tracking, notation guide, recognition hints
6. `07-phase-6-polish.md` — mobile, a11y, accuracy pass, deployment

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Comprehensive static learning site for all 36 F2L cases of the CFOP Rubik's cube method. No build step — pure HTML/CSS/JS. Live at https://mikhailvs.github.io/f2l-guide/

## Running Locally

```bash
python3 -m http.server 8000
```

Must be served over HTTP (not `file://`) — ES modules and `fetch()` require it.

## Architecture

No framework, no bundler. Three content pages, one data file, four JS modules.

| File | Role |
|------|------|
| `index.html` | Landing — hero targets learner who just finished the cross |
| `cases.html` | Core — 36 cases, filter bar, Learning/Reference mode toggle |
| `about.html` | 11-section guide: intuitive F2L, concepts, notation, learning order |
| `404.html` | GitHub Pages 404 |
| `data/f2l-cases.json` | Single source of truth for all 36 cases |
| `js/cases.js` | Renders cards, subgroup sort, mode toggle, filter logic |
| `js/progress.js` | localStorage tracking (`f2l-learned` key) |
| `js/viewer.js` | twisty-player lazy-init via IntersectionObserver |
| `js/nav.js` | Mobile menu (Escape-to-close, focus management) |
| `styles/tokens.css` | CSS custom properties |
| `styles/base.css` | Reset, skip-link |
| `styles/layout.css` | Header, nav, footer, page grid |
| `styles/components.css` | Cards, filter bar, chips, mode toggle, about-page components |

## Data Schema

```jsonc
{
  "id": "f2l-05",
  "name": "Both in top — white up, edge unflipped",
  "category": "easy | both-in-top | corner-in-slot | corner-in-top | advanced",
  "subgroup": "white-side | white-up | awkward",  // both-in-top cases only
  "slot": "FR",
  "setup": "R U' R' U R U2 R'",  // inverse of primary algorithm
  "recognition": "FIND: ...\nWHITE: ...\nEDGE: ...\nCONFIRM: ...",
  "shared_algorithm_note": "...",  // optional
  "algorithms": [
    { "label": "Main", "moves": "R U2 R' U' R U R'", "notes": "" },
    { "label": "Alt",  "moves": "...", "notes": "..." }
  ]
}
```

`setup` = mathematical inverse of the primary algorithm. Applied to a solved cube, it produces the exact case state the 3D viewer shows. `recognition` uses `\n`-delimited FIND/WHITE/EDGE/CONFIRM lines rendered as labeled rows by `formatRecognition()` in cases.js.

## Case Count: 36

Removed from canonical 41: f2l-06/07 (duplicates), f2l-41 (geometrically impossible, OLL trick), f2l-03/04 (AUF variants — same geometry as Easy cases, different starting angle, explained in about.html).

## Key Conventions

**Move chip colors** — owned entirely by JS (`FACE_BG`/`FACE_TEXT` maps in `cases.js`). No CSS face-color rules — they were removed to avoid drift. F and L faces use dark text (`#1a1a00`) because white on green/orange fails WCAG AA.

**Subgroup sorting** — `renderCases()` sorts both-in-top cases by subgroup order (white-side → white-up → awkward) before rendering. Subgroup headings appear automatically when the subgroup changes.

**Display numbers** — cards show sequential `#1`, `#2`, etc. based on render position, not the `f2l-NN` ID. IDs are for localStorage stability only.

**Filter routing** — active filter reflected in `location.hash` via `history.replaceState` (no `hashchange` listener — avoids double render).

**Learning/Reference mode** — `sessionStorage` key `f2l-mode`. Body class `mode-learning` or `mode-reference`. In reference mode, `.recognition-text` is hidden via CSS.

**Progress** — `localStorage` key `f2l-learned`, JSON array of case IDs. `renderProgressBar(total)` updates both the visual bar and `aria-valuenow`.

## twisty-player

CDN: `https://cdn.cubing.net/js/cubing/twisty`

```html
<twisty-player
  puzzle="3x3x3"
  alg="ALGORITHM"
  experimental-setup-alg="SETUP"
  hint-facelets="none"
  back-view="none"
  control-panel="none"
></twisty-player>
```

Play button uses `player.timestamp = 0; player.play()`. Respects `prefers-reduced-motion` via `player.jumpToEnd()`. Accessible name copied from placeholder before `replaceWith()`.

## Design Tokens

```
--bg-base: #0f0f13        --text-primary: #f0f0f5
--bg-surface: #1a1a24     --text-muted: #888899
--bg-elevated: #25253a    --text-subtle: #7a7a8c      (4.61:1 on bg-base)
--accent: #FFD500         --text-subtle-plus: #8e8ea0 (use inside cards on bg-surface)
```

## Plan and Progress

Implementation tracked in `plan/`. Read `plan/progress.md` at the start of any session — it has the sprint status and remaining items.

Current state: Sprint 3 complete. All sprints done.

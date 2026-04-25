# F2L Guide

A comprehensive static learning site for all 36 F2L (First Two Layers) cases — the core step of the CFOP Rubik's cube speedsolving method.

**Live site:** https://mikhailvs.github.io/f2l-guide/

## What's on the site

- **36 cases** with animated 3D cube diagrams (twisty-player)
- **All recognition hints** written as FIND / WHITE / EDGE / CONFIRM decision steps
- **Learning Mode** (default) — hints visible, move counts shown, setup scramble copyable
- **Reference Mode** — toggle for solvers who know the cases and just want the algorithm
- **Both-in-Top subgroups** — white-right/front → white-up → awkward diagonals
- **Progress tracking** via localStorage
- **About page** — intuitive F2L first, core concepts glossary, full notation reference including rotations and slice moves

## Case count

36 cases across 5 categories:

| Category | Count |
|----------|-------|
| Easy (pair formed) | 2 |
| Both in Top | 15 |
| Corner in Slot | 8 |
| Corner in Top | 8 |
| Advanced | 3 |

Cases removed from the canonical 41: 2 duplicates (f2l-06/07), 1 impossible case (f2l-41), 2 AUF variants (f2l-03/04 — same geometry as Easy cases, explained in the About page).

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. Must be served over HTTP (not `file://`) for ES modules and `fetch()` to work.

## Deploy

No build step. Any static host works — GitHub Pages, Netlify, Vercel.

## Algorithms

All algorithms target the **front-right (FR) slot**, white cross on bottom, yellow on top. The `setup` field in each case is the mathematical inverse of the primary algorithm — applying it to a solved cube produces exactly the case state shown in the 3D viewer.

Algorithms manually reviewed against standard CFOP practice.

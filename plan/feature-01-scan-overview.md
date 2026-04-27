# Feature Plan: Cube Scanner & Guided Solve

## What it is

A user photographs each face of their physical cube, the site detects the sticker colors, validates the cube state, generates a CFOP solve plan, and walks them through it step by step — with the existing F2L case library as the core of the F2L phase.

## Why it fits this site

The site already has all 36 F2L cases with animated 3D diagrams and recognition hints. The natural evolution is: given a real cube, identify which F2L case you are looking at and show you the algorithm. The scanner bridges physical cube → digital reference.

## Constraints

- **Static site only** — no backend, no API keys in code, no server uploads
- **Pure client-side JS** — camera via `getUserMedia`, image processing via `canvas`, solving via cubing.js
- **Progressive enhancement** — works without camera (file upload fallback), graceful degradation if WebGL or camera is unavailable
- **No new backend dependency** — cubing.js solver runs in a WebWorker in-browser

---

## Tech decisions

### Image capture
`<input type="file" accept="image/*" capture="environment">` covers both mobile camera and desktop file upload. On mobile, `capture="environment"` opens the rear camera directly. No WebRTC needed for MVP — file input is simpler and works everywhere.

For v2, `getUserMedia` live preview allows a real-time grid overlay before capture, improving alignment accuracy.

### Color detection
Canvas API + LAB color space comparison. Raw RGB is unreliable across lighting; LAB (CIELAB) measures perceptual color distance, which is much more robust. Each sticker region is sampled as a cluster of pixels (not a single point) and the median is compared to the 6 canonical cube colors in LAB space.

No ML model needed for this specific problem — the 6 Rubik's cube colors are sufficiently distinct in LAB space that nearest-neighbor classification works reliably if lighting is reasonable.

### Solving
cubing.js includes an optimal 3×3×3 solver (`experimentalSolve3x3x3IgnoringCenters`) available via the same CDN. It runs in a WebWorker so it doesn't block the UI. For CFOP-stage breakdown (cross, F2L, OLL, PLL), we sequence partial solves: solve cross only → record those moves → solve F2L → record → etc.

### F2L case matching
After the solver generates F2L moves for each slot, we can identify which of the 36 cases from `f2l-cases.json` it corresponds to and deep-link directly to that card. This is the feature's highest-value integration point.

---

## Phases

| # | Phase | Deliverable |
|---|-------|-------------|
| 1 | Capture UI | `scan.html` with 6-face photo flow, grid overlay, review screen |
| 2 | Color detection | Canvas-based sticker extraction, LAB classification, manual correction UI |
| 3 | State validation | Parse → validate → solvability check, error messages |
| 4 | Solver integration | cubing.js solver in WebWorker, CFOP-stage breakdown |
| 5 | Guided solve UI | Step-by-step wizard with twisty-player, F2L case links |

---

## New files

```
scan.html                    ← new page, added to nav
js/scan/
  capture.js                 ← face capture flow
  detect.js                  ← color detection (canvas + LAB)
  validate.js                ← cube state validation
  solver.js                  ← cubing.js WebWorker wrapper
  solver.worker.js           ← WebWorker: runs cubing.js solve
  guide.js                   ← step-by-step solve UI
styles/
  scan.css                   ← scan-specific styles
```

---

## Scope boundaries

**In scope:**
- Standard 3×3×3 cube, Western color scheme (white opposite yellow, etc.)
- CFOP solve plan for the whole cube
- F2L case identification and deep-link to existing case cards
- Manual color correction after detection
- Mobile and desktop

**Out of scope (v1):**
- Other puzzles (2×2, 4×4, megaminx)
- Colorblind mode (defer to v2)
- Saving/sharing solve plans
- Live camera preview with real-time sticker overlay (file input only in v1)
- OLL/PLL case libraries (out of scope for this F2L-focused site)

---

## Open questions before implementation

1. Does the cubing.js CDN include the solver, or does it need a separate import?
2. Can cubing.js produce a CFOP-stage breakdown, or does it only output a flat move sequence? (If flat, we need to split the solution manually by detecting when the cross is done, then when F2L is done, etc.)
3. What is the mapping from cubing.js cube state notation to our `f2l-cases.json` case IDs? (Need to compute which case each F2L slot corresponds to from the partial cube state.)
4. How does the solver handle centers? cubing.js's `IgnoringCenters` variant assumes fixed centers — appropriate for standard 3×3 with fixed center orientation.

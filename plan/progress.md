# Project Progress

## Status: Sprint 2 complete, Sprint 3 remaining

| Sprint | Status | Notes |
|--------|--------|-------|
| Sprint 1 — Correctness | ✅ done | Data fixed, bugs fixed, a11y P1s addressed |
| Sprint 2 — Learning usability | ✅ done | about.html rewrite, recognition hints, mode toggle, setup display |
| Sprint 3 — Polish | ⬜ not started | |

GitHub Pages: https://mikhailvs.github.io/f2l-guide/ (main branch root)

## Sprint 1 — Completed

- [x] Renamed `scramble` → `setup` in JSON and JS
- [x] Computed correct setup values (inverses of algorithms) for all 38 cases
- [x] Removed f2l-06, f2l-07 (duplicates of f2l-01/02)
- [x] Removed f2l-41 (geometrically impossible; OLL trick, not F2L)
- [x] Renumbered all cases sequentially (38 total)
- [x] Renamed category `edge-in-top` → `corner-in-top` (JSON + CSS + JS + HTML)
- [x] Added `shared_algorithm_note` to shared-algorithm cases
- [x] Added case names as visible text on cards
- [x] Recognition hints visible by default (collapsed when marked learned)
- [x] Move counts displayed on every algorithm
- [x] Fetch error handling in cases.js
- [x] Fixed Play button API (removed experimentalModel internal chain)
- [x] Fixed double render on filter click (dropped hashchange, uses history.replaceState)
- [x] Fixed inline onclick on Reset Progress (uses exported resetProgress())
- [x] Fixed dead CSS for move chips (JS owns colors, CSS removed)
- [x] Fixed F and L face chip contrast (#1a1a00 text on green/orange)
- [x] Fixed --text-subtle contrast (#7a7a8c / --text-subtle-plus #8e8ea0)
- [x] Added skip links to all pages
- [x] Added aria-pressed to filter buttons
- [x] Fixed aria-valuenow on progress bar
- [x] Moved aria-live to cases-count paragraph (eliminated announcement flood)
- [x] Fixed mobile menu (Escape handler, focus management, click-outside)
- [x] Fixed twisty-player accessible name after placeholder replacement
- [x] Fixed prefers-reduced-motion (uses jumpToEnd() via matchMedia)
- [x] Made filter bar sticky
- [x] Separated "Learned" filter from category filters
- [x] Fixed transition:all on filter/learned buttons
- [x] Fixed 404.html (added components.css, full nav, nav.js)
- [x] Fixed footer attribution text
- [x] Updated case counts to 38 everywhere
- [x] Disabled viewer buttons until player initialises

## Sprint 2 — Completed

- [x] about.html: Full 11-section rewrite with intuitive F2L, concepts glossary, trigger mechanics
- [x] about.html: x/y/z rotations, M/S/E slices, direction convention
- [x] about.html: Table of contents, callout boxes, structured learning order
- [x] index.html: Hero copy rewritten for learner persona
- [x] index.html: "Start Here" card featured, stale category references fixed
- [x] cases.json: All 38 recognition hints rewritten to FIND/WHITE/EDGE/CONFIRM template
- [x] cases.json: subgroup field added to both-in-top cases
- [x] cases.html/js: Subgroup headings in Both in Top grid
- [x] cases.html/js: Setup scramble panel with Copy button on every card
- [x] cases.html/js: Learning/Reference mode toggle (sessionStorage)

## Sprint 3 — Remaining

- [ ] Algorithm accuracy verification pass (all 38 against SpeedSolving wiki)
- [ ] STD-3: Revisit AUF variants (f2l-03/04) once intuitive F2L content exists
- [ ] Final Lighthouse audit (a11y ≥ 90, performance)

## Phase 6 Checklist

- [ ] Lighthouse a11y ≥ 90
- [ ] Mobile 375px fully usable
- [ ] `prefers-reduced-motion` respected
- [ ] All 41 algs verified against SpeedSolving wiki
- [ ] `README.md` written
- [ ] `404.html` for GitHub Pages

# Project Progress

## Status: All sprints complete ✅

| Sprint | Status | Notes |
|--------|--------|-------|
| Sprint 1 — Correctness | ✅ done | Data fixed, bugs fixed, a11y P1s addressed |
| Sprint 2 — Learning usability | ✅ done | about.html rewrite, recognition hints, mode toggle, setup display |
| Sprint 3 — Polish | ✅ done | AUF variants removed, subgroup sort fixed, algorithm audit |

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

## Sprint 3 — Completed

- [x] STD-3: Removed f2l-03 and f2l-04 (AUF variants). Now that intuitive F2L + AUF concept are in about.html, these inflate the count unnecessarily. Count: 36.
- [x] Fixed subgroup sort bug — both-in-top cases now sorted by subgroup (white-side → white-up → awkward) before rendering, preventing repeated subgroup headings
- [x] Sequential display numbers (#1, #2...) instead of sparse IDs
- [x] Algorithm accuracy audit — 32/36 fully verified, 4 advanced cases noted as long but valid (see plan/audit-06-algorithm-review.md)
- [x] Updated README.md with accurate case count and category table
- [x] Updated CLAUDE.md with complete current-state architecture reference

## Phase 6 Checklist

- [ ] Lighthouse a11y ≥ 90
- [ ] Mobile 375px fully usable
- [ ] `prefers-reduced-motion` respected
- [ ] All 41 algs verified against SpeedSolving wiki
- [ ] `README.md` written
- [ ] `404.html` for GitHub Pages

# Project Progress

## Status: Sprint 1 complete, Sprint 2 in progress

| Sprint | Status | Notes |
|--------|--------|-------|
| Sprint 1 — Correctness | ✅ done | Data fixed, bugs fixed, a11y P1s addressed |
| Sprint 2 — Learning usability | 🔄 in progress | about.html content, intuitive F2L |
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

## Sprint 2 — Remaining

- [ ] about.html: "Intuitive F2L first" section (PED-1)
- [ ] about.html: Glossary — trigger, AUF, sexy move, pairing, flipped edge (PED-2)
- [ ] about.html: Trigger mechanics section (PED-5)
- [ ] about.html: Add x/y/z rotations, M/S/E slices, direction convention (STD-1)
- [ ] about.html: Fix learning order to match index.html
- [ ] index.html: Hero copy rewrite for learner persona
- [ ] cases.json: Add `subgroup` field to both-in-top cases (white-up/right/front)
- [ ] cases.html: Render sub-group headings in Both in Top grid
- [ ] Display setup scramble as copyable text on cards (UX-7) — depends on Sprint 1 ✅

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

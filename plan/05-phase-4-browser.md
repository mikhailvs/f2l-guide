# Phase 4 — Case Browser

## Goal

The cases page is the core of the site. Users can see all 41 cases at once, filter by category, and find any case quickly. Each case is fully readable without clicking into a detail page.

## Checkpoint

- [ ] All 41 cases render as cards from JSON data
- [ ] Category filter buttons narrow displayed cases instantly (no page reload)
- [ ] "Learned" filter shows only cases the user has marked done
- [ ] Case count updates as filters change ("Showing 17 of 41")
- [ ] URL hash reflects active filter (`cases.html#both-in-top`) for shareable links
- [ ] Layout is a responsive grid: 3 col → 2 col → 1 col

## Filter Categories

```
[All]  [Easy]  [Corner in Slot]  [Edge in Top]  [Both in Top]  [Advanced]  [Learned]
```

## Cases Page Layout

```
cases.html
├── Filter bar (sticky at top)
├── Case count label
└── Grid of case cards
    └── [case card × 41]
```

## Case Card Features

- 3D viewer (lazy-loaded, Phase 3)
- Case number + category badge
- Algorithm(s) with color-coded move chips
- "Mark as Learned" toggle (persists to localStorage)
- Collapsed alt algorithms expandable via "Show alternate" toggle

## Algorithm Notation Chips

Each move rendered as a colored badge matching face color:

```html
<span class="move move-U">U</span>
<span class="move move-R">R</span>
<span class="move move-U prime">U'</span>
<span class="move move-F double">F2</span>
```

CSS colors map to face colors from design tokens.

## JS Architecture for This Page

```
cases.js
├── fetchCases()           ← loads data/f2l-cases.json
├── renderCard(case)       ← returns DOM node for one case
├── renderAlg(moves)       ← tokenizes alg string → colored chips
├── applyFilter(category)  ← shows/hides cards, updates count
├── initLearnedToggle()    ← wires up localStorage per case id
└── initHashRouting()      ← reads/writes location.hash for filters
```

## Files to Modify

```
cases.html     ← add filter bar, grid container
js/cases.js    ← all rendering + filter logic
styles/
  components.css  ← case card, filter buttons, move chips
```

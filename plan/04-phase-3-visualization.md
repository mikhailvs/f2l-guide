# Phase 3 — Cube Visualization

## Goal

Every F2L case has a working animated 3D cube that shows the scrambled state and plays the solution algorithm on demand. Uses `@cubing/twisty-player` loaded from CDN — no build step.

## Checkpoint

- [ ] `twisty-player` web component loads from CDN on cases page
- [ ] Each case card renders a `<twisty-player>` with the correct scramble
- [ ] Player is configured to show only U and middle-layer pieces clearly (top-down or isometric view)
- [ ] "Play" / "Pause" / "Reset" controls work
- [ ] Players lazy-initialize (don't all animate at once on page load)

## twisty-player Integration

```html
<script
  type="module"
  src="https://cdn.cubing.net/js/cubing/twisty"
></script>

<twisty-player
  puzzle="3x3x3"
  alg="U R U' R'"
  experimental-setup-alg="SETUP_SCRAMBLE_HERE"
  hint-facelets="none"
  back-view="none"
  camera-latitude="-30"
  camera-longitude="30"
  control-panel="none"
></twisty-player>
```

## Files to Create / Modify

```
js/
  cases.js        ← reads f2l-cases.json, renders case cards with twisty-player
  viewer.js       ← helpers: lazy-load players, play/pause, reset controls
```

## Viewer Behavior

- **Default state**: cube shown in scrambled (setup) position, paused
- **On "Play"**: runs the algorithm forward once, then stops
- **On "Reset"**: returns to scrambled state
- **Lazy loading**: `IntersectionObserver` — only initialize `<twisty-player>` when card scrolls into viewport (performance)
- **View angle**: isometric, looking down from U-layer side so the relevant pieces are clearly visible

## Case Card Layout

```
┌──────────────────────────────────┐
│  [3D cube viewer]                │
│                                  │
│  Case 12 · Both in Top           │
│  ─────────────────────────────── │
│  Main: U R U' R' U' F' U F       │
│  Alt:  d R' U' R  (fewer moves)  │
│                                  │
│  [▶ Play]  [↺ Reset]  [✓ Learnt] │
└──────────────────────────────────┘
```

## Performance Notes

- A page with 41 players will be heavy if all initialize at once — lazy-load is non-negotiable
- Consider a "load viewer" click-to-activate fallback for low-end devices

# Phase 1 — Scaffold & Design System

## Goal

A deployable skeleton with all pages present, navigation working, and the visual design locked in. No real content yet — just the shell that every future phase fills in.

## Checkpoint

- [ ] `index.html` loads with header, nav, and footer
- [ ] Design tokens defined (colors, type scale, spacing) in `styles/tokens.css`
- [ ] Dark-mode-first color scheme applied globally
- [ ] Responsive layout works at 375px, 768px, 1280px
- [ ] Placeholder pages exist for: Home, All Cases, About F2L

## Files to Create

```
index.html              ← landing/intro page
cases.html              ← full case browser
about.html              ← what is F2L, prereqs, notation key
styles/
  tokens.css            ← CSS custom properties (colors, type, spacing)
  base.css              ← reset + global styles
  layout.css            ← header, nav, footer, page grid
  components.css        ← cards, badges, buttons, notation chips
js/
  nav.js                ← mobile menu toggle
```

## Design Decisions

- **Color palette**: dark background (#0f0f13), white text, accent color keyed to Rubik's yellow (#FFD500) for highlights; per-face colors for move notation chips (U=yellow, R=red, F=green, etc.)
- **Typography**: system font stack; monospace for algorithm notation
- **Layout**: max-width 1200px centered; sidebar filter on cases page collapses to top on mobile
- **No JS required for static content** — all case data renders server-side (at build time we hand-write the HTML, or template via JS on load); JS only enhances

## Design Token Reference

```css
--bg-base: #0f0f13;
--bg-surface: #1a1a24;
--bg-elevated: #25253a;
--text-primary: #f0f0f5;
--text-muted: #888899;
--accent: #FFD500;
--face-U: #FFD500;   /* yellow */
--face-R: #E03030;   /* red */
--face-F: #30A030;   /* green */
--face-D: #f0f0f0;   /* white */
--face-L: #E07820;   /* orange */
--face-B: #3060E0;   /* blue */
```

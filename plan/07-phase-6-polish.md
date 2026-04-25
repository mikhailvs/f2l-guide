# Phase 6 — Polish

## Goal

Tighten everything before the site is considered done. Mobile experience, accessibility, micro-interactions, and a final content pass.

## Checkpoint

- [ ] All pages pass Lighthouse accessibility audit (score ≥ 90)
- [ ] Site is fully usable on a 375px iPhone screen
- [ ] No layout breaks between 320px and 1440px
- [ ] Algorithm chips are keyboard-navigable / screen-reader labeled
- [ ] twisty-player loads without console errors on Chrome, Firefox, Safari
- [ ] All 41 cases have accurate algorithms (spot-checked against SpeedSolving wiki)
- [ ] Page titles and meta descriptions set for all pages
- [ ] Favicon set (can use a simple cube emoji or SVG)

## Polish Items

### Mobile

- Filter bar scrolls horizontally on small screens (no wrapping)
- Case cards go to single column, viewer height reduced
- Touch-friendly tap targets (≥ 44px)
- Sticky filter bar doesn't occlude content

### Accessibility

- `aria-label` on all icon-only buttons
- Color is never the sole indicator of meaning (move chips also use text)
- Focus styles visible on all interactive elements
- `prefers-reduced-motion` respected — disable twisty-player autoplay if set

### Micro-interactions

- Smooth filter transitions (cards fade out/in on filter change, not instant hide)
- "Learned" toggle has a satisfying check animation
- Progress bar animates when count increases

### Algorithm Accuracy Pass

Cross-reference all 41 algorithms against:
- SpeedSolving wiki F2L page
- CubeSkills F2L guide

Flag any cases with multiple viable main algorithms and add the most common as "Alt".

### Deployment

- Add a `README.md` with: what the site is, how to run locally (`python3 -m http.server`), and how to deploy (any static host — GitHub Pages, Netlify, Vercel)
- Add `404.html` for GitHub Pages
- Configure `_config.yml` or `netlify.toml` if deploying there

## Files to Create/Modify

```
README.md
404.html
styles/
  mobile.css       ← media queries isolated here for clarity
  animations.css   ← transitions, reduced-motion overrides
```

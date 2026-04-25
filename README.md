# F2L Guide

A comprehensive static site for learning all 41 F2L (First Two Layers) cases — part of the CFOP Rubik's cube speedsolving method.

**Live site:** https://mikhailvs.github.io/f2l-guide/

## Features

- All 41 F2L cases with animated 3D cube diagrams
- Filterable by category (Easy, Both in Top, Corner in Slot, Edge in Top, Advanced)
- Color-coded algorithm notation with move chips
- Recognition hints per case
- Progress tracking via localStorage
- Hash-based filter routing (`cases.html#easy`)

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`. Must be served over HTTP (not `file://`) for ES modules and `fetch()` to work.

## Deploy

Any static host works — GitHub Pages, Netlify, Vercel. No build step required.

## Algorithms

All algorithms target the **front-right (FR) slot**, white cross on bottom, yellow on top. Sourced from the SpeedSolving wiki.

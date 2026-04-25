# F2L Guide — Project Overview

A comprehensive static site for learning the F2L (First Two Layers) step of the CFOP Rubik's cube method. No backend, no build step — pure HTML/CSS/JS served from any static host.

## Goal

Teach all 41 F2L cases in a structured, visually clear way. Each case gets an animated 3D cube diagram, the canonical algorithm(s), and enough context for a learner to understand *what* the case looks like and *why* the algorithm works.

## Tech Stack

- **HTML/CSS/JS** — no framework, no build tool required
- **`@cubing/twisty-player`** — web component for animated 3D cube visualization (loaded via CDN)
- **JSON data file** — single source of truth for all 41 cases (algs, categories, scrambles)
- **localStorage** — optional progress tracking, no server needed

## Repo Name

`f2l-guide`

## Phases

| # | Phase | Checkpoint |
|---|-------|-----------|
| 1 | Scaffold & Design System | Deployable shell with nav, typography, color palette |
| 2 | Case Data | Complete JSON for all 41 cases with metadata |
| 3 | Cube Visualization | twisty-player integrated, each case animates correctly |
| 4 | Case Browser | All cases browsable, filterable by category |
| 5 | Learning Features | Progress tracking, notation guide, algorithm variants |
| 6 | Polish | Mobile, a11y, transitions, final copy |

## F2L Case Categories

- **Easy Cases** — corner and edge already paired (4 cases)
- **Corner in slot, edge in top** — wrong orientation combos (8 cases)
- **Corner in top, edge in middle** — edge needs extraction (8 cases)
- **Both in top layer** — standard F2L cases (21 cases)
- **Advanced / Special** — edge or corner in wrong slot (varies)

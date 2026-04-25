# Phase 5 — Learning Features

## Goal

Layer in features that make the site useful for actually *learning*, not just referencing. Progress tracking, a notation primer, and contextual hints that answer the "why" behind each case.

## Checkpoint

- [ ] Progress bar on cases page shows X/41 learned
- [ ] `about.html` has a complete notation guide with interactive examples
- [ ] Each case card has an expandable "How to recognize this case" hint
- [ ] Home page (`index.html`) explains F2L prerequisites and links to cases by difficulty
- [ ] "Reset progress" button available in a settings/footer area

## Features

### 1. Progress Tracking

- Stored in `localStorage` under key `f2l-learned` as a JSON array of case IDs
- Progress bar component at top of cases page: `▓▓▓▓░░░░ 18 / 41 learned`
- Learned cases get a visual badge (checkmark overlay on card)
- Count persists across page refreshes

### 2. Notation Guide (`about.html`)

Sections:
- **Move notation** — R, U, F, L, B, D, with prime (') and double (2) explained
- **What is F2L** — brief explanation of CFOP context, what "first two layers" means
- **Prerequisites** — assumes solver knows the cross; links to external cross resources if needed
- **How to use this site** — suggest learning order (easy → both-in-top → corner-in-slot → advanced)
- **Interactive demo** — a single `<twisty-player>` with selectable example moves to show what each move does

### 3. Recognition Hints

Each case card has a collapsible "How to spot this" section:

```
▼ How to recognize this case
  Corner: white sticker facing right, on top layer above FR slot
  Edge: front color matches F face, in top layer
```

These are plain-text fields in the JSON schema (`"recognition": "..."` field added to Phase 2 data).

### 4. Home Page (`index.html`)

- Hero: what F2L is, one animated demo cube
- "Start here" card → links to Easy cases filtered view
- "Already know some F2L?" → links to All cases
- Brief stats: 41 cases, 4 categories

## Files to Modify

```
index.html           ← hero, start-here section
about.html           ← full notation + learning guide
cases.html           ← progress bar component
js/progress.js       ← localStorage read/write, progress bar render
data/f2l-cases.json  ← add "recognition" field to each case
```

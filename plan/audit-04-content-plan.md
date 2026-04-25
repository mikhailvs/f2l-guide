# Content Restructure Plan — F2L Guide

Prepared 2026-04-24. Addresses PED-1 through PED-5, UX-1, UX-2, UX-5, STD-1 from audit-01-results.md.

---

## 1. Big Questions — Decisions First

### 1.1 Learning Mode vs. Reference Mode

**Decision: add an explicit mode toggle, default to Learning Mode.**

The site is currently built as a reference tool — recognition hints hidden, case names invisible, no
conceptual scaffolding. But the name is "F2L Guide" and the home page says "learn". Those are
contradictory. Pick one, fully.

The right answer is: default to **Learning Mode**, add a small persistent toggle in the header or
filter bar labeled "Learning" / "Reference". No cookie needed — just a class on `<body>` that
survives the session.

**Learning Mode** (default):
- Recognition hints visible, not collapsed
- Case name visible on the card below the diagram
- Move count shown on algorithm (e.g., "7 moves")
- Setup scramble shown with a "Practice on physical cube" label

**Reference Mode** (toggled):
- Recognition hints collapsed (click to expand)
- Case name still visible (UX-1 is a bug regardless of mode)
- Algorithm chips only, no scaffolding text

This resolves UX-2 cleanly: the answer is not "always show" or "always hide" — it's that a learner
and a speedcuber who already knows the cases have different needs, and the site should serve both
without pretending they're the same person.

### 1.2 Should about.html be split?

**Decision: keep one page, but restructure it with a clear two-part architecture.**

Splitting into "Start Here" and "Notation Reference" sounds clean until you consider that the same
learner reads both in the same sitting, once, before they ever open cases.html. Two pages means two
tabs, two navigation entries, and no natural reading flow.

The better model is a single `about.html` divided into two clearly labeled halves via anchor links:
- Part 1: "Before You Learn" (concepts, vocabulary, intuitive F2L)
- Part 2: "Reference" (notation, rotations, slice moves)

The nav can link to `about.html` for the overview and `about.html#notation` for the notation section
directly. The important thing is that Part 2 is truly standalone — someone who arrives at it from a
Google search for "WCA notation" should get everything they need without scrolling past pedagogy.

### 1.3 Recognition hint format

**Decision: structured prose with a mandatory three-part template. Not a JSON decision tree.**

A machine-readable decision tree in the JSON would require rendering logic, a new component, and
ongoing maintenance. It would also look clinical when rendered. The real problem with the current
hints is not that they're prose — it's that they're the *wrong* prose. They describe a state ("white
sticker facing up") instead of teaching a *search procedure* ("look for the white sticker — which
face is it on?").

The fix is a mandatory template for every recognition hint, enforced by convention, not by code.

**Recognition Hint Template:**

```
FIND:   [What to look for first — always the white sticker on the corner]
CHECK:  [What face is it on / what is its orientation]
EDGE:   [Where is the edge and how is it oriented relative to the corner]
RESULT: [What that combination of positions means — i.e., which case it is]
```

The FIND line establishes the search procedure. CHECK establishes orientation. EDGE completes the
identification. RESULT closes the loop so the learner can confirm they read the case correctly.

**Example rewrites — see Section 3.**

### 1.4 "Both in Top" subdivision

**Decision: add sub-group headings within the Both in Top section, do not flatten or hide them.**

17 undifferentiated cases is a wall. The audit correctly identifies that f2l-06/07 are 4-move
trivial inserts and f2l-19/20 are 8–9 move beasts. Grouping by white-sticker orientation solves
this:

- **White facing up** (f2l-05, f2l-08, f2l-11, f2l-14, f2l-15, f2l-16, f2l-19): the corner is
  the hardest to deal with — white on top means you have to flip it in. Learn these after mastering
  white-right and white-front.
- **White facing right / front** (f2l-06, f2l-07, f2l-09, f2l-10, f2l-12, f2l-13): these are
  one or two triggers. Learn these first within the Both-in-Top group.
- **Longer setups** (f2l-17, f2l-18, f2l-20, f2l-21): diagonal and awkward cases. Learn last.

Recommended learning order within Both in Top: white-right/front first, white-up second, awkward
diagonals last. This should be stated explicitly in the about.html learning order section.

### 1.5 Intuitive F2L — how much content?

**Decision: one full section with a worked example and two to three "see the principle" diagrams.
Not a paragraph, not a dedicated page — a real section in about.html.**

Intuitive F2L is the single most important thing missing from this site (PED-1 is the top pedagogy
issue). Skipping it produces solvers who can execute algorithms but cannot adapt when a case looks
"almost right" or when they want to plan ahead. The ceiling is real.

The section needs:
1. A one-paragraph explanation of what pairing actually is (join the corner and edge in the U layer
   before inserting together)
2. The core insight: you can always get both pieces into the top layer in at most two moves
3. One fully worked step-by-step example: corner with white facing up, matched edge — show the
   thought process, not just the moves
4. A callout box: "Once you can solve Easy Cases intuitively, you already understand half of
   F2L. The algorithms for other cases are just efficient versions of what you'd figure out yourself."

This section comes *before* the algorithm cases page, in about.html, not as a separate page.

---

## 2. New Structure for about.html

Current structure: What is CFOP, Prerequisites, Move Notation, How F2L Works, Learning Order,
How to Use This Site. Six sections. No conceptual depth. No vocabulary. No intuitive F2L.

**New structure — 11 sections, same single page:**

---

### Section 1: What is F2L? *(keep, light edit)*
Same content as now. One sentence added to connect to intuitive solving: "F2L is learnable
intuitively before algorithms — and you should learn it that way first."

---

### Section 2: Prerequisites *(keep, light edit)*
Same content. Add one bullet: "Understand that the cross pieces stay solved while you work above
them — if you're still breaking the cross, pause here."

---

### Section 3: Before You Learn Algorithms — Intuitive F2L *(NEW — most important addition)*

**Heading:** "Solve It Before You Memorize It"

**Content:**

Every corner-edge pair can be solved without algorithms. Algorithms are shortcuts for moves you
would have found yourself. Learning the shortcuts without first understanding what they shortcut
produces brittle, ceiling-limited solving.

**The core procedure:**

1. Find your corner and its matching edge. They share two non-white colors.
2. If either piece is in the middle layer, bring it up to the top: a single trigger (R U R' or
   F' U' F) pops a corner out; U moves bring the edge up.
3. With both pieces in the top layer, pair them. "Pairing" means positioning them so the shared
   colors align, then inserting together.
4. Insert the pair with R U' R' (right side) or F' U F (front side).

**Worked example — "white facing up, matched edge" (f2l-05):**

You see: corner with white on top, edge correctly positioned in the U layer.

Intuitive approach:
- R: corner goes into the slot, but the edge isn't paired. Undo: R'.
- Instead: rotate U until the edge is above the slot. Now the corner and edge are nearby but not
  paired.
- Try: U, then look — the corner white is still facing up. You need to flip it.
- R U R' brings the corner back up. Now try: U' so the edge is out of the way, R U' R' pushes the
  edge away, then R U R' brings the corner down paired with the edge.
- That's the algorithm. You derived it.

**Callout box:** Once you can do Easy Cases (f2l-01 through f2l-04) intuitively, you already
understand pairing and insertion. Every other case is a variation on getting both pieces into a
"paiable" position.

---

### Section 4: Core Concepts *(NEW — addresses PED-2 and PED-5)*

**Heading:** "Five Terms You'll See Everywhere"

Each entry: bold term, one-sentence definition, one example.

**Trigger**
A short, reversible move sequence used as a building block inside larger algorithms.
The two fundamental F2L triggers are R U R' U' and F' U' F U. Almost every algorithm in this
guide is one or two triggers chained together.

**Untrigger (or "reverse trigger")**
The inverse of a trigger. R U R' U' reversed is U R U' R'. Knowing the untrigger lets you
"undo" a trigger mentally, which is how you derive new algorithms without memorizing them.

**Sexy Move**
Informal name for R U R' U', the most common trigger in all of cubing. Named for how naturally
it flows under the fingers. You will execute this sequence thousands of times.

**AUF** (Adjust U Face)
A U, U', or U2 move at the start or end of a case to align pieces with the correct slot before
or after executing the main algorithm. In recognition: "AUF to align" means rotate U until your
piece is above the correct position.

**Flipped Edge**
An edge piece that is in the correct position in the U layer but with its colors on the wrong
faces. Example: the red-green edge is above the FR slot, but the red color faces the top (U face)
instead of the front (F face). Flipped edges require one extra trigger to orient correctly.

---

### Section 5: Move Notation *(expanded, restructured — addresses STD-1)*

**Sub-section A: Face Moves** — keep existing R/U/F/L/B/D grid, same content.

**Sub-section B: Modifiers** — keep prime (') and double (2). Add: "Read left to right. R U R' U'
means: R first, then U, then R', then U'."

**Sub-section C: Rotations (x, y, z)** *(NEW)*

Rotations move the entire cube in your hands. They change which face is "Front" and "Right"
without moving any pieces relative to each other.

| Rotation | Axis | Effect |
|----------|------|--------|
| y | Vertical (U-D) | Front becomes Left; most common F2L rotation |
| y' | Vertical (U-D) | Front becomes Right |
| x | Horizontal (R-L) | Front face tilts down toward you |
| x' | Horizontal (R-L) | Front face tilts away |
| z | Front-back | Cube rotates clockwise viewed from front |

**Convention note:** When you see `y` in an algorithm, physically rotate the cube. The next moves
use the new Front and Right. This site avoids rotations where possible — all cases target the FR
slot and assume you rotate the cube to bring your target slot to FR before starting.

**Sub-section D: Slice Moves (M, S, E)** *(NEW)*

Slice moves turn the middle layer between two face moves.

| Move | Middle layer | Equivalent to |
|------|-------------|---------------|
| M | Between L and R | Like L (left direction) |
| M' | Between L and R | Like L' (right direction) |
| S | Between F and B | Like F |
| E | Between U and D | Like D |

Slice moves rarely appear in F2L but are common in OLL and PLL. They're included here for
completeness when you encounter them in external resources.

**Sub-section E: Direction Convention** *(NEW — one paragraph)*

"Clockwise" means clockwise when you are looking directly at that face from outside the cube.
U clockwise (U) moves the front-right corner of the top layer away from you (toward back-right).
R clockwise (R) moves the front-right corner of the right face upward.
If you're unsure: hold the cube, pick the U face, and turn it clockwise as viewed from above.
That is U.

---

### Section 6: How F2L Works *(keep, one addition)*

Add one paragraph at the end: "The key insight is that inserting a pair uses the same two triggers
every time — either R U' R' (right-side insert) or F' U F (front-side insert). Every algorithm
is just setup moves that get the pair into a position where one of those inserts works."

---

### Section 7: Recommended Learning Order *(rewritten — fixes UX-5)*

The home page and about page currently contradict each other. Home puts "Corner in Slot" third,
about puts "Edge in Top" third. Fix: standardize everywhere to this order, with rationale:

1. **Easy Cases** (4 cases) — Pair already formed. No recognition needed. Build the insert reflex.
2. **Both in Top — white right/front** (6 cases: f2l-06, f2l-07, f2l-09, f2l-10, f2l-12, f2l-13)
   — One or two triggers. The most common cases mid-solve.
3. **Both in Top — white up** (7 cases: f2l-05, f2l-08, f2l-11, f2l-14, f2l-15, f2l-16, f2l-19)
   — Requires flipping the corner. Harder recognition.
4. **Both in Top — awkward diagonals** (4 cases: f2l-17, f2l-18, f2l-20, f2l-21) — Longer setups.
5. **Corner in Slot** (8 cases) — Corner already placed but paired incorrectly. Learn extraction.
6. **Edge in Top (mislabeled — actually "Corner in Top")** (8 cases) — Edge in middle layer,
   corner free. Often short algorithms.
7. **Advanced** (3–4 cases) — Both pieces trapped. Learn last.

Rationale column: add one sentence per step explaining *why* that group comes in that position.

---

### Section 8: How to Use This Site *(keep, minor edits)*

Add one line: "In Learning Mode (default), recognition hints are visible. Switch to Reference
Mode using the toggle in the filter bar if you just want to look up an algorithm."

---

## 3. Recognition Hint Rewrites

### Template

```
FIND:    Look for [what, on which layer]
WHITE:   The white sticker on the corner is facing [U / R / F]
EDGE:    The edge is [location] with [color] facing [direction]
CONFIRM: If you see this, you have [case name]
```

The FIND line always starts with the corner (white sticker), because the white sticker is the
fastest visual anchor. You spot white first, then check edge orientation. Never the other way around.

---

### Rewrite 1 — f2l-05: "Corner top white up, edge matched"

**Current:**
> Corner is in the top layer with the white sticker facing up. Edge is in the top layer with its
> stickers matching the two side colors. They are not paired.

**Problem:** Describes a state. Doesn't tell you how to find it or confirm it.

**Rewritten:**
```
FIND:    Look at the top layer — spot the corner with white facing up (on the U face)
WHITE:   White sticker is on top, pointing at the ceiling
EDGE:    Find the edge with your two slot colors. It is in the top layer with the
         non-white colors visible on the front and right faces (not on top — if one
         color is on top, you have f2l-08 instead)
CONFIRM: Corner white-up + edge unflipped = f2l-05. Algorithm: R U2 R' U' R U R'
```

Note the CONFIRM line includes a branch: if the edge color is facing up instead of the side face,
that's a different case (f2l-08). This is the "decision tree" behavior without a data structure.

---

### Rewrite 2 — f2l-22: "Corner in slot correct, edge in top correct"

**Current:**
> Corner is already in the correct slot. Edge is in the top layer and correctly oriented.
> The corner needs to be extracted to pair.

**Problem:** "correctly oriented" is undefined. Doesn't say what "correct slot" looks like.

**Rewritten:**
```
FIND:    Look at the FR slot — is the corner already inside it with white on the bottom?
WHITE:   White sticker is hidden (on the D face, inside the slot) — you can't see it
         from the top
EDGE:    Now look in the top layer for the edge with your two slot colors. The non-white
         colors should face the side faces (F and R), not the U face.
         If the edge is flipped (one color facing up), you have f2l-23 instead.
CONFIRM: Corner in slot (white hidden) + edge unflipped in top = f2l-22.
         Algorithm: R U' R' U R U' R'
```

---

### Rewrite 3 — f2l-08: "Corner top white up, edge flipped"

**Current:**
> Corner in top layer, white facing up. Edge is in the top layer but flipped — colors are
> swapped relative to the faces.

**Problem:** "colors are swapped relative to the faces" is vague. Doesn't give a visual test.

**Rewritten:**
```
FIND:    Look for the corner with white on top (U face). Then find its matching edge.
WHITE:   White sticker on the corner faces up — same as f2l-05, so far.
EDGE:    The edge's non-white colors are NOT on the front and right faces. Instead,
         one of the edge colors is facing up (toward the U face). This is the flip.
         Practical test: look at the UF or UR edge. If you see your slot color on the
         U face rather than the side face, the edge is flipped.
CONFIRM: Corner white-up + edge flipped = f2l-08. One more move than f2l-05.
         Algorithm: R U R' U2 R U' R'
```

---

### Rewrite 4 — f2l-30: "Corner in top, edge in middle correct" (edge-in-top category)

**Current:**
> Corner is free in the top layer. Edge is already in the middle layer at the correct position,
> correctly oriented. Just insert the corner.

**Problem:** This is actually the clearest existing hint, but "correctly oriented" still needs
a test.

**Rewritten:**
```
FIND:    Check the FR middle slot — is the edge already there? Look at the front face:
         the edge sticker on the F face should match the F center color.
         And on the right face: edge sticker should match the R center color.
EDGE:    Edge is in the correct position AND correctly oriented (both colors match
         their respective face centers).
CORNER:  Find the corner with white somewhere in the top layer. Its U-layer position
         doesn't matter — any position works because the algorithm handles AUF.
CONFIRM: Edge in correct slot, oriented correctly + corner anywhere in top = f2l-30.
         Only 3 moves: R U' R'
```

---

## 4. Home Page Hero Rewrite

### Current hero copy:
> CFOP Method
> Master F2L — First Two Layers
> All 41 cases, animated and organized. Learn to pair and insert corner-edge pairs efficiently
> — the core skill of speedcubing.

### Problem (from audit UX-5 and PED-1):
This copy speaks to someone who already knows what F2L is. A learner who just finished the cross
has no idea what "pair and insert" means or why 41 cases matters.

### Proposed replacement:

**Eyebrow:** After the Cross

**Headline:** The Next Step in CFOP Is F2L

**Sub:** You've solved the cross. Now fill the four corner-edge slots above it — without breaking
anything you just built. This is F2L: the step that separates beginners from speedcubers.

**Primary CTA:** Start with the Concepts (→ about.html#intuitive)
**Secondary CTA:** I know F2L — show me the cases (→ cases.html)

### Why this works:
- "After the Cross" immediately qualifies the visitor. If you don't know what the cross is,
  you're not the audience — and now you know.
- The sub describes the *problem being solved*, not the feature set (41 cases, animated diagrams).
  The learner doesn't care about 41 cases. They care about not breaking the cross.
- Two CTAs serve two audiences: the new learner and the returning solver who wants the algorithm
  list. The current page serves only the second.

### Stats strip — replace:

Current: 41 Cases | 5 Categories | 3D Animated

Proposed: 41 Cases | Start with 4 | Sub-1 minute after learning

"Start with 4" is actionable. "3D Animated" is a feature, not a benefit.

### Start cards — minimal changes needed:

The "Learn the Notation" card (currently the 6th, lowest-priority slot) should become the
first card and be renamed "Start Here." This is the conceptually first step and currently the
least visible. Move it to the top-left position in the grid.

---

## 5. Concepts Section Details (for about.html Section 4)

The five terms from PED-2 (trigger, AUF, sexy move, pairing, flipped edge) are listed in
Section 4 above. Here are the implementation notes:

### Animations
Each term should have a small inline twisty-player demo:
- **Trigger demo**: plays R U R' U' from a solved cube, then loops
- **AUF demo**: plays U once, shows piece alignment, then plays the insert
- **Sexy move**: same as trigger demo, labeled "This is the sexy move"
- **Flipped edge demo**: shows the UF edge with one color facing up — static frame is enough,
  no animation required

These animations are optional for the first iteration. The text alone fixes PED-2. Animations
can be added in a polish pass without restructuring anything.

### Format on the page
Use a definition-list style: term on one line, bold; definition indented below. Not a table —
tables are hard to read on mobile. Not a glossary page — these terms need context, not lookup.

---

## 6. Notation Guide Additions Detail (STD-1)

The additions described in Section 5 of the about.html structure plan (Sub-sections C, D, E)
cover STD-1 completely. Specific implementation notes:

### x/y/z rotation table
The table in Section 5C above should be rendered as a styled component matching the existing
notation grid, not as a plain HTML table. Each rotation should show:
- The letter
- An arrow diagram (SVG or Unicode) showing which way the cube turns
- The most common use case in F2L context ("y rotation: used when your target slot is on the
  left side of the cube")

### M/S/E slice table
Slice moves in F2L are rare. The table should be brief and explicitly labeled "Not used in F2L
— included for when you encounter them in OLL/PLL resources." This prevents learners from being
confused about why they never see M in the cases on this site.

### Direction convention paragraph
Render this as a callout box (same styled component used for the intuitive F2L callout), not
as body prose. Callout heading: "How to tell which way is clockwise." The distinction matters
most for B (back face) and D (down face), which are counterintuitive. Those two should be called
out explicitly in the callout.

---

## 7. Summary of Changes by File

| File | Change type | Addresses |
|------|-------------|-----------|
| `about.html` | Major rewrite — 11 sections | PED-1, PED-2, PED-5, STD-1, UX-5 |
| `index.html` | Hero copy rewrite, stats strip, card order | UX-5, PED-1 |
| `data/f2l-cases.json` | Rewrite all `recognition` fields to template | PED-3 |
| `cases.html` | Add sub-group headings inside both-in-top | PED-4 |
| `cases.html` | Add mode toggle (Learning / Reference) | UX-2 |
| `cases.html` | Show case names visibly on cards | UX-1 |

### Priority order for implementation:

1. **about.html restructure** — the conceptual foundation. Everything else depends on learners
   understanding the vocabulary. Do this first.
2. **index.html hero rewrite** — 30 minutes of work, immediate improvement to the learner entry
   point. Do this at the same time as (1).
3. **Recognition hint rewrites in JSON** — laborious (41 cases) but follows the template exactly.
   Do case-by-case, starting with both-in-top since that's the largest group.
4. **Both-in-top sub-group headings on cases page** — requires adding a subgroup field to the
   JSON schema or hardcoding the breakpoints. Either approach is one hour of work.
5. **Mode toggle** — requires JS and CSS but is self-contained. Do last in this batch.

---

## 8. What Not to Do

**Do not split about.html into multiple pages.** The learning flow is linear. Splitting adds
navigation debt without solving the underlying problem, which is that the content is shallow.

**Do not convert recognition hints to a programmatic decision tree.** The template approach
is sufficient, more maintainable, and easier to write. Structured prose beats data structures
when the goal is teaching.

**Do not add a glossary page.** Define terms in context (about.html Section 4) where they will
actually be read once. A separate glossary page will not be visited.

**Do not reorder the nav.** The current nav (Home | All Cases | About F2L) is fine. The problem
is what the pages say, not how they're named.

**Do not add more categories to the filter bar.** The sub-group logic for both-in-top should
live within the existing category section as headings, not as new filter buttons. Adding filters
for "white-up" etc. creates combinatorial UI complexity for marginal benefit.

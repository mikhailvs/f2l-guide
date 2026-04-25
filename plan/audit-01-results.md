# Audit Results — F2L Guide

Conducted 2026-04-24. Six-persona audit team.

## Auditors

| Persona | Domain |
|---------|--------|
| Senior Frontend Engineer | JS architecture, HTML semantics, CSS |
| UX/UI Designer | Learning flow, card design, information hierarchy |
| Accessibility/Performance Specialist | WCAG, contrast, keyboard, motion |
| Competitive Speedcuber (sub-10) | Algorithm accuracy, case validity, scramble correctness |
| F2L Teacher/Coach | Pedagogy, concept coverage, recognition hints |
| SpeedSolving Community Member | Community conventions, notation standards |

---

## P0 — Breaks Core Functionality

**P0-1: Scrambles equal algorithms — 3D viewer shows wrong states (systemic)**
`experimental-setup-alg` should be the *inverse* of the algorithm. Currently many cases
(f2l-06, f2l-07, f2l-12, f2l-13, f2l-22, f2l-23, f2l-30, f2l-31, f2l-33, f2l-34, and others)
have scramble == algorithm. Applying the same sequence as both setup and solution does not
demonstrate the case — the viewer shows a meaningless round trip.

**P0-2: f2l-01 == f2l-06 (duplicate). f2l-02 == f2l-07 (duplicate).**
Same scramble, same algorithm, different IDs. Progress bar claims 41 learnable cases when
there are at most 39 distinct ones.

**P0-3: f2l-41 algorithm is wrong; the case is geometrically impossible.**
`(R U R' U') × 3` is an OLL corner-twisting trick, not an F2L algorithm. "Corner and edge
both in correct slots but both wrongly oriented" is not a valid 3×3 state — a middle-layer
edge cannot be flipped in place. Case needs replacement or removal.

**P0-4: f2l-12, f2l-22, f2l-33 share identical algorithm. f2l-13 and f2l-34 likewise.**
Three supposedly distinct cases all use `R U' R' U R U' R'`. Either they are not distinct
(copy-paste error) or the fact that one algorithm solves multiple cases is pedagogically
important and is completely unexplained.

**P0-5: No error handling on fetch in cases.js.**
`await fetch('data/f2l-cases.json')` has no try/catch, no res.ok check. 404 or JSON parse
error silently renders a blank page with no user feedback.

---

## P1 — Significant Bugs

**P1-1: viewer.js Play button calls non-public twisty-player API.**
`player.experimentalModel.twistySceneModel.puzzleManager.clear?.()` silently no-ops via
optional chaining when the internal chain is wrong. Replace with: `player.timestamp = 0; player.play();`

**P1-2: 404.html is missing components.css and nav.js.**
The "Go Home" button renders completely unstyled. Hamburger button is inert.

**P1-3: Double renderCases() on every filter click.**
setFilter() → renderCases() directly, then sets location.hash → hashchange fires →
applyFilterFromHash() → renderCases() again. Two renders per click.

**P1-4: Category "edge-in-top" is labeled backwards.**
Cases f2l-30–37 have the *edge in the middle slot* and the *corner in the top layer*.
Category name, about.html description, and filter label all say "Edge in Top" — the opposite
of what's in the data. Correct label: "edge-in-slot" or "corner-in-top".

**P1-5: Inline onclick on Reset Progress bypasses the module.**
Hardcodes localStorage key 'f2l-learned' (already defined as STORAGE_KEY in progress.js),
uses browser confirm(), calls location.reload() instead of exported resetProgress().

**P1-6: Dead CSS for move chip colors.**
JS renderAlg() sets inline style="color:${color}" on every chip, completely overriding
the CSS .move-R { color:#fff }, .move-F { color:#fff } rules. Those CSS declarations are dead.

---

## P1 — Accessibility Failures (WCAG Level A/AA)

**A11Y-1: No skip link on any page. (WCAG 2.4.1 — Level A)**
On cases.html: Tab through nav + 7 filter buttons before any case card is reachable.

**A11Y-2: Filter buttons have no aria-pressed state. (WCAG 4.1.2)**
Active filter communicated by CSS class only. Screen reader users can't tell which is selected.

**A11Y-3: aria-valuenow on progress bar never updated. (WCAG 4.1.2)**
renderProgressBar() updates visual width and label text but never setAttribute('aria-valuenow').
Screen readers always announce "0 of 41."

**A11Y-4: aria-live="polite" on card grid causes announcement flood.**
Filter change rebuilds all matching cards; every card name is queued for announcement.
"Both in Top" filter → 17 card names read aloud. Move role="status" to .cases-count instead.

**A11Y-5: Mobile menu — no Escape-to-close, no focus management. (WCAG 2.1.2)**
No keydown listener for Escape, no focus movement to first link on open, no return focus on close.

**A11Y-6: twisty-player loses accessible name after placeholder replacement.**
Placeholder has role="img" + aria-label. After replaceWith(player), new <twisty-player>
has neither. Need to copy both attributes to the player element in initPlayer().

**A11Y-7: --text-subtle fails contrast everywhere. (WCAG 1.4.3 AA)**
#555566 on --bg-base (#0f0f13): 2.62:1 (required 4.5:1).
#555566 on --bg-surface (#1a1a24): 2.36:1.
#555566 on --bg-elevated (#25253a): 2.05:1.
Used for: .case-id, .case-alg-label, .recognition-toggle, .alt-toggle, .section-label, footer.
Every use is a WCAG AA failure.

**A11Y-8: F-face (green) and L-face (orange) move chips fail contrast.**
White on #30A030 (F green): 3.39:1. White on #E07820 (L orange): 3.05:1.
Both below the 4.5:1 AA threshold. Opacity modifiers for prime/double make it worse.

**A11Y-9: prefers-reduced-motion has zero effect on twisty-player.**
base.css suppresses CSS animations, but twisty-player runs via requestAnimationFrame inside
its Shadow DOM. Needs explicit window.matchMedia check in viewer.js; use player.jumpToEnd()
instead of player.play() when reduced motion is active.

---

## P2 — UX and Design Gaps

**UX-1: Case names are invisible to sighted users.**
c.name is used only in the card's aria-label, not rendered as visible text. Names like
"Corner top white up, edge matched" are the clearest anchor for learning — they should appear.

**UX-2: Recognition hints hidden by default — wrong for a learning tool.**
Disclosing hints makes sense for a reference tool. For learning, the recognition text is
primary teaching content and should be visible by default.

**UX-3: Filter bar is not sticky.**
plan/05-phase-4-browser.md listed "sticky at top" as a layout requirement. No position:sticky
in CSS. After scrolling to case 20, switching categories requires scrolling back to top.

**UX-4: "Learned" filter mixed with category filters.**
Different type of filter (learner status vs. content category). Should be visually separated.

**UX-5: Learning order inconsistent between index.html and about.html.**
Home: Corner in Slot 3rd, Edge in Top 4th.
About: Edge in Top 3rd, Corner in Slot 4th.
Contradictory recommendations to the same learner.

**UX-6: No visible move count on algorithm chips.**
Move counts (3 moves vs 9 moves) are pedagogically important in F2L — learners should
prioritize short algorithms. Already computable from the moves string, never displayed.

**UX-7: Scramble setup strings never shown to users.**
Learners who want to practice the case on a physical cube have no way to get the setup
scramble — it's embedded in a DOM attribute, never rendered.

---

## P2 — Pedagogy Gaps

**PED-1: Intuitive F2L completely absent.**
Every major F2L resource starts with intuitive solving before algorithms. Solvers who skip
this plateau at a ceiling that algorithms can't break. One "Before You Learn Algorithms"
section in about.html would transform the site from reference tool to learning resource.

**PED-2: Core vocabulary used but never defined.**
"Trigger", "AUF", "sexy move", "pairing", "flipped edge" — all appear in recognition hints
and notes but are undefined anywhere on the site.

**PED-3: Recognition hints are position descriptions, not decision trees.**
"Corner in the top layer with the white sticker facing up" describes a state but doesn't
teach a learner how to *find* that state mid-solve. Should be a lookup sequence:
find white sticker → determine which face → check edge orientation.

**PED-4: "Both in Top" 17 cases presented as one undifferentiated block.**
f2l-06/07 are single triggers; f2l-19/20 are 8–9 move setups. Without internal subdivision,
learners have no ramp. Minimum subdivision: by white-sticker orientation (up / right / front).

**PED-5: No explanation of trigger mechanics.**
R U R' U' and F' U' F U are the foundation of almost all F2L algorithms. Naming them,
explaining their geometry, and showing they are reversible ("untrigger") would let learners
derive cases rather than memorize them.

---

## P3 — Standards and Convention Issues

**STD-1: Notation guide missing M/S/E slices and x/y/z rotations.**
'y' rotation appears in most F2L tutorials within the first week. Learner following any
external resource will encounter these with no reference on this site.

**STD-2: Footer attribution "Algorithms sourced from the SpeedSolving wiki" is misleading.**
Site uses custom case numbering that doesn't match the wiki's canonical numbers. A learner
cross-referencing will find nothing aligns. Remove or qualify the attribution.

**STD-3: f2l-03 and f2l-04 are AUF variants, not distinct cases by community convention.**
`U2 R U' R'` is f2l-01 with U2 prepended. SpeedSolving wiki does not count different AUF
starting positions as separate cases. Including them inflates the count artificially.

**STD-4: transition:all on .filter-btn and .learned-btn.**
Animates all properties including layout-affecting ones. Should be explicit property list.

**STD-5: plan/01-overview.md says 21 "both in top" cases; JSON has 17.**
The two plan files contradict each other. Overview should say 17 (with 4 broken out as easy)
or note the combined 21 = 4 easy + 17 both-in-top.

---

## Issue Count by Priority

| Priority | Count |
|----------|-------|
| P0 — breaks core functionality | 5 |
| P1 — significant bugs | 6 |
| P1 — accessibility (WCAG A/AA) | 9 |
| P2 — UX gaps | 7 |
| P2 — pedagogy gaps | 5 |
| P3 — standards/conventions | 5 |
| **Total** | **37** |

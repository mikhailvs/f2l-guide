# Audit Roadmap — F2L Guide

Synthesized 2026-04-24. Based on audit-01-results.md (37 issues, 6 categories) and all phase plans.

---

## Revised Site Concept

This site is a **structured learning tool for intermediate speedcubers** who understand how to solve a Rubik's cube intuitively and are ready to learn algorithmic F2L. The target user has a solved cross, knows basic notation, and wants a single place to learn all F2L cases in a deliberate order — not a lookup reference to copy-paste during a competition. The site commits to showing *why* each algorithm works, not just what it is. Recognition of cases is treated as a primary skill alongside execution. The audience is roughly 1–6 months into speedcubing, aiming to break the 1-minute barrier.

---

## Hard Tradeoff Decisions

### 1. Fix vs Rebuild the Data Layer

**Decision: Targeted fix, not a rebuild.**

The schema is fine. The problem is wrong values in existing fields, not a structural deficiency. The `experimental-setup-alg` field exists and is the right concept — it just needs correct values (inverses of the algorithms). A rebuild to "compute inverses programmatically" is tempting but adds runtime complexity for a problem that is purely a data authoring error.

The fix path:
- Correct all `experimental-setup-alg` values to their proper inverses (this touches ~15 cases identified in P0-1).
- Remove f2l-06 and f2l-07 (exact duplicates of f2l-01 and f2l-02).
- Remove f2l-41 (geometrically impossible case; document why in a code comment).
- Investigate f2l-12/22/33 and f2l-13/34 sharing algorithms — determine if these are distinct cases where one algorithm happens to solve multiple states (pedagogically important) or copy-paste errors. If the same algorithm genuinely handles multiple distinct states, make that explicit in `notes`; if it's a copy-paste error, fix the wrong entries.
- Re-number the remaining cases after removals, or use stable IDs that don't promise contiguity (e.g., keep the IDs as-is and accept gaps).

Do not add computed fields at runtime. Keep the JSON as the single source of truth with human-verified values.

### 2. External Authoritative Source vs Own Dataset

**Decision: Verify against SpeedSolving wiki and CubeSkills, but maintain our own dataset.**

Scraping is not viable — the wiki's HTML structure is fragile, and there is no clean API. Maintaining our own dataset is fine provided we do one honest verification pass against the wiki. The footer attribution "Algorithms sourced from the SpeedSolving wiki" (STD-2) is the real problem: it implies 1:1 correspondence that doesn't exist. Fix the attribution to say "Algorithms verified against SpeedSolving wiki conventions" or remove it entirely.

After the data fix sprint, every algorithm in the JSON should have been looked up by a human against at least one authoritative source. This is a one-time cost that pays off in perpetuity — the dataset does not change frequently.

### 3. Learning Tool vs Reference Tool

**Decision: Commit to learning tool. No mode toggle.**

A reference tool already exists (SpeedSolving wiki, AlgDB, JPerm). The only differentiation this site can offer is genuine pedagogical structure. A mode toggle is a product design failure — it means the team couldn't decide, so it punts the decision to the user. Users don't know which mode they want until they've already been confused.

Concrete consequences of this decision:
- Recognition hints are **visible by default**, not collapsed.
- Move counts are displayed on every algorithm.
- Case names are visible text, not just aria-label content.
- The "Both in Top" 17 cases get internal structure (see tradeoff 4).
- about.html gets an "Intuitive F2L first" section before algorithms are introduced.

The learning tool framing also resolves the UX-2 vs reference-tool tension cleanly. It is not a contested design question if we have committed to the persona.

### 4. Structure for the "Both in Top" 17 Cases

**Decision: Option A — flat list with sub-group headings, not separate pages.**

Option B (separate pages) fragments the URL space and forces navigation that kills the "scan all cases" workflow. Option C (learning path view) is ambitious and belongs in a later sprint if at all.

Option A with proper headings delivers 80% of the pedagogical value at 10% of the cost: group the 17 cases under three headings — "White sticker facing up," "White sticker facing right," "White sticker facing front" — rendered as section dividers within the existing grid. This gives learners a ramp, is achievable in the data layer by adding a `subgroup` field to the relevant cases, and requires minimal UI change.

This also resolves PED-4 and partially resolves PED-3.

### 5. Case Count: 41, 39, or 37?

**Decision: 41 is the displayed count during the fix sprint. Target is 39 after removing duplicates. Do not remove the AUF variants.**

Community convention (STD-3) says AUF variants are not distinct cases. That is true for competition-level reference tools. For a *learning* tool targeting beginners, f2l-03 and f2l-04 (the U2 pre-AUF variants) are genuinely useful to show explicitly — a beginner does not yet have the intuition to recognize "oh, that's just f2l-01 with a U2 in front." Remove them later, after the intuitive F2L content exists to explain what AUF means and why variants collapse.

For now: remove the 2 confirmed duplicates (f2l-01/06, f2l-02/07) → 39 cases. Remove f2l-41 (impossible case) → 38. Decide on f2l-12/22/33 and f2l-13/34 based on the investigation above — if 3 are copy-paste errors and should be 3 distinct algorithms, the count stays 38; if they are genuinely one algorithm per multiple states, the count becomes 35–37.

**Communicate this honestly.** The site should say "38 cases" (or whatever the final count is) without apology. The SpeedSolving wiki's canonical number is 41 *including* AUF variants and some edge cases with multiple algorithms. The discrepancy is explainable.

---

## Sprint Plan

### Sprint 1 — The Site Must Be Correct Before Anything Else

These issues make the site actively wrong or misleading. Nothing in Sprint 2 or 3 matters if the 3D viewer shows nonsense states.

| Issue | Action |
|-------|--------|
| P0-1 | Audit every `experimental-setup-alg` value. Compute the inverse of each algorithm and update the JSON. Verify in the viewer. |
| P0-2 | Delete f2l-06 and f2l-07 from the JSON. Update any hardcoded case counts. |
| P0-3 | Delete f2l-41. Add a comment in the JSON (or a README note) explaining why: "corner + flipped in-slot edge is not a valid 3×3 state." |
| P0-4 | Investigate f2l-12/22/33 and f2l-13/34. Verify which algorithms are wrong, fix them. If genuinely multi-case, add a `notes` field explaining this. |
| P0-5 | Wrap the fetch in cases.js with try/catch. Check `res.ok`. Render a visible error state ("Could not load case data — try refreshing"). |
| P1-1 | Replace the twisty-player internal API call with `player.timestamp = 0; player.play()`. |
| P1-4 | Fix the "edge-in-top" category label to "corner-in-top" in the JSON, filter bar, about.html, and any category badge rendering. This is a correctness issue, not a UX issue. |
| STD-2 | Fix or remove the SpeedSolving wiki attribution in the footer. |

Outcome: the site shows correct cube states, has no impossible cases, has no duplicates, and does not crash silently on fetch failure.

**Sprint 1 is complete when:** every 3D viewer animation demonstrably shows the case state it claims to show. This requires manual spot-checking at minimum 10 cases including the previously identified wrong ones.

---

### Sprint 2 — The Site Must Be Usable for Learning

These issues make the site technically functional but pedagogically broken.

| Issue | Action |
|-------|--------|
| UX-1 | Render `c.name` as visible text on each card. This is a one-line template change. |
| UX-2 | Make recognition hints visible by default. Keep the collapse toggle for users who want to hide them. This reverses the current behavior. |
| UX-3 | Add `position: sticky; top: 0` to the filter bar. Add a `z-index` to keep it above cards. |
| UX-5 | Pick one learning order (Easy → Both in Top → Corner in Slot → Edge in Slot → Advanced) and make index.html and about.html consistent. |
| UX-6 | Compute and display move count next to each algorithm. This is a 5-line JS addition in `renderAlg()`. |
| UX-7 | Display the setup scramble on each card as copyable text. Label it "Practice setup (apply to solved cube)." |
| PED-1 | Add an "Intuitive F2L first" section to about.html. This is content, not code. Two to three paragraphs explaining pair-and-insert before the algorithm list. Link to it from the home page. |
| PED-2 | Add a glossary section to about.html: trigger, AUF, sexy move, pairing, flipped edge. These terms appear in recognition hints; they must be defined where recognition hints are visible. |
| PED-4 | Add `subgroup` field to "Both in Top" cases in the JSON. Render sub-group headings in the grid. Three headings: white-up, white-right, white-front. |
| PED-5 | Add a "Trigger Mechanics" section to about.html explaining R U R' U' and F' U' F U, their names, and their inverses. Place it before the case list link. |
| A11Y-3 | Fix `aria-valuenow` in `renderProgressBar()`. One-line setAttribute fix. |
| A11Y-7 | Increase `--text-subtle` contrast. Change #555566 to a lighter value that passes 4.5:1 against all three background tokens. Target: #8888aa or similar — verify with a contrast checker. |
| STD-5 | Update 01-overview.md to say 17 "Both in Top" cases (not 21). Note that 4 easy cases were previously miscounted here. |
| P1-5 | Wire `Reset Progress` to the exported `resetProgress()` function in progress.js. Remove the inline onclick. |
| P1-6 | Remove the dead CSS color rules for move chips (or fix the JS to use CSS classes instead of inline style). Pick one approach and make the other go away. |

Outcome: a learner can open the site, read the recognition hint for every case, understand the algorithm difficulty via move count, practice on a physical cube using the setup scramble, and track progress accurately.

**Sprint 2 is complete when:** a new learner can be handed the URL and navigate from "I know nothing about F2L" to "I understand what each case looks like and how to start learning them" without leaving the site.

---

### Sprint 3 — Polish and Enhancement

These are real issues but none of them block correct learning.

| Issue | Action |
|-------|--------|
| A11Y-1 | Add a skip link to cases.html. `<a class="skip-link" href="#cases-grid">Skip to cases</a>`. |
| A11Y-2 | Add `aria-pressed` to filter buttons. Update on each filter change. |
| A11Y-4 | Move `aria-live="polite"` from the card grid to `.cases-count`. |
| A11Y-5 | Add Escape-to-close to mobile menu. Move focus to first nav link on open. Return focus to hamburger on close. |
| A11Y-6 | Copy `role="img"` and `aria-label` from placeholder to the replacement `<twisty-player>` element in `initPlayer()`. |
| A11Y-8 | Darken F-face (green) chip text or use dark text on light green. Same for L-face (orange). Verify new contrast ratios. |
| A11Y-9 | Add `window.matchMedia('(prefers-reduced-motion: reduce)')` check in viewer.js. Call `player.jumpToEnd()` instead of `player.play()` when true. |
| UX-4 | Visually separate "Learned" filter from category filters. Use a divider or right-align it. |
| P1-2 | Add `components.css` and `nav.js` to `404.html`. |
| P1-3 | Remove one of the two `renderCases()` calls triggered by filter click. The hash-based path should be the single trigger. |
| STD-1 | Add M, S, E slice moves and x, y, z rotation notation to the notation guide. |
| STD-3 | Revisit AUF variants (f2l-03/f2l-04) once the intuitive F2L content exists. Remove them if the AUF concept is well explained. |
| STD-4 | Replace `transition: all` on filter buttons with an explicit property list. |

---

## Issues That Should NOT Be Fixed

**STD-3 (AUF variants as inflation) — defer, not fix.**
The audit is not wrong, but the timing is wrong. Removing f2l-03 and f2l-04 before the intuitive F2L section exists leaves learners without context for why AUF variants collapse. The pedagogy has to come first.

**UX-7 setup scramble display** is listed in Sprint 2 but carries a caveat: the setup scramble values must be correct (Sprint 1) before displaying them is anything other than harmful. The dependency is hard — do not ship UX-7 before P0-1 is verified complete.

**PED-3 (recognition hints as decision trees)** is noted but not scheduled. Rewriting recognition hints from position descriptions to decision trees is significant content work and requires someone with domain expertise to author correctly. A bad decision tree is worse than a position description. This belongs in a future content revision cycle, not an engineering sprint.

---

## Disagreements with the Audit

**P0-4 framing is slightly off.** The audit flags f2l-12/22/33 sharing an algorithm as either a copy-paste error or an unexplained pedagogical point. A third possibility: these cases are genuinely rotationally equivalent (i.e., the same physical state with the target slot in different positions) and the "algorithm" is actually a rotation-relative description that appears identical in WCA notation. This is common in F2L and is not inherently wrong — it requires investigation before characterizing as a bug. The priority rating P0 may be overstated; P1 is more appropriate unless investigation confirms the values are actually wrong.

**A11Y-9 (prefers-reduced-motion and twisty-player)** is correctly identified but the severity is overstated. twisty-player running requestAnimationFrame inside its Shadow DOM is an intentional design of that library. Calling `player.jumpToEnd()` is a reasonable mitigation, but characterizing the current behavior as a WCAG failure is a stretch — the motion is interactive (triggered by user action), not ambient or auto-playing. WCAG 2.3.3 (Animation from Interactions) is Level AAA, not AA. This is best-effort polish, not a compliance failure.

**UX-2 (recognition hints hidden by default)** — the audit calls this "wrong for a learning tool" and this roadmap agrees with that conclusion. But the audit frames it as a UX gap rather than a product vision failure. The real issue is that the site was built without committing to a persona. Fixing UX-2 in isolation, without the broader commitment to the learning tool persona, would be inconsistent. The fix is correct but it is downstream of the tradeoff decision made in this document.

**STD-2 (footer attribution)** is listed as P3 — Standards. It should be P1. The site is explicitly claiming authority from the SpeedSolving wiki while using a numbering system that is incompatible with it. A learner who tries to cross-reference will be confused and will lose trust in the entire dataset. Trust damage is not a P3 problem.

---

## Dependency Graph for Sprint Sequencing

```
Sprint 1 (data correctness)
  └── P0-1 (fix scrambles) ──→ unblocks UX-7 (display scrambles)
  └── P0-2 (remove duplicates) ──→ unblocks correct case count everywhere
  └── P0-3 (remove f2l-41) ──→ unblocks correct case count
  └── P0-4 (investigate shared algs) ──→ unblocks final case count

Sprint 2 (learning usability)
  └── PED-1/2/5 (content) ──→ unblocks STD-3 (remove AUF variants, Sprint 3)
  └── UX-2 (hints visible) ──→ requires PED-2 (glossary) to be present first

Sprint 3 (polish)
  └── All a11y fixes are independent of each other
  └── STD-3 requires PED-1 to exist
```

The sequencing is strict at the top (Sprint 1 must fully complete before Sprint 2 ships anything involving case counts or scramble display) and loose at the bottom (Sprint 3 items can be parallelized).

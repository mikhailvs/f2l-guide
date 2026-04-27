# Phase 5: Guided Solve UI

## Goal

Walk the user through executing the solution on their physical cube, one step at a time, with a twisty-player showing the current state, the next move highlighted, and direct links to the F2L case cards on cases.html.

---

## UI structure

```
scan.html (step 3 of 3: Guided Solve)

  ┌─ Stage tabs ───────────────────────────────────────────────┐
  │  [Cross] [F2L] [OLL] [PLL]   ← current stage highlighted  │
  └────────────────────────────────────────────────────────────┘

  ┌─ Current cube state (twisty-player) ──────────────────────┐
  │                   [3D cube at current state]               │
  │  [▶ Animate next move]  [↺ Reset to step start]           │
  └────────────────────────────────────────────────────────────┘

  ┌─ Step details ─────────────────────────────────────────────┐
  │  Step 3 of 7 in F2L                                        │
  │  Inserting the FR pair                                      │
  │                                                             │
  │  Algorithm:  [R] [U'] [R'] [U] [R] [U'] [R']              │
  │                                                             │
  │  ┌─ This is F2L Case ──────────────────────────────────┐   │
  │  │  f2l-12: Both in top — white right, edge adjacent    │   │
  │  │  [View case card →]                                  │   │
  │  └─────────────────────────────────────────────────────┘   │
  └────────────────────────────────────────────────────────────┘

  [← Back]              [✓ Done, next step →]
```

---

## Stage structure

### Cross (4 moves per edge, up to ~8 moves total)

- Show each cross edge individually
- Label: "Place the [color]-white edge"
- Small hint: show which edge piece to look for on the physical cube

### F2L (4 slots, each with an identified case)

For each slot:
- Show the pre-slot state in the twisty-player
- If matched to a case in `f2l-cases.json`:
  - Show a "This is F2L Case" card with case name, badge, algorithm chips
  - "View case card →" opens cases.html with that case visible/highlighted
- If not matched (rare): just show the algorithm moves

### OLL (1 algorithm)

- Show the OLL case visually (top-view twisty-player)
- Note: this site doesn't have an OLL library, so just show the algorithm string
- Optional future: link to an OLL reference

### PLL (1 algorithm)

- Same as OLL: show the algorithm, no case library (out of scope)

---

## Step navigation

### Forward: "Done, next step →"

When clicked:
- Record this step as completed
- Advance to the next step
- Update the twisty-player to show the cube state AFTER the last step's moves
- Scroll to top of step details

The twisty-player always reflects the current cumulative state of the solve. Each step advances from the previous state.

### Backward: "← Back"

Return to the previous step. The twisty-player reverts to the previous state. Useful if the user executed a move incorrectly.

### Stage tabs

Clicking a stage tab jumps to the first unfinished step in that stage. Completed stages show a checkmark.

---

## Twisty-player usage per step

Each step constructs a twisty-player with:
- `experimental-setup-alg`: the cumulative moves up to this step's starting state
- `alg`: the moves for this step only

This means the viewer shows exactly the cube state the user should be at, and animating it shows only the next moves — not the full solution.

```js
// For step i:
const setupMoves = allMoves.slice(0, stepStartIndex).join(' ');
const stepMoves  = allMoves.slice(stepStartIndex, stepEndIndex).join(' ');

player.setAttribute('experimental-setup-alg', setupMoves);
player.setAttribute('alg', stepMoves);
player.timestamp = 0;
```

---

## State persistence

The solve progress is saved in `sessionStorage`:
- `f2l-scan-state`: the original detected cube state (54-char string)
- `f2l-scan-solution`: the full move sequence as JSON
- `f2l-scan-step`: current step index

This allows the user to close and reopen the browser tab without losing their place (within the same session). A "Start over" button clears all state and returns to the capture flow.

---

## F2L case deep-linking

When an F2L step matches a case from `f2l-cases.json`:

1. Show a compact case card (name, badge, algorithm chips) inline in the step details
2. The "View case card →" link goes to `cases.html#<caseId>` and programmatically scrolls that card into view
3. When the user returns to scan.html (browser back), they're at the same step

The case link is the most important integration point. A user learning F2L can:
1. Scan their cube
2. See which F2L case is on the board
3. Click to the full case card with 3D animated diagram
4. Come back and mark the step done

---

## Error recovery

| Situation | Handling |
|-----------|----------|
| User executed wrong move | "Something looks wrong? Go back and redo this step" — no state lock |
| Step skipped accidentally | Steps can be revisited freely via "← Back" |
| User rearranged the cube wrongly | "Reset to step start" sets twisty-player to the step's expected starting state so user can compare |
| Solve is taking too long | No timeout — users learn at their own pace |

---

## Accessibility

- Algorithm chips use the same color-coded design as the cases page
- Twisty-player has aria-label describing the current cube state
- Stage tabs have `aria-current="true"` on the active stage
- "Done, next step" announces progress via `aria-live` region: "Step 3 of 7 complete"
- Play/pause button toggles aria-label between "Animate next move" and "Pause animation"

---

## What this page is NOT

- Not a real-time cube tracker — user manually advances each step
- Not a timer — no speedsolving features
- Not a branching guide — one solution path only (the solver's output)
- Not persistent across sessions — sessionStorage only, closes when tab closes

# Phase 3 & 4: State Validation + Solver

## Phase 3: State Validation

Before solving, the 54-sticker array must be validated. Invalid states produce useless solutions or crash the solver.

### Validation rules (in order)

**Rule 1 — Color count**: Each of the 6 colors appears exactly 9 times.
```
countByColor = { U:9, R:9, F:9, D:9, L:9, B:9 }
```
If this fails: wrong color was assigned. The correction UI delta (which colors are over/under) tells the user exactly which face likely has the error.

**Rule 2 — Center stickers match**: The center sticker (position 4) of each face must match the face's identity. If the user photographed in the wrong order, centers may be wrong.

**Rule 3 — Solvability**: A valid-looking cube state may still be physically impossible (odd permutation, flipped edge in place, twisted corner in place). These arise from detection errors that put a valid-count state in an impossible configuration.

Check with cubing.js:
```js
import { Cube3x3x3 } from '@cubing/cubing/puzzles';
const kstate = new KState(/* parsed state */);
const solvable = await isSolvable(kstate); // cubing.js utility
```

If not solvable: the error is almost certainly a detection mistake on one or two stickers. Highlight the most probable misclassifications (lowest confidence scores) and ask the user to check them.

### Error messages

| Validation failure | User message |
|-------------------|-------------|
| Wrong color count | "There are too many [color] stickers. Check the [face] face — one sticker may be misidentified." |
| Wrong center | "The center of the [face] face doesn't match. Did you photograph the faces in the right order?" |
| Not solvable | "This cube state can't be solved — one or two stickers are likely misidentified. The highlighted stickers have the lowest detection confidence." |

### State format

Internally, the cube state is stored as a 54-character string in standard kociemba notation:
`UUUUUUUUURRRRRRRRRFFFFFFFFFDDDDDDDDDLLLLLLLLLBBBBBBBBB`

This is the input format for most 3×3×3 solvers. The mapping from our 6-face 3×3 grids to this string is:
- Characters 0–8: U face, reading row by row top-left to bottom-right
- Characters 9–17: R face
- Characters 18–26: F face
- Characters 27–35: D face
- Characters 36–44: L face
- Characters 45–53: B face

---

## Phase 4: Solver Integration

### cubing.js solver

cubing.js includes `experimentalSolve3x3x3IgnoringCenters` — a near-optimal solver that runs in the browser. It requires a one-time WASM initialization (~2–3 seconds on first use) and subsequent solves are fast (<1 second for most states).

The solver returns a flat move sequence (e.g., `R U R' U' F2 D L2 ...`) that solves the cube in ~20 moves. This flat sequence needs to be broken into CFOP stages.

### WASM Worker

The solver runs in a WebWorker to avoid blocking the UI:

```js
// solver.worker.js
importScripts('https://cdn.cubing.net/js/cubing/puzzles');

self.addEventListener('message', async ({ data }) => {
  const { state } = data;
  const solution = await experimentalSolve3x3x3IgnoringCenters(state);
  self.postMessage({ solution: solution.toString() });
});
```

```js
// solver.js
const worker = new Worker('./js/scan/solver.worker.js');
export function solve(state) {
  return new Promise(resolve => {
    worker.onmessage = ({ data }) => resolve(data.solution);
    worker.postMessage({ state });
  });
}
```

### CFOP stage breakdown

The flat solution string needs to be split into stages for the guided UI. Strategy: simulate the cube state incrementally applying moves, and check for stage completion after each:

```js
function detectStages(state, moves) {
  const stages = { cross: null, f2l: null, oll: null, pll: null };
  let sim = state;

  for (let i = 0; i < moves.length; i++) {
    sim = applyMove(sim, moves[i]);
    if (!stages.cross && isCrossSolved(sim)) stages.cross = i + 1;
    if (!stages.f2l   && isF2LSolved(sim))   stages.f2l   = i + 1;
    if (!stages.oll   && isOLLSolved(sim))   stages.oll   = i + 1;
    if (!stages.pll   && isPLLSolved(sim))   stages.pll   = i + 1;
  }
  return stages;
}
```

This requires a lightweight cube simulator (just move application, no solving). cubing.js provides this as `KState.applyMove()`.

Stage check functions:
- `isCrossSolved(state)`: D-layer edge pieces all in place and oriented
- `isF2LSolved(state)`: All 4 F2L slots solved (first two layers complete)
- `isOLLSolved(state)`: All U-layer stickers facing up (OLL complete)
- `isPLLSolved(state)`: Cube fully solved

### F2L case identification

This is the feature's key integration point with the existing site.

When the solver's moves complete one F2L slot, we need to identify which of the 36 cases from `f2l-cases.json` the _starting position_ of that slot corresponded to.

Approach:
1. Before the F2L moves for a slot, extract the positions of that slot's corner and edge pieces
2. Compare this position/orientation pattern to all 36 case definitions in `f2l-cases.json`
3. Match the case and surface the matching card with a deep link

The matching logic lives in `detect.js` as `identifyF2LCase(slotState)` → returns `caseId | null`.

```js
// From the partial cube state before F2L moves for the FR slot:
// - Extract FR corner position (which cubie is at UBR/UFR/ULF/etc.)
// - Extract FR edge position (which cubie is at UF/UR/etc.)
// - Derive: which category (both-in-top, corner-in-slot, etc.)
//           and subgroup if both-in-top
// - Return the matching case ID from f2l-cases.json
```

This is the hardest algorithmic piece. Fallback: if case can't be identified, just show the moves without a case link.

### Alternative solver approach: stage-by-stage

Instead of flat solve + split, use cubing.js to solve one stage at a time:
1. Solve cross only (set other layers as "don't care")
2. From post-cross state, solve first F2L slot
3. From post-F2L-1 state, solve second slot
4. etc.

This gives cleaner stage boundaries and makes F2L case identification trivial (just check each slot's state before solving it). The trade-off is longer total move count (stage-by-stage is less efficient than one-shot optimal), but for a teaching tool, move efficiency matters less than clarity.

**Recommendation: stage-by-stage approach.** It produces cleaner CFOP stages, enables precise F2L case identification, and is more consistent with how humans actually learn CFOP.

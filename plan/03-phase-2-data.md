# Phase 2 — Case Data

## Goal

A single JSON file containing all 41 F2L cases as the authoritative data source. Every other feature reads from this file — visualization, filtering, progress tracking all key off the same IDs.

## Checkpoint

- [ ] `data/f2l-cases.json` contains all 41 cases
- [ ] Each case has: id, name, category, scramble, algorithm(s), thumbnail description
- [ ] A second simpler algorithm listed where one commonly exists
- [ ] Categories match the filter labels planned for Phase 4
- [ ] JSON validates (no syntax errors)

## Schema

```jsonc
{
  "cases": [
    {
      "id": "f2l-01",
      "name": "Easy Case 1",
      "category": "easy",           // easy | corner-in-slot | edge-in-top | both-in-top | advanced
      "slot": "FR",                 // which slot: FR | FL | BR | BL
      "scramble": "...",            // WCA notation to get to this case from solved F2L slot
      "algorithms": [
        {
          "label": "Main",
          "moves": "U R U' R'",
          "notes": ""
        },
        {
          "label": "Alt",
          "moves": "...",
          "notes": "Fewer moves if coming from OLL skip"
        }
      ],
      "description": "Corner on top with white facing up, edge in top layer matching R color"
    }
  ]
}
```

## Category Breakdown (41 total)

| Category | Count | Description |
|----------|-------|-------------|
| `easy` | 4 | Pair already formed, just insert |
| `corner-in-slot` | 8 | Corner stuck in slot (right or wrong), edge in top |
| `edge-in-top` | 8 | Edge flipped or misoriented in top, corner in top |
| `both-in-top` | 17 | Both pieces free in U layer, various orientations |
| `advanced` | 4 | Edge in wrong slot / corner flipped in slot |

## Files

```
data/
  f2l-cases.json      ← all 41 cases
```

## Notes

- Scrambles should set up the case relative to the **FR slot** (right-front) — the standard teaching convention
- All algorithms assume white cross on bottom, yellow on top (standard CFOP orientation)
- Use standard WCA move notation: R, U, F, L, B, D and their primes/doubles

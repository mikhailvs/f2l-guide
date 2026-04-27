# Phase 2: Color Detection

## Goal

Extract 54 sticker colors (9 per face × 6 faces) from the captured images, classify each into one of the 6 canonical Rubik's cube colors, and present a correction UI for misclassifications.

---

## The core challenge

RGB pixel values are unreliable across lighting conditions. A white sticker under warm indoor light looks cream-yellow. A yellow sticker in shadow looks brownish-orange. Comparing raw RGB to hardcoded target colors will fail on ~30% of real photos.

Solution: **LAB color space + relative comparison**.

LAB (CIELAB) was designed to match human color perception — equal numerical distances represent equal perceived color differences. It separates luminance (L) from color information (a, b), which makes it robust to lighting changes that primarily affect brightness.

---

## Algorithm

### Step 1: Extract sticker sample regions

For each face image, define 9 sample regions — one per sticker, arranged in a 3×3 grid. The grid is centered in the image within the user's crop guide.

```
┌───┬───┬───┐
│ 0 │ 1 │ 2 │
├───┼───┼───┤
│ 3 │ 4 │ 5 │  ← center sticker (4) defines the face color
├───┼───┼───┤
│ 6 │ 7 │ 8 │
└───┴───┴───┘
```

For each region, sample a central 40% of the cell area (not the full cell) to avoid edge bleed from adjacent sticker colors or the cube's black border.

Sample implementation:

```js
function sampleRegion(imageData, x, y, w, h) {
  const pixels = [];
  const margin = 0.3; // ignore outer 30%
  const x0 = Math.round(x + w * margin);
  const y0 = Math.round(y + h * margin);
  const x1 = Math.round(x + w * (1 - margin));
  const y1 = Math.round(y + h * (1 - margin));
  for (let py = y0; py < y1; py++) {
    for (let px = x0; px < x1; px++) {
      const i = (py * imageData.width + px) * 4;
      pixels.push([imageData.data[i], imageData.data[i+1], imageData.data[i+2]]);
    }
  }
  return medianRGB(pixels); // median is more robust than mean to hot spots
}
```

### Step 2: Convert to LAB

```js
function rgbToLab([r, g, b]) {
  // Linearize sRGB
  const lin = v => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  const [rl, gl, bl] = [lin(r), lin(g), lin(b)];
  // D65 reference white XYZ
  const X = rl*0.4124 + gl*0.3576 + bl*0.1805;
  const Y = rl*0.2126 + gl*0.7152 + bl*0.0722;
  const Z = rl*0.0193 + gl*0.1192 + bl*0.9505;
  const f = v => v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16/116;
  const [fx, fy, fz] = [f(X/0.9505), f(Y/1.0000), f(Z/1.0890)];
  return [116*fy - 16, 500*(fx - fy), 200*(fy - fz)]; // [L, a, b]
}
```

### Step 3: Classify each sticker

Compare each sampled sticker's LAB value to the 6 canonical cube colors (in LAB space) using Euclidean distance:

```js
const CANONICAL_LAB = {
  U: rgbToLab([255, 213, 0]),    // yellow
  R: rgbToLab([224, 48,  48]),   // red
  F: rgbToLab([48,  160, 48]),   // green
  D: rgbToLab([232, 232, 232]),  // white
  L: rgbToLab([224, 120, 32]),   // orange
  B: rgbToLab([48,  96,  224]),  // blue
};

function classifySticker(labValue) {
  let best = null, bestDist = Infinity;
  for (const [face, canonical] of Object.entries(CANONICAL_LAB)) {
    const dist = Math.hypot(
      labValue[0] - canonical[0],
      labValue[1] - canonical[1],
      labValue[2] - canonical[2],
    );
    if (dist < bestDist) { bestDist = dist; best = face; }
  }
  return { face: best, confidence: 1 / (1 + bestDist / 30) }; // 0-1 confidence
}
```

### Step 4: Confidence-based anchoring

The center sticker of each face (position 4 in the 3×3 grid) is always the face's color — that's a physical invariant of the cube. Use detected centers to **anchor** and recalibrate the 6 canonical colors for this specific photo and lighting:

```js
// After detecting all 6 centers, re-derive canonical colors from detected centers
// rather than hardcoded values. This makes the rest of the face detection
// relative to the actual lighting in this photo session.
const anchored = {};
for (const face of 'URFDLB') {
  anchored[face] = detectedCenterLab[face]; // use detected center as canonical
}
// Re-classify all 54 stickers against anchored canonicals
```

This dramatically improves accuracy: if the camera white-balances warm, yellow might look orange in absolute LAB, but the anchored yellow (from the detected yellow center) will still match the other yellow stickers.

---

## Confidence threshold and correction UI

Any sticker classified with confidence below 0.6 (or where the top-2 candidates are close) is flagged. Flagged stickers appear with a warning indicator in the correction UI.

### Correction UI design

Show an unfolded cube net with colored tiles for all 54 stickers:

```
          [ U face ]
[ L face ] [ F face ] [ R face ] [ B face ]
          [ D face ]
```

Each sticker is a colored square — the detected color. Flagged stickers have a pulse outline. The user taps/clicks a sticker to cycle it through the 6 possible colors.

A color key at the bottom shows the 6 face colors with their labels. Incorrectly detected stickers are the most common correction target, so the tap-to-cycle UX (rather than a dropdown) is the fastest path.

The "Validate & Solve →" button only activates when all validation rules pass (see Phase 3).

---

## Confidence display

Each face preview shows a small confidence indicator:
- Green check (≥80% confident on all 9 stickers)
- Yellow warning (one or more stickers between 60–80%)
- Red X (any sticker below 60%)

Users are prompted to retake low-confidence faces before proceeding. They can still force-proceed and use the correction UI to fix issues manually.

---

## Edge cases

| Situation | Handling |
|-----------|----------|
| Sticker is missing/worn | Low confidence, flagged for correction |
| Black border between stickers sampled | Margin-based sampling avoids edges |
| Shiny/metallic cube (speed cube coatings) | Hot spots → sample median filters them |
| Cube with non-standard colors | Anchoring from centers helps; may require full manual correction |
| Image too dark | Pre-detection brightness check with user warning |
| User photographs wrong face | Caught at validation stage (wrong number of each color) |

# Revised Capture: 2-Photo Approach

The user's observation: a standard cube only needs **2 photos** to capture all 6 faces, not 6. From one corner of a cube, 3 faces are simultaneously visible. Photograph from 2 opposite corners and all 6 faces are covered.

---

## The geometry

From an isometric corner perspective, you can see exactly 3 faces:
```
Photo 1 (top-front-right corner):     Photo 2 (bottom-back-left corner):
  U + F + R                              D + B + L
```

The user holds the cube with the instruction:
- **Photo 1**: "White face on top, green face toward you" → shows U (white), F (green), R (red)
- **Photo 2**: "Flip the cube over, blue face toward you" → shows D (yellow), B (blue), L (orange)

Two photos instead of six is a significantly better UX.

---

## What makes this harder than 6 flat photos

### 1. Perspective distortion

The faces are at ~45° angles in the photo, not face-on. Each face appears as a parallelogram or irregular quadrilateral, not a square. Mapping the 3×3 sticker grid onto this shape requires a **perspective transform** (homography).

For each face in the isometric photo:
1. User (or automated detection) identifies the 4 corners of the face
2. Apply a perspective warp to extract a rectified square of that face
3. Sample the 9 sticker regions from the rectified square

This adds significant complexity over 6 flat photos, but the user experience improvement is large enough to justify it.

### 2. Automatic vs. manual corner detection

**Option A: Automatic** — detect the cube corners using edge detection (Sobel filter) and line intersection. This works well when the cube has clear black borders between stickers and reasonable contrast from the background. Unreliable with low contrast backgrounds.

**Option B: Manual with tap-to-correct** — show the photo with an auto-detected perspective grid, let the user drag the corners to align if the auto-detection missed. This is the pragmatic choice for v1.

**Recommended: Manual with automated suggestion.** Auto-detect as a starting point; show 3 corner-dragging handles per face in the photo; allow adjustments before accepting.

---

## Revised capture flow

### Photo 1: Top corner

Instructions: "Hold the cube so WHITE is on top and GREEN faces you. Tilt the cube slightly so you can see the top, front, and right faces all at once."

After photo:
- Show the image with 3 labeled quadrilaterals (U, F, R) overlaid
- Each quad has 4 corner-drag handles
- Drag to align with actual face edges
- "Looks good" → extract and rectify 3 faces

### Photo 2: Bottom corner

Instructions: "Flip the cube upside down so YELLOW is on top and BLUE faces you."

Same rectification flow for D, B, L faces.

After both photos: proceed to correction UI (same as 6-photo flow).

---

## Perspective rectification

For each face with its 4 corners identified, apply a projective transformation (homography):

```js
// corners: [{x, y}, ...] — 4 corners of the face in the photo
// output: 180×180 canvas of the face, squared up
function rectifyFace(imageData, corners, outputSize = 180) {
  const canvas = new OffscreenCanvas(outputSize, outputSize);
  const ctx = canvas.getContext('2d');

  // Compute homography matrix from corners → square
  const H = computeHomography(corners, [
    [0, 0], [outputSize, 0], [outputSize, outputSize], [0, outputSize]
  ]);

  // Inverse-map pixels: for each output pixel, find source pixel
  for (let y = 0; y < outputSize; y++) {
    for (let x = 0; x < outputSize; x++) {
      const [sx, sy] = applyHomography(H, [x, y]);
      // Sample from imageData at (sx, sy) with bilinear interpolation
      setPixel(canvas, x, y, sampleBilinear(imageData, sx, sy));
    }
  }
  return canvas;
}
```

Once each face is rectified to a square, the 9-sticker sampling from feature-03-detection.md applies unchanged.

---

## Automatic face corner detection

To seed the manual-adjust UI with a good starting point:

1. **Grayscale + edge detection** (Sobel) to find strong edges
2. **Hough line transform** to detect the 12 dominant straight lines of the cube
3. **Find 3 groups of 4 parallel lines** (the 3 sets of parallel edges of the cube)
4. **Intersect lines** to find the 8 cube corners visible in each photo
5. **Assign 3 face quads** from the 8 corners using the known cube topology

This is a moderate amount of CV work but the result is a usable starting estimate. The manual-adjust handles the failure cases.

Alternative shortcut: if auto-detection is too unreliable, skip it entirely and just show the grid in the default position (centered, parallelogram-shaped) and rely on the user to drag it to the correct position. The drag-to-adjust handles the entire case.

---

## Impact on detection algorithm

The 2-photo approach only changes Phase 1 (capture) and the first step of Phase 2 (extraction). Once each face is rectified to a 180×180 square, the LAB color classification and confidence scoring from feature-03-detection.md apply identically.

No changes needed to Phase 3 (validation), Phase 4 (solver), or Phase 5 (guidance UI).

---

## Revised complexity estimate

| Aspect | 6-photo approach | 2-photo approach |
|--------|-----------------|-----------------|
| Photos required | 6 | 2 |
| User steps | High | Low |
| Detection accuracy | High (face-on) | Slightly lower (angle) |
| Implementation complexity | Lower | Higher (perspective warp, corner detection) |
| UX quality | Acceptable | Significantly better |

**Recommendation: Build 6-photo as v1 (lower risk, ships faster), then replace with 2-photo in v2 once the rest of the pipeline is proven.** The 2-photo version is architecturally compatible — it only swaps out the capture + extraction phase while leaving validation, solver, and guidance UI unchanged.

---

## Alternative: pre-defined orientation marks

A simpler path to 2-photo that avoids the full homography: **print or show a reference frame on screen** that the user aligns the cube against. A phone prop with a printed L-shaped bracket tells the user exactly how to orient the cube, and the face positions are known offsets from the bracket corners. This reduces corner detection to simple known-position sampling at the cost of requiring a physical prop.

Not ideal for a pure web app, but worth noting as a middle path.

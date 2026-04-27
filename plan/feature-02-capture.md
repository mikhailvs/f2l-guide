# Phase 1: Capture UI

## Goal

A guided 6-step photo flow that walks the user through photographing each face of their cube in the correct orientation, with enough visual context that the color detection algorithm has a good chance of working on the first attempt.

---

## Face capture order

Standard order: **White (U) → Red (R) → Green (F) → Yellow (D) → Orange (L) → Blue (B)**

This matches the CFOP "white on bottom" convention the rest of the site uses, with U photographed first so center colors can anchor the others. The order is displayed to the user as:

```
① White (top)   ② Red (right)   ③ Green (front)
④ Yellow (bottom)  ⑤ Orange (left)  ⑥ Blue (back)
```

---

## Page structure: scan.html

```
/scan.html
  ├── Nav (same as all pages)
  ├── Progress stepper: [①②③④⑤⑥] with current step highlighted
  ├── Instruction card
  │     ├── Face diagram — which face to point at camera
  │     ├── "Hold the cube with WHITE on top and RED facing you"
  │     └── Lighting tip: "Find even lighting. Avoid direct sunlight."
  ├── Capture zone
  │     ├── Uploaded image preview (once selected)
  │     ├── 3×3 grid overlay — drawn on canvas over the image
  │     └── "The cube face should fill this square"
  ├── [📷 Take Photo / Upload Image] button (triggers file input)
  ├── [Use this photo →] button (advances to next face)
  └── [← Retake] button
```

After all 6 faces are captured, advance to the review screen before running detection.

---

## Step-by-step flow

### Step 1–6: Capture each face

Each step shows:
- A small 3D diagram of the cube with the target face highlighted yellow
- An instruction showing which face is being captured (e.g., "Point the RED face directly at the camera")
- A reference diagram showing the correct cube orientation (white on top, specific face toward camera)
- The file input button (opens camera on mobile, file dialog on desktop)

Once an image is selected:
- Preview the image in the capture zone
- Draw a square frame overlay (the area the detection will sample)
- Provide a "looks good" / "retake" choice

### Review screen (after all 6)

Show a net layout of the cube (unfolded cross shape) with all 6 face thumbnails. User can tap any face to retake it. A "Detect Colors →" CTA advances to Phase 2.

```
          [ U ]
[ L ] [ F ] [ R ] [ B ]
          [ D ]
```

---

## Technical implementation

### File input

```html
<input type="file" id="face-input" accept="image/*" capture="environment" hidden>
<button onclick="document.getElementById('face-input').click()">📷 Take Photo</button>
```

`capture="environment"` opens the rear camera directly on mobile. Removing `capture` on desktop removes the constraint.

### Image preview + grid overlay

```js
// Draw the captured image and a centered square crop guide on a canvas
const ctx = canvas.getContext('2d');
ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

// Draw 3×3 grid within the crop square
const gridSize = Math.min(canvas.width, canvas.height) * 0.85;
const offsetX = (canvas.width  - gridSize) / 2;
const offsetY = (canvas.height - gridSize) / 2;
const cell = gridSize / 3;
for (let i = 0; i <= 3; i++) {
  ctx.strokeRect(offsetX + i * cell, offsetY, 0, gridSize); // vertical
  ctx.strokeRect(offsetX, offsetY + i * cell, gridSize, 0); // horizontal
}
```

### State management

A module-level object stores the 6 face images (as `ImageData` or `Blob`) keyed by face ID:

```js
const captured = { U: null, R: null, F: null, D: null, L: null, B: null };
```

When all 6 are populated, the "Detect Colors →" button activates.

---

## UX details

### Orientation guide

For each face, show a small ASCII-or-SVG diagram of the cube with the target face colored. The user is told exactly how to hold the cube, not just "photograph face X."

Example for Green (F) face:
> "Hold the cube so WHITE is on top. Rotate the cube so the GREEN face points directly at your camera. The face should fill the square outline."

### Lighting guidance

A persistent banner: "Best results in indirect daylight or even indoor lighting. Avoid direct sunlight or strong shadows."

### Retake anytime

The step stepper at the top is clickable — users can jump back to any face to retake it at any time before running detection.

### Accessibility

- All buttons have aria-labels
- Face names use text, not color-only indicators
- Progress stepper announces current step via `aria-current`
- Error state ("no image selected") announced via `aria-live`

---

## Failure modes

| Situation | Handling |
|-----------|----------|
| File too large (>10MB) | Resize client-side before processing (canvas resize) |
| Wrong file type | File input `accept="image/*"` filters this; show error if bypassed |
| User skips faces | "Detect Colors" button stays disabled until all 6 captured |
| Camera permission denied | Show message: "Use the 'Upload Image' option instead" |

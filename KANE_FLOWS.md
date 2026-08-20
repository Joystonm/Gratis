# Gratis — Kane Verification Flows

These are real end-to-end verification flows for use with Kane CLI against the deployed Gratis URL.

---

## Setup

```bash
# Start Gratis locally
npm run dev
# or point Kane at deployed URL
```

---

## FLOW 1: Create a design and export PNG

**Steps:**

1. Open Gratis at `/`
2. Click "Start Creating Free" CTA
3. On `/create`, click "Instagram Post" preset (1080×1080)
4. Verify navigation to `/editor/:id`
5. In the editor, click "Uploads" in the left toolbar
6. Upload any image file
7. Verify the image appears on the canvas
8. Click the "Text" toolbar button
9. Click "Add a heading"
10. Verify a text layer appears on canvas
11. Double-click the text to edit → type "My Design"
12. Click "Export" in the top bar
13. Select PNG format
14. Click "Export"
15. Verify a `.png` file is downloaded

**Expected outcomes:**
- Project persists after page refresh (stored in IndexedDB)
- Export produces a real PNG file matching the canvas content
- Text layer is visible in the Layers panel

---

## FLOW 2: Upload image and use AI background removal

**Prerequisites:** Cloudinary configured (VITE_CLOUDINARY_CLOUD_NAME + VITE_CLOUDINARY_UPLOAD_PRESET set)

**Steps:**

1. Create a new design (any size)
2. Upload an image via the Uploads sidebar panel
3. Click the AI Tools button in the left toolbar
4. Verify the AI Tools panel opens
5. With the image layer selected, click "Remove Background"
6. Verify a processing state is shown (toast notification)
7. Verify the resulting image has its background removed (Cloudinary transformation applied)
8. Export as PNG (transparent)
9. Verify the exported PNG has transparency

**If Cloudinary is not configured:**
- Verify "Remove White Background" local tool is available
- Click it on a suitable image
- Verify white areas become transparent

---

## FLOW 3: Layer management

**Steps:**

1. Create a new design (800×600 custom)
2. Add a rectangle shape (Shapes panel)
3. Add a circle shape
4. Add a text layer
5. Verify all 4 layers appear in the Layers panel (Background + 3 added)
6. Click the eye icon on the rectangle layer → verify it disappears from canvas
7. Click the eye icon again → verify it reappears
8. Click the lock icon on the circle → verify it can't be moved on canvas
9. Drag the text layer above the circle in the Layers panel
10. Verify the canvas layer order changes
11. Right-click a layer → "Duplicate" → verify duplicate appears
12. Select a layer and press Delete → verify it's removed

---

## FLOW 4: Image adjustments

**Steps:**

1. Create a new design and upload an image
2. Select the image layer
3. In the Properties panel, expand "Adjustments"
4. Set Brightness to +50 → verify canvas updates
5. Set Contrast to +30 → verify canvas updates
6. Set Saturation to -50 → verify image appears more desaturated
7. Enable Grayscale toggle → verify full grayscale
8. Click "Reset adjustments" → verify all return to 0
9. Export the adjusted image as JPEG

---

## FLOW 5: Create from template, modify, export

**Steps:**

1. Navigate to `/templates`
2. Click on any template (e.g., "Bold Social Post")
3. Verify navigation to the editor with the template loaded
4. Verify all template layers are visible in the Layers panel
5. Double-click the headline text on canvas → edit the text
6. Select a shape layer → change its fill color in Properties panel
7. Click "Save" (Ctrl+S)
8. Navigate to `/projects`
9. Verify the project appears in the list
10. Click to reopen it → verify edits are preserved
11. Export as PNG at 2× resolution

---

## FLOW 6: Keyboard shortcut verification

**Steps:**

1. Open any project in the editor
2. Add a text layer
3. Press Ctrl+Z (Undo) → verify text layer disappears
4. Press Ctrl+Shift+Z (Redo) → verify text layer reappears
5. Click the text layer to select it
6. Press Arrow keys → verify layer moves 1px per press
7. Press Shift+Arrow → verify layer moves 10px per press
8. Press Escape → verify layer is deselected
9. Press Ctrl+D → verify layer is duplicated
10. Select duplicated layer, press Delete → verify it's removed
11. Press Ctrl+S → verify "Saved" toast notification appears

---

## FLOW 7: Canvas controls

**Steps:**

1. Open any project
2. Scroll with mouse wheel on canvas → verify zoom in/out
3. Use the zoom controls in the top bar → verify zoom changes
4. Click "Fit to screen" icon → verify canvas fits the workspace
5. Click "100%" zoom option → verify canvas returns to 100%
6. Toggle grid on/off → verify grid appears/disappears
7. Toggle rulers on/off → verify ruler state changes
8. Toggle snap on/off → verify button state changes
9. Rename the project by clicking the project name → verify name updates

---

## Notes for Kane automation

- All routes use client-side routing (React Router). Kane should wait for navigation to settle.
- IndexedDB operations are async — add short waits after create/save operations.
- Canvas is a Konva `<canvas>` element — use coordinate-based interaction for element selection.
- Export triggers a file download — verify the download completes rather than checking file content.
- Cloudinary-dependent features should be tested separately with Cloudinary configured.

# Product

## What Gratis Is

Gratis is a browser-based design editor for image creation, editing, AI transformation, and export. It targets designers and developers who need professional creative tools without paywalls, accounts, or subscriptions.

## Core Value Proposition

- No account required, no login, no server
- Full editing workflow in one place: layout, image editing, AI effects, export
- Cloudinary AI features (background removal, upscaling, art filters) available without a backend
- Everything persists in the browser via IndexedDB

## Feature Areas

**Canvas editor**
- Layer-based canvas (images, text, shapes, background)
- Layer panel: visibility, lock, reorder, duplicate, delete
- Undo/redo (50-step history), keyboard shortcuts, grid, rulers, snap-to-grid

**Text**
- Google Fonts, size, weight, style, alignment, letter spacing, line height, outline, shadow, blend modes

**Shapes**
- Rectangle, circle, ellipse, line, arrow, triangle, star, polygon, pentagon, hexagon, octagon, diamond, heart, cross, rounded rect

**Local image editing (no upload needed)**
- Brightness, contrast, saturation, blur, exposure, sharpness, gamma, temperature
- Grayscale, sepia, flip, vignette, pixelate, noise
- White-background removal (Canvas API, fully offline)
- Crop, corner radius, border, drop shadow, blend modes

**Cloudinary AI (optional, requires env vars)**
- Background removal, enhancement, upscaling
- 21 art filters: Hokusai, Aurora, Daguerre, Zorro, Peacock, and more
- Color adjustments: vibrance, fill light, vignette, tint
- Format conversion (WebP, AVIF, PNG, JPG) with quality control

**Export**
- PNG, JPG, WebP at 1×, 2×, or 3× resolution via Konva stage export

**Projects and templates**
- Projects auto-saved to IndexedDB, persist across page refreshes
- Browse, rename, duplicate, delete from Projects page
- Pre-built templates for social media, presentations, marketing

## What Gratis Is Not

- Not a collaborative tool (no real-time multi-user support yet)
- Not a vector editor (no SVG import)
- Not a video tool
- Not a backend application — everything runs in the browser

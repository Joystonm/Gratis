<div align="center">

# Gratis

**Premium creative tools. Zero paywall.**

A browser-based design editor for image creation, editing, AI transformation, and export — no account, no subscription, no backend required.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-AI-3448C5?style=flat-square&logo=cloudinary&logoColor=white)](https://cloudinary.com)

</div>

---

## The Problem

Creating a single professional image usually means bouncing between four or five tools:

- Canva or Figma for layout
- Photoshop or Remove.bg for background removal
- Squoosh or TinyPNG for compression
- A paid app for AI enhancement or art filters

The tools that actually matter — AI background removal, generative fill, upscaling, art filters — sit behind a paywall almost everywhere.

Gratis puts the full workflow in one place. It runs entirely in the browser, requires no account, and surfaces Cloudinary's AI capabilities without ever touching a server or exposing an API secret.

---

## What It Is

Gratis is a canvas-based design editor built on React-Konva. You start from a blank canvas or a template, stack images, text, and shapes in layers, apply local or cloud-powered effects, and export at up to 3× resolution.

Everything is stored in IndexedDB. No server, no login, no data leaving the browser unless you explicitly upload to Cloudinary.

---

## Features

### Editor

- Canvas with a full layer system — images, text, shapes, background
- Layer panel: visibility toggle, lock, drag-to-reorder, duplicate, delete
- Undo/redo with 50-step history (deep-cloned state, no reference sharing bugs)
- Keyboard shortcuts: `Ctrl+Z/Y`, `Ctrl+D`, `Delete`, arrow-key nudging (1px / 10px with Shift), `Ctrl+S`
- Grid overlay, rulers, snap-to-grid, fit-to-screen, zoom controls

### Text

- Inline editing with font family (Google Fonts), size, weight, style, alignment
- Letter spacing, line height, text outline, per-layer shadow
- 12 blend modes

### Shapes

- Rectangle, rounded rect, circle, ellipse, line, arrow, triangle, star, polygon, pentagon, hexagon, octagon, diamond, heart, cross
- Fill, stroke, opacity, corner radius, shadow

### Image Editing (local, no upload needed)

- Brightness, contrast, saturation, blur, exposure, sharpness, gamma, temperature
- Grayscale, sepia, flip horizontal/vertical
- Vignette, pixelate, noise effects
- White-background removal via threshold (Canvas API, fully offline)
- Crop, corner radius, border, drop shadow, blend modes

### Cloudinary AI Features *(optional — see setup)*

- AI background removal, image enhancement, upscaling
- Generative fill, generative object removal
- 21 art filters: Hokusai, Aurora, Daguerre, Zorro, Peacock, and more
- Color adjustments: vibrance, fill light, vignette, tint
- Format conversion (WebP, AVIF, PNG, JPG) with quality control
- Responsive srcset generation
- Client-side compression before upload (capped at 4000×4000 to stay under Cloudinary's 25MP limit)

All Cloudinary transformations work by constructing a delivery URL in the browser — no backend, no proxy, just a URL that Cloudinary renders.

### Export

- PNG, JPG, WebP
- 1×, 2×, or 3× resolution via Konva stage export

### Projects and Templates

- Projects auto-saved to IndexedDB, persist across page refreshes
- Projects page: browse, rename, duplicate, delete
- Pre-built templates for social media, presentations, and marketing

---

## How Kiro Was Used

Kiro was the primary development environment for this project. The entire build — architecture, implementation, debugging, and test planning — happened inside Kiro's chat interface.

**Architecture and scaffolding**
Kiro designed the initial folder structure (`stores/`, `services/`, `editor/`, `pages/`), the Zustand store shape, and the TypeScript type hierarchy. The data model for layers, projects, adjustments, and effects was worked out collaboratively before a single component was written.

**Cloudinary service layer**
`cloudinaryService.ts` covers 12 transformation categories — smart crop, effects, generative AI, watermarking, optimization, format conversion, pixelation, borders, rotation, and more. It was written iteratively with Kiro. The key constraint — keeping everything browser-safe with unsigned uploads and no API secret in frontend code — was a design decision Kiro flagged and enforced throughout.

**Editor implementation**
The Canvas component (React-Konva), Properties panel, Layers panel, and CloudinaryPanel were all built with Kiro. Each panel went through multiple rounds of review and refinement in conversation before being finalized.

**Debugging**
When undo/redo wasn't correctly restoring layer state, Kiro traced the issue to `pushHistory` — layer objects were being added by reference rather than deep-cloned, so all history entries pointed at the same mutable data. The fix (`JSON.parse(JSON.stringify(layers))`) came directly from that diagnosis.

**Practical product decisions**
Kiro flagged that `URL.createObjectURL` references are lost on page refresh, which led to the IndexedDB-backed persistence model. It also caught the Cloudinary 25MP limit early, which is why `browser-image-compression` runs before every upload.

---

## How Kane CLI Was Used

Kane is a browser automation tool for testing real user workflows — not unit tests, but end-to-end flows the way an actual user runs them. Kane was pointed at `http://localhost:5173` and run against the flows defined in [`KANE_FLOWS.md`](./KANE_FLOWS.md).

| Flow | What was tested |
|---|---|
| Flow 1 | Create a design → add image → add text → export PNG |
| Flow 2 | Upload image → AI background removal (with and without Cloudinary) |
| Flow 3 | Layer management: visibility, locking, reordering, duplication, deletion |
| Flow 4 | Image adjustments: brightness, contrast, saturation, grayscale, reset |
| Flow 5 | Load template → edit text + color → save → reopen from Projects |
| Flow 6 | Keyboard shortcuts: undo, redo, arrow nudge, Ctrl+D, Delete, Ctrl+S |
| Flow 7 | Canvas controls: zoom, fit to screen, grid, rulers, snap, project rename |

Kane caught real behavioral issues — not rendering glitches, but logic bugs:

- The export dialog was not reflecting the format selected by the user
- The canvas was not re-rendering after adjustment values were reset to zero
- IndexedDB writes were completing asynchronously after navigation, causing stale project reads when reopening

All three were fixed before the final version. Evidence snapshots from Kane runs are in `.testmuai/evidence/`.

---

## Cloudinary Integration

Gratis uses Cloudinary for uploads and delivery-URL transformations. Both are optional — the editor works fully offline without any Cloudinary config.

**Uploads**
When `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_UPLOAD_PRESET` are set, images upload directly from the browser to Cloudinary using an unsigned upload preset. There is no backend involved. Client-side compression via `browser-image-compression` runs before the upload to ensure images stay under Cloudinary's 25MP transformation limit.

**AI transformations**
Every AI feature — background removal, enhancement, upscaling, generative fill, art filters, color adjustments, optimization — works by building a Cloudinary delivery URL in the browser:

```
https://res.cloudinary.com/<cloud>/image/upload/e_background_removal/<public_id>
https://res.cloudinary.com/<cloud>/image/upload/e_art:hokusai/<public_id>
https://res.cloudinary.com/<cloud>/image/upload/e_upscale/<public_id>
```

The browser requests the URL, Cloudinary applies the transformation server-side and returns the result. No proxy, no backend, no secret.

> ⚠️ Use an **unsigned** upload preset. Never put `CLOUDINARY_API_SECRET` in a frontend env variable.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript 5.6 |
| Build | Vite 5 + SWC |
| Styling | Tailwind CSS 3 + Radix UI primitives |
| State management | Zustand 5 with `subscribeWithSelector` |
| Canvas | Konva + react-konva |
| Cloud & AI | Cloudinary (unsigned upload + URL transformations) |
| Local storage | IndexedDB via `idb` |
| Image processing | Canvas API, `browser-image-compression` |
| Routing | React Router v6 |
| Animation | Framer Motion |
| Icons | Lucide React |
| Linting | oxlint |

---

## Setup and Installation

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
git clone https://github.com/Joystonm/Gratis.git
cd Gratis
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Enable Cloudinary AI features (optional)

Gratis works without Cloudinary. To unlock AI background removal, art filters, enhancement, upscaling, and generative fill:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_preset
```

To create an unsigned preset: Cloudinary Dashboard → Settings → Upload → Upload presets → Add preset → Set signing mode to **Unsigned**.

### Available scripts

```bash
npm run dev       # Development server at localhost:5173
npm run build     # Type-check + production build
npm run preview   # Preview the production build locally
npm run lint      # Run oxlint
```

---

## Running the Tests

End-to-end verification flows are defined in [`KANE_FLOWS.md`](./KANE_FLOWS.md). To run them with Kane CLI:

```bash
# Start the dev server first
npm run dev

# In a separate terminal, run Kane against localhost:5173
# (refer to Kane CLI docs for the exact invocation)
```

Seven flows cover the full user journey: creating a design, uploading images, using AI tools, managing layers, testing keyboard shortcuts, loading templates, and canvas controls. See `KANE_FLOWS.md` for step-by-step instructions and expected outcomes for each flow.

---

## Demo Walkthrough

The fastest way to see everything working end-to-end:

1. Open `http://localhost:5173`
2. Click **Start Creating Free** → select **Instagram Post (1080×1080)**
3. Open **Shapes** → add a rectangle → change its fill color in the Properties panel
4. Open **Text** → click **Add a heading** → double-click the text on canvas → type something
5. Open **Uploads** → drag in any image → it lands centered on the canvas
6. Select the image layer → open **Properties** → adjust brightness and contrast
7. Press `Ctrl+S` → see the save toast
8. Click **Export** → choose PNG at 2× → download

With Cloudinary configured, after uploading an image:

9. Open **AI Tools** → click **Remove Background**
10. Open **Image Tools** → **Filters** tab → click any art filter (Hokusai or Aurora are good ones to try)

---

## Project Structure

```
src/
├── components/ui/          # Shared primitives: Button, Modal, Slider, ColorPicker, Toast
├── data/                   # Templates, font list, canvas presets
├── editor/
│   ├── Canvas.tsx          # Konva stage: layer rendering, selection, drag, resize
│   ├── Sidebar.tsx         # Left panel: uploads, text, shapes, AI tools, background
│   ├── CloudinaryPanel.tsx # Image Tools: Filters, Adjust, Optimize tabs
│   ├── PropertiesPanel.tsx # Right panel: per-layer properties and adjustments
│   ├── LayersPanel.tsx     # Layer list with reorder, visibility toggle, lock
│   ├── EditorTopBar.tsx    # Zoom, grid/rulers/snap, save, export
│   └── ExportDialog.tsx    # Format and scale selection, download trigger
├── pages/                  # Landing, Editor, Projects, Templates, Assets, Settings
├── services/
│   ├── cloudinary/         # Upload + all URL-transformation builders (12 categories)
│   ├── image/              # Local processing: filters, canvas resize, flip, bg removal
│   └── storage/            # IndexedDB read/write via idb
├── stores/                 # Zustand stores: editorStore, projectStore, toastStore
├── types/                  # Core types: Layer, Project, Adjustments, Effects, etc.
└── utils/                  # generateId, cn (class merge), helpers
```

---

## Future Scope

Features worth building next, not promises:

- **Collaborative editing** — real-time multi-user canvas via WebSockets
- **Cloud project sync** — optional backend to sync projects across devices
- **Freehand drawing** — brush tool with pressure simulation
- **SVG import** — bring in vector assets directly to the canvas
- **Typography system** — global text styles applied across a project
- **Video still extraction** — pull a frame from a video and drop it onto the canvas
- **Plugin API** — third-party panels that hook into the editor store

---

## License

MIT

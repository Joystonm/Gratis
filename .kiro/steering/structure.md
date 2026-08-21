# Structure

## Folder Map

```
src/
├── components/ui/          # Shared primitives: Button, Modal, Slider, ColorPicker, Toast
├── data/                   # Static data: templates, font list, canvas presets
├── editor/                 # All editor UI components (see below)
├── pages/                  # Route-level pages: Landing, Editor, Projects, Templates, Assets, Settings
├── services/               # Pure business logic (no React, no side effects)
│   ├── cloudinary/         # Upload + URL-transformation builders (12 categories)
│   ├── image/              # Local processing: filters, resize, flip, bg removal
│   └── storage/            # IndexedDB read/write via idb
├── stores/                 # Zustand stores: editorStore, projectStore, toastStore
├── types/                  # Core TypeScript types: Layer, Project, Adjustments, Effects
├── utils/                  # generateId, cn (class merge), misc helpers
├── assets/                 # Static assets (fonts, images bundled with app)
├── App.tsx                 # Router + route definitions
├── main.tsx                # React entry point
└── index.css               # Tailwind base + global CSS
```

## Editor Directory

```
src/editor/
├── Canvas.tsx              # Konva stage: layer rendering, selection, drag, resize, transform
├── Sidebar.tsx             # Left content panel: uploads, text, shapes, AI tools, background
├── CloudinaryPanel.tsx     # Image Tools panel: Filters / Adjust / Optimize tabs
├── PropertiesPanel.tsx     # Right panel: per-layer properties and local adjustments
├── LayersPanel.tsx         # Layer list: reorder, visibility toggle, lock, duplicate, delete
├── LeftToolbar.tsx         # Narrow icon toolbar: tool selector + panel launchers
├── EditorTopBar.tsx        # Top bar: zoom, grid/rulers/snap toggles, save, export
└── ExportDialog.tsx        # Export modal: format + scale selection, download trigger
```

## Architectural Boundaries

- **`pages/`** — routing and layout only. No business logic.
- **`editor/`** — UI components for the canvas editor. Read from stores, dispatch to stores.
- **`stores/`** — all editor and project state. Single source of truth.
- **`services/`** — pure functions. No React hooks, no direct store access.
- **`components/ui/`** — dumb, reusable primitives. No store dependencies.
- **`types/`** — type definitions only. No runtime code.

## Key Constraints

- New pages require a route in `src/App.tsx`
- Business logic goes in `services/` or `stores/`, not inside components
- Cloudinary URL builders live in `src/services/cloudinary/` — do not inline them in components
- All new Zustand state for the editor goes in `editorStore`, not ad-hoc component state

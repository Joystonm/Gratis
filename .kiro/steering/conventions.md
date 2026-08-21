# Conventions

## Layer System

Every canvas element is a `Layer` with:
- `type`: `'image' | 'text' | 'shape' | 'background'`
- `id`, `visible`, `locked`, `x`, `y`, `width`, `height`, `rotation`, `opacity`
- Layer order in the array = render order (last = top of canvas)

## Undo / Redo

History entries must be deep-cloned — never store references.

```ts
// Correct
pushHistory(JSON.parse(JSON.stringify(layers)))

// Wrong — all entries point at the same mutable object
pushHistory(layers)
```

Max history depth: 50 steps.

## Toolbar Panels

`LeftToolbar` maps icon buttons to sidebar panels. Panel IDs are the `SidebarPanel` union type in `editorStore`.

- Adding a panel requires an entry in both `LeftToolbar.tsx` (icon + id) and the panel map in `Sidebar.tsx` (content)
- Do not add duplicate panels — the `elements` entry was removed because it rendered the same `<ShapesPanel />` as `shapes`

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Z` | Undo |
| `Ctrl+Y` | Redo |
| `Ctrl+D` | Duplicate selected layer |
| `Delete` | Delete selected layer |
| `Ctrl+S` | Save project |
| Arrow keys | Nudge 1px |
| `Shift+Arrow` | Nudge 10px |

## Cloudinary Security

- Never put `CLOUDINARY_API_SECRET` in any `.env` file or frontend code
- Always use an unsigned upload preset
- Compress images to ≤ 4000×4000 before upload (25MP Cloudinary limit)

## Export

Konva stage `toDataURL` at 1×, 2×, or 3× pixel ratio. Formats: PNG, JPG, WebP.

## Git

- Do not commit `.env` (already in `.gitignore`)
- PR titles follow conventional commits: `feat:`, `fix:`, `chore:`, `docs:`

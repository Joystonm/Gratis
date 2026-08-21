# Tech Stack

## Framework and Build

- **React 18** + **TypeScript 5.6** (strict mode)
- **Vite 5** + SWC for fast builds
- **React Router v6** for routing

## Styling

- **Tailwind CSS 3** — utility-first, config in `tailwind.config.js`
- **Radix UI** primitives for accessible components
- **Framer Motion** for animation
- **Lucide React** for icons (only icon library — do not add others)

## State Management

- **Zustand 5** with `subscribeWithSelector` middleware
- Stores: `editorStore`, `projectStore`, `toastStore` — all in `src/stores/`
- Components read from stores. No prop-drilling for editor state.

## Canvas

- **Konva** + **react-konva** for the canvas layer
- Export via Konva stage's `toDataURL` at 1×/2×/3× pixel ratio

## Storage and Persistence

- **IndexedDB** via `idb` — the only persistence layer
- Do not use `localStorage`, `sessionStorage`, or `URL.createObjectURL` for persistence
- `URL.createObjectURL` refs are lost on page refresh

## Image Processing

- **Canvas API** — local filters, flip, bg removal (offline, no upload)
- **browser-image-compression** — compress before Cloudinary upload (cap: 4000×4000 / 25MP)

## Cloud and AI

- **Cloudinary** — unsigned uploads + delivery URL transformations only
- No backend. No API secret in frontend code.
- Env vars: `VITE_CLOUDINARY_CLOUD_NAME`, `VITE_CLOUDINARY_UPLOAD_PRESET`
- Both optional — app works fully offline without them

## Linting

- **oxlint** — run with `npm run lint`

## Dev Commands

```bash
npm run dev       # Dev server at localhost:5173
npm run build     # Type-check + production build
npm run preview   # Preview production build
npm run lint      # Run oxlint
```

## Coding Rules

- No `any` types — use `unknown` and narrow
- Prefer `const` over `let`
- All components need explicit TypeScript props interfaces
- Use `cn()` from `src/utils` for class merging
- `generateId()` from `src/utils` for new IDs — never `Math.random()` or `Date.now()`

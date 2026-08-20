# Gratis Design System
## Internal Design Analysis & Implementation Guide

---

## 1. Design Language

Gratis adapts the Cursor design reference into a premium creative-tools identity.

**Voice:** Quietly confident, editorial, creative — professional without being corporate.
**Feel:** "A serious tool that respects your creativity."

### Core Principles (inherited + adapted)
- Warm cream canvas (`#f5f4f0`) as base floor — not white, not gray. Warm.
- Warm near-black ink (`#1a1917`) for all display/body text.
- **Single brand accent: Gratis Violet** (`#6c47ff`) — replaces Cursor Orange. Violet/indigo signals creativity and premium positioning.
- Hairline-only depth. No drop shadows anywhere. 1px borders carry elevation.
- 400-weight display type with negative letter-spacing — editorial magazine voice.
- 80px section rhythm, 4px base grid unit.

---

## 2. Color System

```
Brand Accent:    #6c47ff  (Gratis Violet — CTAs, selection highlights, brand)
Accent Active:   #5534e0  (pressed/active state)
Accent Subtle:   #f0ecff  (light tint for selected states, badges)

Canvas:          #f5f4f0  (warm cream page floor)
Canvas Soft:     #f9f8f5  (editor workspace background)
Surface Card:    #ffffff  (card surfaces, panels)
Surface Strong:  #e8e7e1  (badge backgrounds, dividers)

Ink:             #1a1917  (display + headline text)
Body:            #55534e  (default running text)
Muted:           #7e7b72  (subtitles, metadata)
Muted Soft:      #a09c92  (disabled text)

Hairline:        #e2e1db  (1px dividers)
Hairline Soft:   #eceae4  (lighter dividers)
Hairline Strong: #cbc9c0  (panel outlines)

On Accent:       #ffffff
Semantic Error:  #cf2d56
Semantic Success: #1f8a65
Semantic Warning: #b87c0a

Editor Dark:     #1c1b18  (editor chrome background — dark mode for editor only)
Editor Panel:    #242320  (left/right panels in dark editor)
Editor Surface:  #2e2c28  (elevated panels in dark editor)
Editor Border:   #3a3835  (borders in dark editor)
Editor Text:     #e8e7e2  (primary text in dark editor)
Editor Muted:    #7e7b72  (secondary text in dark editor)
```

### Adaptation Notes
- Cursor Orange (#f54e00) → Gratis Violet (#6c47ff)
- The violet signals creativity, premium positioning, and visual design tools
- All CTA hierarchy rules remain: accent is used scarcely
- Editor uses its own dark-mode palette for the canvas environment

---

## 3. Typography

**Primary font:** Inter (Google Fonts, open-source substitute for CursorGothic)
**Monospace:** JetBrains Mono (code surfaces, dimension inputs, numeric values)

```
Display Hero:    Inter 64px / 400 / -1.8px tracking / lh 1.08
Display Large:   Inter 40px / 400 / -0.8px tracking / lh 1.15
Display Medium:  Inter 28px / 400 / -0.35px tracking / lh 1.2
Display Small:   Inter 22px / 400 / -0.15px tracking / lh 1.25

Title Large:     Inter 18px / 600 / 0 / lh 1.4
Title Medium:    Inter 16px / 600 / 0 / lh 1.4
Title Small:     Inter 14px / 600 / 0 / lh 1.4

Body Large:      Inter 16px / 400 / 0 / lh 1.55
Body Medium:     Inter 14px / 400 / 0 / lh 1.5
Body Small:      Inter 13px / 400 / 0 / lh 1.45

Caption:         Inter 12px / 400 / 0 / lh 1.4
Caption Upper:   Inter 11px / 600 / 0.8px / lh 1.4 / UPPERCASE

Button:          Inter 14px / 500 / 0 / lh 1
Nav:             Inter 14px / 500 / 0 / lh 1.4
```

---

## 4. Layout System

```
Base unit:       4px
Section pad:     80px vertical
Content max-w:   1280px
Editor sidebar:  240px (left), 280px (right)
Editor topbar:   56px
Status bar:      28px

Spacing scale:
  xxs: 4px
  xs:  8px
  sm:  12px
  base: 16px
  md:  20px
  lg:  24px
  xl:  32px
  xxl: 48px
  section: 80px
```

### Grid
- Landing: 12-column editorial grid, max 1280px
- Feature sections: 2-up (split) and 3-up (cards)
- Editor: Fixed-layout with sidebar + canvas + panel

---

## 5. Border Radius

```
none:  0px
xs:    3px   (inline tags, small chips)
sm:    6px   (compact rows)
md:    8px   (buttons, inputs, toolbars)
lg:    12px  (cards, panels, modals)
xl:    16px  (large feature cards — rare)
pill:  9999px (badge pills)
full:  9999px (avatars)
```

---

## 6. Elevation / Depth

**No drop shadows.** The system uses hairline borders only.

```
Floor (canvas)     #f5f4f0           Page background
Card               #ffffff + 1px hairline    Content cards
Panel (light)      #ffffff + 1px hairline    Properties panel
Panel (dark)       #242320 + 1px #3a3835     Editor panels
Active/Selected    accent subtle + accent border  Selection state
```

---

## 7. Component Inventory

### Navigation
- `TopNav` — Logo + nav links + CTAs (light, cream bg, 64px height)
- `EditorTopBar` — Logo + project name + actions (dark, 56px height)

### Buttons
- `ButtonPrimary` — Violet fill, white text, 8px radius, 40px height
- `ButtonSecondary` — White fill, ink border/text, 8px radius, 40px height  
- `ButtonGhost` — Transparent, ink text (hover: subtle bg)
- `ButtonDanger` — Error color fill
- `IconButton` — Square button with icon only, tooltip

### Forms
- `TextInput` — White bg, hairline border, 8px radius, 44px height
- `Slider` — Custom range with accent-colored thumb/track
- `ColorPicker` — Swatch + hex input + alpha
- `Select` / `Dropdown` — White bg, chevron, 8px radius
- `Toggle` / `Switch` — Accent on active state
- `Checkbox` / `Radio` — Accent on checked

### Feedback
- `Toast` — Bottom-right stacked, 4 variants (success, error, warning, info)
- `Dialog` / `Modal` — Centered overlay, 12px radius, backdrop blur
- `Tooltip` — Dark bg, 4px radius, arrow, 260ms delay

### Editor-specific
- `LayerItem` — Drag handle + icon + name + visibility/lock
- `PropertySection` — Collapsible section with title
- `PropertySlider` — Label + slider + numeric input
- `CanvasRuler` — Horizontal/vertical rulers
- `SelectionBox` — 8 resize handles + rotation handle
- `ContextMenu` — Right-click canvas menu
- `ZoomControl` — Zoom in/out + fit + percentage display
- `ColorSwatch` — Fill/stroke color indicator

### Cards
- `ProjectCard` — Thumbnail + title + metadata + actions
- `TemplateCard` — Preview + name + category badge
- `AssetCard` — Image thumbnail + name + hover actions
- `AIActionCard` — Icon + title + description + CTA

### Panels
- `LeftToolbar` — Vertical icon toolbar with tooltips
- `LeftSidebar` — Expandable panel for layers/assets/templates
- `RightPanel` — Context-sensitive properties panel

---

## 8. Editor UX

### Layout Structure
```
┌─────────────────────────────────────────────────────┐
│  TOP BAR (56px dark)                                │
│  Logo | Project Name | Undo/Redo | Zoom | Preview | Save | Export │
├──────┬──────────────────────────────────┬───────────┤
│ LEFT │                                  │  RIGHT    │
│ TOOL │         CANVAS WORKSPACE         │  PROPS    │
│ BAR  │         (dark bg #1c1b18)        │  PANEL    │
│ 48px │                                  │  280px    │
│      │                                  │           │
├──────┴──────────────────────────────────┴───────────┤
│  STATUS BAR (28px)  Zoom | Canvas size | Selection  │
└─────────────────────────────────────────────────────┘
```

### Left Sidebar (toggleable, 240px)
Opens from left toolbar buttons. Contains:
- Layers panel
- Templates browser
- Image library
- Uploads
- Text presets
- Shapes gallery
- AI Tools

### Selection & Interaction
- Bounding box with 8 resize handles (corners + midpoints) + rotation handle (top)
- Snap guides: center, edges, alignment to other objects
- Keyboard: Arrow to nudge 1px, Shift+Arrow to nudge 10px
- Right-click: context menu

### Canvas Workspace
- Dark environment (#1c1b18 background, canvas appears as white/custom bg)
- Checkered pattern for transparent areas
- Rulers on top and left edges
- Grid + guides toggleable
- Zoom: scroll wheel, Ctrl+/-, fit to screen

---

## 9. Responsive Strategy

- **Desktop-first.** Editor is a desktop experience.
- Landing page: responsive at all breakpoints
- Editor: minimum 1024px width; below that, show "Open on desktop" message for editor routes
- `< 640px`: Mobile landing page simplified; editor shows upgrade prompt
- `640-1024px`: Tablet landing page; editor in read-only/preview mode  
- `> 1024px`: Full editor experience

---

## 10. Animation Principles

- Prefer CSS transitions over JS animations where possible
- Duration: 150ms for microinteractions, 250ms for panel transitions, 350ms for modals
- Easing: `cubic-bezier(0.16, 1, 0.3, 1)` for entrances, `ease-in` for exits
- No gratuitous animations; motion serves function
- Canvas operations: immediate, no delay
- Respect `prefers-reduced-motion`

---

## 11. Gratis Brand Identity Elements

- **Logotype:** "Gratis" in Inter 600, with a small violet spark/star glyph
- **Tagline:** "Premium creative tools. Zero paywall."
- **Accent usage:** Violet on CTAs, active states, selection handles, progress indicators
- **Empty states:** Illustrated with simple line art + encouraging copy
- **Loading states:** Skeleton screens (not spinners) for content; subtle pulse animation

---

## 12. Key Design Decisions vs. Cursor Reference

| Cursor Reference | Gratis Adaptation |
|---|---|
| Cursor Orange (#f54e00) | Gratis Violet (#6c47ff) |
| CursorGothic font | Inter (open-source) |
| Dark IDE mockup as hero visual | Editor canvas preview with design content |
| Marketing/info product | Creative tool product |
| Single page application focus | Multi-screen application with deep editor |
| Timeline pastels for AI stages | Used for layer type indicators |
| Light canvas only | Dual: light landing + dark editor environment |
| Code surfaces with JetBrains Mono | Numeric inputs and dimension fields only |

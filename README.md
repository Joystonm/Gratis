<div align="center">

# Gratis

**Premium creative tools. Zero paywall.**

Gratis is an AI-powered image design and editing platform — one place for professional image creation, editing, transformation, and export.

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

## Overview

Creating a professional image usually means juggling multiple tools one for design, another for editing, another for background removal, another for AI transformations. And the most useful features are almost always behind a paywall.

Gratis brings the entire workflow into a single editor, built around one idea:

> **Powerful creative tools should be accessible without constantly running into paywalls.**

---

## Features

- 🎨 **Design editor** — canvas-based layout with layers, shapes, and text
- 🖼️ **Image editing** — adjustments, filters, effects, crop, flip, and more
- ✂️ **Background removal** — AI-powered via Cloudinary
- 🤖 **AI transformations** — generative fill, object removal, upscaling, enhancement
- 🎭 **Art filters** — 20+ one-click artistic styles
- 📦 **Export** — PNG, JPG, WebP at 1×, 2×, 3× scale
- 💾 **Offline-first** — all projects stored locally via IndexedDB, no account required
- ☁️ **Cloud-optional** — Cloudinary integration unlocks AI features when configured

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React 18 + TypeScript |
| Build | Vite |
| Styling | Tailwind CSS |
| State | Zustand |
| Canvas | Konva / react-konva |
| Cloud & AI | Cloudinary |
| Storage | IndexedDB (idb) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

```bash
# Clone the repository
git clone https://github.com/Joystonm/Gratis.git
cd gratis

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Type-check and build for production
npm run preview   # Preview the production build locally
npm run lint      # Run oxlint
```

---

## Environment Variables

Gratis works fully offline out of the box. Cloudinary is optional — it unlocks AI-powered features like background removal, generative fill, upscaling, and art filters.

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in your values:

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_unsigned_upload_preset
```

> ⚠️ Use an **unsigned** upload preset only. Never put your Cloudinary API Secret in a frontend environment variable.

To create an unsigned preset: Cloudinary Dashboard → Settings → Upload → Upload presets → Add preset → Set signing mode to **Unsigned**.

---

## Project Structure

```
src/
├── components/       # Shared UI components
├── data/             # Static data — fonts, presets, templates
├── editor/           # Editor panels — Canvas, Sidebar, Toolbar, Properties
├── pages/            # Route-level pages
├── services/
│   ├── cloudinary/   # Cloudinary integration & URL builders
│   ├── image/        # Local image processing
│   └── storage/      # IndexedDB persistence
├── stores/           # Zustand state — editor, projects, toasts
├── types/            # Shared TypeScript types
└── utils/            # Utility functions
```

---

## Kane Verification

Kane was used throughout development to verify that Gratis actually works — not just that it looks like it works.

Rather than relying solely on manual testing, Kane ran structured workflow tests against Gratis to catch real issues: broken state transitions, export failures, editor interactions that didn't behave as expected. That verification process is documented in [`KANE_FLOWS.md`](./KANE_FLOWS.md).

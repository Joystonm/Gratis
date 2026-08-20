import { useRef, useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import {
  X, Upload, Image as ImageIcon, Type, Shapes, Wand2, Grid,
  Sparkles, Plus, Search, Palette, Blend, RefreshCcw, FlipHorizontal2,
  FlipVertical2, Contrast, Sun, Droplets, Focus, Eraser, Paintbrush2
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { useProjectStore } from '@/stores/projectStore'
import { LayersPanel } from './LayersPanel'
import { CloudinaryPanel } from './CloudinaryPanel'
import type { ImageLayer, TextLayer, ShapeLayer, ShapeType, Project, Layer, BackgroundLayer, BackgroundFill } from '@/types'
import { generateId } from '@/utils'
import { TEMPLATES } from '@/data/templates'
import { FONTS, loadGoogleFont } from '@/data/fonts'
import { uploadToCloudinary, getCloudinaryConfig } from '@/services/cloudinary/cloudinaryService'
import { toastSuccess, toastError, toastInfo } from '@/stores/toastStore'
import { cn } from '@/utils'
import { Button } from '@/components/ui/Button'
import { defaultAdjustments, defaultEffects, defaultShadow, defaultTextStyle } from '@/types'

// ============================================================
// Uploads / Images panel
// ============================================================

function UploadsPanel() {
  const { project, addLayer } = useEditorStore()
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [recentUploads, setRecentUploads] = useState<Array<{ src: string; name: string; w: number; h: number }>>([])

  const onDrop = useCallback(async (files: File[]) => {
    const file = files[0]
    if (!file || !project) return

    setUploading(true)
    setUploadProgress(0)

    // Try Cloudinary first, fall back to object URL
    let src: string
    let cloudinaryPublicId: string | undefined

    const cloudinaryConfig = getCloudinaryConfig()

    try {
      if (cloudinaryConfig.isConfigured) {
        toastInfo('Uploading…')
        const result = await uploadToCloudinary(file, setUploadProgress)
        src = result.secureUrl
        cloudinaryPublicId = result.publicId
        toastSuccess('Upload complete')
      } else {
        src = URL.createObjectURL(file)
        toastInfo('Image added', 'Using local storage')
      }

      // Get image dimensions
      const imgEl = new Image()
      imgEl.src = src
      await new Promise(r => { imgEl.onload = r })

      const maxDim = Math.min(project.width * 0.8, project.height * 0.8, 600)
      const ratio = Math.min(maxDim / imgEl.naturalWidth, maxDim / imgEl.naturalHeight, 1)
      const w = Math.round(imgEl.naturalWidth * ratio)
      const h = Math.round(imgEl.naturalHeight * ratio)

      const layer: ImageLayer = {
        id: generateId(),
        type: 'image',
        name: file.name.replace(/\.[^.]+$/, ''),
        x: Math.round((project.width - w) / 2),
        y: Math.round((project.height - h) / 2),
        width: w,
        height: h,
        rotation: 0,
        opacity: 100,
        visible: true,
        locked: false,
        blendMode: 'normal',
        scaleX: 1,
        scaleY: 1,
        src,
        originalSrc: src,
        cloudinaryPublicId,
        flipX: false,
        flipY: false,
        crop: null,
        cornerRadius: 0,
        border: null,
        adjustments: { ...defaultAdjustments },
        effects: { ...defaultEffects },
        shadow: { ...defaultShadow },
        backgroundRemoved: false,
      }

      addLayer(layer)
      setRecentUploads(prev => [{ src, name: file.name, w, h }, ...prev].slice(0, 12))
    } catch (err) {
      toastError('Upload failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }, [project, addLayer])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxFiles: 1,
    disabled: uploading,
  })

  function addFromRecent(item: { src: string; name: string; w: number; h: number }) {
    if (!project) return
    const layer: ImageLayer = {
      id: generateId(),
      type: 'image',
      name: item.name,
      x: Math.round((project.width - item.w) / 2),
      y: Math.round((project.height - item.h) / 2),
      width: item.w,
      height: item.h,
      rotation: 0, opacity: 100, visible: true, locked: false,
      blendMode: 'normal', scaleX: 1, scaleY: 1,
      src: item.src,
      originalSrc: item.src,
      flipX: false, flipY: false, crop: null, cornerRadius: 0, border: null,
      adjustments: { ...defaultAdjustments },
      effects: { ...defaultEffects },
      shadow: { ...defaultShadow },
      backgroundRemoved: false,
    }
    addLayer(layer)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-editor-border">
        <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-3">Upload Image</div>
        <div
          {...getRootProps()}
          className={cn(
            'flex flex-col items-center justify-center gap-2 p-4 rounded-lg border-2 border-dashed cursor-pointer transition-colors',
            isDragActive ? 'border-accent bg-accent/10' : 'border-editor-border hover:border-accent/40',
            uploading && 'pointer-events-none opacity-60'
          )}
        >
          <input {...getInputProps()} />
          <Upload className="w-6 h-6 text-editor-muted" />
          <div className="text-center">
            <p className="text-xs font-medium text-editor-text">
              {uploading ? `Uploading… ${uploadProgress}%` : isDragActive ? 'Drop here' : 'Drop image or click'}
            </p>
            <p className="text-xs text-editor-muted mt-0.5">PNG, JPG, WebP, GIF</p>
          </div>
        </div>
        {uploading && (
          <div className="mt-2 h-1 bg-editor-surface rounded-full overflow-hidden">
            <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${uploadProgress}%` }} />
          </div>
        )}
      </div>

      {recentUploads.length > 0 && (
        <div className="p-3 flex-1 overflow-y-auto">
          <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-2">Recent</div>
          <div className="grid grid-cols-2 gap-2">
            {recentUploads.map((item, i) => (
              <button
                key={i}
                onClick={() => addFromRecent(item)}
                className="group relative aspect-square rounded-md overflow-hidden border border-editor-border hover:border-accent/40 transition-all"
              >
                <img src={item.src} alt={item.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                  <Plus className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {recentUploads.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <div>
            <ImageIcon className="w-8 h-8 text-editor-muted/40 mx-auto mb-2" />
            <p className="text-xs text-editor-muted">Upload images to add them to your design</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Text panel
// ============================================================

const FONT_CATEGORIES_SIDEBAR = ['All', 'Sans-serif', 'Serif', 'Display', 'Handwriting', 'Monospace']

function TextPanel() {
  const { project, addLayer } = useEditorStore()
  const [fontCategory, setFontCategory] = useState('All')
  const [fontSearch, setFontSearch] = useState('')

  const filteredFonts = FONTS.filter(f => {
    const matchCat = fontCategory === 'All' || f.category === fontCategory
    const matchSearch = f.name.toLowerCase().includes(fontSearch.toLowerCase())
    return matchCat && matchSearch
  })

  const textPresets = [
    { label: 'Heading', size: 48, weight: 700, font: 'Montserrat' },
    { label: 'Subheading', size: 28, weight: 600, font: 'Inter' },
    { label: 'Body text', size: 16, weight: 400, font: 'Inter' },
    { label: 'Small caption', size: 12, weight: 400, font: 'Inter' },
    { label: 'Bold title', size: 56, weight: 800, font: 'Bebas Neue' },
    { label: 'Script accent', size: 36, weight: 400, font: 'Dancing Script' },
    { label: 'Mono label', size: 14, weight: 500, font: 'JetBrains Mono' },
  ]

  function addText(size: number, weight: number, fontFamily: string, sample: string) {
    if (!project) return
    loadGoogleFont(fontFamily, [weight])
    const layer: TextLayer = {
      id: generateId(),
      type: 'text',
      name: sample,
      x: Math.round(project.width * 0.1),
      y: Math.round(project.height * 0.4),
      width: Math.round(project.width * 0.8),
      height: size * 3,
      rotation: 0, opacity: 100, visible: true, locked: false,
      blendMode: 'normal', scaleX: 1, scaleY: 1,
      text: sample,
      style: {
        ...defaultTextStyle,
        fontSize: size,
        fontWeight: weight as TextLayer['style']['fontWeight'],
        fontFamily,
        color: '#1a1917',
      },
    }
    addLayer(layer)
  }

  function addFontSample(font: typeof FONTS[0]) {
    if (!project) return
    const weight = font.weights.includes(700) ? 700 : font.weights[0]
    loadGoogleFont(font.family, font.weights)
    addText(32, weight, font.family, font.name)
  }

  return (
    <div className="flex flex-col h-full">
      {/* Quick presets */}
      <div className="p-3 border-b border-editor-border">
        <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-2">Quick Add</div>
        <div className="flex flex-col gap-1.5">
          {textPresets.map(preset => (
            <button
              key={preset.label}
              onClick={() => addText(preset.size, preset.weight, preset.font, preset.label)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg border border-editor-border hover:border-accent/40 hover:bg-editor-surface transition-all text-left"
            >
              <Type className="w-3.5 h-3.5 text-editor-muted shrink-0" />
              <span style={{ fontSize: Math.min(preset.size * 0.32, 15), fontWeight: preset.weight, fontFamily: preset.font }} className="text-editor-text truncate">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Font browser */}
      <div className="p-3 border-b border-editor-border">
        <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-2">Browse Fonts</div>
        <div className="relative mb-2">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-editor-muted" />
          <input
            type="text"
            placeholder="Search fonts…"
            value={fontSearch}
            onChange={e => setFontSearch(e.target.value)}
            className="w-full pl-6 pr-2 py-1.5 text-xs bg-editor-surface text-editor-text border border-editor-border rounded-md focus:outline-none focus:border-accent/60"
          />
        </div>
        <div className="flex flex-wrap gap-1 mb-1">
          {FONT_CATEGORIES_SIDEBAR.map(cat => (
            <button
              key={cat}
              onClick={() => setFontCategory(cat)}
              className={cn(
                'px-2 py-0.5 text-xs rounded-full border transition-all',
                fontCategory === cat
                  ? 'bg-accent text-white border-accent'
                  : 'border-editor-border text-editor-muted hover:text-editor-text'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        {filteredFonts.map(font => (
          <button
            key={font.name}
            onClick={() => addFontSample(font)}
            onMouseEnter={() => loadGoogleFont(font.family, font.weights)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-transparent hover:border-accent/30 hover:bg-editor-surface transition-all text-left group"
          >
            <div className="flex-1 min-w-0">
              <span
                className="text-editor-text truncate block"
                style={{ fontFamily: font.family, fontSize: 16 }}
              >
                {font.name}
              </span>
              <span className="text-xs text-editor-muted">{font.category} · {font.weights.length} weights</span>
            </div>
            <Plus className="w-3.5 h-3.5 text-editor-muted opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Shapes panel
// ============================================================

function ShapesPanel() {
  const { project, addLayer } = useEditorStore()

  const shapes: Array<{ shape: ShapeType; label: string; icon: string }> = [
    { shape: 'rect', label: 'Rectangle', icon: '▬' },
    { shape: 'rounded-rect', label: 'Rounded Rect', icon: '▢' },
    { shape: 'circle', label: 'Circle', icon: '●' },
    { shape: 'ellipse', label: 'Ellipse', icon: '⬭' },
    { shape: 'triangle', label: 'Triangle', icon: '▲' },
    { shape: 'star', label: 'Star', icon: '★' },
    { shape: 'line', label: 'Line', icon: '─' },
    { shape: 'arrow', label: 'Arrow', icon: '→' },
    { shape: 'polygon', label: 'Polygon', icon: '⬡' },
    { shape: 'pentagon', label: 'Pentagon', icon: '⬠' },
    { shape: 'hexagon', label: 'Hexagon', icon: '⬡' },
    { shape: 'octagon', label: 'Octagon', icon: '⯃' },
    { shape: 'diamond', label: 'Diamond', icon: '◆' },
    { shape: 'heart', label: 'Heart', icon: '♥' },
    { shape: 'cross', label: 'Cross', icon: '✚' },
  ]

  function addShape(shape: ShapeType) {
    if (!project) return
    const size = Math.min(project.width, project.height) * 0.3
    const layer: ShapeLayer = {
      id: generateId(),
      type: 'shape',
      name: shape.charAt(0).toUpperCase() + shape.slice(1),
      x: Math.round((project.width - size) / 2),
      y: Math.round((project.height - size) / 2),
      width: shape === 'line' || shape === 'arrow' ? size * 1.5 : size,
      height: size,
      rotation: 0, opacity: 100, visible: true, locked: false,
      blendMode: 'normal', scaleX: 1, scaleY: 1,
      shape,
      style: {
        fill: '#6c47ff',
        stroke: 'transparent',
        strokeWidth: 0,
        cornerRadius: shape === 'rounded-rect' ? 12 : 0,
        shadow: { ...defaultShadow },
      },
    }
    addLayer(layer)
  }

  return (
    <div className="p-3">
      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-3">Shapes</div>
      <div className="grid grid-cols-3 gap-2">
        {shapes.map(s => (
          <button
            key={s.shape}
            onClick={() => addShape(s.shape)}
            className="flex flex-col items-center gap-1.5 p-3 rounded-lg border border-editor-border hover:border-accent/40 hover:bg-editor-surface transition-all"
          >
            <span className="text-lg text-editor-text">{s.icon}</span>
            <span className="text-xs text-editor-muted">{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// Templates panel
// ============================================================

function TemplatesPanel() {
  const { setProject } = useEditorStore()
  const { saveProject } = useProjectStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  const filtered = TEMPLATES.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.category.toLowerCase().includes(search.toLowerCase())
  )

  async function applyTemplate(templateId: string) {
    const template = TEMPLATES.find(t => t.id === templateId)
    if (!template) return

    const project: Project = {
      id: generateId(),
      name: template.name,
      width: template.width,
      height: template.height,
      unit: 'px',
      dpi: 72,
      layers: JSON.parse(JSON.stringify(template.layers)) as Layer[],
      createdAt: Date.now(),
      updatedAt: Date.now(),
      thumbnail: null,
      template: templateId,
    }

    await saveProject(project)
    setProject(project)
    navigate(`/editor/${project.id}`)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-editor-border">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-editor-muted" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-7 pr-3 py-1.5 text-xs bg-editor-surface text-editor-text border border-editor-border rounded-md focus:outline-none focus:border-accent/60"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
        {filtered.map(t => (
          <button
            key={t.id}
            onClick={() => applyTemplate(t.id)}
            className="group flex flex-col rounded-lg overflow-hidden border border-editor-border hover:border-accent/40 transition-all text-left"
          >
            <div className="aspect-video bg-gradient-to-br from-accent-subtle to-editor-surface flex items-center justify-center">
              <span className="text-xs text-editor-muted">{t.width}×{t.height}</span>
            </div>
            <div className="px-2 py-1.5">
              <div className="text-xs font-medium text-editor-text truncate">{t.name}</div>
              <div className="text-xs text-editor-muted">{t.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ============================================================
// AI Tools panel — browser-local image processing tools
// (distinct from Image Tools / CloudinaryPanel which handles cloud transforms)
// ============================================================

function LocalToolsPanel() {
  const { getSelectedLayers, updateLayer } = useEditorStore()
  const [activeOp, setActiveOp] = useState<string | null>(null)
  const selectedLayers = getSelectedLayers()
  const selectedImage = selectedLayers.find(l => l.type === 'image') as ImageLayer | undefined

  type LocalTool = {
    id: string
    title: string
    desc: string
    icon: React.ReactNode
    category: string
  }

  const tools: LocalTool[] = [
    // Background tools
    { id: 'remove-white-bg', title: 'Remove White BG', desc: 'Make white/light areas transparent', icon: <Eraser className="w-4 h-4" />, category: 'Background' },
    { id: 'remove-dark-bg', title: 'Remove Dark BG', desc: 'Make dark/black areas transparent', icon: <Eraser className="w-4 h-4" />, category: 'Background' },
    // Colour
    { id: 'grayscale', title: 'Grayscale', desc: 'Convert to black & white', icon: <Contrast className="w-4 h-4" />, category: 'Colour' },
    { id: 'invert', title: 'Invert Colours', desc: 'Flip all pixel colours', icon: <RefreshCcw className="w-4 h-4" />, category: 'Colour' },
    { id: 'sepia', title: 'Sepia Tone', desc: 'Warm vintage brown tint', icon: <Palette className="w-4 h-4" />, category: 'Colour' },
    { id: 'vibrant', title: 'Boost Vibrance', desc: 'Punch up muted colours', icon: <Droplets className="w-4 h-4" />, category: 'Colour' },
    // Tone
    { id: 'brighten', title: 'Auto Brighten', desc: 'Lift shadows and midtones', icon: <Sun className="w-4 h-4" />, category: 'Tone' },
    { id: 'darken', title: 'Auto Darken', desc: 'Deepen highlights and midtones', icon: <Blend className="w-4 h-4" />, category: 'Tone' },
    { id: 'high-contrast', title: 'High Contrast', desc: 'Dramatic light/dark separation', icon: <Contrast className="w-4 h-4" />, category: 'Tone' },
    // Style
    { id: 'vintage', title: 'Vintage', desc: 'Faded warm retro look', icon: <Paintbrush2 className="w-4 h-4" />, category: 'Style' },
    { id: 'cool-blue', title: 'Cool Tone', desc: 'Push colours toward cool blue', icon: <Paintbrush2 className="w-4 h-4" />, category: 'Style' },
    { id: 'posterize', title: 'Posterize', desc: 'Reduce to bold flat colour bands', icon: <Paintbrush2 className="w-4 h-4" />, category: 'Style' },
    // Flip
    { id: 'flip-h', title: 'Flip Horizontal', desc: 'Mirror left–right', icon: <FlipHorizontal2 className="w-4 h-4" />, category: 'Transform' },
    { id: 'flip-v', title: 'Flip Vertical', desc: 'Mirror top–bottom', icon: <FlipVertical2 className="w-4 h-4" />, category: 'Transform' },
    // Focus / blur
    { id: 'sharpen', title: 'Sharpen', desc: 'Increase edge sharpness', icon: <Focus className="w-4 h-4" />, category: 'Focus' },
    { id: 'soft-blur', title: 'Soft Blur', desc: 'Light dreamy blur', icon: <Focus className="w-4 h-4" />, category: 'Focus' },
  ]

  const categories = [...new Set(tools.map(t => t.category))]

  async function runTool(toolId: string) {
    if (!selectedImage) {
      toastError('No image selected', 'Select an image layer first')
      return
    }
    setActiveOp(toolId)
    try {
      const src = selectedImage.src

      // ── background removal ──────────────────────────────────
      if (toolId === 'remove-white-bg') {
        const { removeWhiteBackground } = await import('@/services/image/imageService')
        const result = await removeWhiteBackground(src, 230)
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('White background removed')
      }

      if (toolId === 'remove-dark-bg') {
        const result = await removeDarkBackground(src, 30)
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Dark background removed')
      }

      // ── colour ──────────────────────────────────────────────
      if (toolId === 'grayscale') {
        const result = await applyPixelOp(src, (r, g, b) => { const v = Math.round(r * 0.299 + g * 0.587 + b * 0.114); return [v, v, v] })
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Grayscale applied')
      }

      if (toolId === 'invert') {
        const result = await applyPixelOp(src, (r, g, b) => [255 - r, 255 - g, 255 - b])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Colours inverted')
      }

      if (toolId === 'sepia') {
        const result = await applyPixelOp(src, (r, g, b) => [
          Math.min(255, r * 0.393 + g * 0.769 + b * 0.189),
          Math.min(255, r * 0.349 + g * 0.686 + b * 0.168),
          Math.min(255, r * 0.272 + g * 0.534 + b * 0.131),
        ])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Sepia applied')
      }

      if (toolId === 'vibrant') {
        const result = await applyPixelOp(src, (r, g, b) => {
          const avg = (r + g + b) / 3
          const vib = 1.4
          return [
            Math.min(255, avg + (r - avg) * vib),
            Math.min(255, avg + (g - avg) * vib),
            Math.min(255, avg + (b - avg) * vib),
          ]
        })
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Vibrance boosted')
      }

      // ── tone ────────────────────────────────────────────────
      if (toolId === 'brighten') {
        const result = await applyPixelOp(src, (r, g, b) => [Math.min(255, r + 40), Math.min(255, g + 40), Math.min(255, b + 40)])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Image brightened')
      }

      if (toolId === 'darken') {
        const result = await applyPixelOp(src, (r, g, b) => [Math.max(0, r - 40), Math.max(0, g - 40), Math.max(0, b - 40)])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Image darkened')
      }

      if (toolId === 'high-contrast') {
        const result = await applyPixelOp(src, (r, g, b) => [
          Math.min(255, Math.max(0, (r - 128) * 1.6 + 128)),
          Math.min(255, Math.max(0, (g - 128) * 1.6 + 128)),
          Math.min(255, Math.max(0, (b - 128) * 1.6 + 128)),
        ])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('High contrast applied')
      }

      // ── style ───────────────────────────────────────────────
      if (toolId === 'vintage') {
        const result = await applyPixelOp(src, (r, g, b) => {
          const sr = Math.min(255, r * 0.9 + 30)
          const sg = Math.max(0, g * 0.85)
          const sb = Math.max(0, b * 0.7)
          return [sr, sg, sb]
        })
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Vintage look applied')
      }

      if (toolId === 'cool-blue') {
        const result = await applyPixelOp(src, (r, g, b) => [
          Math.max(0, r - 20),
          Math.min(255, g + 5),
          Math.min(255, b + 40),
        ])
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Cool tone applied')
      }

      if (toolId === 'posterize') {
        const levels = 4
        const result = await applyPixelOp(src, (r, g, b) => {
          const step = 255 / (levels - 1)
          return [
            Math.round(Math.round(r / step) * step),
            Math.round(Math.round(g / step) * step),
            Math.round(Math.round(b / step) * step),
          ]
        })
        updateLayer(selectedImage.id, { src: result })
        toastSuccess('Posterize applied')
      }

      // ── transform ───────────────────────────────────────────
      if (toolId === 'flip-h') {
        updateLayer(selectedImage.id, { flipX: !selectedImage.flipX })
        toastSuccess('Flipped horizontal')
      }

      if (toolId === 'flip-v') {
        updateLayer(selectedImage.id, { flipY: !selectedImage.flipY })
        toastSuccess('Flipped vertical')
      }

      // ── focus / blur ────────────────────────────────────────
      if (toolId === 'sharpen') {
        const adj = selectedImage.adjustments
        updateLayer(selectedImage.id, { adjustments: { ...adj, sharpness: Math.min(100, adj.sharpness + 30) } })
        toastSuccess('Sharpness increased')
      }

      if (toolId === 'soft-blur') {
        const adj = selectedImage.adjustments
        updateLayer(selectedImage.id, { adjustments: { ...adj, blur: Math.min(50, adj.blur + 4) } })
        toastSuccess('Soft blur applied')
      }

    } catch (err) {
      toastError('Tool failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setActiveOp(null)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-editor-border shrink-0">
        <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Local Image Tools</div>
        <p className="text-xs text-editor-muted/70">Browser-based · works offline · no upload needed</p>
      </div>

      {!selectedImage && (
        <div className="p-3">
          <div className="p-3 rounded-lg border border-editor-border bg-editor-surface text-xs text-editor-muted">
            Select an image layer to use these tools.
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {categories.map(cat => (
          <div key={cat}>
            <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-2">{cat}</div>
            <div className="space-y-1.5">
              {tools.filter(t => t.category === cat).map(tool => {
                const disabled = !selectedImage || activeOp !== null
                const isActive = activeOp === tool.id
                return (
                  <button
                    key={tool.id}
                    onClick={() => runTool(tool.id)}
                    disabled={disabled}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all',
                      disabled
                        ? 'border-editor-border opacity-40 cursor-not-allowed'
                        : 'border-editor-border hover:border-accent/40 hover:bg-editor-surface cursor-pointer',
                      isActive && 'border-accent/40 bg-editor-surface'
                    )}
                  >
                    <div className={cn('shrink-0', isActive ? 'text-accent animate-pulse' : 'text-editor-muted')}>
                      {tool.icon}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-editor-text">{tool.title}</div>
                      <div className="text-xs text-editor-muted truncate">{tool.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── pixel-level operation helper ───────────────────────────────────────────────

async function applyPixelOp(
  src: string,
  fn: (r: number, g: number, b: number) => [number, number, number]
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No 2D context'))
      ctx.drawImage(img, 0, 0)
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = id.data
      for (let i = 0; i < d.length; i += 4) {
        const [nr, ng, nb] = fn(d[i], d[i + 1], d[i + 2])
        d[i] = Math.round(nr)
        d[i + 1] = Math.round(ng)
        d[i + 2] = Math.round(nb)
      }
      ctx.putImageData(id, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

async function removeDarkBackground(src: string, threshold: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('No 2D context'))
      ctx.drawImage(img, 0, 0)
      const id = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = id.data
      for (let i = 0; i < d.length; i += 4) {
        if (d[i] < threshold && d[i + 1] < threshold && d[i + 2] < threshold) d[i + 3] = 0
      }
      ctx.putImageData(id, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = src
  })
}

// ============================================================
// Background panel
// ============================================================

const PRESET_COLORS = [
  '#ffffff', '#1a1917', '#f5c842', '#6c47ff', '#e31b1b', '#1ebd6e',
  '#0ea5e9', '#f97316', '#ec4899', '#8b5cf6', '#14b8a6', '#f43f5e',
  '#64748b', '#a16207', '#166534', '#1e3a8a',
]

const GRADIENT_PRESETS: Array<{ label: string; stops: [string, string]; angle: number }> = [
  { label: 'Sunset', stops: ['#f97316', '#ec4899'], angle: 135 },
  { label: 'Ocean', stops: ['#0ea5e9', '#6c47ff'], angle: 135 },
  { label: 'Forest', stops: ['#1ebd6e', '#0ea5e9'], angle: 135 },
  { label: 'Midnight', stops: ['#1a1917', '#6c47ff'], angle: 135 },
  { label: 'Gold', stops: ['#f5c842', '#f97316'], angle: 135 },
  { label: 'Rose', stops: ['#ec4899', '#8b5cf6'], angle: 135 },
  { label: 'Dawn', stops: ['#fde68a', '#f97316'], angle: 160 },
  { label: 'Ice', stops: ['#e0f2fe', '#6c47ff'], angle: 120 },
]

function BackgroundPanel() {
  const { project, updateLayer } = useEditorStore()

  const bgLayer = project?.layers.find(l => l.type === 'background') as BackgroundLayer | undefined

  const [activeTab, setActiveTab] = useState<'solid' | 'gradient' | 'transparent'>('solid')
  const [solidColor, setSolidColor] = useState('#ffffff')
  const [gradStart, setGradStart] = useState('#6c47ff')
  const [gradEnd, setGradEnd] = useState('#1a1917')
  const [gradAngle, setGradAngle] = useState(135)

  if (!bgLayer) {
    return (
      <div className="p-4 text-xs text-editor-muted">
        No background layer found in this project.
      </div>
    )
  }

  function applyFill(fill: BackgroundFill) {
    if (!bgLayer) return
    updateLayer(bgLayer.id, { fill } as Partial<BackgroundLayer>)
  }

  const tabs = [
    { id: 'solid' as const, label: 'Solid' },
    { id: 'gradient' as const, label: 'Gradient' },
    { id: 'transparent' as const, label: 'None' },
  ]

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {/* Tab strip */}
      <div className="p-3 border-b border-editor-border shrink-0">
        <div className="flex gap-1 bg-editor-surface rounded-lg p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                'flex-1 py-1.5 text-xs font-medium rounded-md transition-all',
                activeTab === t.id
                  ? 'bg-editor-panel text-editor-text shadow-sm'
                  : 'text-editor-muted hover:text-editor-text'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Solid */}
      {activeTab === 'solid' && (
        <div className="p-3 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Presets</div>
          <div className="grid grid-cols-8 gap-1.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => { setSolidColor(c); applyFill({ type: 'solid', color: c }) }}
                className={cn(
                  'aspect-square rounded-md border-2 transition-all hover:scale-110',
                  (bgLayer.fill.type === 'solid' && bgLayer.fill.color === c)
                    ? 'border-accent scale-110 shadow-sm'
                    : 'border-transparent'
                )}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-2">Custom Colour</div>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={solidColor}
                onChange={e => setSolidColor(e.target.value)}
                className="w-9 h-9 rounded-lg border border-editor-border cursor-pointer bg-transparent"
              />
              <input
                type="text"
                value={solidColor}
                onChange={e => {
                  const v = e.target.value
                  setSolidColor(v)
                  if (/^#[0-9a-f]{6}$/i.test(v)) applyFill({ type: 'solid', color: v })
                }}
                className="flex-1 bg-editor-surface text-editor-text text-xs px-2 py-1.5 rounded border border-editor-border focus:outline-none focus:border-accent/60 font-mono"
                placeholder="#ffffff"
              />
              <button
                onClick={() => applyFill({ type: 'solid', color: solidColor })}
                className="px-2 py-1.5 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
              >
                Apply
              </button>
            </div>
          </div>

          {/* Current preview */}
          <div
            className="w-full h-10 rounded-lg border border-editor-border"
            style={{ background: bgLayer.fill.type === 'solid' ? bgLayer.fill.color : solidColor }}
          />
        </div>
      )}

      {/* Gradient */}
      {activeTab === 'gradient' && (
        <div className="p-3 space-y-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Presets</div>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map(g => (
              <button
                key={g.label}
                onClick={() => {
                  setGradStart(g.stops[0])
                  setGradEnd(g.stops[1])
                  setGradAngle(g.angle)
                  applyFill({
                    type: 'gradient',
                    gradient: { type: 'linear', angle: g.angle, stops: [{ offset: 0, color: g.stops[0] }, { offset: 1, color: g.stops[1] }] }
                  })
                }}
                className="h-12 rounded-lg border border-editor-border hover:border-accent/40 transition-all text-xs font-medium text-white flex items-center justify-center shadow-sm hover:scale-[1.02]"
                style={{ background: `linear-gradient(${g.angle}deg, ${g.stops[0]}, ${g.stops[1]})` }}
              >
                <span className="drop-shadow text-shadow">{g.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Custom Gradient</div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-editor-muted w-10 shrink-0">Start</span>
              <input type="color" value={gradStart} onChange={e => setGradStart(e.target.value)} className="w-8 h-8 rounded border border-editor-border cursor-pointer bg-transparent" />
              <input type="text" value={gradStart} onChange={e => setGradStart(e.target.value)} className="flex-1 bg-editor-surface text-editor-text text-xs px-2 py-1 rounded border border-editor-border focus:outline-none font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-editor-muted w-10 shrink-0">End</span>
              <input type="color" value={gradEnd} onChange={e => setGradEnd(e.target.value)} className="w-8 h-8 rounded border border-editor-border cursor-pointer bg-transparent" />
              <input type="text" value={gradEnd} onChange={e => setGradEnd(e.target.value)} className="flex-1 bg-editor-surface text-editor-text text-xs px-2 py-1 rounded border border-editor-border focus:outline-none font-mono" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-editor-muted w-10 shrink-0">Angle</span>
              <input type="range" min={0} max={360} value={gradAngle} onChange={e => setGradAngle(Number(e.target.value))} className="flex-1 accent-accent" />
              <span className="text-xs text-editor-muted w-8 text-right font-mono">{gradAngle}°</span>
            </div>
            <div
              className="w-full h-10 rounded-lg border border-editor-border"
              style={{ background: `linear-gradient(${gradAngle}deg, ${gradStart}, ${gradEnd})` }}
            />
            <button
              onClick={() => applyFill({
                type: 'gradient',
                gradient: { type: 'linear', angle: gradAngle, stops: [{ offset: 0, color: gradStart }, { offset: 1, color: gradEnd }] }
              })}
              className="w-full py-1.5 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
            >
              Apply Gradient
            </button>
          </div>
        </div>
      )}

      {/* Transparent */}
      {activeTab === 'transparent' && (
        <div className="p-3 space-y-3">
          <div
            className="w-full h-16 rounded-lg border border-editor-border checkerboard"
          />
          <p className="text-xs text-editor-muted">
            Removes the background colour. Export as PNG to keep transparency.
          </p>
          <button
            onClick={() => applyFill({ type: 'transparent' })}
            className="w-full py-2 text-xs bg-accent text-white rounded-md hover:bg-accent/90 transition-colors"
          >
            Make Transparent
          </button>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Sidebar container
// ============================================================

export function Sidebar() {
  const { activeSidebarPanel, setActiveSidebarPanel } = useEditorStore()

  if (!activeSidebarPanel) return null

  const panels: Record<string, { title: string; content: React.ReactNode; wide?: boolean }> = {
    layers: { title: 'Layers', content: <LayersPanel /> },
    templates: { title: 'Templates', content: <TemplatesPanel /> },
    images: { title: 'Images', content: <UploadsPanel /> },
    uploads: { title: 'Uploads', content: <UploadsPanel /> },
    text: { title: 'Text', content: <TextPanel /> },
    shapes: { title: 'Shapes', content: <ShapesPanel /> },
    ai: { title: 'Local Tools', content: <LocalToolsPanel /> },
    background: { title: 'Background', content: <BackgroundPanel /> },
    elements: { title: 'Elements', content: <ShapesPanel /> },
    cloudinary: { title: 'Image Tools', content: <CloudinaryPanel />, wide: true },
  }

  const panel = panels[activeSidebarPanel]
  if (!panel) return null

  return (
    <aside className={`${panel.wide ? 'w-72' : 'w-60'} bg-editor-panel border-r border-editor-border flex flex-col shrink-0`}>
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-editor-border">
        <span className="text-xs font-semibold text-editor-text">{panel.title}</span>
        <button
          onClick={() => setActiveSidebarPanel(null)}
          className="p-0.5 rounded hover:bg-editor-surface text-editor-muted hover:text-editor-text transition-colors"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {panel.content}
      </div>
    </aside>
  )
}

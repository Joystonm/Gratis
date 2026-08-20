/**
 * CloudinaryPanel — Image Tools sidebar panel.
 *
 * Tabs:
 *  1. Filters  — all Cloudinary art filters + stylize + one-click effects
 *  2. Adjust   — colour / tone adjustments, tint, border, rounded corners
 *  3. Optimize — quality, format conversion, watermark
 */

import { useState } from 'react'
import {
  Wand2, Palette, Sliders, Zap,
  AlertCircle, CloudOff, Loader2,
  ChevronDown, ChevronRight, Check
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { toastError, toastSuccess } from '@/stores/toastStore'
import { cn } from '@/utils'
import type { ImageLayer } from '@/types'
import {
  getCloudinaryConfig,
  buildEffectUrl,
  buildColorAdjustUrl,
  buildOptimizedUrl,
  buildFormatConvertUrl,
  buildRoundedUrl,
  buildBorderUrl,
  buildPixelateFacesUrl,
  buildTextOverlayUrl,
  ART_FILTERS,
  type GravityMode,
  type OutputFormat,
} from '@/services/cloudinary/cloudinaryService'

// ─── shared primitives ────────────────────────────────────────────────────────

type Tab = 'filters' | 'adjust' | 'optimize'

const TABS: Array<{ id: Tab; label: string; icon: typeof Wand2 }> = [
  { id: 'filters',  label: 'Filters',  icon: Palette  },
  { id: 'adjust',   label: 'Adjust',   icon: Sliders  },
  { id: 'optimize', label: 'Optimize', icon: Zap      },
]

function SectionHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle(): void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-widest text-editor-muted hover:text-editor-text transition-colors"
    >
      {title}
      {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
    </button>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 min-h-[28px]">
      <span className="text-xs text-editor-muted w-20 shrink-0 truncate">{label}</span>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}

function MiniSlider({ value, min, max, step = 1, onChange }: {
  value: number; min: number; max: number; step?: number; onChange(v: number): void
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="range" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 accent-accent h-1 cursor-pointer"
      />
      <input
        type="number" value={value} min={min} max={max} step={step}
        onChange={e => onChange(Number(e.target.value))}
        className="w-12 text-xs text-right font-mono bg-editor-surface text-editor-text border border-editor-border rounded px-1 py-0.5"
      />
    </div>
  )
}

function MiniSelect<T extends string>({ value, options, onChange }: {
  value: T
  options: Array<{ value: T; label: string }>
  onChange(v: T): void
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="w-full text-xs bg-editor-surface text-editor-text border border-editor-border rounded px-2 py-1 focus:outline-none focus:border-accent/60"
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ─── Not-configured notice ────────────────────────────────────────────────────

function NotConfigured() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3 p-3 rounded-lg border border-editor-border bg-editor-surface">
        <CloudOff className="w-4 h-4 text-editor-muted shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-editor-text">Cloud processing not configured</p>
          <p className="text-xs text-editor-muted mt-1 leading-relaxed">
            Add these to your <code className="text-accent">.env</code> file to enable cloud features:
          </p>
          <pre className="text-xs text-editor-muted mt-2 font-mono leading-relaxed overflow-x-auto">
{`VITE_CLOUDINARY_CLOUD_NAME=...
VITE_CLOUDINARY_UPLOAD_PRESET=...`}
          </pre>
        </div>
      </div>
    </div>
  )
}

// ─── No-image notice ──────────────────────────────────────────────────────────

function NoImageSelected() {
  return (
    <div className="p-4">
      <div className="flex items-start gap-3 p-3 rounded-lg border border-editor-border bg-editor-surface">
        <AlertCircle className="w-4 h-4 text-editor-muted shrink-0 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-editor-text">No image selected</p>
          <p className="text-xs text-editor-muted mt-1">
            Select an image layer to use these tools.
          </p>
        </div>
      </div>
    </div>
  )
}

// ─── helper: preload a URL and resolve true/false ────────────────────────────

function probeImageUrl(url: string): Promise<boolean> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload  = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}

// ─── hook: apply a cloudinary transform ──────────────────────────────────────

function useApplyTransform(image: ImageLayer | undefined) {
  const { updateLayer, pushHistory } = useEditorStore()
  const [busy, setBusy] = useState<string | null>(null)

  async function apply(opId: string, urlFn: () => string, label: string) {
    if (!image?.cloudinaryPublicId) {
      toastError('No cloud asset', 'Upload the image first to use these tools')
      return
    }
    setBusy(opId)
    try {
      const url = urlFn()
      if (!url) throw new Error('Failed to build transform URL')

      // Verify the transformed URL actually loads before replacing the layer src.
      // Cloudinary returns a 400 image (broken) for invalid/unsupported transforms —
      // probing with an Image element catches this without a CORS-blocked fetch.
      const ok = await probeImageUrl(url)
      if (!ok) {
        throw new Error('Transformation failed — this effect may require a paid Cloudinary plan or the parameters are invalid')
      }

      updateLayer(image.id, { src: url })
      pushHistory(label)
      toastSuccess(label, 'Transformation applied')
    } catch (err) {
      toastError('Transform failed', err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setBusy(null)
    }
  }

  return { apply, busy }
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 1 — Filters (art filters + stylize + one-click + privacy)
// ─────────────────────────────────────────────────────────────────────────────

function FilterChip({ filter, isSelected, isLoading, onClick }: {
  filter: typeof ART_FILTERS[number]
  isSelected: boolean
  isLoading: boolean
  onClick(): void
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      title={filter.label}
      className={cn(
        'flex flex-col items-center rounded-lg border transition-all overflow-hidden',
        isSelected ? 'border-accent ring-1 ring-accent' : 'border-editor-border hover:border-accent/40',
        isLoading && 'opacity-50 cursor-wait',
      )}
    >
      <div className="w-full h-12 relative" style={{ background: filter.preview }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(circle at 40% 35%, rgba(255,255,255,0.2) 0%, transparent 65%)', mixBlendMode: 'overlay' }} />
        {isSelected && (
          <div className="absolute top-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-accent flex items-center justify-center">
            <Check className="w-2 h-2 text-white" />
          </div>
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          </div>
        )}
      </div>
      <span className="text-editor-muted py-1 px-0.5 truncate w-full text-center leading-tight" style={{ fontSize: 9 }}>
        {filter.label}
      </span>
    </button>
  )
}

function FiltersTab({ image }: { image: ImageLayer }) {
  const { apply, busy } = useApplyTransform(image)
  const pid = image.cloudinaryPublicId ?? ''
  const [selectedArt, setSelectedArt] = useState<string | null>(null)
  const [open, setOpen] = useState<Record<string, boolean>>({ art: true, stylize: true, oneclick: true, privacy: false })
  const toggle = (k: string) => setOpen(p => ({ ...p, [k]: !p[k] }))

  // Stylize sliders
  const [cartoonStr, setCartoonStr]   = useState(50)
  const [oilStr, setOilStr]           = useState(40)
  const [vignetteStr, setVignetteStr] = useState(30)
  const [sketchStr, setSketchStr]     = useState(40)
  const [pixelSize, setPixelSize]     = useState(10)
  const [blurStr, setBlurStr]         = useState(300)
  const [pixFaceSize, setPixFaceSize] = useState(20)
  const [blurFaceStr, setBlurFaceStr] = useState(600)

  const STYLIZE: Array<{ id: string; label: string; value: number; setValue: (v: number) => void; min: number; max: number; effectFn: () => string }> = [
    { id: 'cartoonify', label: 'Cartoonify',   value: cartoonStr,   setValue: setCartoonStr,   min: 0,   max: 100,  effectFn: () => buildEffectUrl({ publicId: pid, effect: 'cartoonify',  strength: cartoonStr  }) },
    { id: 'oil_paint',  label: 'Oil Paint',    value: oilStr,       setValue: setOilStr,       min: 0,   max: 100,  effectFn: () => buildEffectUrl({ publicId: pid, effect: 'oil_paint',   strength: oilStr      }) },
    { id: 'vignette',   label: 'Vignette',     value: vignetteStr,  setValue: setVignetteStr,  min: 0,   max: 100,  effectFn: () => buildEffectUrl({ publicId: pid, effect: 'vignette',    strength: vignetteStr }) },
    { id: 'sketch',     label: 'Sketch',       value: sketchStr,    setValue: setSketchStr,    min: 0,   max: 100,  effectFn: () => buildEffectUrl({ publicId: pid, effect: 'sketch',      strength: sketchStr   }) },
    { id: 'pixelate',   label: 'Pixelate',     value: pixelSize,    setValue: setPixelSize,    min: 2,   max: 100,  effectFn: () => buildEffectUrl({ publicId: pid, effect: 'pixelate',   strength: pixelSize   }) },
    { id: 'blur',       label: 'Blur',         value: blurStr,      setValue: setBlurStr,      min: 100, max: 2000, effectFn: () => buildEffectUrl({ publicId: pid, effect: 'blur',        strength: blurStr     }) },
  ]

  const ONE_CLICK: Array<{ id: string; label: string; fn: () => string }> = [
    { id: 'grayscale',       label: 'Grayscale',     fn: () => buildEffectUrl({ publicId: pid, effect: 'grayscale' }) },
    { id: 'sepia',           label: 'Sepia',         fn: () => buildEffectUrl({ publicId: pid, effect: 'sepia' }) },
    { id: 'negate',          label: 'Negate',        fn: () => buildEffectUrl({ publicId: pid, effect: 'negate' }) },
    { id: 'sharpen',         label: 'Sharpen',       fn: () => buildEffectUrl({ publicId: pid, effect: 'sharpen', strength: 100 }) },
    { id: 'improve',         label: 'Auto Improve',  fn: () => buildEffectUrl({ publicId: pid, effect: 'improve' }) },
    { id: 'viesus_correct',  label: 'Viesus Fix',    fn: () => buildEffectUrl({ publicId: pid, effect: 'viesus_correct' }) },
    { id: 'auto_color',      label: 'Auto Color',    fn: () => buildEffectUrl({ publicId: pid, effect: 'auto_color' }) },
    { id: 'auto_brightness', label: 'Auto Bright',   fn: () => buildEffectUrl({ publicId: pid, effect: 'auto_brightness' }) },
    { id: 'auto_contrast',   label: 'Auto Contrast', fn: () => buildEffectUrl({ publicId: pid, effect: 'auto_contrast' }) },
    { id: 'vibrance',        label: 'Vibrance',      fn: () => buildEffectUrl({ publicId: pid, effect: 'vibrance', strength: 70 }) },
    { id: 'tilt_shift',      label: 'Tilt Shift',    fn: () => buildEffectUrl({ publicId: pid, effect: 'tilt_shift' }) },
    { id: 'trim',            label: 'Trim BG',       fn: () => buildEffectUrl({ publicId: pid, effect: 'trim' }) },
  ]

  return (
    <div className="p-3 space-y-0.5">

      {/* ── Art Filters ── */}
      <SectionHeader title={`Art Filters (${ART_FILTERS.length})`} open={!!open['art']} onToggle={() => toggle('art')} />
      {open['art'] && (
        <div className="grid grid-cols-4 gap-1.5 pb-3">
          {ART_FILTERS.map(f => (
            <FilterChip
              key={f.id}
              filter={f}
              isSelected={selectedArt === f.id}
              isLoading={busy === `art-${f.id}`}
              onClick={() => {
                setSelectedArt(f.id)
                apply(`art-${f.id}`, () => buildEffectUrl({ publicId: pid, effect: f.effect }), `Art: ${f.label}`)
              }}
            />
          ))}
        </div>
      )}

      <div className="border-t border-editor-border" />

      {/* ── Stylize (with sliders) ── */}
      <SectionHeader title="Stylize" open={!!open['stylize']} onToggle={() => toggle('stylize')} />
      {open['stylize'] && (
        <div className="space-y-2.5 pb-3">
          {STYLIZE.map(s => (
            <div key={s.id}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-editor-text font-medium">{s.label}</span>
                {busy === s.id && <Loader2 className="w-3 h-3 animate-spin text-accent" />}
              </div>
              <div className="flex gap-2 items-center">
                <MiniSlider value={s.value} min={s.min} max={s.max} onChange={s.setValue} />
                <button
                  onClick={() => apply(s.id, s.effectFn, s.label)}
                  disabled={!!busy}
                  className="text-xs bg-editor-surface border border-editor-border text-editor-text px-2 py-1 rounded hover:border-accent/40 disabled:opacity-40 shrink-0"
                >
                  Apply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="border-t border-editor-border" />

      {/* ── One-click ── */}
      <SectionHeader title="One-Click Effects" open={!!open['oneclick']} onToggle={() => toggle('oneclick')} />
      {open['oneclick'] && (
        <div className="grid grid-cols-3 gap-1.5 pb-3">
          {ONE_CLICK.map(item => (
            <button
              key={item.id}
              onClick={() => apply(item.id, item.fn, item.label)}
              disabled={!!busy}
              className={cn(
                'py-2 px-1 rounded-lg border text-xs font-medium transition-all truncate',
                'border-editor-border text-editor-text hover:bg-editor-surface hover:border-accent/30',
                busy === item.id && 'opacity-60',
              )}
            >
              {busy === item.id ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : item.label}
            </button>
          ))}
        </div>
      )}

      <div className="border-t border-editor-border" />

      {/* ── Privacy ── */}
      <SectionHeader title="Privacy" open={!!open['privacy']} onToggle={() => toggle('privacy')} />
      {open['privacy'] && (
        <div className="space-y-2.5 pb-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-editor-text font-medium">Pixelate Faces</span>
            </div>
            <div className="flex gap-2 items-center">
              <MiniSlider value={pixFaceSize} min={5} max={50} onChange={setPixFaceSize} />
              <button onClick={() => apply('pix-faces', () => buildPixelateFacesUrl(pid, pixFaceSize), 'Pixelate faces')} disabled={!!busy} className="text-xs bg-editor-surface border border-editor-border text-editor-text px-2 py-1 rounded hover:border-accent/40 disabled:opacity-40 shrink-0">Apply</button>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-editor-text font-medium">Blur Faces</span>
            </div>
            <div className="flex gap-2 items-center">
              <MiniSlider value={blurFaceStr} min={100} max={2000} step={100} onChange={setBlurFaceStr} />
              <button onClick={() => apply('blur-faces', () => buildEffectUrl({ publicId: pid, effect: 'blur_faces', strength: blurFaceStr }), 'Blur faces')} disabled={!!busy} className="text-xs bg-editor-surface border border-editor-border text-editor-text px-2 py-1 rounded hover:border-accent/40 disabled:opacity-40 shrink-0">Apply</button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 2 — Adjust (colour / tone)
// ─────────────────────────────────────────────────────────────────────────────

function AdjustTab({ image }: { image: ImageLayer }) {
  const { apply, busy } = useApplyTransform(image)
  const pid = image.cloudinaryPublicId ?? ''

  const [brightness,  setBrightness]  = useState(0)
  const [contrast,    setContrast]    = useState(0)
  const [saturation,  setSaturation]  = useState(0)
  const [vibrance,    setVibrance]    = useState(0)
  const [fillLight,   setFillLight]   = useState(0)
  const [tintColor,   setTintColor]   = useState('#6c47ff')
  const [tintInt,     setTintInt]     = useState(40)
  const [tintEnabled, setTintEnabled] = useState(false)
  const [rounded,     setRounded]     = useState(0)
  const [borderW,     setBorderW]     = useState(4)
  const [borderColor, setBorderColor] = useState('#ffffff')
  const [borderOn,    setBorderOn]    = useState(false)

  function applyAll() {
    apply('color-adjust', () => buildColorAdjustUrl({
      publicId: pid,
      brightness:  brightness  !== 0 ? brightness  : undefined,
      contrast:    contrast    !== 0 ? contrast    : undefined,
      saturation:  saturation  !== 0 ? saturation  : undefined,
      vibrance:    vibrance    !== 0 ? vibrance    : undefined,
      fillLight:   fillLight   !== 0 ? fillLight   : undefined,
      tint:        tintEnabled ? tintColor : undefined,
      tintIntensity: tintEnabled ? tintInt : undefined,
    }), 'Colour adjustments')
  }

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Colour / Tone</div>
      <Row label="Brightness"><MiniSlider value={brightness} min={-100} max={100} onChange={setBrightness} /></Row>
      <Row label="Contrast">  <MiniSlider value={contrast}  min={-100} max={100} onChange={setContrast}   /></Row>
      <Row label="Saturation"><MiniSlider value={saturation} min={-100} max={100} onChange={setSaturation} /></Row>
      <Row label="Vibrance">  <MiniSlider value={vibrance}  min={-100} max={100} onChange={setVibrance}   /></Row>
      <Row label="Fill Light"><MiniSlider value={fillLight}  min={0}    max={100} onChange={setFillLight}  /></Row>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-editor-muted">Tint</span>
        <button onClick={() => setTintEnabled(v => !v)} className={cn('relative w-8 h-4 rounded-full transition-colors', tintEnabled ? 'bg-accent' : 'bg-editor-surface')}>
          <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform', tintEnabled ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
      </div>
      {tintEnabled && (
        <div className="space-y-2 pl-2">
          <Row label="Color">
            <div className="flex items-center gap-2">
              <input type="color" value={tintColor} onChange={e => setTintColor(e.target.value)} className="w-7 h-7 rounded border border-editor-border cursor-pointer bg-transparent" />
              <span className="text-xs font-mono text-editor-muted">{tintColor}</span>
            </div>
          </Row>
          <Row label="Intensity"><MiniSlider value={tintInt} min={0} max={100} onChange={setTintInt} /></Row>
        </div>
      )}

      <button onClick={applyAll} disabled={!!busy} className="w-full mt-2 py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
        {busy === 'color-adjust' ? <span className="flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Applying…</span> : 'Apply Adjustments'}
      </button>

      <div className="border-t border-editor-border pt-2 mt-2" />

      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Shape</div>
      <Row label="Rounded">
        <div className="flex gap-2 items-center">
          <MiniSlider value={rounded} min={0} max={500} onChange={setRounded} />
          <button onClick={() => apply('rounded', () => buildRoundedUrl(pid, rounded === 0 ? 'max' : rounded), 'Round corners')} disabled={!!busy} className="text-xs bg-editor-surface border border-editor-border text-editor-text px-2 py-1 rounded hover:border-accent/40 disabled:opacity-40 shrink-0">Apply</button>
        </div>
      </Row>
      <button onClick={() => apply('circle', () => buildRoundedUrl(pid, 'max'), 'Circle crop')} disabled={!!busy} className="w-full py-1.5 rounded border border-editor-border text-xs text-editor-text hover:bg-editor-surface hover:border-accent/30 transition-all disabled:opacity-40">
        Circle Crop
      </button>

      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-editor-muted">Border</span>
        <button onClick={() => setBorderOn(v => !v)} className={cn('relative w-8 h-4 rounded-full transition-colors', borderOn ? 'bg-accent' : 'bg-editor-surface')}>
          <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform', borderOn ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
      </div>
      {borderOn && (
        <div className="space-y-2 pl-2">
          <Row label="Width"><MiniSlider value={borderW} min={1} max={40} onChange={setBorderW} /></Row>
          <Row label="Color">
            <div className="flex items-center gap-2">
              <input type="color" value={borderColor} onChange={e => setBorderColor(e.target.value)} className="w-7 h-7 rounded border border-editor-border cursor-pointer bg-transparent" />
              <span className="text-xs font-mono text-editor-muted">{borderColor}</span>
            </div>
          </Row>
          <button onClick={() => apply('border', () => buildBorderUrl(pid, borderW, borderColor), 'Add border')} disabled={!!busy} className="w-full py-1.5 rounded-lg bg-editor-surface border border-editor-border text-xs text-editor-text hover:border-accent/40 disabled:opacity-40">
            Apply Border
          </button>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// TAB 3 — Optimize
// ─────────────────────────────────────────────────────────────────────────────

type QualityPreset = 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low'
type DeliveryFormat = 'auto' | 'webp' | 'avif' | 'jpg' | 'png'

const QUALITY_OPTIONS: Array<{ value: QualityPreset; label: string }> = [
  { value: 'auto',       label: 'Auto'  },
  { value: 'auto:best',  label: 'Best'  },
  { value: 'auto:good',  label: 'Good'  },
  { value: 'auto:eco',   label: 'Eco'   },
  { value: 'auto:low',   label: 'Low'   },
]
const FORMAT_OPTIONS: Array<{ value: DeliveryFormat; label: string }> = [
  { value: 'auto', label: 'Auto' },
  { value: 'webp', label: 'WebP' },
  { value: 'avif', label: 'AVIF' },
  { value: 'jpg',  label: 'JPEG' },
  { value: 'png',  label: 'PNG'  },
]

const GRAVITY_OPTIONS: Array<{ value: GravityMode; label: string }> = [
  { value: 'auto', label: 'Auto' }, { value: 'center', label: 'Center' },
  { value: 'north', label: 'Top' }, { value: 'south', label: 'Bottom' },
  { value: 'east', label: 'Right' }, { value: 'west', label: 'Left' },
  { value: 'north_east', label: 'Top Right' }, { value: 'north_west', label: 'Top Left' },
  { value: 'south_east', label: 'Bottom Right' }, { value: 'south_west', label: 'Bottom Left' },
]

function OptimizeTab({ image }: { image: ImageLayer }) {
  const { apply, busy } = useApplyTransform(image)
  const pid = image.cloudinaryPublicId ?? ''

  const [quality, setQuality]   = useState<QualityPreset>('auto:good')
  const [format, setFormat]     = useState<DeliveryFormat>('auto')
  const [maxWidth, setMaxWidth] = useState(1200)
  const [limitOn, setLimitOn]   = useState(false)
  const [textContent, setTextContent] = useState('© Gratis')
  const [textFont, setTextFont]       = useState('Arial')
  const [textSize, setTextSize]       = useState(36)
  const [textOpacity, setTextOpacity] = useState(70)
  const [textGravity, setTextGravity] = useState<GravityMode>('south_east')
  const [textColor, setTextColor]     = useState('#ffffff')

  return (
    <div className="p-3 space-y-2">
      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Delivery</div>
      <Row label="Quality">
        <MiniSelect<QualityPreset> value={quality} options={QUALITY_OPTIONS} onChange={setQuality} />
      </Row>
      <Row label="Format">
        <MiniSelect<DeliveryFormat> value={format} options={FORMAT_OPTIONS} onChange={setFormat} />
      </Row>
      <div className="flex items-center justify-between">
        <span className="text-xs text-editor-muted">Limit width</span>
        <button onClick={() => setLimitOn(v => !v)} className={cn('relative w-8 h-4 rounded-full transition-colors', limitOn ? 'bg-accent' : 'bg-editor-surface')}>
          <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform', limitOn ? 'translate-x-4' : 'translate-x-0.5')} />
        </button>
      </div>
      {limitOn && <Row label="Max px"><MiniSlider value={maxWidth} min={200} max={4000} step={100} onChange={setMaxWidth} /></Row>}
      <button onClick={() => apply('optimize', () => buildOptimizedUrl({ publicId: pid, quality, format: format as 'auto' | 'webp' | 'avif' | 'jpg' | 'png', maxWidth: limitOn ? maxWidth : undefined, stripMetadata: true }), 'Optimize')} disabled={!!busy} className="w-full py-2 rounded-lg bg-accent text-white text-xs font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50">
        {busy === 'optimize' ? <span className="flex items-center justify-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> Applying…</span> : 'Apply Optimization'}
      </button>

      <div className="border-t border-editor-border pt-2 mt-2" />
      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Convert Format</div>
      <div className="grid grid-cols-4 gap-1.5">
        {(['webp', 'avif', 'png', 'jpg'] as OutputFormat[]).map(fmt => (
          <button key={fmt} onClick={() => apply(`fmt-${fmt}`, () => buildFormatConvertUrl({ publicId: pid, format: fmt, quality: 'auto' }), `→ ${fmt.toUpperCase()}`)} disabled={!!busy} className="py-1.5 rounded border border-editor-border text-xs font-mono text-editor-text hover:bg-editor-surface hover:border-accent/30 uppercase disabled:opacity-40">
            {fmt}
          </button>
        ))}
      </div>

      <div className="border-t border-editor-border pt-2 mt-2" />
      <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-1">Text Watermark</div>
      <Row label="Text">
        <input value={textContent} onChange={e => setTextContent(e.target.value)} className="w-full text-xs bg-editor-surface text-editor-text border border-editor-border rounded px-2 py-1 focus:outline-none focus:border-accent/60" />
      </Row>
      <Row label="Font">
        <MiniSelect<string> value={textFont} options={[
          { value: 'Arial', label: 'Arial' }, { value: 'Georgia', label: 'Georgia' },
          { value: 'Roboto', label: 'Roboto' }, { value: 'Open Sans', label: 'Open Sans' },
          { value: 'Verdana', label: 'Verdana' },
        ]} onChange={setTextFont} />
      </Row>
      <Row label="Size">   <MiniSlider value={textSize}    min={12} max={200} onChange={setTextSize}    /></Row>
      <Row label="Opacity"><MiniSlider value={textOpacity} min={10} max={100} onChange={setTextOpacity} /></Row>
      <Row label="Color">
        <div className="flex items-center gap-2">
          <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} className="w-7 h-7 rounded border border-editor-border cursor-pointer bg-transparent" />
          <span className="text-xs font-mono text-editor-muted">{textColor}</span>
        </div>
      </Row>
      <Row label="Position">
        <MiniSelect<GravityMode> value={textGravity} options={GRAVITY_OPTIONS} onChange={setTextGravity} />
      </Row>
      <button onClick={() => apply('text-wm', () => buildTextOverlayUrl({ publicId: pid, text: textContent, font: textFont, fontSize: textSize, color: textColor, opacity: textOpacity, gravity: textGravity }), 'Add watermark')} disabled={!!busy || !textContent.trim()} className="w-full py-1.5 rounded-lg border border-editor-border text-xs text-editor-text hover:bg-editor-surface hover:border-accent/30 transition-all disabled:opacity-40">
        Add Watermark
      </button>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main CloudinaryPanel
// ─────────────────────────────────────────────────────────────────────────────

export function CloudinaryPanel() {
  const { getSelectedLayers } = useEditorStore()
  const [activeTab, setActiveTab] = useState<Tab>('filters')

  const config = getCloudinaryConfig()
  const selectedLayers = getSelectedLayers()
  const imageLayer = selectedLayers.find(l => l.type === 'image') as ImageLayer | undefined

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div className="px-3 py-2 border-b border-editor-border shrink-0">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-4 h-4 rounded flex items-center justify-center bg-accent/20">
            <Wand2 className="w-2.5 h-2.5 text-accent" />
          </div>
          <span className="text-xs font-semibold text-editor-text">Image Tools</span>
          <span className={cn(
            'ml-auto text-xs px-1.5 py-0.5 rounded-full font-medium',
            config.isConfigured ? 'bg-success/15 text-success' : 'bg-editor-surface text-editor-muted',
          )}>
            {config.isConfigured ? 'Cloud ✓' : 'Local only'}
          </span>
        </div>
        {/* Tab strip */}
        <div className="flex gap-0.5">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-md text-xs transition-all',
                activeTab === tab.id ? 'bg-accent text-white' : 'text-editor-muted hover:text-editor-text hover:bg-editor-surface',
              )}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span style={{ fontSize: 9 }}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {!config.isConfigured ? (
          <NotConfigured />
        ) : !imageLayer ? (
          <NoImageSelected />
        ) : !imageLayer.cloudinaryPublicId ? (
          <div className="p-4">
            <div className="flex items-start gap-3 p-3 rounded-lg border border-editor-border bg-editor-surface">
              <AlertCircle className="w-4 h-4 text-editor-muted shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-editor-text">Local image only</p>
                <p className="text-xs text-editor-muted mt-1 leading-relaxed">
                  Re-upload via the Uploads panel to enable cloud-powered filters and tools.
                </p>
              </div>
            </div>
          </div>
        ) : activeTab === 'filters' ? (
          <FiltersTab image={imageLayer} />
        ) : activeTab === 'adjust' ? (
          <AdjustTab image={imageLayer} />
        ) : (
          <OptimizeTab image={imageLayer} />
        )}
      </div>
    </div>
  )
}


import { useState } from 'react'
import { ChevronDown, ChevronRight, RotateCcw } from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import type { Layer, ImageLayer, TextLayer, ShapeLayer, BackgroundLayer, BackgroundFill } from '@/types'
import { PropertySlider } from '@/components/ui/Slider'
import { PopoverColorPicker } from '@/components/ui/ColorPicker'
import { defaultAdjustments, defaultEffects } from '@/types'
import { FONTS, loadGoogleFont } from '@/data/fonts'
import { cn } from '@/utils'

// ============================================================
// Section wrapper
// ============================================================

interface SectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
}

function Section({ title, children, defaultOpen = true }: SectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-editor-border">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold uppercase tracking-widest text-editor-muted hover:text-editor-text transition-colors"
      >
        {title}
        {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {children}
        </div>
      )}
    </div>
  )
}

// ============================================================
// Numeric input
// ============================================================

interface NumericInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  width?: string
}

function NumericInput({ label, value, onChange, min, max, step = 1, unit = '', width = 'w-16' }: NumericInputProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-editor-muted w-20 shrink-0">{label}</span>
      <div className="flex items-center gap-1">
        <input
          type="number"
          value={Math.round(value * 100) / 100}
          onChange={e => onChange(Number(e.target.value))}
          min={min}
          max={max}
          step={step}
          className={cn('bg-editor-surface text-editor-text text-xs px-1.5 py-1 rounded border border-editor-border focus:outline-none focus:border-accent/60 font-mono', width)}
        />
        {unit && <span className="text-xs text-editor-muted">{unit}</span>}
      </div>
    </div>
  )
}

// ============================================================
// Transform section (common to all layers)
// ============================================================

interface TransformProps {
  layer: Layer
  onUpdate: (updates: Partial<Layer>) => void
}

function TransformSection({ layer, onUpdate }: TransformProps) {
  return (
    <Section title="Transform">
      <div className="grid grid-cols-2 gap-2">
        <NumericInput label="X" value={layer.x} onChange={x => onUpdate({ x })} step={1} unit="px" width="w-14" />
        <NumericInput label="Y" value={layer.y} onChange={y => onUpdate({ y })} step={1} unit="px" width="w-14" />
        <NumericInput label="W" value={layer.width} onChange={width => onUpdate({ width })} min={1} unit="px" width="w-14" />
        <NumericInput label="H" value={layer.height} onChange={height => onUpdate({ height })} min={1} unit="px" width="w-14" />
      </div>
      <PropertySlider
        label="Rotation"
        value={layer.rotation}
        min={-180}
        max={180}
        step={1}
        onChange={rotation => onUpdate({ rotation })}
        unit="°"
      />
      <PropertySlider
        label="Opacity"
        value={layer.opacity}
        min={0}
        max={100}
        step={1}
        onChange={opacity => onUpdate({ opacity })}
        unit="%"
      />
    </Section>
  )
}

// ============================================================
// Image properties
// ============================================================

function ImageProperties({ layer, onUpdate }: { layer: ImageLayer; onUpdate: (u: Partial<ImageLayer>) => void }) {
  const adj = layer.adjustments
  const effects = layer.effects
  const { setActiveTool, activeTool } = useEditorStore()
  const isCropping = activeTool === 'crop'

  return (
    <>
      <TransformSection layer={layer} onUpdate={onUpdate as (u: Partial<Layer>) => void} />

      {/* Image specific */}
      <Section title="Image">
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => onUpdate({ flipX: !layer.flipX })}
            className={cn('flex-1 py-1.5 text-xs rounded border transition-colors', layer.flipX ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted hover:text-editor-text')}
          >
            Flip H
          </button>
          <button
            onClick={() => onUpdate({ flipY: !layer.flipY })}
            className={cn('flex-1 py-1.5 text-xs rounded border transition-colors', layer.flipY ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted hover:text-editor-text')}
          >
            Flip V
          </button>
        </div>

        {/* Crop */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setActiveTool(isCropping ? 'select' : 'crop')}
            className={cn(
              'flex-1 py-1.5 text-xs rounded border transition-colors flex items-center justify-center gap-1.5',
              isCropping
                ? 'border-accent text-accent bg-accent/10'
                : 'border-editor-border text-editor-muted hover:text-editor-text'
            )}
          >
            ✂ {isCropping ? 'Exit Crop' : 'Crop Image'}
          </button>
          {layer.crop && (
            <button
              onClick={() => onUpdate({ crop: null })}
              className="px-2 py-1.5 text-xs rounded border border-editor-border text-editor-muted hover:text-editor-text transition-colors"
              title="Clear crop"
            >
              ✕ Clear
            </button>
          )}
        </div>
        {layer.crop && (
          <div className="text-xs text-editor-muted bg-editor-surface rounded px-2 py-1.5 mb-2">
            Crop: {Math.round(layer.crop.width)}×{Math.round(layer.crop.height)}px at ({Math.round(layer.crop.x)}, {Math.round(layer.crop.y)})
          </div>
        )}
        <NumericInput
          label="Corner Radius"
          value={layer.cornerRadius}
          onChange={cornerRadius => onUpdate({ cornerRadius })}
          min={0}
          max={500}
          unit="px"
        />
      </Section>

      <Section title="Adjustments" defaultOpen={false}>
        <PropertySlider label="Brightness" value={adj.brightness} min={-100} max={100} onChange={v => onUpdate({ adjustments: { ...adj, brightness: v } })} />
        <PropertySlider label="Contrast" value={adj.contrast} min={-100} max={100} onChange={v => onUpdate({ adjustments: { ...adj, contrast: v } })} />
        <PropertySlider label="Saturation" value={adj.saturation} min={-100} max={100} onChange={v => onUpdate({ adjustments: { ...adj, saturation: v } })} />
        <PropertySlider label="Exposure" value={adj.exposure} min={-100} max={100} onChange={v => onUpdate({ adjustments: { ...adj, exposure: v } })} />
        <PropertySlider label="Sharpness" value={adj.sharpness} min={0} max={100} onChange={v => onUpdate({ adjustments: { ...adj, sharpness: v } })} />
        <PropertySlider label="Blur" value={adj.blur} min={0} max={50} onChange={v => onUpdate({ adjustments: { ...adj, blur: v } })} />
        <PropertySlider label="Temperature" value={adj.temperature} min={-100} max={100} onChange={v => onUpdate({ adjustments: { ...adj, temperature: v } })} />
        <PropertySlider label="Sepia" value={adj.sepia} min={0} max={100} onChange={v => onUpdate({ adjustments: { ...adj, sepia: v } })} />
        <div className="flex items-center justify-between">
          <span className="text-xs text-editor-muted">Grayscale</span>
          <button
            onClick={() => onUpdate({ adjustments: { ...adj, grayscale: !adj.grayscale } })}
            className={cn(
              'relative w-8 h-4 rounded-full transition-colors',
              adj.grayscale ? 'bg-accent' : 'bg-editor-surface'
            )}
          >
            <div className={cn('absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform', adj.grayscale ? 'translate-x-4' : 'translate-x-0.5')} />
          </button>
        </div>
        <button
          onClick={() => onUpdate({ adjustments: { ...defaultAdjustments } })}
          className="flex items-center gap-1.5 text-xs text-editor-muted hover:text-editor-text transition-colors mt-1"
        >
          <RotateCcw className="w-3 h-3" />
          Reset adjustments
        </button>
      </Section>

      <Section title="Effects" defaultOpen={false}>
        <PropertySlider label="Vignette" value={effects.vignette} min={0} max={100} onChange={v => onUpdate({ effects: { ...effects, vignette: v } })} />
        <PropertySlider label="Pixelate" value={effects.pixelate} min={0} max={50} onChange={v => onUpdate({ effects: { ...effects, pixelate: v } })} />
        <PropertySlider label="Noise" value={effects.noise} min={0} max={100} onChange={v => onUpdate({ effects: { ...effects, noise: v } })} />
      </Section>
    </>
  )
}

// ============================================================
// Text properties
// ============================================================

function TextProperties({ layer, onUpdate }: { layer: TextLayer; onUpdate: (u: Partial<TextLayer>) => void }) {
  const style = layer.style
  const WEIGHTS = [300, 400, 500, 600, 700, 800]

  const [fontSearch, setFontSearch] = useState('')
  const filteredFonts = FONTS.filter(f =>
    f.name.toLowerCase().includes(fontSearch.toLowerCase())
  )

  return (
    <>
      <TransformSection layer={layer} onUpdate={onUpdate as (u: Partial<Layer>) => void} />
      <Section title="Text">
        <div className="mb-2">
          <textarea
            value={layer.text}
            onChange={e => onUpdate({ text: e.target.value })}
            rows={3}
            className="w-full bg-editor-surface text-editor-text text-xs px-2 py-1.5 rounded border border-editor-border focus:outline-none focus:border-accent/60 resize-none"
          />
        </div>
      </Section>
      <Section title="Typography">
        <div className="mb-2">
          <span className="text-xs text-editor-muted block mb-1">Font</span>
          <input
            type="text"
            placeholder="Search fonts…"
            value={fontSearch}
            onChange={e => setFontSearch(e.target.value)}
            className="w-full bg-editor-surface text-editor-text text-xs px-2 py-1 rounded border border-editor-border focus:outline-none focus:border-accent/60 mb-1"
          />
          <select
            value={style.fontFamily}
            onChange={e => {
              const font = FONTS.find(f => f.family === e.target.value)
              if (font) loadGoogleFont(font.family, font.weights)
              onUpdate({ style: { ...style, fontFamily: e.target.value } })
            }}
            className="w-full bg-editor-surface text-editor-text text-xs px-2 py-1.5 rounded border border-editor-border focus:outline-none"
            style={{ fontFamily: style.fontFamily }}
          >
            {filteredFonts.map(f => (
              <option key={f.name} value={f.family} style={{ fontFamily: f.family }}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <NumericInput label="Size" value={style.fontSize} onChange={v => onUpdate({ style: { ...style, fontSize: v } })} min={1} max={500} unit="px" />
        <div className="mb-2">
          <span className="text-xs text-editor-muted block mb-1">Weight</span>
          <div className="flex flex-wrap gap-1">
            {WEIGHTS.map(w => (
              <button
                key={w}
                onClick={() => onUpdate({ style: { ...style, fontWeight: w as TextLayer['style']['fontWeight'] } })}
                className={cn('px-2 py-1 text-xs rounded border', style.fontWeight === w ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted')}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {[
            { label: 'I', title: 'Italic', active: style.italic, action: () => onUpdate({ style: { ...style, italic: !style.italic } }) },
            { label: 'U', title: 'Underline', active: style.underline, action: () => onUpdate({ style: { ...style, underline: !style.underline } }) },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              title={btn.title}
              className={cn('w-8 h-8 text-sm rounded border', btn.active ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted')}
            >
              {btn.label}
            </button>
          ))}
          <div className="flex items-center gap-1">
            {(['left', 'center', 'right'] as const).map(align => (
              <button
                key={align}
                onClick={() => onUpdate({ style: { ...style, align } })}
                className={cn('w-8 h-8 text-xs rounded border', style.align === align ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted')}
              >
                {align[0].toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <PopoverColorPicker label="Color" value={style.color} onChange={c => onUpdate({ style: { ...style, color: c } })} />
        <PropertySlider label="Line Height" value={Math.round(style.lineHeight * 100)} min={50} max={300} onChange={v => onUpdate({ style: { ...style, lineHeight: v / 100 } })} />
        <PropertySlider label="Spacing" value={style.letterSpacing} min={-10} max={50} onChange={v => onUpdate({ style: { ...style, letterSpacing: v } })} unit="px" />
      </Section>
    </>
  )
}

// ============================================================
// Shape properties
// ============================================================

function ShapeProperties({ layer, onUpdate }: { layer: ShapeLayer; onUpdate: (u: Partial<ShapeLayer>) => void }) {
  const s = layer.style
  return (
    <>
      <TransformSection layer={layer} onUpdate={onUpdate as (u: Partial<Layer>) => void} />
      <Section title="Fill & Stroke">
        <PopoverColorPicker label="Fill" value={s.fill} onChange={fill => onUpdate({ style: { ...s, fill } })} />
        <PopoverColorPicker label="Stroke" value={s.stroke} onChange={stroke => onUpdate({ style: { ...s, stroke } })} />
        <PropertySlider label="Stroke width" value={s.strokeWidth} min={0} max={50} onChange={strokeWidth => onUpdate({ style: { ...s, strokeWidth } })} unit="px" />
        <PropertySlider label="Corner radius" value={s.cornerRadius} min={0} max={500} onChange={cornerRadius => onUpdate({ style: { ...s, cornerRadius } })} unit="px" />
      </Section>
    </>
  )
}

// ============================================================
// Background properties
// ============================================================

function BackgroundProperties({ layer, onUpdate }: { layer: BackgroundLayer; onUpdate: (u: Partial<BackgroundLayer>) => void }) {
  const fill = layer.fill

  return (
    <Section title="Background">
      <div className="flex gap-1.5 mb-3">
        {(['solid', 'gradient', 'transparent'] as const).map(type => (
          <button
            key={type}
            onClick={() => {
              if (type === 'solid') onUpdate({ fill: { type: 'solid', color: '#ffffff' } })
              else if (type === 'transparent') onUpdate({ fill: { type: 'transparent' } })
              else if (type === 'gradient') onUpdate({ fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#6c47ff' }, { offset: 1, color: '#1a1917' }] } } })
            }}
            className={cn(
              'flex-1 py-1 text-xs rounded border capitalize',
              fill.type === type ? 'border-accent text-accent bg-accent/10' : 'border-editor-border text-editor-muted'
            )}
          >
            {type}
          </button>
        ))}
      </div>

      {fill.type === 'solid' && (
        <PopoverColorPicker label="Color" value={fill.color} onChange={color => onUpdate({ fill: { ...fill, color } })} />
      )}
      {fill.type === 'gradient' && (
        <div className="space-y-2">
          <PopoverColorPicker label="Start" value={fill.gradient.stops[0].color} onChange={color => {
            const stops = [...fill.gradient.stops]; stops[0] = { ...stops[0], color }
            onUpdate({ fill: { ...fill, gradient: { ...fill.gradient, stops } } })
          }} />
          <PopoverColorPicker label="End" value={fill.gradient.stops[1]?.color ?? '#000'} onChange={color => {
            const stops = [...fill.gradient.stops]; stops[1] = { ...stops[1], color }
            onUpdate({ fill: { ...fill, gradient: { ...fill.gradient, stops } } })
          }} />
          <PropertySlider label="Angle" value={fill.gradient.angle} min={0} max={360} onChange={angle => onUpdate({ fill: { ...fill, gradient: { ...fill.gradient, angle } } })} unit="°" />
        </div>
      )}
      {fill.type === 'transparent' && (
        <p className="text-xs text-editor-muted">Transparent background. Export as PNG to preserve transparency.</p>
      )}
    </Section>
  )
}

// ============================================================
// Empty state
// ============================================================

function NoSelection() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-10 h-10 rounded-lg bg-editor-surface flex items-center justify-center mb-3">
        <svg className="w-5 h-5 text-editor-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path d="M15 3h6v6M14 10l6.1-6.1M9 21H3v-6M10 14l-6.1 6.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
      <p className="text-sm font-medium text-editor-muted">Nothing selected</p>
      <p className="text-xs text-editor-muted/60 mt-1">Click an element on the canvas to edit its properties.</p>
    </div>
  )
}

// ============================================================
// Properties Panel
// ============================================================

export function PropertiesPanel() {
  const { getSelectedLayers, updateLayer } = useEditorStore()
  const selected = getSelectedLayers()

  if (selected.length === 0) {
    return (
      <aside className="w-72 bg-editor-panel border-l border-editor-border flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-editor-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Properties</span>
        </div>
        <NoSelection />
      </aside>
    )
  }

  if (selected.length > 1) {
    return (
      <aside className="w-72 bg-editor-panel border-l border-editor-border flex flex-col shrink-0">
        <div className="px-3 py-2 border-b border-editor-border">
          <span className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Properties</span>
        </div>
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-sm text-editor-muted">{selected.length} layers selected</p>
        </div>
      </aside>
    )
  }

  const layer = selected[0]
  const update = (updates: Partial<Layer>) => updateLayer(layer.id, updates)

  return (
    <aside className="w-72 bg-editor-panel border-l border-editor-border flex flex-col shrink-0 overflow-y-auto">
      <div className="px-3 py-2 border-b border-editor-border flex items-center justify-between shrink-0">
        <span className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Properties</span>
        <span className="text-xs text-editor-muted capitalize">{layer.type}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {layer.type === 'image' && (
          <ImageProperties layer={layer} onUpdate={update as (u: Partial<ImageLayer>) => void} />
        )}
        {layer.type === 'text' && (
          <TextProperties layer={layer} onUpdate={update as (u: Partial<TextLayer>) => void} />
        )}
        {layer.type === 'shape' && (
          <ShapeProperties layer={layer} onUpdate={update as (u: Partial<ShapeLayer>) => void} />
        )}
        {layer.type === 'background' && (
          <BackgroundProperties layer={layer} onUpdate={update as (u: Partial<BackgroundLayer>) => void} />
        )}
      </div>
    </aside>
  )
}

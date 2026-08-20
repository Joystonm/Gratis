import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, ChevronLeft, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CANVAS_PRESETS, PRESET_CATEGORIES } from '@/data/presets'
import { TEMPLATES } from '@/data/templates'
import type { Project, Layer, BackgroundLayer } from '@/types'
import { generateId } from '@/utils'
import { useProjectStore } from '@/stores/projectStore'
import { cn } from '@/utils'

function createBlankProject(width: number, height: number, name: string, templateId?: string): Project {
  const bgLayer: BackgroundLayer = {
    id: generateId(),
    type: 'background',
    name: 'Background',
    x: 0, y: 0, width, height,
    rotation: 0, opacity: 100, visible: true, locked: true,
    blendMode: 'normal', scaleX: 1, scaleY: 1,
    fill: { type: 'solid', color: '#ffffff' },
  }

  return {
    id: generateId(),
    name,
    width,
    height,
    unit: 'px',
    dpi: 72,
    layers: [bgLayer],
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: null,
    template: templateId ?? null,
  }
}

function PresetGrid() {
  const navigate = useNavigate()
  const { saveProject } = useProjectStore()
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customWidth, setCustomWidth] = useState(800)
  const [customHeight, setCustomHeight] = useState(600)
  const [designName, setDesignName] = useState('Untitled Design')

  const filteredPresets = activeCategory === 'All'
    ? CANVAS_PRESETS
    : CANVAS_PRESETS.filter(p => p.category === activeCategory)

  const handleCreate = async (presetId?: string) => {
    let width = customWidth
    let height = customHeight
    let name = designName

    if (presetId) {
      const preset = CANVAS_PRESETS.find(p => p.id === presetId)
      if (preset) {
        width = preset.width
        height = preset.height
        name = name || preset.name
      }
    }

    const project = createBlankProject(width, height, name)
    await saveProject(project)
    navigate(`/editor/${project.id}`)
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Design name */}
      <div>
        <label className="block text-sm font-medium text-ink mb-2">Design name</label>
        <input
          type="text"
          value={designName}
          onChange={e => setDesignName(e.target.value)}
          className="w-full max-w-xs h-10 px-3 rounded-md border border-hairline-strong bg-surface-card text-ink text-sm focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
          placeholder="Untitled Design"
        />
      </div>

      {/* Category filter */}
      <div>
        <div className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Canvas size</div>
        <div className="flex flex-wrap gap-2 mb-6">
          {PRESET_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium transition-colors border',
                activeCategory === cat
                  ? 'bg-accent text-white border-accent'
                  : 'border-hairline text-body hover:border-hairline-strong hover:text-ink bg-surface-card'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Preset grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {filteredPresets.map(preset => {
            const isSelected = selectedPreset === preset.id
            const isCustom = preset.id === 'custom'
            const ar = preset.width / preset.height
            const previewW = Math.min(80, 80 * Math.min(ar, 1))
            const previewH = Math.min(80, 80 / Math.max(ar, 1))

            return (
              <button
                key={preset.id}
                onClick={() => {
                  if (isCustom) {
                    setSelectedPreset('custom')
                  } else {
                    setSelectedPreset(preset.id)
                    handleCreate(preset.id)
                  }
                }}
                className={cn(
                  'relative group flex flex-col items-center gap-3 p-4 rounded-xl border transition-all text-left hover:border-accent/40 hover:shadow-sm',
                  isSelected ? 'border-accent bg-accent-subtle' : 'border-hairline bg-surface-card'
                )}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}

                {/* Aspect ratio preview */}
                <div className="flex items-center justify-center h-16 w-full">
                  <div
                    className={cn(
                      'rounded border-2',
                      isSelected ? 'border-accent bg-accent/10' : 'border-hairline-strong bg-surface-strong'
                    )}
                    style={{ width: previewW, height: previewH }}
                  />
                </div>

                <div className="text-center">
                  <div className="text-sm font-medium text-ink leading-tight">{preset.name}</div>
                  {!isCustom && (
                    <div className="text-xs text-muted mt-0.5">
                      {preset.width} × {preset.height}
                    </div>
                  )}
                  {preset.description && (
                    <div className="text-xs text-muted-soft mt-0.5">{preset.description}</div>
                  )}
                </div>
              </button>
            )
          })}
        </div>

        {/* Custom size inputs */}
        {selectedPreset === 'custom' && (
          <div className="mt-6 p-4 rounded-xl border border-accent/30 bg-accent-subtle">
            <div className="text-sm font-semibold text-ink mb-4">Custom canvas size</div>
            <div className="flex items-center gap-4">
              <div>
                <label className="text-xs text-muted mb-1 block">Width (px)</label>
                <input
                  type="number"
                  value={customWidth}
                  onChange={e => setCustomWidth(Number(e.target.value))}
                  min={1}
                  max={8000}
                  className="w-24 h-9 px-3 rounded-md border border-hairline-strong bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <span className="text-muted mt-4">×</span>
              <div>
                <label className="text-xs text-muted mb-1 block">Height (px)</label>
                <input
                  type="number"
                  value={customHeight}
                  onChange={e => setCustomHeight(Number(e.target.value))}
                  min={1}
                  max={8000}
                  className="w-24 h-9 px-3 rounded-md border border-hairline-strong bg-white text-sm text-ink focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button
                variant="primary"
                size="sm"
                className="mt-4"
                onClick={() => handleCreate()}
              >
                Create
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TemplateStartSection() {
  const navigate = useNavigate()
  const { saveProject } = useProjectStore()

  const handleFromTemplate = async (templateId: string) => {
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
    navigate(`/editor/${project.id}`)
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-muted mb-4">Or start from a template</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {TEMPLATES.slice(0, 6).map(t => (
          <button
            key={t.id}
            onClick={() => handleFromTemplate(t.id)}
            className="group flex flex-col rounded-xl overflow-hidden border border-hairline hover:border-accent/40 hover:shadow-sm transition-all text-left bg-surface-card"
          >
            <div className="aspect-[4/3] bg-gradient-to-br from-accent-subtle to-surface-strong flex items-center justify-center">
              <span className="text-xs text-muted font-medium">{t.width}×{t.height}</span>
            </div>
            <div className="px-3 py-2">
              <div className="text-sm font-medium text-ink truncate">{t.name}</div>
              <div className="text-xs text-muted mt-0.5">{t.category}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

export function CreateDesignPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-canvas border-b border-hairline sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-body hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-4 w-px bg-hairline" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-ink">New Design</span>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            My Projects
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-10">
          <h1 className="text-3xl font-normal text-ink tracking-tight mb-2">Create new design</h1>
          <p className="text-body">Choose a canvas size or start from a template.</p>
        </div>

        <div className="space-y-12">
          <PresetGrid />
          <div className="border-t border-hairline pt-12">
            <TemplateStartSection />
          </div>
        </div>
      </main>
    </div>
  )
}

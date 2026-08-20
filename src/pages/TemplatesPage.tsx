import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Plus, ChevronLeft, Search, ArrowRight } from 'lucide-react'
import { TEMPLATES, TEMPLATE_CATEGORIES, type TemplateWithPreview } from '@/data/templates'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'
import { generateId } from '@/utils'
import type { Project, Layer } from '@/types'

// ─── Visual template preview (renders an approximation using CSS) ─────────────

function TemplatePreviewCard({ template, onClick }: { template: TemplateWithPreview; onClick: () => void }) {
  const { preview } = template
  const isPortrait = template.height > template.width
  const isWide = template.width / template.height > 2

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer rounded-xl overflow-hidden border border-hairline hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10 transition-all duration-200 bg-surface-card"
    >
      {/* Preview area */}
      <div
        className={cn(
          'relative overflow-hidden flex items-center justify-center',
          isPortrait ? 'aspect-[3/4]' : isWide ? 'aspect-[21/9]' : 'aspect-[4/3]'
        )}
        style={{ background: preview.bg }}
      >
        {/* Decorative shapes that hint at the template layout */}
        <TemplateVisualHint template={template} />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
            <div className="bg-accent text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg flex items-center gap-1.5">
              Use Template
              <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Category badge */}
        <div className="absolute top-2 left-2">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-sm text-white/90">
            {template.category}
          </span>
        </div>
      </div>

      {/* Info row */}
      <div className="px-3 py-2.5">
        <div className="text-sm font-medium text-ink truncate">{template.name}</div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-muted font-mono">{template.width}×{template.height}</span>
          <div className="flex gap-1">
            {template.tags.slice(0, 2).map(tag => (
              <span key={tag} className="text-xs bg-surface-strong text-muted-soft px-1.5 py-0.5 rounded">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── CSS-rendered preview hint per template style ────────────────────────────

function TemplateVisualHint({ template }: { template: TemplateWithPreview }) {
  const { preview, id } = template
  const accent = preview.accentColor
  const text = preview.textColor

  // Each template gets a unique visual composition hint
  const hints: Record<string, JSX.Element> = {

    'template-bold-social': (
      <>
        <div className="absolute top-4 right-4 w-28 h-28 rounded-full opacity-20" style={{ background: text }} />
        <div className="absolute bottom-6 left-4 w-16 h-16 rounded-full opacity-10" style={{ background: text }} />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-1.5">
          <div className="w-6 h-0.5 rounded" style={{ background: text }} />
          <div className="w-28 h-4 rounded font-bold text-xs flex items-center pl-1" style={{ color: text, fontSize: 9, lineHeight: 1 }}>MAKE YOUR</div>
          <div className="w-28 h-4 rounded font-bold text-xs flex items-center pl-1" style={{ color: text, fontSize: 9, lineHeight: 1 }}>MARK.</div>
          <div className="w-24 h-2 rounded opacity-60" style={{ background: text }} />
          <div className="mt-2 w-20 h-5 rounded-full border opacity-70 flex items-center justify-center text-xs" style={{ borderColor: text, color: text, fontSize: 7 }}>✦ GRATIS DESIGN</div>
        </div>
      </>
    ),

    'template-minimal-light': (
      <>
        <div className="absolute left-3 top-4 w-0.5 h-16 rounded" style={{ background: accent }} />
        <div className="absolute right-4 top-3 text-right opacity-5 font-bold leading-none" style={{ color: '#1a1917', fontSize: 72 }}>01</div>
        <div className="absolute left-6 top-4 space-y-1 mt-1">
          <div className="text-xs font-semibold" style={{ color: accent, fontSize: 7, letterSpacing: 2 }}>DESIGN SHOWCASE</div>
        </div>
        <div className="absolute left-6 top-1/3 space-y-0.5">
          <div className="font-light" style={{ color: text, fontSize: 18, letterSpacing: -0.5, lineHeight: 1.1 }}>Less</div>
          <div className="font-light" style={{ color: text, fontSize: 18, letterSpacing: -0.5, lineHeight: 1.1 }}>Noise.</div>
        </div>
        <div className="absolute bottom-4 left-6 right-6 h-px opacity-30" style={{ background: text }} />
      </>
    ),

    'template-neon-glow': (
      <>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full opacity-15" style={{ background: accent, filter: 'blur(20px)' }} />
        </div>
        <div className="absolute left-4 top-1/3 space-y-0.5">
          <div className="w-10 h-0.5" style={{ background: accent }} />
          <div className="font-black" style={{ color: '#fff', fontSize: 22, lineHeight: 0.9, letterSpacing: -0.5 }}>FUTURE</div>
          <div className="font-black" style={{ color: '#fff', fontSize: 22, lineHeight: 0.9, letterSpacing: -0.5 }}>IS NOW</div>
        </div>
        <div className="absolute bottom-4 right-4 w-12 h-12 rounded-full border" style={{ borderColor: accent, opacity: 0.5 }} />
      </>
    ),

    'template-quote-card': (
      <>
        <div className="absolute top-2 left-2 w-4 h-0.5" style={{ background: accent }} />
        <div className="absolute top-2 left-2 w-0.5 h-4" style={{ background: accent }} />
        <div className="absolute bottom-2 right-2 w-4 h-0.5" style={{ background: accent }} />
        <div className="absolute bottom-2 right-2 w-0.5 h-4" style={{ background: accent }} />
        <div className="absolute left-4 top-4 opacity-20 font-serif font-bold" style={{ color: accent, fontSize: 48, lineHeight: 1 }}>"</div>
        <div className="absolute left-4 right-4 top-1/3 italic text-center" style={{ color: text, fontSize: 8, lineHeight: 1.4 }}>
          Design is not just what it looks like. Design is how it works.
        </div>
        <div className="absolute bottom-6 left-4 flex items-center gap-1">
          <div className="w-4 h-0.5" style={{ background: accent }} />
          <span style={{ color: accent, fontSize: 7 }}>— Steve Jobs</span>
        </div>
      </>
    ),

    'template-youtube-thumb': (
      <>
        <div className="absolute left-0 top-0 bottom-0 w-1" style={{ background: accent }} />
        <div className="absolute left-3 top-2 font-black" style={{ color: accent, fontSize: 28, lineHeight: 1, letterSpacing: -1, textShadow: `0 0 12px ${accent}` }}>10X</div>
        <div className="absolute left-3 bottom-4 space-y-0.5">
          <div className="font-bold text-white" style={{ fontSize: 9, lineHeight: 1 }}>GROWTH</div>
          <div className="font-bold text-white" style={{ fontSize: 9, lineHeight: 1 }}>STRATEGIES</div>
          <div className="font-bold text-white" style={{ fontSize: 9, lineHeight: 1 }}>THAT WORK</div>
        </div>
        <div className="absolute right-3 top-3 bottom-3 w-14 rounded border opacity-20" style={{ borderColor: accent }} />
      </>
    ),

    'template-youtube-tutorial': (
      <>
        <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center" style={{ background: accent }}>
          <div className="font-bold text-white" style={{ fontSize: 14, lineHeight: 1.1 }}>How<br />To Do<br />This</div>
        </div>
        <div className="absolute left-1/3 right-0 top-3 pl-3 space-y-1">
          <div className="font-bold" style={{ color: '#1a1917', fontSize: 9 }}>Step-by-Step Guide</div>
          <div style={{ color: '#55534e', fontSize: 7, lineHeight: 1.4 }}>Everything you need<br />to know</div>
          <div className="mt-2 w-14 h-4 rounded-full flex items-center justify-center text-white" style={{ background: accent, fontSize: 6 }}>▶ Watch</div>
        </div>
      </>
    ),

    'template-product-ad': (
      <>
        <div className="absolute inset-0 flex">
          <div className="flex-1 p-3 flex flex-col justify-between">
            <div className="w-16 h-4 rounded-full flex items-center justify-center text-xs" style={{ background: '#f5c842', color: '#000', fontSize: 5, fontWeight: 700 }}>🚀 NEW LAUNCH</div>
            <div>
              <div className="font-black text-white" style={{ fontSize: 12, lineHeight: 1.0, letterSpacing: -0.3 }}>Introducing<br />Something<br />Amazing</div>
            </div>
            <div className="w-14 h-4 rounded flex items-center justify-center text-xs" style={{ background: '#f5c842', color: '#000', fontSize: 6, fontWeight: 700 }}>Shop Now →</div>
          </div>
          <div className="w-1/3 m-2 rounded border opacity-25 flex items-center justify-center" style={{ borderColor: 'rgba(255,255,255,0.4)' }}>
            <span className="text-white/40" style={{ fontSize: 8 }}>+ photo</span>
          </div>
        </div>
      </>
    ),

    'template-sale-banner': (
      <>
        <div className="absolute inset-0 flex items-center">
          <div className="pl-3">
            <div className="font-black text-white" style={{ fontSize: 40, lineHeight: 0.85, letterSpacing: -2 }}>50%</div>
            <div className="font-black opacity-25 text-white" style={{ fontSize: 12, letterSpacing: 4 }}>OFF</div>
          </div>
          <div className="ml-auto mr-3 flex flex-col gap-1">
            <div className="font-black text-white" style={{ fontSize: 12, letterSpacing: -0.5 }}>FLASH<br />SALE</div>
            <div className="text-white/70" style={{ fontSize: 6 }}>Use code: GRATIS50</div>
            <div className="w-16 h-4 rounded flex items-center justify-center text-xs font-bold" style={{ background: '#fff', color: '#e31b1b', fontSize: 6 }}>SHOP NOW</div>
          </div>
        </div>
      </>
    ),

    'template-dark-poster': (
      <>
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: accent }} />
        <div className="absolute inset-0 flex items-center justify-center opacity-8">
          <div className="w-24 h-24 rounded-full" style={{ background: accent }} />
        </div>
        <div className="absolute left-3 top-1/4">
          <div className="font-bold text-white" style={{ fontSize: 22, lineHeight: 0.9, letterSpacing: 1 }}>THE<br />EVENT</div>
        </div>
        <div className="absolute left-3 bottom-6">
          <div className="font-semibold" style={{ color: accent, fontSize: 6, letterSpacing: 2 }}>SOMETHING SPECTACULAR</div>
          <div className="mt-1 w-10 h-3 rounded flex items-center justify-center text-white" style={{ background: accent, fontSize: 5 }}>Tickets</div>
        </div>
      </>
    ),

    'template-magazine-cover': (
      <>
        <div className="absolute top-0 left-0 right-0 h-8 bg-black/50 flex items-center px-3">
          <span className="font-black" style={{ color: '#f5c842', fontSize: 11, letterSpacing: 4 }}>GRATIS</span>
        </div>
        <div className="absolute left-3 right-3 bottom-8">
          <div className="w-10 h-3 mb-1" style={{ background: '#f5c842' }} />
          <div className="font-bold text-white" style={{ fontSize: 12, lineHeight: 1.1 }}>The Future<br />of Design<br />Is Here</div>
        </div>
        <div className="absolute bottom-2 left-3 right-3 h-px bg-white/30" />
      </>
    ),

    'template-linkedin-post': (
      <>
        <div className="absolute inset-0 flex">
          <div className="w-2/5 h-full flex flex-col" style={{ background: '#f0ecff' }}>
            <div className="h-1 w-full" style={{ background: accent }} />
            <div className="p-2 flex-1 flex flex-col justify-between">
              <div className="flex items-center gap-1 mt-1">
                <div className="w-6 h-6 rounded-full" style={{ background: '#cbc9c0' }} />
                <div>
                  <div className="font-semibold" style={{ color: '#1a1917', fontSize: 6 }}>Your Name</div>
                  <div style={{ color: '#7e7b72', fontSize: 5 }}>Role · Company</div>
                </div>
              </div>
              <div>
                <div className="font-black" style={{ color: accent, fontSize: 22, letterSpacing: -1 }}>3x</div>
                <div style={{ color: '#55534e', fontSize: 6 }}>Faster Results</div>
              </div>
            </div>
          </div>
          <div className="flex-1 p-2 flex flex-col justify-between">
            <div style={{ color: accent, fontSize: 6, fontWeight: 600 }}>💡 Key Insight</div>
            <div className="font-bold" style={{ color: '#1a1917', fontSize: 13, lineHeight: 1.05, letterSpacing: -0.5 }}>Your<br />most<br />impactful<br />idea.</div>
            <div style={{ color: '#7e7b72', fontSize: 5 }}>#Design #Growth</div>
          </div>
        </div>
      </>
    ),

    'template-presentation-title': (
      <>
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <div className="w-40 h-40 rounded-full" style={{ background: accent }} />
        </div>
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-20 h-20 rounded-full border opacity-25" style={{ borderColor: accent }} />
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-start gap-2">
          <div className="w-0.5 h-16 rounded" style={{ background: accent }} />
          <div>
            <div className="font-bold text-white" style={{ fontSize: 13, lineHeight: 1.0, letterSpacing: -0.5 }}>Presentation<br />Title Slide</div>
            <div className="mt-1 opacity-50 text-white" style={{ fontSize: 6 }}>Subtitle · Author · Date</div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: accent }} />
      </>
    ),
  }

  return hints[id] ?? (
    <div className="flex flex-col items-center justify-center gap-1 text-center px-4">
      <div className="text-xs font-medium opacity-60" style={{ color: text }}>{template.width}×{template.height}</div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function TemplatesPage() {
  const navigate = useNavigate()
  const { saveProject } = useProjectStore()
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = TEMPLATES.filter(t => {
    const matchesSearch =
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase()) ||
      t.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeCategory === 'All' || t.category === activeCategory
    return matchesSearch && matchesCategory
  })

  async function useTemplate(templateId: string) {
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
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-canvas/95 backdrop-blur-sm border-b border-hairline sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1.5 text-sm text-body hover:text-ink transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Home
            </button>
            <div className="h-4 w-px bg-hairline" />
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-semibold text-ink">Templates</span>
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate('/create')}
          >
            Blank Canvas
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Page heading */}
        <div className="mb-8">
          <h1 className="text-4xl font-normal text-ink tracking-tight mb-2">Templates</h1>
          <p className="text-body text-lg">
            {TEMPLATES.length} professionally designed templates. Every element is fully editable.
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            <input
              type="text"
              placeholder="Search templates…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-hairline bg-surface-card text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  'px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all',
                  activeCategory === cat
                    ? 'bg-accent text-white border-accent shadow-sm shadow-accent/20'
                    : 'border-hairline text-body hover:border-accent/30 hover:text-ink bg-surface-card'
                )}
              >
                {cat}
                {cat !== 'All' && (
                  <span className={cn('ml-1.5 text-xs', activeCategory === cat ? 'text-white/70' : 'text-muted')}>
                    {TEMPLATES.filter(t => t.category === cat).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {search && (
          <p className="text-sm text-muted mb-4">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-14 h-14 rounded-xl bg-surface-strong flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6 text-muted" />
            </div>
            <h2 className="text-xl font-medium text-ink mb-2">No templates found</h2>
            <p className="text-body">Try a different search or browse all categories.</p>
            <button
              onClick={() => { setSearch(''); setActiveCategory('All') }}
              className="mt-4 text-sm text-accent hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(template => (
              <TemplatePreviewCard
                key={template.id}
                template={template}
                onClick={() => useTemplate(template.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

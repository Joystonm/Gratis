import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Sparkles, Layers, Download, Zap, Image as ImageIcon,
  Type, Shapes, Wand2, ArrowRight, Check,
  Layout, Palette
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

// ============================================================
// Section animations
// ============================================================

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
}

const stagger = {
  initial: {},
  whileInView: { transition: { staggerChildren: 0.08 } },
  viewport: { once: true, margin: '-60px' },
}

// ============================================================
// Navigation
// ============================================================

function Nav() {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-40 bg-canvas/90 backdrop-blur-sm border-b border-hairline-soft">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        {/* Logo */}
        <div className="flex items-center gap-2 select-none cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-ink tracking-tight">Gratis</span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-6">
          {[
            { label: 'Features', href: '#features' },
            { label: 'AI Tools', href: '#ai' },
            { label: 'Export', href: '#export' },
          ].map(link => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-body hover:text-ink transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
            Projects
          </Button>
          <Button variant="primary" size="sm" onClick={() => navigate('/create')}>
            Start Creating
          </Button>
        </div>
      </div>
    </header>
  )
}

// ============================================================
// Hero
// ============================================================

function Hero() {
  const navigate = useNavigate()
  return (
    <section className="relative overflow-hidden bg-canvas pt-20 pb-16 md:pt-32 md:pb-20">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-radial from-accent/8 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <motion.div {...fadeUp} className="inline-flex items-center gap-2 mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-subtle text-accent text-xs font-semibold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              Free · Forever
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl font-normal text-ink leading-[1.05] tracking-[-0.03em] mb-6"
          >
            Premium creative tools.{' '}
            <span className="text-accent">Zero paywall.</span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-lg md:text-xl text-body leading-relaxed max-w-2xl mx-auto mb-10"
          >
            Create, edit, transform, and export stunning images with professional tools
            and AI-powered editing — without locking essential features behind a subscription.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/create')}
            >
              Start Creating Free
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => navigate('/templates')}
            >
              Explore Templates
            </Button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-xs text-muted mt-4"
          >
            No account required. No credit card. Everything included.
          </motion.p>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Feature Cards
// ============================================================

interface FeatureCardProps {
  icon: typeof Sparkles
  title: string
  description: string
  accent?: boolean
}

function FeatureCard({ icon: Icon, title, description, accent }: FeatureCardProps) {
  return (
    <motion.div
      {...fadeUp}
      className={cn(
        'p-6 rounded-xl border transition-all duration-200 hover:shadow-sm',
        accent
          ? 'bg-accent-subtle border-accent/20'
          : 'bg-surface-card border-hairline'
      )}
    >
      <div className={cn(
        'w-10 h-10 rounded-lg flex items-center justify-center mb-4',
        accent ? 'bg-accent text-white' : 'bg-surface-strong text-ink'
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-ink mb-2">{title}</h3>
      <p className="text-sm text-body leading-relaxed">{description}</p>
    </motion.div>
  )
}

// ============================================================
// Features Section
// ============================================================

function FeaturesSection() {
  return (
    <section id="features" className="py-section bg-canvas">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div {...fadeUp} className="text-center mb-16">
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Features</span>
          <h2 className="text-4xl md:text-5xl font-normal text-ink tracking-tight leading-tight mb-4">
            Professional editing tools
          </h2>
          <p className="text-lg text-body max-w-xl mx-auto">
            Every tool you need. None of the subscription gates.
          </p>
        </motion.div>

        <motion.div {...stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={Layers}
            title="Layer-based editing"
            description="Full layer system with reordering, visibility, locking, and multi-selection."
            accent
          />
          <FeatureCard
            icon={ImageIcon}
            title="Professional image tools"
            description="Crop, resize, rotate, flip, adjust brightness, contrast, saturation, and more."
          />
          <FeatureCard
            icon={Type}
            title="Rich text system"
            description="Multiple fonts, weights, sizes, colors, effects, line height, and letter spacing."
          />
          <FeatureCard
            icon={Shapes}
            title="Shapes & elements"
            description="Rectangles, circles, arrows, polygons, stars with full fill, stroke, and shadow controls."
          />
          <FeatureCard
            icon={Palette}
            title="Color & effects"
            description="Advanced color picker, gradients, blending modes, vignette, noise, and duotone effects."
          />
          <FeatureCard
            icon={Layout}
            title="Canvas presets"
            description="25+ preset canvas sizes for social media, YouTube, print, web, and presentations."
          />
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// AI Tools Section
// ============================================================

function AIToolsSection() {
  const aiTools = [
    { icon: Wand2, title: 'Background Removal', desc: 'Remove backgrounds instantly with AI precision.' },
    { icon: Sparkles, title: 'AI Enhancement', desc: 'Upscale and enhance image quality automatically.' },
    { icon: Zap, title: 'Smart Crop', desc: 'Face and object-aware cropping via Cloudinary AI.' },
    { icon: ImageIcon, title: 'Generative Fill', desc: 'Extend images and fill areas with AI generation.' },
  ]

  return (
    <section id="ai" className="py-section bg-surface-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div {...fadeUp}>
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">AI Tools</span>
            <h2 className="text-4xl md:text-5xl font-normal text-ink tracking-tight leading-tight mb-4">
              AI-powered editing
            </h2>
            <p className="text-lg text-body mb-8 leading-relaxed">
              Powered by Cloudinary's AI capabilities and browser-based processing.
              Professional AI tools that used to cost extra are built right in.
            </p>
            <div className="flex flex-col gap-4">
              {aiTools.map(tool => (
                <div key={tool.title} className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg bg-accent-subtle flex items-center justify-center shrink-0">
                    <tool.icon className="w-4 h-4 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-ink">{tool.title}</div>
                    <div className="text-sm text-body mt-0.5">{tool.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp} className="relative">
            <div className="rounded-xl border border-hairline bg-editor-bg p-6 space-y-3">
              <div className="text-xs font-semibold uppercase tracking-widest text-editor-muted mb-4">
                ✨ AI Tools
              </div>
              {aiTools.map((tool, i) => (
                <div
                  key={tool.title}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border transition-all',
                    i === 0
                      ? 'bg-accent/10 border-accent/20 text-editor-text'
                      : 'bg-editor-surface border-editor-border text-editor-muted hover:border-accent/20'
                  )}
                >
                  <tool.icon className={cn('w-4 h-4', i === 0 ? 'text-accent' : '')} />
                  <span className="text-sm">{tool.title}</span>
                  {i === 0 && (
                    <span className="ml-auto text-xs bg-accent/20 text-accent px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Export Section
// ============================================================

function ExportSection() {
  return (
    <section id="export" className="py-section bg-surface-card">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Visual */}
          <motion.div {...fadeUp} className="order-2 lg:order-1">
            <div className="rounded-xl border border-hairline bg-canvas p-8 space-y-4">
              <div className="text-sm font-semibold text-ink mb-4">Export your design</div>
              {['PNG (lossless)', 'JPEG (high quality)', 'WebP (optimized)', 'PNG (transparent)'].map((fmt, i) => (
                <div key={fmt} className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border',
                  i === 0 ? 'border-accent/30 bg-accent-subtle' : 'border-hairline bg-surface-card'
                )}>
                  <Download className={cn('w-4 h-4', i === 0 ? 'text-accent' : 'text-muted')} />
                  <span className={cn('text-sm', i === 0 ? 'text-accent font-medium' : 'text-body')}>{fmt}</span>
                  {i === 0 && <Sparkles className="ml-auto w-3.5 h-3.5 text-accent" />}
                </div>
              ))}
              <Button variant="primary" fullWidth className="mt-4">
                Export Design
              </Button>
            </div>
          </motion.div>

          {/* Text */}
          <motion.div {...fadeUp} className="order-1 lg:order-2">
            <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Export</span>
            <h2 className="text-4xl md:text-5xl font-normal text-ink tracking-tight leading-tight mb-4">
              Export the actual canvas
            </h2>
            <p className="text-lg text-body mb-8 leading-relaxed">
              Gratis exports the real canvas composition, not a screenshot.
              Full resolution, multiple formats, quality control — no watermarks, ever.
            </p>
            <div className="space-y-3">
              {[
                'PNG, JPEG, WebP output formats',
                'Transparent PNG export',
                'Scale up to 3× resolution',
                'Quality control for JPEG/WebP',
                'No watermarks, ever',
              ].map(item => (
                <div key={item} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-sm text-body">{item}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

// ============================================================
// Everything Unlocked Section
// ============================================================

function EverythingSection() {
  const features = [
    'Professional layer editor', 'AI background removal', 'Cloudinary transformations',
    'Smart cropping', 'Advanced filters & effects', 'Text with full typography',
    'Shapes & elements', '25+ canvas presets', 'All export formats',
    'Project persistence', 'Template gallery', 'Asset library',
    'Undo / Redo history', 'Canvas zoom & pan', 'Real-time preview',
  ]

  return (
    <section className="py-section bg-ink">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div {...fadeUp}>
          <span className="text-xs font-semibold uppercase tracking-widest text-accent mb-3 block">Why Gratis</span>
          <h2 className="text-4xl md:text-5xl font-normal text-canvas tracking-tight mb-4">
            Everything included.
          </h2>
          <p className="text-lg text-canvas/60 max-w-xl mx-auto mb-12">
            Not a trial. Not a freemium tier. Everything you need is unlocked from day one.
          </p>
        </motion.div>

        <motion.div {...stagger} className="flex flex-wrap justify-center gap-3">
          {features.map(f => (
            <motion.div
              key={f}
              {...fadeUp}
              className="flex items-center gap-2 px-4 py-2 rounded-full border border-editor-border bg-editor-panel text-editor-text text-sm"
            >
              <Check className="w-3.5 h-3.5 text-accent shrink-0" />
              {f}
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// Final CTA
// ============================================================

function CtaSection() {
  const navigate = useNavigate()
  return (
    <section className="py-section bg-canvas border-t border-hairline">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div {...fadeUp}>
          <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-normal text-ink tracking-tight mb-4">
            Ready to create?
          </h2>
          <p className="text-lg text-body mb-8">
            Start with a blank canvas or pick from a template. No account needed.
          </p>
          <Button
            variant="primary"
            size="lg"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/create')}
          >
            Open Gratis — It's Free
          </Button>
        </motion.div>
      </div>
    </section>
  )
}

// ============================================================
// Footer
// ============================================================

function Footer() {
  return (
    <footer className="bg-canvas border-t border-hairline py-10">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
          <span className="text-sm font-semibold text-ink">Gratis</span>
          <span className="text-xs text-muted ml-2">Premium creative tools. Zero paywall.</span>
        </div>
        <div className="text-xs text-muted">
          Built with open-source tools. No trackers. No ads.
        </div>
      </div>
    </footer>
  )
}

// ============================================================
// Landing Page
// ============================================================

export function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas">
      <Nav />
      <Hero />
      <FeaturesSection />
      <AIToolsSection />
      <ExportSection />
      <EverythingSection />
      <CtaSection />
      <Footer />
    </div>
  )
}

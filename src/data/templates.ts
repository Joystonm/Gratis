import type { Template, Layer } from '@/types'
import { generateId } from '@/utils'

// ─── helper: no-shadow shorthand ────────────────────────────
const noShadow = { enabled: false, color: '#000', blur: 0, offsetX: 0, offsetY: 0, opacity: 0 }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const base = (id: string, type: Layer['type'], name: string, x: number, y: number, w: number, h: number): any => ({
  id, type, name, x, y, width: w, height: h,
  rotation: 0, opacity: 100, visible: true, locked: false,
  blendMode: 'normal', scaleX: 1, scaleY: 1,
})

// ─── visual preview config (used by TemplatesPage to render SVG previews) ───
export interface TemplatePreview {
  bg: string          // CSS background (gradient or solid)
  accentColor: string // dominant accent
  textColor: string   // headline text color
  style: 'dark' | 'light' | 'colorful' | 'minimal'
}

export interface TemplateWithPreview extends Template {
  preview: TemplatePreview
}

export const TEMPLATES: TemplateWithPreview[] = [

  // ──────────────────────────────────────────────
  // SOCIAL MEDIA
  // ──────────────────────────────────────────────

  {
    id: 'template-bold-social',
    name: 'Bold Statement',
    category: 'Social Media',
    thumbnail: '',
    width: 1080,
    height: 1080,
    tags: ['social', 'bold', 'modern'],
    isPremium: false,
    preview: { bg: 'linear-gradient(135deg,#6c47ff 0%,#3a20c4 100%)', accentColor: '#6c47ff', textColor: '#ffffff', style: 'colorful' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1080, 1080), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#6c47ff' }, { offset: 1, color: '#2d15a8' }] } } } as Layer,
      // Decorative large circle top-right
      { ...base(generateId(), 'shape', 'Circle BG', 780, -160, 580, 580), type: 'shape', locked: false, opacity: 15, shape: 'circle', style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Small circle bottom-left
      { ...base(generateId(), 'shape', 'Circle Sm', -80, 780, 320, 320), type: 'shape', locked: false, opacity: 10, shape: 'circle', style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Accent horizontal rule
      { ...base(generateId(), 'shape', 'Rule', 80, 320, 120, 5), type: 'shape', shape: 'rect', style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Headline
      { ...base(generateId(), 'text', 'Headline', 80, 350, 920, 260), type: 'text', text: 'Make\nYour Mark.', style: { fontFamily: 'Montserrat', fontSize: 96, fontWeight: 800, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.0, letterSpacing: -2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Subtext
      { ...base(generateId(), 'text', 'Subtext', 80, 640, 720, 70), type: 'text', opacity: 75, text: 'Stand out with designs that demand attention', style: { fontFamily: 'Inter', fontSize: 26, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.4, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Tag pill
      { ...base(generateId(), 'shape', 'Tag Pill', 80, 780, 220, 56), type: 'shape', shape: 'rounded-rect', style: { fill: 'transparent', stroke: '#ffffff', strokeWidth: 2, cornerRadius: 28, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Tag Text', 80, 793, 220, 30), type: 'text', text: '✦  GRATIS DESIGN', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1, letterSpacing: 2, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-minimal-light',
    name: 'Minimal Editorial',
    category: 'Social Media',
    thumbnail: '',
    width: 1080,
    height: 1080,
    tags: ['minimal', 'clean', 'editorial'],
    isPremium: false,
    preview: { bg: '#f5f4f0', accentColor: '#6c47ff', textColor: '#1a1917', style: 'minimal' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1080, 1080), type: 'background', fill: { type: 'solid', color: '#f5f4f0' } } as Layer,
      // Large background number (decorative)
      { ...base(generateId(), 'text', 'BG Number', 580, 160, 500, 500), type: 'text', opacity: 6, text: '01', style: { fontFamily: 'Inter', fontSize: 480, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'left', lineHeight: 1, letterSpacing: -20, background: null, outline: null, shadow: noShadow } } as Layer,
      // Thin vertical accent bar
      { ...base(generateId(), 'shape', 'Accent Bar', 80, 80, 4, 260), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 2, shadow: noShadow } } as Layer,
      // Category label
      { ...base(generateId(), 'text', 'Category', 100, 80, 400, 36), type: 'text', text: 'DESIGN SHOWCASE', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1, letterSpacing: 3, background: null, outline: null, shadow: noShadow } } as Layer,
      // Main headline
      { ...base(generateId(), 'text', 'Headline', 80, 360, 900, 340), type: 'text', text: 'Less\nNoise.\nMore\nImpact.', style: { fontFamily: 'Inter', fontSize: 88, fontWeight: 300, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'left', lineHeight: 1.05, letterSpacing: -2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Divider line
      { ...base(generateId(), 'shape', 'Divider', 80, 760, 920, 1), type: 'shape', shape: 'rect', style: { fill: '#cbc9c0', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Footer text
      { ...base(generateId(), 'text', 'Footer', 80, 790, 700, 50), type: 'text', text: 'Add your supporting message here for context', style: { fontFamily: 'Inter', fontSize: 20, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: '#7e7b72', align: 'left', lineHeight: 1.5, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-neon-glow',
    name: 'Neon Glow',
    category: 'Social Media',
    thumbnail: '',
    width: 1080,
    height: 1080,
    tags: ['neon', 'dark', 'vibrant'],
    isPremium: false,
    preview: { bg: 'linear-gradient(135deg,#0d0d1a 0%,#1a0d2e 100%)', accentColor: '#c084fc', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1080, 1080), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#0d0d1a' }, { offset: 1, color: '#1a0d2e' }] } } } as Layer,
      // Glow circle
      { ...base(generateId(), 'shape', 'Glow', 240, 140, 600, 600), type: 'shape', shape: 'circle', opacity: 12, style: { fill: '#c084fc', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Horizontal accent line
      { ...base(generateId(), 'shape', 'Line Top', 80, 280, 200, 3), type: 'shape', shape: 'rect', style: { fill: '#c084fc', stroke: 'transparent', strokeWidth: 0, cornerRadius: 2, shadow: noShadow } } as Layer,
      // Main text
      { ...base(generateId(), 'text', 'Headline', 80, 320, 920, 380), type: 'text', text: 'FUTURE\nIS NOW', style: { fontFamily: 'Montserrat', fontSize: 120, fontWeight: 900, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 0.9, letterSpacing: -2, background: null, outline: null, shadow: { enabled: true, color: '#c084fc', blur: 30, offsetX: 0, offsetY: 0, opacity: 80 } } } as Layer,
      // Accent word
      { ...base(generateId(), 'text', 'Accent', 80, 720, 700, 100), type: 'text', text: 'ILLUMINATE YOUR VISION', style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#c084fc', align: 'left', lineHeight: 1.4, letterSpacing: 5, background: null, outline: null, shadow: noShadow } } as Layer,
      // Outlined circle decoration
      { ...base(generateId(), 'shape', 'Outline Circle', 760, 700, 240, 240), type: 'shape', shape: 'circle', style: { fill: 'transparent', stroke: '#c084fc', strokeWidth: 2, cornerRadius: 0, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-quote-card',
    name: 'Quote Card',
    category: 'Social Media',
    thumbnail: '',
    width: 1080,
    height: 1080,
    tags: ['quote', 'typography', 'clean'],
    isPremium: false,
    preview: { bg: '#1a1917', accentColor: '#f5c842', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1080, 1080), type: 'background', fill: { type: 'solid', color: '#1a1917' } } as Layer,
      // Top-left corner accent
      { ...base(generateId(), 'shape', 'Corner TL', 60, 60, 80, 6), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'shape', 'Corner TL V', 60, 60, 6, 80), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Bottom-right corner accent
      { ...base(generateId(), 'shape', 'Corner BR H', 940, 1014, 80, 6), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'shape', 'Corner BR V', 1014, 940, 6, 80), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Quote mark
      { ...base(generateId(), 'text', 'Quote Mark', 80, 200, 160, 200), type: 'text', opacity: 30, text: '"', style: { fontFamily: 'Playfair Display', fontSize: 260, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#f5c842', align: 'left', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Quote text
      { ...base(generateId(), 'text', 'Quote', 100, 360, 880, 340), type: 'text', text: 'Design is not just what it looks like. Design is how it works.', style: { fontFamily: 'Playfair Display', fontSize: 52, fontWeight: 400, italic: true, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.3, letterSpacing: -0.5, background: null, outline: null, shadow: noShadow } } as Layer,
      // Attribution line
      { ...base(generateId(), 'shape', 'Attr Line', 100, 740, 60, 2), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Attribution', 180, 728, 500, 40), type: 'text', text: '— Steve Jobs', style: { fontFamily: 'Inter', fontSize: 18, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: '#f5c842', align: 'left', lineHeight: 1.4, letterSpacing: 1, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  // ──────────────────────────────────────────────
  // YOUTUBE
  // ──────────────────────────────────────────────

  {
    id: 'template-youtube-thumb',
    name: 'YouTube — Impact',
    category: 'YouTube',
    thumbnail: '',
    width: 1280,
    height: 720,
    tags: ['youtube', 'thumbnail', 'bold'],
    isPremium: false,
    preview: { bg: 'linear-gradient(135deg,#0f0c1a 0%,#1e1535 100%)', accentColor: '#6c47ff', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1280, 720), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#0f0c1a' }, { offset: 1, color: '#1e1535' }] } } } as Layer,
      // Left accent bar
      { ...base(generateId(), 'shape', 'Accent Bar', 0, 0, 8, 720), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Big number
      { ...base(generateId(), 'text', 'Number', 40, 20, 340, 280), type: 'text', text: '10X', style: { fontFamily: 'Montserrat', fontSize: 240, fontWeight: 900, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1, letterSpacing: -6, background: null, outline: null, shadow: { enabled: true, color: '#6c47ff', blur: 40, offsetX: 0, offsetY: 0, opacity: 60 } } } as Layer,
      // Diagonal shape
      { ...base(generateId(), 'shape', 'Slash', 400, 0, 60, 720), type: 'shape', shape: 'rect', opacity: 20, rotation: 10, style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Main title
      { ...base(generateId(), 'text', 'Title', 40, 330, 780, 320), type: 'text', text: 'GROWTH\nSTRATEGIES\nTHAT WORK', style: { fontFamily: 'Oswald', fontSize: 100, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 0.92, letterSpacing: 1, background: null, outline: null, shadow: { enabled: true, color: '#000', blur: 12, offsetX: 2, offsetY: 4, opacity: 60 } } } as Layer,
      // Right side placeholder
      { ...base(generateId(), 'shape', 'Image Area', 840, 60, 380, 600), type: 'shape', shape: 'rounded-rect', opacity: 15, style: { fill: '#ffffff', stroke: '#6c47ff', strokeWidth: 2, cornerRadius: 12, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Image Hint', 840, 310, 380, 60), type: 'text', opacity: 40, text: '+ Add photo', style: { fontFamily: 'Inter', fontSize: 20, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-youtube-tutorial',
    name: 'YouTube — Tutorial',
    category: 'YouTube',
    thumbnail: '',
    width: 1280,
    height: 720,
    tags: ['youtube', 'tutorial', 'clean'],
    isPremium: false,
    preview: { bg: 'linear-gradient(90deg,#ffffff 0%,#f0ecff 100%)', accentColor: '#6c47ff', textColor: '#1a1917', style: 'light' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1280, 720), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 90, stops: [{ offset: 0, color: '#ffffff' }, { offset: 1, color: '#f0ecff' }] } } } as Layer,
      // Left accent block
      { ...base(generateId(), 'shape', 'Left Block', 0, 0, 420, 720), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Step badge
      { ...base(generateId(), 'shape', 'Step Badge', 50, 50, 120, 120), type: 'shape', shape: 'circle', opacity: 20, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Step Num', 50, 50, 120, 120), type: 'text', text: '01', style: { fontFamily: 'Inter', fontSize: 52, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1.9, letterSpacing: -1, background: null, outline: null, shadow: noShadow } } as Layer,
      // White headline on left
      { ...base(generateId(), 'text', 'Left Title', 50, 280, 340, 240), type: 'text', text: 'How\nTo Do\nThis', style: { fontFamily: 'Inter', fontSize: 72, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.0, letterSpacing: -1.5, background: null, outline: null, shadow: noShadow } } as Layer,
      // Right side content
      { ...base(generateId(), 'text', 'Right Heading', 480, 120, 720, 100), type: 'text', text: 'Step-by-Step Guide', style: { fontFamily: 'Inter', fontSize: 48, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'left', lineHeight: 1.1, letterSpacing: -1, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Description', 480, 240, 720, 100), type: 'text', text: 'Everything you need to know\nin under 10 minutes', style: { fontFamily: 'Inter', fontSize: 28, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: '#55534e', align: 'left', lineHeight: 1.4, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Tag line
      { ...base(generateId(), 'shape', 'Tag', 480, 480, 240, 52), type: 'shape', shape: 'rounded-rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 26, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Tag Label', 480, 492, 240, 28), type: 'text', text: '▶  Watch Now', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1, letterSpacing: 0.5, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  // ──────────────────────────────────────────────
  // MARKETING
  // ──────────────────────────────────────────────

  {
    id: 'template-product-ad',
    name: 'Product Launch',
    category: 'Marketing',
    thumbnail: '',
    width: 1200,
    height: 630,
    tags: ['product', 'launch', 'marketing'],
    isPremium: false,
    preview: { bg: 'linear-gradient(135deg,#6c47ff 0%,#a855f7 100%)', accentColor: '#f5c842', textColor: '#ffffff', style: 'colorful' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1200, 630), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#6c47ff' }, { offset: 1, color: '#a855f7' }] } } } as Layer,
      // Geometric accent shapes
      { ...base(generateId(), 'shape', 'Circle 1', 800, -100, 500, 500), type: 'shape', shape: 'circle', opacity: 15, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'shape', 'Circle 2', -100, 300, 300, 300), type: 'shape', shape: 'circle', opacity: 10, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Launch label
      { ...base(generateId(), 'shape', 'Label Pill', 60, 60, 200, 44), type: 'shape', shape: 'rounded-rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 22, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Label Text', 60, 71, 200, 22), type: 'text', text: '🚀  NEW LAUNCH', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'center', lineHeight: 1, letterSpacing: 1.5, background: null, outline: null, shadow: noShadow } } as Layer,
      // Headline
      { ...base(generateId(), 'text', 'Headline', 60, 140, 700, 240), type: 'text', text: 'Introducing\nSomething\nAmazing', style: { fontFamily: 'Inter', fontSize: 80, fontWeight: 800, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.0, letterSpacing: -2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Subtext
      { ...base(generateId(), 'text', 'Subtext', 60, 400, 580, 60), type: 'text', text: 'The product that changes everything.', style: { fontFamily: 'Inter', fontSize: 22, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.8)', align: 'left', lineHeight: 1.4, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // CTA
      { ...base(generateId(), 'shape', 'CTA', 60, 490, 200, 56), type: 'shape', shape: 'rounded-rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 8, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'CTA Text', 60, 507, 200, 22), type: 'text', text: 'Shop Now →', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'center', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Right image placeholder
      { ...base(generateId(), 'shape', 'Image Area', 820, 80, 320, 460), type: 'shape', shape: 'rounded-rect', opacity: 20, style: { fill: '#ffffff', stroke: 'rgba(255,255,255,0.4)', strokeWidth: 2, cornerRadius: 16, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Image Hint', 820, 290, 320, 40), type: 'text', opacity: 50, text: '+ Add product image', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-sale-banner',
    name: 'Sale Banner',
    category: 'Marketing',
    thumbnail: '',
    width: 1200,
    height: 630,
    tags: ['sale', 'promo', 'ecommerce'],
    isPremium: false,
    preview: { bg: '#ff3b3b', accentColor: '#ffffff', textColor: '#ffffff', style: 'colorful' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1200, 630), type: 'background', fill: { type: 'solid', color: '#e31b1b' } } as Layer,
      // Diagonal stripe overlay
      { ...base(generateId(), 'shape', 'Stripe 1', -200, 0, 500, 800), type: 'shape', shape: 'rect', opacity: 12, rotation: 15, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'shape', 'Stripe 2', 600, -100, 200, 900), type: 'shape', shape: 'rect', opacity: 8, rotation: 15, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Big % text
      { ...base(generateId(), 'text', 'Percent', 60, 40, 500, 400), type: 'text', text: '50%', style: { fontFamily: 'Montserrat', fontSize: 320, fontWeight: 900, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 0.9, letterSpacing: -8, background: null, outline: null, shadow: { enabled: true, color: '#000', blur: 20, offsetX: 0, offsetY: 8, opacity: 30 } } } as Layer,
      // OFF text
      { ...base(generateId(), 'text', 'OFF', 180, 420, 300, 120), type: 'text', text: 'OFF', style: { fontFamily: 'Montserrat', fontSize: 100, fontWeight: 900, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.3)', align: 'left', lineHeight: 1, letterSpacing: 10, background: null, outline: null, shadow: noShadow } } as Layer,
      // Right panel
      { ...base(generateId(), 'shape', 'Right Panel', 680, 0, 520, 630), type: 'shape', shape: 'rect', opacity: 20, style: { fill: '#000000', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Right Title', 720, 120, 440, 120), type: 'text', text: 'FLASH\nSALE', style: { fontFamily: 'Inter', fontSize: 80, fontWeight: 800, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1, letterSpacing: -2, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Promo Code', 720, 280, 440, 50), type: 'text', text: 'Use code: GRATIS50', style: { fontFamily: 'Inter', fontSize: 20, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.8)', align: 'left', lineHeight: 1, letterSpacing: 0.5, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'shape', 'CTA Btn', 720, 380, 260, 60), type: 'shape', shape: 'rounded-rect', style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 8, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'CTA', 720, 396, 260, 28), type: 'text', text: 'SHOP NOW', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#e31b1b', align: 'center', lineHeight: 1, letterSpacing: 2, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  // ──────────────────────────────────────────────
  // PRINT
  // ──────────────────────────────────────────────

  {
    id: 'template-dark-poster',
    name: 'Event Poster',
    category: 'Print',
    thumbnail: '',
    width: 794,
    height: 1123,
    tags: ['poster', 'event', 'dramatic'],
    isPremium: false,
    preview: { bg: '#0d0d0d', accentColor: '#6c47ff', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 794, 1123), type: 'background', fill: { type: 'solid', color: '#0d0d0d' } } as Layer,
      // Top accent bar
      { ...base(generateId(), 'shape', 'Top Bar', 0, 0, 794, 8), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Decorative circle behind title
      { ...base(generateId(), 'shape', 'BG Circle', 147, 220, 500, 500), type: 'shape', shape: 'circle', opacity: 8, style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Subtitle label
      { ...base(generateId(), 'text', 'Label', 60, 200, 674, 36), type: 'text', text: 'PRESENTS', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1, letterSpacing: 4, background: null, outline: null, shadow: noShadow } } as Layer,
      // Main title
      { ...base(generateId(), 'text', 'Title', 60, 250, 674, 400), type: 'text', text: 'THE\nEVENT\nOF THE\nYEAR', style: { fontFamily: 'Oswald', fontSize: 120, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 0.9, letterSpacing: 2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Highlight word
      { ...base(generateId(), 'text', 'Highlight', 60, 720, 674, 80), type: 'text', text: 'FEATURING SOMETHING\nSPECTACULAR', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1.5, letterSpacing: 3, background: null, outline: null, shadow: noShadow } } as Layer,
      // Divider
      { ...base(generateId(), 'shape', 'Divider', 60, 870, 674, 1), type: 'shape', shape: 'rect', style: { fill: '#3a3835', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Date and venue
      { ...base(generateId(), 'text', 'Date', 60, 900, 674, 40), type: 'text', text: 'JANUARY 1, 2026  ·  CITY VENUE  ·  8:00 PM', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: '#7e7b72', align: 'left', lineHeight: 1.4, letterSpacing: 2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Ticket CTA
      { ...base(generateId(), 'shape', 'Ticket Btn', 60, 970, 220, 56), type: 'shape', shape: 'rounded-rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 8, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Ticket Text', 60, 985, 220, 26), type: 'text', text: 'Get Tickets', style: { fontFamily: 'Inter', fontSize: 15, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'center', lineHeight: 1, letterSpacing: 0.5, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  {
    id: 'template-magazine-cover',
    name: 'Magazine Cover',
    category: 'Print',
    thumbnail: '',
    width: 794,
    height: 1123,
    tags: ['magazine', 'editorial', 'print'],
    isPremium: false,
    preview: { bg: 'linear-gradient(180deg,#1a0533 0%,#0d001a 100%)', accentColor: '#f5c842', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 794, 1123), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 180, stops: [{ offset: 0, color: '#1a0533' }, { offset: 1, color: '#0d001a' }] } } } as Layer,
      // Header bar
      { ...base(generateId(), 'shape', 'Header Bar', 0, 0, 794, 100), type: 'shape', shape: 'rect', opacity: 60, style: { fill: '#000000', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Magazine name
      { ...base(generateId(), 'text', 'Mag Name', 40, 22, 720, 60), type: 'text', text: 'GRATIS', style: { fontFamily: 'Montserrat', fontSize: 56, fontWeight: 900, italic: false, underline: false, strikethrough: false, color: '#f5c842', align: 'left', lineHeight: 1, letterSpacing: 12, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Issue', 40, 28, 720, 40), type: 'text', text: 'VOL 01  ·  2026', style: { fontFamily: 'Inter', fontSize: 11, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.5)', align: 'right', lineHeight: 1, letterSpacing: 3, background: null, outline: null, shadow: noShadow } } as Layer,
      // Cover story label
      { ...base(generateId(), 'shape', 'Cover Label', 40, 580, 180, 36), type: 'shape', shape: 'rect', style: { fill: '#f5c842', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Cover Label Text', 40, 586, 180, 24), type: 'text', text: 'COVER STORY', style: { fontFamily: 'Inter', fontSize: 11, fontWeight: 800, italic: false, underline: false, strikethrough: false, color: '#0d001a', align: 'center', lineHeight: 1, letterSpacing: 2, background: null, outline: null, shadow: noShadow } } as Layer,
      // Cover headline
      { ...base(generateId(), 'text', 'Headline', 40, 630, 720, 280), type: 'text', text: 'The Future\nof Design\nIs Here', style: { fontFamily: 'Playfair Display', fontSize: 84, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.05, letterSpacing: -1, background: null, outline: null, shadow: noShadow } } as Layer,
      // Sub-articles
      { ...base(generateId(), 'shape', 'Sub Div', 40, 960, 714, 1), type: 'shape', shape: 'rect', opacity: 40, style: { fill: '#ffffff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Sub Articles', 40, 978, 714, 80), type: 'text', text: 'Top Tools  ·  AI Editing  ·  Export Tips  ·  Layer Secrets', style: { fontFamily: 'Inter', fontSize: 13, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.55)', align: 'left', lineHeight: 1.6, letterSpacing: 1, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  // ──────────────────────────────────────────────
  // BUSINESS
  // ──────────────────────────────────────────────

  {
    id: 'template-linkedin-post',
    name: 'LinkedIn Post',
    category: 'Business',
    thumbnail: '',
    width: 1200,
    height: 627,
    tags: ['linkedin', 'professional', 'business'],
    isPremium: false,
    preview: { bg: '#ffffff', accentColor: '#0077b5', textColor: '#1a1917', style: 'light' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1200, 627), type: 'background', fill: { type: 'solid', color: '#ffffff' } } as Layer,
      // Left accent column
      { ...base(generateId(), 'shape', 'Left Column', 0, 0, 480, 627), type: 'shape', shape: 'rect', style: { fill: '#f0ecff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Accent bar top of left col
      { ...base(generateId(), 'shape', 'Accent', 0, 0, 480, 10), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Avatar placeholder
      { ...base(generateId(), 'shape', 'Avatar', 60, 80, 100, 100), type: 'shape', shape: 'circle', style: { fill: '#cbc9c0', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Name', 180, 90, 260, 42), type: 'text', text: 'Your Name', style: { fontFamily: 'Inter', fontSize: 20, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'left', lineHeight: 1, letterSpacing: -0.3, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Title', 180, 138, 260, 36), type: 'text', text: 'Role · Company', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: '#7e7b72', align: 'left', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Left stat
      { ...base(generateId(), 'text', 'Stat Number', 60, 320, 360, 120), type: 'text', text: '3x', style: { fontFamily: 'Inter', fontSize: 96, fontWeight: 800, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1, letterSpacing: -3, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Stat Label', 60, 450, 360, 40), type: 'text', text: 'Faster Results', style: { fontFamily: 'Inter', fontSize: 16, fontWeight: 500, italic: false, underline: false, strikethrough: false, color: '#55534e', align: 'left', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Right content
      { ...base(generateId(), 'text', 'Insight', 530, 80, 620, 60), type: 'text', text: '💡 Key Insight', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 600, italic: false, underline: false, strikethrough: false, color: '#6c47ff', align: 'left', lineHeight: 1, letterSpacing: 1, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Main Point', 530, 150, 620, 280), type: 'text', text: 'Your most\nimpactful\nidea here.', style: { fontFamily: 'Inter', fontSize: 56, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#1a1917', align: 'left', lineHeight: 1.05, letterSpacing: -1, background: null, outline: null, shadow: noShadow } } as Layer,
      { ...base(generateId(), 'text', 'Hashtags', 530, 490, 620, 40), type: 'text', text: '#Design  #Growth  #Productivity', style: { fontFamily: 'Inter', fontSize: 14, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: '#7e7b72', align: 'left', lineHeight: 1, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
    ],
  },

  // ──────────────────────────────────────────────
  // PRESENTATION
  // ──────────────────────────────────────────────

  {
    id: 'template-presentation-title',
    name: 'Presentation Title',
    category: 'Presentation',
    thumbnail: '',
    width: 1920,
    height: 1080,
    tags: ['presentation', 'slide', 'corporate'],
    isPremium: false,
    preview: { bg: 'linear-gradient(135deg,#0f0c1a 0%,#1e1535 60%,#2d1f5e 100%)', accentColor: '#6c47ff', textColor: '#ffffff', style: 'dark' },
    layers: [
      { ...base(generateId(), 'background', 'Background', 0, 0, 1920, 1080), type: 'background', fill: { type: 'gradient', gradient: { type: 'linear', angle: 135, stops: [{ offset: 0, color: '#0f0c1a' }, { offset: 0.6, color: '#1e1535' }, { offset: 1, color: '#2d1f5e' }] } } } as Layer,
      // Geometric accent — large circle
      { ...base(generateId(), 'shape', 'Circle Large', 1200, -200, 1000, 1000), type: 'shape', shape: 'circle', opacity: 12, style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Outline circle
      { ...base(generateId(), 'shape', 'Circle Outline', 1400, 200, 600, 600), type: 'shape', shape: 'circle', opacity: 20, style: { fill: 'transparent', stroke: '#6c47ff', strokeWidth: 2, cornerRadius: 0, shadow: noShadow } } as Layer,
      // Left accent bar
      { ...base(generateId(), 'shape', 'Bar', 120, 240, 8, 280), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 4, shadow: noShadow } } as Layer,
      // Title
      { ...base(generateId(), 'text', 'Title', 160, 240, 1000, 280), type: 'text', text: 'Presentation\nTitle Slide', style: { fontFamily: 'Inter', fontSize: 120, fontWeight: 700, italic: false, underline: false, strikethrough: false, color: '#ffffff', align: 'left', lineHeight: 1.0, letterSpacing: -3, background: null, outline: null, shadow: noShadow } } as Layer,
      // Subtitle
      { ...base(generateId(), 'text', 'Subtitle', 160, 560, 900, 60), type: 'text', text: 'Subtitle · Author Name · Month Year', style: { fontFamily: 'Inter', fontSize: 26, fontWeight: 400, italic: false, underline: false, strikethrough: false, color: 'rgba(255,255,255,0.55)', align: 'left', lineHeight: 1.4, letterSpacing: 0, background: null, outline: null, shadow: noShadow } } as Layer,
      // Bottom bar
      { ...base(generateId(), 'shape', 'Bottom Bar', 0, 1020, 1920, 4), type: 'shape', shape: 'rect', style: { fill: '#6c47ff', stroke: 'transparent', strokeWidth: 0, cornerRadius: 0, shadow: noShadow } } as Layer,
    ],
  },
]

export const TEMPLATE_CATEGORIES = ['All', 'Social Media', 'YouTube', 'Marketing', 'Print', 'Business', 'Presentation']

export function getTemplatesByCategory(category: string): TemplateWithPreview[] {
  if (category === 'All') return TEMPLATES
  return TEMPLATES.filter(t => t.category === category)
}

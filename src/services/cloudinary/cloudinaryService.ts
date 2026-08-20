/**
 * Cloudinary Frontend Service — Gratis
 *
 * 100% browser-safe. Uses only:
 *   - Unsigned uploads  (no API secret)
 *   - Delivery-URL transformations (URL-only, client-side)
 *
 * Configure via .env:
 *   VITE_CLOUDINARY_CLOUD_NAME     = your cloud name
 *   VITE_CLOUDINARY_UPLOAD_PRESET  = an unsigned upload preset
 *
 * NEVER put CLOUDINARY_API_SECRET in frontend code.
 */

import type { CloudinaryConfig, CloudinaryUploadResult } from '@/types'

// ─────────────────────────────────────────────────────────────
// Config
// ─────────────────────────────────────────────────────────────

export function getCloudinaryConfig(): CloudinaryConfig {
  const cloudName    = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME    ?? ''
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET ?? ''
  return { cloudName, uploadPreset, isConfigured: Boolean(cloudName && uploadPreset) }
}

// ─────────────────────────────────────────────────────────────
// Upload (unsigned)
// ─────────────────────────────────────────────────────────────

export type UploadProgressCallback = (progress: number) => void

export async function uploadToCloudinary(
  file: File,
  onProgress?: UploadProgressCallback,
): Promise<CloudinaryUploadResult> {
  const config = getCloudinaryConfig()
  if (!config.isConfigured) throw new Error('Cloudinary not configured.')

  const form = new FormData()
  form.append('file', file)
  form.append('upload_preset', config.uploadPreset)
  form.append('folder', 'gratis')

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress?.(Math.round((e.loaded / e.total) * 100))
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const d = JSON.parse(xhr.responseText)
        resolve({ publicId: d.public_id, secureUrl: d.secure_url, width: d.width, height: d.height, format: d.format })
      } else {
        reject(new Error(JSON.parse(xhr.responseText)?.error?.message ?? 'Upload failed'))
      }
    }
    xhr.onerror  = () => reject(new Error('Network error'))
    xhr.onabort  = () => reject(new Error('Upload aborted'))
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${config.cloudName}/image/upload`)
    xhr.send(form)
  })
}

// ─────────────────────────────────────────────────────────────
// Low-level transformation URL builder
// ─────────────────────────────────────────────────────────────

/** Each entry in the chain is a transformation segment joined by `/` */
export type TransformSegment = Record<string, string | number | undefined>

export function buildTransformUrl(publicId: string, segments: TransformSegment[]): string {
  const { cloudName, isConfigured } = getCloudinaryConfig()
  if (!isConfigured || !publicId) return ''

  const chain = segments
    .map(seg =>
      Object.entries(seg)
        .filter(([, v]) => v !== undefined && v !== '')
        .map(([k, v]) => `${k}_${v}`)
        .join(','),
    )
    .filter(Boolean)
    .join('/')

  return [
    'https://res.cloudinary.com',
    cloudName,
    'image/upload',
    chain,
    publicId,
  ]
    .filter(Boolean)
    .join('/')
}

// ─────────────────────────────────────────────────────────────
// ① SMART CROP / RESIZE MODES
// ─────────────────────────────────────────────────────────────

export type CropMode = 'fill' | 'fit' | 'limit' | 'scale' | 'pad' | 'crop' | 'thumb' | 'fill_pad' | 'imagga_crop' | 'imagga_scale'
export type GravityMode = 'auto' | 'face' | 'faces' | 'body' | 'subject' | 'center' | 'north' | 'south' | 'east' | 'west' | 'north_east' | 'north_west' | 'south_east' | 'south_west' | 'custom'

export interface SmartCropOptions {
  publicId: string
  width: number
  height: number
  crop?: CropMode
  gravity?: GravityMode
  zoom?: number           // 0.5–2.0, relevant for face/thumb crop
  background?: string     // for pad mode
  aspectRatio?: string    // e.g. '16:9'
}

export function buildSmartCropUrl(opts: SmartCropOptions): string {
  const seg: TransformSegment = {
    w: opts.width,
    h: opts.height,
    c: opts.crop ?? 'fill',
    g: opts.gravity ?? 'auto',
  }
  if (opts.zoom)        seg['z'] = opts.zoom
  if (opts.background)  seg['b'] = opts.background.replace('#', 'rgb:')
  if (opts.aspectRatio) seg['ar'] = opts.aspectRatio

  return buildTransformUrl(opts.publicId, [seg])
}

// ─────────────────────────────────────────────────────────────
// ② IMAGE EFFECTS (Cloudinary built-in, URL-only)
// ─────────────────────────────────────────────────────────────

export type CloudinaryEffect =
  // Quality / sharpness
  | 'sharpen'
  | 'unsharp_mask'
  | 'improve'
  // Colour adjustments
  | 'auto_brightness'
  | 'auto_color'
  | 'auto_contrast'
  | 'vibrance'
  | 'saturation'
  | 'fill_light'
  | 'viesus_correct'
  // Artistic
  | 'art:al_dente'
  | 'art:athena'
  | 'art:audrey'
  | 'art:aurora'
  | 'art:daguerre'
  | 'art:eucalyptus'
  | 'art:fes'
  | 'art:frost'
  | 'art:hairspray'
  | 'art:hokusai'
  | 'art:incognito'
  | 'art:linen'
  | 'art:peacock'
  | 'art:primavera'
  | 'art:quartz'
  | 'art:red_rock'
  | 'art:refresh'
  | 'art:sizzle'
  | 'art:sonnet'
  | 'art:ukulele'
  | 'art:zorro'
  // Stylisation
  | 'cartoonify'
  | 'outline'
  | 'shadow'
  | 'pixelate'
  | 'pixelate_faces'
  | 'blur'
  | 'blur_faces'
  | 'grayscale'
  | 'sepia'
  | 'negate'
  | 'oil_paint'
  | 'vignette'
  | 'tilt_shift'
  | 'sketch'
  | 'trim'

export interface EffectOptions {
  publicId: string
  effect: CloudinaryEffect
  strength?: number        // optional numeric level appended after ':'
  extraParams?: TransformSegment
}

export function buildEffectUrl(opts: EffectOptions): string {
  const effectStr = opts.strength !== undefined
    ? `${opts.effect}:${opts.strength}`
    : opts.effect
  const seg: TransformSegment = { e: effectStr, ...(opts.extraParams ?? {}) }
  return buildTransformUrl(opts.publicId, [seg])
}

// Convenience: apply multiple effects in a chain
export function buildEffectChainUrl(
  publicId: string,
  effects: Array<{ effect: CloudinaryEffect; strength?: number }>,
): string {
  const segments = effects.map(({ effect, strength }) => ({
    e: strength !== undefined ? `${effect}:${strength}` : effect,
  }))
  return buildTransformUrl(publicId, segments)
}

// ─────────────────────────────────────────────────────────────
// ③ ART FILTERS — grouped for the UI
// ─────────────────────────────────────────────────────────────

export interface ArtFilter {
  id: string
  label: string
  effect: CloudinaryEffect
  preview: string   // CSS gradient used as preview swatch
}

export const ART_FILTERS: ArtFilter[] = [
  { id: 'al_dente',   label: 'Al Dente',   effect: 'art:al_dente',   preview: 'linear-gradient(135deg,#c8a97e,#8b5e3c)' },
  { id: 'athena',     label: 'Athena',     effect: 'art:athena',     preview: 'linear-gradient(135deg,#e8d5c4,#c4a882)' },
  { id: 'audrey',     label: 'Audrey',     effect: 'art:audrey',     preview: 'linear-gradient(135deg,#2c2c2c,#6b6b6b)' },
  { id: 'aurora',     label: 'Aurora',     effect: 'art:aurora',     preview: 'linear-gradient(135deg,#4facfe,#00f2fe)' },
  { id: 'daguerre',   label: 'Daguerre',   effect: 'art:daguerre',   preview: 'linear-gradient(135deg,#b8a89a,#7d6b60)' },
  { id: 'eucalyptus', label: 'Eucalyptus', effect: 'art:eucalyptus', preview: 'linear-gradient(135deg,#a8c5a0,#5a8f6e)' },
  { id: 'fes',        label: 'Fes',        effect: 'art:fes',        preview: 'linear-gradient(135deg,#e85d04,#9d4e15)' },
  { id: 'frost',      label: 'Frost',      effect: 'art:frost',      preview: 'linear-gradient(135deg,#a8d8f0,#6bb8d4)' },
  { id: 'hairspray',  label: 'Hairspray',  effect: 'art:hairspray',  preview: 'linear-gradient(135deg,#f9c784,#f0853a)' },
  { id: 'hokusai',    label: 'Hokusai',    effect: 'art:hokusai',    preview: 'linear-gradient(135deg,#1e6b8c,#0d3d52)' },
  { id: 'incognito',  label: 'Incognito',  effect: 'art:incognito',  preview: 'linear-gradient(135deg,#4a4a4a,#1a1a1a)' },
  { id: 'linen',      label: 'Linen',      effect: 'art:linen',      preview: 'linear-gradient(135deg,#f0e6d3,#d4c4a8)' },
  { id: 'peacock',    label: 'Peacock',    effect: 'art:peacock',    preview: 'linear-gradient(135deg,#00bcd4,#006064)' },
  { id: 'primavera',  label: 'Primavera',  effect: 'art:primavera',  preview: 'linear-gradient(135deg,#f8bbd0,#e91e63)' },
  { id: 'quartz',     label: 'Quartz',     effect: 'art:quartz',     preview: 'linear-gradient(135deg,#e8c5f0,#b87fc4)' },
  { id: 'red_rock',   label: 'Red Rock',   effect: 'art:red_rock',   preview: 'linear-gradient(135deg,#c0392b,#7b241c)' },
  { id: 'refresh',    label: 'Refresh',    effect: 'art:refresh',    preview: 'linear-gradient(135deg,#a8edea,#fed6e3)' },
  { id: 'sizzle',     label: 'Sizzle',     effect: 'art:sizzle',     preview: 'linear-gradient(135deg,#ff6b35,#f7c59f)' },
  { id: 'sonnet',     label: 'Sonnet',     effect: 'art:sonnet',     preview: 'linear-gradient(135deg,#c9d6df,#52616b)' },
  { id: 'ukulele',    label: 'Ukulele',    effect: 'art:ukulele',    preview: 'linear-gradient(135deg,#f6d365,#fda085)' },
  { id: 'zorro',      label: 'Zorro',      effect: 'art:zorro',      preview: 'linear-gradient(135deg,#1a1a2e,#16213e)' },
]

// ─────────────────────────────────────────────────────────────
// ④ COLOR EFFECTS
// ─────────────────────────────────────────────────────────────

export interface ColorAdjustOptions {
  publicId: string
  brightness?: number       // -100 to 100
  contrast?: number         // -100 to 100
  saturation?: number       // -100 to 100
  vibrance?: number         // -100 to 100
  fillLight?: number        // 0 to 100
  grayscale?: boolean
  sepia?: boolean
  negate?: boolean
  vignette?: number         // 0 to 100
  tint?: string             // hex color (e.g. 'ff0000')
  tintIntensity?: number    // 0 to 100
}

export function buildColorAdjustUrl(opts: ColorAdjustOptions): string {
  const segs: TransformSegment[] = []

  if (opts.brightness)  segs.push({ e: `brightness:${opts.brightness}` })
  if (opts.contrast)    segs.push({ e: `contrast:${opts.contrast}` })
  if (opts.saturation)  segs.push({ e: `saturation:${opts.saturation}` })
  if (opts.vibrance)    segs.push({ e: `vibrance:${opts.vibrance}` })
  if (opts.fillLight)   segs.push({ e: `fill_light:${opts.fillLight}` })
  if (opts.grayscale)   segs.push({ e: 'grayscale' })
  if (opts.sepia)       segs.push({ e: 'sepia' })
  if (opts.negate)      segs.push({ e: 'negate' })
  if (opts.vignette)    segs.push({ e: `vignette:${opts.vignette}` })
  if (opts.tint && opts.tintIntensity) {
    segs.push({ e: `tint:${opts.tintIntensity}:${opts.tint.replace('#', '')}` })
  }

  return buildTransformUrl(opts.publicId, segs)
}

// ─────────────────────────────────────────────────────────────
// ⑤ IMAGE OPTIMIZATION (quality + format + responsive)
// ─────────────────────────────────────────────────────────────

export interface OptimizeOptions {
  publicId: string
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  maxWidth?: number
  dpr?: 'auto' | number       // device pixel ratio
  stripMetadata?: boolean
}

export function buildOptimizedUrl(opts: OptimizeOptions): string {
  const seg: TransformSegment = {}

  seg['q'] = opts.quality ?? 'auto'
  seg['f'] = opts.format  ?? 'auto'
  if (opts.maxWidth)        seg['w'] = opts.maxWidth
  if (opts.maxWidth)        seg['c'] = 'limit'
  if (opts.dpr)             seg['dpr'] = opts.dpr
  if (opts.stripMetadata)   seg['fl'] = 'strip_profile'

  return buildTransformUrl(opts.publicId, [seg])
}

// Responsive image srcset helper
export function buildResponsiveSrcSet(
  publicId: string,
  widths: number[] = [320, 640, 960, 1280, 1920],
  format: string = 'auto',
  quality: string = 'auto',
): string {
  return widths
    .map(w => {
      const url = buildTransformUrl(publicId, [{ w, c: 'limit', q: quality, f: format }])
      return `${url} ${w}w`
    })
    .join(', ')
}

// ─────────────────────────────────────────────────────────────
// ⑥ GENERATIVE AI OPERATIONS
// ─────────────────────────────────────────────────────────────

export type GenAIOperation =
  | 'background_removal'
  | 'upscale'
  | 'enhance'
  | 'restore'
  | 'gen_background_replace'
  | 'gen_remove'
  | 'gen_replace'
  | 'gen_recolor'
  | 'gen_fill'

export interface GenAIOptions {
  publicId: string
  operation: GenAIOperation
  prompt?: string           // for gen_fill, gen_remove, gen_replace, gen_background_replace
  fromObject?: string       // for gen_replace / gen_recolor
  toObject?: string         // for gen_replace
  toColor?: string          // for gen_recolor
  multiply?: boolean        // gen_remove: remove all instances
  width?: number            // for gen_fill expansion
  height?: number
  aspectRatio?: string
}

export function buildGenAIUrl(opts: GenAIOptions): string {
  const { publicId, operation } = opts
  let effectStr: string

  switch (operation) {
    case 'background_removal':
      effectStr = 'background_removal'
      break
    case 'upscale':
      effectStr = 'upscale'
      break
    case 'enhance':
      effectStr = 'enhance'
      break
    case 'restore':
      effectStr = 'restore'
      break
    case 'gen_background_replace':
      effectStr = opts.prompt
        ? `gen_background_replace:prompt_${encodeURIComponent(opts.prompt)}`
        : 'gen_background_replace'
      break
    case 'gen_remove':
      if (opts.prompt) {
        effectStr = `gen_remove:prompt_${encodeURIComponent(opts.prompt)}${opts.multiply ? ';multiple_true' : ''}`
      } else {
        effectStr = 'gen_remove'
      }
      break
    case 'gen_replace':
      effectStr = [
        'gen_replace',
        opts.fromObject ? `from_${encodeURIComponent(opts.fromObject)}` : '',
        opts.toObject   ? `to_${encodeURIComponent(opts.toObject)}`   : '',
      ].filter(Boolean).join(';')
      break
    case 'gen_recolor':
      effectStr = [
        'gen_recolor',
        opts.prompt ? `prompt_${encodeURIComponent(opts.prompt)}` : '',
        opts.toColor ? `to-color_${opts.toColor.replace('#', '')}` : '',
        opts.multiply ? 'multiple_true' : '',
      ].filter(Boolean).join(';')
      break
    case 'gen_fill':
      effectStr = opts.prompt
        ? `gen_fill:prompt_${encodeURIComponent(opts.prompt)}`
        : 'gen_fill'
      break
    default:
      effectStr = operation
  }

  const segments: TransformSegment[] = []

  // If expanding canvas for gen_fill, add resize segment first
  if (operation === 'gen_fill' && (opts.width || opts.height || opts.aspectRatio)) {
    const resize: TransformSegment = { c: 'pad' }
    if (opts.width)       resize['w'] = opts.width
    if (opts.height)      resize['h'] = opts.height
    if (opts.aspectRatio) resize['ar'] = opts.aspectRatio
    segments.push(resize)
  }

  segments.push({ e: effectStr })

  return buildTransformUrl(publicId, segments)
}

// ─────────────────────────────────────────────────────────────
// ⑦ TEXT OVERLAY / WATERMARK
// ─────────────────────────────────────────────────────────────

export interface TextOverlayOptions {
  publicId: string
  text: string
  font?: string             // e.g. 'Arial'
  fontSize?: number
  fontWeight?: 'normal' | 'bold'
  color?: string            // hex without #
  opacity?: number          // 0–100
  gravity?: GravityMode
  x?: number
  y?: number
  background?: string
}

export function buildTextOverlayUrl(opts: TextOverlayOptions): string {
  const {
    publicId, text, font = 'Arial', fontSize = 40,
    fontWeight = 'normal', color = 'ffffff',
    opacity = 80, gravity = 'south_east', x = 20, y = 20,
    background,
  } = opts

  // Cloudinary text overlay format: l_text:FontName_size:text
  // Spaces in font names must be replaced with underscores
  const textEncoded = encodeURIComponent(text).replace(/%20/g, '_')
  const fontName = font.replace(/\s+/g, '_')
  const fontSpec = `${fontName}_${fontSize}${fontWeight === 'bold' ? '_bold' : ''}`

  const overlaySeg: TransformSegment = {
    l: `text:${fontSpec}:${textEncoded}`,
    co: `rgb:${color.replace('#', '')}`,
    o: opacity,
  }
  if (background) overlaySeg['b'] = `rgb:${background.replace('#', '')}`

  const positionSeg: TransformSegment = {
    fl: 'layer_apply',
    g: gravity,
    x,
    y,
  }

  return buildTransformUrl(publicId, [overlaySeg, positionSeg])
}

// ─────────────────────────────────────────────────────────────
// ⑧ IMAGE WATERMARK (image overlay)
// ─────────────────────────────────────────────────────────────

export interface ImageWatermarkOptions {
  publicId: string
  watermarkPublicId: string
  gravity?: GravityMode
  opacity?: number
  x?: number
  y?: number
  width?: number
}

export function buildImageWatermarkUrl(opts: ImageWatermarkOptions): string {
  const { publicId, watermarkPublicId, gravity = 'south_east', opacity = 60, x = 20, y = 20 } = opts

  const overlaySeg: TransformSegment = {
    l: watermarkPublicId.replace(/\//g, ':'),
    o: opacity,
  }
  if (opts.width) overlaySeg['w'] = opts.width

  const positionSeg: TransformSegment = {
    fl: 'layer_apply',
    g: gravity,
    x,
    y,
  }

  return buildTransformUrl(publicId, [overlaySeg, positionSeg])
}

// ─────────────────────────────────────────────────────────────
// ⑨ FORMAT CONVERSION
// ─────────────────────────────────────────────────────────────

export type OutputFormat = 'png' | 'jpg' | 'webp' | 'avif' | 'gif' | 'bmp' | 'tiff' | 'ico'

export interface FormatConvertOptions {
  publicId: string
  format: OutputFormat
  quality?: number | 'auto'
  lossless?: boolean
}

export function buildFormatConvertUrl(opts: FormatConvertOptions): string {
  const seg: TransformSegment = {
    f: opts.format,
    q: opts.quality ?? 'auto',
  }
  if (opts.lossless) seg['fl'] = 'lossless'
  return buildTransformUrl(opts.publicId, [seg])
}

// ─────────────────────────────────────────────────────────────
// ⑩ ROTATION & FLIP
// ─────────────────────────────────────────────────────────────

export function buildRotateUrl(publicId: string, angle: number): string {
  return buildTransformUrl(publicId, [{ a: angle }])
}

export function buildFlipUrl(publicId: string, direction: 'horizontal' | 'vertical' | 'both'): string {
  const effects: string[] = []
  if (direction === 'horizontal' || direction === 'both') effects.push('hflip')
  if (direction === 'vertical'   || direction === 'both') effects.push('vflip')
  return buildTransformUrl(publicId, effects.map(e => ({ e })))
}

// ─────────────────────────────────────────────────────────────
// ⑪ BORDER & ROUNDED CORNERS
// ─────────────────────────────────────────────────────────────

export function buildRoundedUrl(publicId: string, radius: number | 'max'): string {
  return buildTransformUrl(publicId, [{ r: radius === 'max' ? 'max' : radius }])
}

export function buildBorderUrl(publicId: string, width: number, color: string): string {
  return buildTransformUrl(publicId, [{ bo: `${width}px_solid_rgb:${color.replace('#', '')}` }])
}

// ─────────────────────────────────────────────────────────────
// ⑫ PIXELATE / BLUR FACES
// ─────────────────────────────────────────────────────────────

export function buildPixelateFacesUrl(publicId: string, squareSize: number = 20): string {
  return buildTransformUrl(publicId, [{ e: `pixelate_faces:${squareSize}` }])
}

export function buildBlurFacesUrl(publicId: string, strength: number = 600): string {
  return buildTransformUrl(publicId, [{ e: `blur_faces:${strength}` }])
}

// ─────────────────────────────────────────────────────────────
// Backwards-compat re-export (used by existing Sidebar.tsx)
// ─────────────────────────────────────────────────────────────

/** @deprecated Use buildGenAIUrl instead */
export function buildAITransformUrl(opts: {
  publicId: string
  type: 'background-remove' | 'upscale' | 'enhance' | 'generative-fill'
  prompt?: string
}): string {
  const opMap = {
    'background-remove': 'background_removal',
    'upscale': 'upscale',
    'enhance': 'enhance',
    'generative-fill': 'gen_fill',
  } as const
  return buildGenAIUrl({ publicId: opts.publicId, operation: opMap[opts.type], prompt: opts.prompt })
}

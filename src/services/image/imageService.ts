/**
 * Browser-side image processing service
 * Uses Canvas API for transformations that don't require Cloudinary
 */

import type { ImageAdjustments, ImageEffects } from '@/types'

// ============================================================
// Adjustments via CSS filter string (for canvas)
// ============================================================

export function buildCSSFilters(adj: ImageAdjustments): string {
  const filters: string[] = []

  if (adj.brightness !== 0) {
    filters.push(`brightness(${1 + adj.brightness / 100})`)
  }
  if (adj.contrast !== 0) {
    filters.push(`contrast(${1 + adj.contrast / 100})`)
  }
  if (adj.saturation !== 0) {
    filters.push(`saturate(${1 + adj.saturation / 100})`)
  }
  if (adj.blur > 0) {
    filters.push(`blur(${adj.blur * 0.5}px)`)
  }
  if (adj.sepia > 0) {
    filters.push(`sepia(${adj.sepia / 100})`)
  }
  if (adj.grayscale) {
    filters.push('grayscale(1)')
  }

  return filters.join(' ')
}

// ============================================================
// Konva-compatible filter (applied per pixel via Konva filters)
// ============================================================

export function buildKonvaFilters(adj: ImageAdjustments): Record<string, number | boolean> {
  return {
    brightness: adj.brightness / 100,          // Konva: -1 to 1
    contrast: adj.contrast / 100,               // Konva: -100 to 100 (we scale)
    saturation: adj.saturation / 100,           // Konva: -1 to 1
    blur: adj.blur,                              // Konva: radius in px
  }
}

// ============================================================
// Canvas-based resize
// ============================================================

export async function resizeImageCanvas(
  imageSrc: string,
  targetWidth: number,
  targetHeight: number,
  quality: number = 0.9
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = targetWidth
      canvas.height = targetHeight
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Canvas 2D context not available'))
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight)
      canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('Failed to create blob')),
        'image/png',
        quality
      )
    }
    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = imageSrc
  })
}

// ============================================================
// Canvas export
// ============================================================

export interface CanvasExportOptions {
  format: 'png' | 'jpg' | 'webp'
  quality: number
  scale: number
}

export function exportCanvasToBlob(
  canvas: HTMLCanvasElement,
  options: CanvasExportOptions
): Promise<Blob> {
  const { format, quality, scale } = options

  const exportCanvas = document.createElement('canvas')
  exportCanvas.width = canvas.width * scale
  exportCanvas.height = canvas.height * scale
  const ctx = exportCanvas.getContext('2d')
  if (!ctx) return Promise.reject(new Error('Canvas 2D context not available'))

  ctx.scale(scale, scale)
  ctx.drawImage(canvas, 0, 0)

  const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`

  return new Promise((resolve, reject) => {
    exportCanvas.toBlob(
      (blob) => blob ? resolve(blob) : reject(new Error('Export failed')),
      mimeType,
      quality / 100
    )
  })
}

// ============================================================
// Image flip
// ============================================================

export async function flipImage(
  imageSrc: string,
  horizontal: boolean,
  vertical: boolean
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Context unavailable'))
      ctx.save()
      ctx.translate(horizontal ? img.width : 0, vertical ? img.height : 0)
      ctx.scale(horizontal ? -1 : 1, vertical ? -1 : 1)
      ctx.drawImage(img, 0, 0)
      ctx.restore()
      resolve(canvas.toDataURL())
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

// ============================================================
// Simple local background removal via threshold (fallback)
// ============================================================

export async function removeWhiteBackground(
  imageSrc: string,
  threshold: number = 240
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return reject(new Error('Context unavailable'))
      ctx.drawImage(img, 0, 0)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        if (r > threshold && g > threshold && b > threshold) {
          data[i + 3] = 0
        }
      }

      ctx.putImageData(imageData, 0, 0)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = imageSrc
  })
}

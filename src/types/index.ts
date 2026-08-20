// ============================================================
// Gratis Core Data Model Types
// ============================================================

export type ID = string

export type LayerType = 'image' | 'text' | 'shape' | 'background'

export type ShapeType = 
  | 'rect' 
  | 'rounded-rect' 
  | 'circle' 
  | 'ellipse' 
  | 'line' 
  | 'arrow' 
  | 'triangle' 
  | 'star' 
  | 'polygon'
  | 'pentagon'
  | 'hexagon'
  | 'octagon'
  | 'diamond'
  | 'heart'
  | 'cross'

export type BlendMode = 
  | 'normal' 
  | 'multiply' 
  | 'screen' 
  | 'overlay' 
  | 'darken' 
  | 'lighten'
  | 'color-dodge'
  | 'color-burn'
  | 'hard-light'
  | 'soft-light'
  | 'difference'
  | 'exclusion'

export type FontWeight = 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900

export type TextAlign = 'left' | 'center' | 'right' | 'justify'

export type CropMode = 'none' | 'rect' | 'circle'

// ============================================================
// Image Adjustments
// ============================================================

export interface ImageAdjustments {
  brightness: number    // -100 to 100, default 0
  contrast: number      // -100 to 100, default 0
  saturation: number    // -100 to 100, default 0
  exposure: number      // -100 to 100, default 0
  sharpness: number     // 0 to 100, default 0
  blur: number          // 0 to 50, default 0
  gamma: number         // 0.1 to 4.0, default 1.0
  temperature: number   // -100 to 100, default 0 (warm/cool)
  tint: number          // -100 to 100, default 0
  grayscale: boolean    // default false
  sepia: number         // 0 to 100, default 0
}

export const defaultAdjustments: ImageAdjustments = {
  brightness: 0,
  contrast: 0,
  saturation: 0,
  exposure: 0,
  sharpness: 0,
  blur: 0,
  gamma: 1,
  temperature: 0,
  tint: 0,
  grayscale: false,
  sepia: 0,
}

// ============================================================
// Image Effects
// ============================================================

export interface ImageEffects {
  vignette: number        // 0 to 100, default 0
  pixelate: number        // 0 to 50, default 0
  noise: number           // 0 to 100, default 0
  duotone: DuotoneEffect | null
}

export interface DuotoneEffect {
  highlight: string   // hex color
  shadow: string      // hex color
  intensity: number   // 0 to 100
}

export const defaultEffects: ImageEffects = {
  vignette: 0,
  pixelate: 0,
  noise: 0,
  duotone: null,
}

// ============================================================
// Crop
// ============================================================

export interface CropRect {
  x: number
  y: number
  width: number
  height: number
}

// ============================================================
// Shadow
// ============================================================

export interface Shadow {
  enabled: boolean
  color: string
  blur: number
  offsetX: number
  offsetY: number
  opacity: number
}

export const defaultShadow: Shadow = {
  enabled: false,
  color: '#000000',
  blur: 10,
  offsetX: 2,
  offsetY: 4,
  opacity: 30,
}

// ============================================================
// Text Style
// ============================================================

export interface TextStyle {
  fontFamily: string
  fontSize: number
  fontWeight: FontWeight
  italic: boolean
  underline: boolean
  strikethrough: boolean
  color: string
  align: TextAlign
  lineHeight: number
  letterSpacing: number
  background: string | null
  outline: TextOutline | null
  shadow: Shadow
}

export interface TextOutline {
  color: string
  width: number
}

export const defaultTextStyle: TextStyle = {
  fontFamily: 'Inter',
  fontSize: 24,
  fontWeight: 400,
  italic: false,
  underline: false,
  strikethrough: false,
  color: '#1a1917',
  align: 'left',
  lineHeight: 1.4,
  letterSpacing: 0,
  background: null,
  outline: null,
  shadow: { ...defaultShadow },
}

// ============================================================
// Shape Style
// ============================================================

export interface ShapeStyle {
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  shadow: Shadow
  sides?: number        // for polygon
  numPoints?: number    // for star
  innerRadius?: number  // for star
}

export const defaultShapeStyle: ShapeStyle = {
  fill: '#6c47ff',
  stroke: 'transparent',
  strokeWidth: 0,
  cornerRadius: 0,
  shadow: { ...defaultShadow },
}

// ============================================================
// Base Layer
// ============================================================

export interface BaseLayer {
  id: ID
  type: LayerType
  name: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  blendMode: BlendMode
  scaleX: number
  scaleY: number
}

// ============================================================
// Layer Variants
// ============================================================

export interface ImageLayer extends BaseLayer {
  type: 'image'
  src: string             // object URL or cloudinary URL
  originalSrc: string     // original unmodified src
  cloudinaryPublicId?: string
  flipX: boolean
  flipY: boolean
  crop: CropRect | null
  cornerRadius: number
  border: { color: string; width: number } | null
  adjustments: ImageAdjustments
  effects: ImageEffects
  shadow: Shadow
  backgroundRemoved: boolean
}

export interface TextLayer extends BaseLayer {
  type: 'text'
  text: string
  style: TextStyle
}

export interface ShapeLayer extends BaseLayer {
  type: 'shape'
  shape: ShapeType
  style: ShapeStyle
  points?: number[]     // for line/arrow
}

export interface BackgroundLayer extends BaseLayer {
  type: 'background'
  fill: BackgroundFill
}

export type BackgroundFill = 
  | { type: 'solid'; color: string }
  | { type: 'gradient'; gradient: GradientFill }
  | { type: 'image'; src: string; size: 'cover' | 'contain' | 'fill' }
  | { type: 'transparent' }

export interface GradientFill {
  type: 'linear' | 'radial'
  angle: number
  stops: Array<{ offset: number; color: string }>
}

export type Layer = ImageLayer | TextLayer | ShapeLayer | BackgroundLayer

// ============================================================
// Project
// ============================================================

export interface Project {
  id: ID
  name: string
  width: number
  height: number
  unit: 'px' | 'in' | 'cm' | 'mm'
  dpi: number
  layers: Layer[]
  createdAt: number
  updatedAt: number
  thumbnail: string | null
  template: string | null
}

// ============================================================
// Canvas Preset
// ============================================================

export interface CanvasPreset {
  id: string
  name: string
  category: string
  width: number
  height: number
  unit: 'px'
  description?: string
  icon?: string
}

// ============================================================
// Template
// ============================================================

export interface Template {
  id: ID
  name: string
  category: string
  thumbnail: string
  width: number
  height: number
  layers: Layer[]
  tags: string[]
  isPremium: boolean
}

// ============================================================
// Asset
// ============================================================

export interface UploadedAsset {
  id: ID
  name: string
  src: string
  cloudinaryUrl?: string
  cloudinaryPublicId?: string
  width: number
  height: number
  size: number
  type: string
  uploadedAt: number
}

// ============================================================
// Editor State
// ============================================================

export interface EditorSelection {
  layerIds: ID[]
}

export interface EditorViewport {
  zoom: number
  panX: number
  panY: number
}

export interface HistoryEntry {
  id: ID
  timestamp: number
  label: string
  layers: Layer[]
}

// ============================================================
// Export Options
// ============================================================

export type ExportFormat = 'png' | 'jpg' | 'webp'

export interface ExportOptions {
  format: ExportFormat
  quality: number       // 0-100 for jpg/webp
  scale: number         // 1x, 2x, 3x
  background: 'transparent' | 'white' | 'canvas'
}

// ============================================================
// Cloudinary
// ============================================================

export interface CloudinaryConfig {
  cloudName: string
  uploadPreset: string
  isConfigured: boolean
}

export interface CloudinaryUploadResult {
  publicId: string
  secureUrl: string
  width: number
  height: number
  format: string
}

export interface CloudinaryTransformation {
  width?: number
  height?: number
  crop?: string
  gravity?: string
  quality?: string | number
  format?: string
  effect?: string | string[]
  angle?: number
  background?: string
}

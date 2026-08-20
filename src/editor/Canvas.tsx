import { useRef, useEffect, useCallback, useState } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, RegularPolygon, Arrow, Line, Transformer, Path } from 'react-konva'
import Konva from 'konva'
import useImage from 'use-image'
import { useEditorStore } from '@/stores/editorStore'
import type {
  Layer as GratisLayer, ImageLayer, TextLayer, ShapeLayer, BackgroundLayer
} from '@/types'
import { buildCSSFilters } from '@/services/image/imageService'
import { cn } from '@/utils'

// ============================================================
// Image layer renderer
// ============================================================

interface ImageLayerProps {
  layer: ImageLayer
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ImageLayer>) => void
  onTransformEnd: () => void
}

function ImageLayerNode({ layer, isSelected, onSelect, onUpdate, onTransformEnd }: ImageLayerProps) {
  const [image] = useImage(layer.src, 'anonymous')
  const nodeRef = useRef<Konva.Image>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  // Build filter string for CSS-like effects
  const adj = layer.adjustments
  const filterStr = buildCSSFilters(adj)

  const scaleX = layer.flipX ? -1 : 1
  const scaleY = layer.flipY ? -1 : 1

  return (
    <>
      <KonvaImage
        ref={nodeRef}
        image={image}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        rotation={layer.rotation}
        opacity={layer.opacity / 100}
        visible={layer.visible}
        scaleX={scaleX}
        scaleY={scaleY}
        offsetX={layer.flipX ? layer.width : 0}
        offsetY={layer.flipY ? layer.height : 0}
        cornerRadius={layer.cornerRadius}
        draggable={!layer.locked}
        onClick={onSelect}
        onTap={onSelect}
        onDragEnd={e => {
          onUpdate({ x: e.target.x(), y: e.target.y() })
          onTransformEnd()
        }}
        onTransformEnd={e => {
          const node = nodeRef.current
          if (!node) return
          const scX = node.scaleX()
          const scY = node.scaleY()
          onUpdate({
            x: node.x(),
            y: node.y(),
            width: Math.max(5, node.width() * Math.abs(scX)),
            height: Math.max(5, node.height() * Math.abs(scY)),
            rotation: node.rotation(),
            flipX: scX < 0 ? !layer.flipX : layer.flipX,
            flipY: scY < 0 ? !layer.flipY : layer.flipY,
          })
          node.scaleX(1)
          node.scaleY(1)
          onTransformEnd()
        }}
        filters={[
          ...(adj.brightness !== 0 || adj.contrast !== 0 ? [Konva.Filters.Brighten, Konva.Filters.Contrast] : []),
          ...(adj.blur > 0 ? [Konva.Filters.Blur] : []),
          ...(adj.grayscale ? [Konva.Filters.Grayscale] : []),
          ...(adj.sepia > 0 ? [Konva.Filters.Sepia] : []),
        ]}
        brightness={adj.brightness / 100}
        contrast={adj.contrast}
        blurRadius={adj.blur}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          rotateEnabled
          enabledAnchors={['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left']}
          boundBoxFunc={(oldBox, newBox) => {
            if (Math.abs(newBox.width) < 10 || Math.abs(newBox.height) < 10) return oldBox
            return newBox
          }}
          anchorStyleFunc={(anchor) => {
            anchor.cornerRadius(3)
          }}
          borderStroke="#6c47ff"
          borderStrokeWidth={1}
          anchorFill="#fff"
          anchorStroke="#6c47ff"
          anchorSize={8}
        />
      )}
    </>
  )
}

// ============================================================
// Text layer renderer
// ============================================================

interface TextLayerProps {
  layer: TextLayer
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<TextLayer>) => void
  onTransformEnd: () => void
  stageRef: React.RefObject<Konva.Stage>
  scale: number
}

function TextLayerNode({ layer, isSelected, onSelect, onUpdate, onTransformEnd, stageRef, scale }: TextLayerProps) {
  const nodeRef = useRef<Konva.Text>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const style = layer.style

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  function handleDblClick() {
    if (!nodeRef.current || !stageRef.current) return
    const node = nodeRef.current
    node.hide()

    const stageBox = stageRef.current.container().getBoundingClientRect()
    const absPos = node.getAbsolutePosition()

    const textarea = document.createElement('textarea')
    document.body.appendChild(textarea)
    textarea.value = layer.text
    textarea.style.position = 'fixed'
    textarea.style.top = `${stageBox.top + absPos.y}px`
    textarea.style.left = `${stageBox.left + absPos.x}px`
    textarea.style.width = `${node.width() * scale}px`
    textarea.style.fontSize = `${style.fontSize * scale}px`
    textarea.style.lineHeight = `${style.lineHeight}`
    textarea.style.fontFamily = style.fontFamily
    textarea.style.fontWeight = String(style.fontWeight)
    textarea.style.color = style.color
    textarea.style.background = 'transparent'
    textarea.style.border = '1px solid #6c47ff'
    textarea.style.outline = 'none'
    textarea.style.resize = 'none'
    textarea.style.padding = '0'
    textarea.style.margin = '0'
    textarea.style.overflow = 'hidden'
    textarea.style.zIndex = '9999'
    textarea.style.transform = `rotate(${node.rotation()}deg)`
    textarea.focus()
    textarea.select()

    function removeTextarea() {
      if (textarea.parentNode) textarea.parentNode.removeChild(textarea)
      node.show()
      stageRef.current?.container().focus()
    }

    textarea.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        removeTextarea()
      }
    })
    textarea.addEventListener('blur', () => {
      onUpdate({ text: textarea.value })
      removeTextarea()
    })
  }

  return (
    <>
      <Text
        ref={nodeRef}
        x={layer.x}
        y={layer.y}
        width={layer.width}
        height={layer.height}
        text={layer.text}
        fontSize={style.fontSize}
        fontFamily={style.fontFamily}
        fontStyle={`${style.italic ? 'italic' : 'normal'} ${style.fontWeight}`}
        textDecoration={style.underline ? 'underline' : style.strikethrough ? 'line-through' : ''}
        fill={style.color}
        align={style.align}
        lineHeight={style.lineHeight}
        letterSpacing={style.letterSpacing}
        rotation={layer.rotation}
        opacity={layer.opacity / 100}
        visible={layer.visible}
        draggable={!layer.locked}
        wrap="word"
        onClick={onSelect}
        onTap={onSelect}
        onDblClick={handleDblClick}
        onDblTap={handleDblClick}
        onDragEnd={e => {
          onUpdate({ x: e.target.x(), y: e.target.y() })
          onTransformEnd()
        }}
        onTransformEnd={e => {
          const node = nodeRef.current
          if (!node) return
          onUpdate({
            x: node.x(),
            y: node.y(),
            width: Math.max(20, node.width() * node.scaleX()),
            height: Math.max(10, node.height() * node.scaleY()),
            rotation: node.rotation(),
          })
          node.scaleX(1)
          node.scaleY(1)
          onTransformEnd()
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          enabledAnchors={['middle-left', 'middle-right', 'top-left', 'top-right', 'bottom-left', 'bottom-right']}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 20) return oldBox
            return newBox
          }}
          borderStroke="#6c47ff"
          borderStrokeWidth={1}
          anchorFill="#fff"
          anchorStroke="#6c47ff"
          anchorSize={8}
        />
      )}
    </>
  )
}

// ============================================================
// Shape layer renderer
// ============================================================

interface ShapeLayerProps {
  layer: ShapeLayer
  isSelected: boolean
  onSelect: () => void
  onUpdate: (updates: Partial<ShapeLayer>) => void
  onTransformEnd: () => void
}

function ShapeLayerNode({ layer, isSelected, onSelect, onUpdate, onTransformEnd }: ShapeLayerProps) {
  const nodeRef = useRef<Konva.Shape>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const s = layer.style

  useEffect(() => {
    if (isSelected && trRef.current && nodeRef.current) {
      trRef.current.nodes([nodeRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [isSelected])

  const commonProps = {
    x: layer.x + layer.width / 2,
    y: layer.y + layer.height / 2,
    offsetX: layer.width / 2,
    offsetY: layer.height / 2,
    rotation: layer.rotation,
    opacity: layer.opacity / 100,
    visible: layer.visible,
    fill: s.fill === 'transparent' ? undefined : s.fill,
    stroke: s.stroke === 'transparent' ? undefined : s.stroke,
    strokeWidth: s.strokeWidth,
    draggable: !layer.locked,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onUpdate({
        x: e.target.x() - layer.width / 2,
        y: e.target.y() - layer.height / 2,
      })
      onTransformEnd()
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const scX = node.scaleX()
      const scY = node.scaleY()
      onUpdate({
        x: node.x() - (layer.width * scX) / 2,
        y: node.y() - (layer.height * scY) / 2,
        width: Math.max(5, layer.width * scX),
        height: Math.max(5, layer.height * scY),
        rotation: node.rotation(),
      })
      node.scaleX(1)
      node.scaleY(1)
      onTransformEnd()
    },
    ref: nodeRef as React.RefObject<never>,
  }

  const transformer = isSelected ? (
    <Transformer
      ref={trRef}
      borderStroke="#6c47ff"
      borderStrokeWidth={1}
      anchorFill="#fff"
      anchorStroke="#6c47ff"
      anchorSize={8}
    />
  ) : null

  if (layer.shape === 'circle' || layer.shape === 'ellipse') {
    return (
      <>
        <Ellipse
          {...commonProps}
          radiusX={layer.width / 2}
          radiusY={layer.height / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'line') {
    return (
      <>
        <Line
          {...commonProps}
          points={[0, layer.height / 2, layer.width, layer.height / 2]}
          stroke={s.fill !== 'transparent' ? s.fill : s.stroke}
          strokeWidth={Math.max(2, s.strokeWidth)}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'arrow') {
    return (
      <>
        <Arrow
          {...commonProps}
          points={[0, layer.height / 2, layer.width, layer.height / 2]}
          stroke={s.fill !== 'transparent' ? s.fill : '#6c47ff'}
          strokeWidth={Math.max(2, s.strokeWidth || 3)}
          fill={s.fill !== 'transparent' ? s.fill : '#6c47ff'}
          pointerLength={12}
          pointerWidth={10}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'triangle') {
    return (
      <>
        <RegularPolygon
          {...commonProps}
          sides={3}
          radius={Math.min(layer.width, layer.height) / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'star') {
    return (
      <>
        <Star
          {...commonProps}
          numPoints={5}
          innerRadius={Math.min(layer.width, layer.height) * 0.2}
          outerRadius={Math.min(layer.width, layer.height) / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'pentagon') {
    return (
      <>
        <RegularPolygon
          {...commonProps}
          sides={5}
          radius={Math.min(layer.width, layer.height) / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'hexagon') {
    return (
      <>
        <RegularPolygon
          {...commonProps}
          sides={6}
          radius={Math.min(layer.width, layer.height) / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'octagon') {
    return (
      <>
        <RegularPolygon
          {...commonProps}
          sides={8}
          radius={Math.min(layer.width, layer.height) / 2}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'diamond') {
    const w = layer.width
    const h = layer.height
    return (
      <>
        <Path
          {...commonProps}
          data={`M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`}
          x={layer.x}
          y={layer.y}
          width={w}
          height={h}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'heart') {
    const w = layer.width
    const h = layer.height
    // Normalised heart path scaled to w×h
    const data = `M ${w * 0.5} ${h * 0.25} C ${w * 0.5} ${h * 0.1}, ${w * 0.75} ${h * 0.0}, ${w * 0.875} ${h * 0.2} C ${w} ${h * 0.35}, ${w} ${h * 0.55}, ${w * 0.5} ${h * 0.85} C 0 ${h * 0.55}, 0 ${h * 0.35}, ${w * 0.125} ${h * 0.2} C ${w * 0.25} ${h * 0.0}, ${w * 0.5} ${h * 0.1}, ${w * 0.5} ${h * 0.25} Z`
    return (
      <>
        <Path
          {...commonProps}
          data={data}
          x={layer.x}
          y={layer.y}
          width={w}
          height={h}
        />
        {transformer}
      </>
    )
  }

  if (layer.shape === 'cross') {
    const w = layer.width
    const h = layer.height
    const t = Math.min(w, h) * 0.3 // thickness of the cross arms
    const cx = (w - t) / 2
    const cy = (h - t) / 2
    const data = `M ${cx} 0 L ${cx + t} 0 L ${cx + t} ${cy} L ${w} ${cy} L ${w} ${cy + t} L ${cx + t} ${cy + t} L ${cx + t} ${h} L ${cx} ${h} L ${cx} ${cy + t} L 0 ${cy + t} L 0 ${cy} L ${cx} ${cy} Z`
    return (
      <>
        <Path
          {...commonProps}
          data={data}
          x={layer.x}
          y={layer.y}
          width={w}
          height={h}
        />
        {transformer}
      </>
    )
  }

  // Default: rect / rounded-rect
  return (
    <>
      <Rect
        {...commonProps}
        width={layer.width}
        height={layer.height}
        cornerRadius={s.cornerRadius}
      />
      {transformer}
    </>
  )
}

// Import missing Konva elements
import { Ellipse, Star } from 'react-konva'

// ============================================================
// Crop overlay — draggable crop rect for image layers
// ============================================================

interface CropOverlayProps {
  layer: ImageLayer
  cropRect: { x: number; y: number; width: number; height: number }
  onChange: (r: { x: number; y: number; width: number; height: number }) => void
  zoom: number
}

function CropOverlay({ layer, cropRect: crop, onChange, zoom }: CropOverlayProps) {
  const cropRef = useRef<Konva.Rect>(null)
  const trRef = useRef<Konva.Transformer>(null)

  useEffect(() => {
    if (trRef.current && cropRef.current) {
      trRef.current.nodes([cropRef.current])
      trRef.current.getLayer()?.batchDraw()
    }
  }, [])

  function clamp(val: number, min: number, max: number) {
    return Math.max(min, Math.min(max, val))
  }

  return (
    <>
      {/* Dark overlay outside the crop rect */}
      <Rect x={layer.x} y={layer.y} width={layer.width} height={Math.max(0, crop.y - layer.y)} fill="rgba(0,0,0,0.55)" listening={false} />
      <Rect x={layer.x} y={crop.y + crop.height} width={layer.width} height={Math.max(0, layer.y + layer.height - crop.y - crop.height)} fill="rgba(0,0,0,0.55)" listening={false} />
      <Rect x={layer.x} y={crop.y} width={Math.max(0, crop.x - layer.x)} height={crop.height} fill="rgba(0,0,0,0.55)" listening={false} />
      <Rect x={crop.x + crop.width} y={crop.y} width={Math.max(0, layer.x + layer.width - crop.x - crop.width)} height={crop.height} fill="rgba(0,0,0,0.55)" listening={false} />

      {/* Rule-of-thirds grid inside crop */}
      {[1/3, 2/3].map((f, i) => (
        <Line key={`cv${i}`} points={[crop.x + crop.width * f, crop.y, crop.x + crop.width * f, crop.y + crop.height]} stroke="rgba(255,255,255,0.35)" strokeWidth={1 / zoom} listening={false} />
      ))}
      {[1/3, 2/3].map((f, i) => (
        <Line key={`ch${i}`} points={[crop.x, crop.y + crop.height * f, crop.x + crop.width, crop.y + crop.height * f]} stroke="rgba(255,255,255,0.35)" strokeWidth={1 / zoom} listening={false} />
      ))}

      {/* Draggable crop rect */}
      <Rect
        ref={cropRef}
        x={crop.x}
        y={crop.y}
        width={crop.width}
        height={crop.height}
        stroke="#fff"
        strokeWidth={1.5 / zoom}
        fill="transparent"
        draggable
        onDragMove={e => {
          const newX = clamp(e.target.x(), layer.x, layer.x + layer.width - crop.width)
          const newY = clamp(e.target.y(), layer.y, layer.y + layer.height - crop.height)
          e.target.x(newX)
          e.target.y(newY)
        }}
        onDragEnd={e => {
          onChange({ ...crop, x: e.target.x(), y: e.target.y() })
        }}
        onTransformEnd={() => {
          const node = cropRef.current
          if (!node) return
          const newW = Math.max(10, node.width() * node.scaleX())
          const newH = Math.max(10, node.height() * node.scaleY())
          const newX = clamp(node.x(), layer.x, layer.x + layer.width - newW)
          const newY = clamp(node.y(), layer.y, layer.y + layer.height - newH)
          node.scaleX(1)
          node.scaleY(1)
          onChange({ x: newX, y: newY, width: newW, height: newH })
        }}
      />

      {/* Transformer for resize handles */}
      <Transformer
        ref={trRef}
        rotateEnabled={false}
        keepRatio={false}
        borderStroke="rgba(255,255,255,0.8)"
        borderStrokeWidth={1.5 / zoom}
        anchorFill="#fff"
        anchorStroke="#6c47ff"
        anchorSize={8}
        anchorCornerRadius={2}
        boundBoxFunc={(_old, newBox) => {
          const minX = layer.x
          const minY = layer.y
          const maxX = layer.x + layer.width
          const maxY = layer.y + layer.height
          const x = clamp(newBox.x, minX, maxX - 20)
          const y = clamp(newBox.y, minY, maxY - 20)
          return {
            ...newBox,
            x, y,
            width: Math.min(Math.max(20, newBox.width), maxX - x),
            height: Math.min(Math.max(20, newBox.height), maxY - y),
          }
        }}
      />
    </>
  )
}

// ============================================================
// Background renderer
// ============================================================

function BackgroundLayerNode({ layer }: { layer: BackgroundLayer }) {
  const fill = layer.fill

  if (fill.type === 'transparent') {
    return (
      <Rect
        x={0} y={0}
        width={layer.width} height={layer.height}
        fill="transparent"
      />
    )
  }

  if (fill.type === 'solid') {
    return (
      <Rect
        x={0} y={0}
        width={layer.width} height={layer.height}
        fill={fill.color}
      />
    )
  }

  if (fill.type === 'gradient') {
    const grad = fill.gradient
    const radAngle = (grad.angle * Math.PI) / 180
    const x2 = Math.cos(radAngle)
    const y2 = Math.sin(radAngle)

    return (
      <Rect
        x={0} y={0}
        width={layer.width} height={layer.height}
        fillLinearGradientStartPoint={{ x: 0, y: 0 }}
        fillLinearGradientEndPoint={{ x: layer.width * x2, y: layer.height * y2 }}
        fillLinearGradientColorStops={grad.stops.flatMap(s => [s.offset, s.color])}
      />
    )
  }

  return <Rect x={0} y={0} width={layer.width} height={layer.height} fill="#fff" />
}

// ============================================================
// Grid overlay
// ============================================================

function GridOverlay({ width, height, zoom }: { width: number; height: number; zoom: number }) {
  const gridSize = 20 // logical px
  const lines: React.ReactNode[] = []

  for (let x = gridSize; x < width; x += gridSize) {
    lines.push(<Line key={`v${x}`} points={[x, 0, x, height]} stroke="#e2e1db" strokeWidth={1 / zoom} opacity={0.5} />)
  }
  for (let y = gridSize; y < height; y += gridSize) {
    lines.push(<Line key={`h${y}`} points={[0, y, width, y]} stroke="#e2e1db" strokeWidth={1 / zoom} opacity={0.5} />)
  }

  return <>{lines}</>
}

// ============================================================
// Canvas Component
// ============================================================

interface CanvasProps {
  className?: string
  stageRef?: React.RefObject<Konva.Stage>
}

export function Canvas({ className, stageRef: externalStageRef }: CanvasProps) {
  const {
    project,
    selection,
    selectLayer,
    deselectAll,
    updateLayer,
    pushHistory,
    viewport,
    setZoom,
    setPan,
    showGrid,
    activeTool,
    setActiveTool,
    getLayers,
  } = useEditorStore()

  const localStageRef = useRef<Konva.Stage>(null)
  const stageRef = externalStageRef ?? localStageRef
  const containerRef = useRef<HTMLDivElement>(null)
  const [stageSize, setStageSize] = useState({ width: 800, height: 600 })
  const isDragging = useRef(false)
  const lastPointerPos = useRef({ x: 0, y: 0 })

  // Crop state — lives here so Apply button can read it
  const [cropRect, setCropRect] = useState<{ x: number; y: number; width: number; height: number } | null>(null)

  // Sync stage container size
  useEffect(() => {
    if (!containerRef.current) return
    const observer = new ResizeObserver(entries => {
      const entry = entries[0]
      if (entry) {
        setStageSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [])

  // Fit to screen on project load
  useEffect(() => {
    if (!project || !containerRef.current) return
    const { clientWidth: w, clientHeight: h } = containerRef.current
    const padding = 80
    const zoom = Math.min((w - padding * 2) / project.width, (h - padding * 2) / project.height, 2)
    const panX = (w - project.width * zoom) / 2
    const panY = (h - project.height * zoom) / 2
    useEditorStore.getState().setZoom(zoom)
    useEditorStore.getState().setPan(panX, panY)
  }, [project?.id])

  // Mouse wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault()
    if (!stageRef.current) return

    const oldScale = viewport.zoom
    const pointer = stageRef.current.getPointerPosition()
    if (!pointer) return

    const scaleBy = 1.06
    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy
    const clampedScale = Math.max(0.1, Math.min(10, newScale))

    const mousePointTo = {
      x: (pointer.x - viewport.panX) / oldScale,
      y: (pointer.y - viewport.panY) / oldScale,
    }

    const newPanX = pointer.x - mousePointTo.x * clampedScale
    const newPanY = pointer.y - mousePointTo.y * clampedScale

    setZoom(clampedScale)
    setPan(newPanX, newPanY)
  }, [viewport, setZoom, setPan])

  // Pan with middle mouse / space + drag
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.evt.button === 1 || (e.evt.button === 0 && activeTool === 'pan')) {
      isDragging.current = true
      lastPointerPos.current = { x: e.evt.clientX, y: e.evt.clientY }
    }
  }, [activeTool])

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDragging.current) return
    const dx = e.evt.clientX - lastPointerPos.current.x
    const dy = e.evt.clientY - lastPointerPos.current.y
    setPan(viewport.panX + dx, viewport.panY + dy)
    lastPointerPos.current = { x: e.evt.clientX, y: e.evt.clientY }
  }, [viewport, setPan])

  const handleMouseUp = useCallback(() => {
    isDragging.current = false
  }, [])

  // Crop mode init — must be before any early returns (rules of hooks)
  useEffect(() => {
    if (!project) return
    const layers = project.layers
    const selectedImgLayer = layers.find(
      l => l.type === 'image' && selection.layerIds.includes(l.id)
    ) as ImageLayer | undefined
    const entering = activeTool === 'crop' && !!selectedImgLayer
    if (entering && selectedImgLayer) {
      const existing = selectedImgLayer.crop
      setCropRect(existing
        ? { x: selectedImgLayer.x + existing.x, y: selectedImgLayer.y + existing.y, width: existing.width, height: existing.height }
        : { x: selectedImgLayer.x, y: selectedImgLayer.y, width: selectedImgLayer.width, height: selectedImgLayer.height }
      )
    } else if (!entering) {
      setCropRect(null)
    }
  }, [activeTool, selection.layerIds.join(','), project])

  if (!project) return (
    <div className={cn('flex-1 flex items-center justify-center bg-editor-bg', className)}>
      <p className="text-editor-muted text-sm">No project loaded</p>
    </div>
  )

  const layers = getLayers()

  // Determine crop target
  const selectedImageLayer = layers.find(
    l => l.type === 'image' && selection.layerIds.includes(l.id)
  ) as ImageLayer | undefined

  const isCropMode = activeTool === 'crop' && !!selectedImageLayer

  function applyCrop() {
    if (!selectedImageLayer || !cropRect) return
    updateLayer(selectedImageLayer.id, {
      crop: {
        x: cropRect.x - selectedImageLayer.x,
        y: cropRect.y - selectedImageLayer.y,
        width: cropRect.width,
        height: cropRect.height,
      }
    })
    pushHistory('Crop image')
    setActiveTool('select')
  }

  function cancelCrop() {
    setActiveTool('select')
  }

  return (
    <div
      id="canvas-workspace"
      ref={containerRef}
      className={cn('flex-1 overflow-hidden relative bg-editor-bg', className)}
      style={{ cursor: activeTool === 'pan' ? 'grab' : 'default' }}
    >
      {/* Checkerboard for transparent bg hint */}
      {project.layers[0]?.type === 'background' &&
       (project.layers[0] as BackgroundLayer).fill.type === 'transparent' && (
        <div
          className="absolute inset-0 checkerboard pointer-events-none opacity-20"
          aria-hidden
        />
      )}

      <Stage
        ref={stageRef}
        width={stageSize.width}
        height={stageSize.height}
        x={viewport.panX}
        y={viewport.panY}
        scaleX={viewport.zoom}
        scaleY={viewport.zoom}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={(e) => {
          // Deselect when clicking empty canvas area
          if (e.target === e.target.getStage()) {
            deselectAll()
          }
        }}
      >
        <Layer>
          {/* Canvas boundary shadow */}
          <Rect
            x={-2} y={-2}
            width={project.width + 4} height={project.height + 4}
            fill="rgba(0,0,0,0.3)"
            cornerRadius={1}
          />

          {/* Render all layers bottom to top */}
          {layers.map(layer => {
            if (!layer.visible) return null

            const isSelected = selection.layerIds.includes(layer.id)
            const baseProps = {
              layer,
              isSelected,
              onSelect: () => selectLayer(layer.id),
              onUpdate: (updates: Partial<GratisLayer>) => updateLayer(layer.id, updates),
              onTransformEnd: () => pushHistory('Transform'),
            }

            if (layer.type === 'background') {
              return <BackgroundLayerNode key={layer.id} layer={layer} />
            }
            if (layer.type === 'image') {
              return (
                <ImageLayerNode
                  key={layer.id}
                  {...baseProps}
                  layer={layer}
                  onUpdate={(u) => updateLayer(layer.id, u)}
                />
              )
            }
            if (layer.type === 'text') {
              return (
                <TextLayerNode
                  key={layer.id}
                  {...baseProps}
                  layer={layer}
                  onUpdate={(u) => updateLayer(layer.id, u)}
                  stageRef={stageRef}
                  scale={viewport.zoom}
                />
              )
            }
            if (layer.type === 'shape') {
              return (
                <ShapeLayerNode
                  key={layer.id}
                  {...baseProps}
                  layer={layer}
                  onUpdate={(u) => updateLayer(layer.id, u)}
                />
              )
            }
            return null
          })}

          {/* Grid overlay */}
          {showGrid && (
            <GridOverlay width={project.width} height={project.height} zoom={viewport.zoom} />
          )}

          {/* Crop overlay — rendered on top of everything */}
          {isCropMode && selectedImageLayer && cropRect && (
            <CropOverlay
              layer={selectedImageLayer}
              cropRect={cropRect}
              onChange={setCropRect}
              zoom={viewport.zoom}
            />
          )}
        </Layer>
      </Stage>

      {/* Crop mode control bar */}
      {isCropMode && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-editor-panel border border-editor-border rounded-xl px-4 py-2 shadow-xl z-10">
          <span className="text-xs text-editor-muted mr-2">Drag to adjust crop</span>
          <button
            onClick={cancelCrop}
            className="px-3 py-1.5 text-xs rounded-lg border border-editor-border text-editor-muted hover:text-editor-text hover:bg-editor-surface transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={applyCrop}
            className="px-3 py-1.5 text-xs rounded-lg bg-accent text-white hover:bg-accent/90 transition-colors font-medium"
          >
            Apply Crop
          </button>
        </div>
      )}

      {/* Canvas size indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-editor-muted/60 pointer-events-none">
        {project.width} × {project.height}px
      </div>
    </div>
  )
}

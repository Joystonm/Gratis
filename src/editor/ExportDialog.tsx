import { useState, useRef } from 'react'
import { Download } from 'lucide-react'
import Konva from 'konva'
import { Modal, ModalFooter } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useEditorStore } from '@/stores/editorStore'
import { downloadBlob } from '@/utils'
import { toastSuccess, toastError } from '@/stores/toastStore'
import { cn } from '@/utils'
import type { ExportFormat, ExportOptions } from '@/types'

interface ExportDialogProps {
  open: boolean
  onClose: () => void
  stageRef: React.RefObject<Konva.Stage>
}

export function ExportDialog({ open, onClose, stageRef }: ExportDialogProps) {
  const { project } = useEditorStore()
  const [format, setFormat] = useState<ExportFormat>('png')
  const [quality, setQuality] = useState(90)
  const [scale, setScale] = useState(1)
  const [exporting, setExporting] = useState(false)

  const formats: Array<{ id: ExportFormat; label: string; desc: string }> = [
    { id: 'png', label: 'PNG', desc: 'Lossless, supports transparency' },
    { id: 'jpg', label: 'JPEG', desc: 'Smaller file size, no transparency' },
    { id: 'webp', label: 'WebP', desc: 'Modern format, good quality/size ratio' },
  ]

  const scales = [
    { value: 1, label: '1×', size: project ? `${project.width} × ${project.height}` : '' },
    { value: 2, label: '2×', size: project ? `${project.width * 2} × ${project.height * 2}` : '' },
    { value: 3, label: '3×', size: project ? `${project.width * 3} × ${project.height * 3}` : '' },
  ]

  async function handleExport() {
    if (!project || !stageRef.current) {
      toastError('Export failed', 'No project or canvas available')
      return
    }

    setExporting(true)

    try {
      // Temporarily remove any selection/transformer overlays
      const stage = stageRef.current

      // Save viewport transform
      const stageX = stage.x()
      const stageY = stage.y()
      const stageScaleX = stage.scaleX()
      const stageScaleY = stage.scaleY()

      // Reset viewport for export
      stage.position({ x: 0, y: 0 })
      stage.scale({ x: 1, y: 1 })
      stage.batchDraw()

      // Hide transformers during export
      const transformers = stage.find('Transformer') as Konva.Transformer[]
      transformers.forEach(tr => tr.hide())
      stage.batchDraw()

      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`
      const pixelRatio = scale

      // Export to data URL then convert to blob
      const dataUrl = stage.toDataURL({
        mimeType,
        quality: quality / 100,
        pixelRatio,
        x: 0,
        y: 0,
        width: project.width,
        height: project.height,
      })

      // Restore viewport
      stage.position({ x: stageX, y: stageY })
      stage.scale({ x: stageScaleX, y: stageScaleY })
      transformers.forEach(tr => tr.show())
      stage.batchDraw()

      // Convert data URL to blob
      const response = await fetch(dataUrl)
      const blob = await response.blob()

      const extension = format === 'jpg' ? 'jpg' : format
      const filename = `${(project.name ?? 'gratis-design').replace(/[^a-z0-9]/gi, '-').toLowerCase()}.${extension}`
      downloadBlob(blob, filename)

      toastSuccess('Export complete', `Downloaded as ${filename}`)
      onClose()
    } catch (err) {
      console.error('Export error:', err)
      toastError('Export failed', err instanceof Error ? err.message : 'Please try again')
    } finally {
      setExporting(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Export Design" size="sm">
      <div className="px-6 py-4 space-y-5">
        {/* Format selection */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">Format</label>
          <div className="flex gap-2">
            {formats.map(f => (
              <button
                key={f.id}
                onClick={() => setFormat(f.id)}
                className={cn(
                  'flex-1 px-3 py-2 rounded-lg border text-sm font-medium transition-colors',
                  format === f.id
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-hairline text-body hover:border-hairline-strong'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-muted mt-1.5">
            {formats.find(f => f.id === format)?.desc}
          </p>
        </div>

        {/* Scale */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-widest text-muted mb-2">Resolution</label>
          <div className="flex gap-2">
            {scales.map(s => (
              <button
                key={s.value}
                onClick={() => setScale(s.value)}
                className={cn(
                  'flex-1 flex flex-col items-center px-2 py-2 rounded-lg border text-sm transition-colors',
                  scale === s.value
                    ? 'border-accent bg-accent-subtle text-accent'
                    : 'border-hairline text-body hover:border-hairline-strong'
                )}
              >
                <span className="font-medium">{s.label}</span>
                <span className="text-xs mt-0.5 opacity-70">{s.size}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Quality (for lossy formats) */}
        {(format === 'jpg' || format === 'webp') && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-widest text-muted">Quality</label>
              <span className="text-xs font-mono text-ink">{quality}%</span>
            </div>
            <input
              type="range"
              value={quality}
              min={10}
              max={100}
              step={5}
              onChange={e => setQuality(Number(e.target.value))}
              className="w-full accent-accent"
            />
            <div className="flex justify-between text-xs text-muted mt-1">
              <span>Smaller file</span>
              <span>Better quality</span>
            </div>
          </div>
        )}

        {/* Preview info */}
        <div className="p-3 rounded-lg bg-canvas border border-hairline text-xs text-muted space-y-1">
          <div className="flex justify-between">
            <span>Canvas size</span>
            <span className="font-mono text-ink">{project?.width} × {project?.height}px</span>
          </div>
          <div className="flex justify-between">
            <span>Export size</span>
            <span className="font-mono text-ink">
              {(project?.width ?? 0) * scale} × {(project?.height ?? 0) * scale}px
            </span>
          </div>
          <div className="flex justify-between">
            <span>Format</span>
            <span className="font-mono text-ink uppercase">{format}</span>
          </div>
        </div>
      </div>

      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button
          variant="primary"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={handleExport}
          loading={exporting}
        >
          Export
        </Button>
      </ModalFooter>
    </Modal>
  )
}

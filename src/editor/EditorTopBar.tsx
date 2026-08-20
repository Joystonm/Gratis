import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles, Undo2, Redo2, ZoomIn, ZoomOut, Maximize2,
  Download, Save, Eye, ChevronDown, Check, Grid3x3, Ruler
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import { useProjectStore } from '@/stores/projectStore'
import { IconButton } from '@/components/ui/IconButton'
import { Button } from '@/components/ui/Button'
import { cn } from '@/utils'

interface EditorTopBarProps {
  onExport: () => void
  onPreview: () => void
}

export function EditorTopBar({ onExport, onPreview }: EditorTopBarProps) {
  const navigate = useNavigate()
  const {
    project, canUndo, canRedo, undo, redo,
    viewport, setZoom, fitToScreen,
    showGrid, showRulers, toggleGrid, toggleRulers, snapEnabled, toggleSnap,
    isDirty
  } = useEditorStore()
  const { saveProject } = useProjectStore()

  const [saving, setSaving] = useState(false)
  const [showZoomMenu, setShowZoomMenu] = useState(false)
  const [projectName, setProjectName] = useState(project?.name ?? 'Untitled')
  const [editingName, setEditingName] = useState(false)

  const zoomPercent = Math.round(viewport.zoom * 100)

  const zoomLevels = [25, 50, 75, 100, 125, 150, 200, 300]

  async function handleSave() {
    if (!project) return
    setSaving(true)
    try {
      await saveProject({ ...project, updatedAt: Date.now() })
      useEditorStore.getState().setIsDirty(false)
    } catch {
      // error handled by store
    } finally {
      setSaving(false)
    }
  }

  function handleNameSubmit() {
    if (!project) return
    useEditorStore.getState().updateProject({ name: projectName })
    setEditingName(false)
  }

  return (
    <header className="h-14 bg-editor-panel border-b border-editor-border flex items-center px-4 gap-3 shrink-0 z-20">
      {/* Logo */}
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-1.5 hover:opacity-80 transition-opacity shrink-0"
        aria-label="Go to home"
      >
        <div className="w-6 h-6 bg-accent rounded-md flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="text-sm font-semibold text-editor-text hidden md:block">Gratis</span>
      </button>

      <div className="w-px h-6 bg-editor-border shrink-0" />

      {/* Project name */}
      <div className="flex-1 min-w-0 max-w-xs">
        {editingName ? (
          <input
            type="text"
            value={projectName}
            onChange={e => setProjectName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={e => { if (e.key === 'Enter') handleNameSubmit(); if (e.key === 'Escape') setEditingName(false) }}
            autoFocus
            className="w-full bg-editor-surface text-editor-text text-sm px-2 py-1 rounded border border-accent/50 focus:outline-none"
          />
        ) : (
          <button
            onClick={() => setEditingName(true)}
            className="text-sm text-editor-text hover:text-white transition-colors truncate max-w-full px-1"
          >
            {project?.name ?? 'Untitled'}
            {isDirty && <span className="ml-1 text-editor-muted">•</span>}
          </button>
        )}
      </div>

      <div className="flex-1" />

      {/* Undo / Redo */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={<Undo2 className="w-4 h-4" />}
          tooltip="Undo (Ctrl+Z)"
          variant="dark-ghost"
          size="sm"
          disabled={!canUndo}
          onClick={undo}
          tooltipSide="bottom"
        />
        <IconButton
          icon={<Redo2 className="w-4 h-4" />}
          tooltip="Redo (Ctrl+Shift+Z)"
          variant="dark-ghost"
          size="sm"
          disabled={!canRedo}
          onClick={redo}
          tooltipSide="bottom"
        />
      </div>

      <div className="w-px h-5 bg-editor-border" />

      {/* View toggles */}
      <div className="flex items-center gap-0.5">
        <IconButton
          icon={<Grid3x3 className="w-3.5 h-3.5" />}
          tooltip="Toggle grid"
          variant="dark-ghost"
          size="sm"
          active={showGrid}
          onClick={toggleGrid}
          tooltipSide="bottom"
        />
        <IconButton
          icon={<Ruler className="w-3.5 h-3.5" />}
          tooltip="Toggle rulers"
          variant="dark-ghost"
          size="sm"
          active={showRulers}
          onClick={toggleRulers}
          tooltipSide="bottom"
        />
        <button
          onClick={toggleSnap}
          className={cn(
            'h-7 px-2 text-xs rounded font-medium transition-colors',
            snapEnabled
              ? 'bg-accent/20 text-accent'
              : 'text-editor-muted hover:text-editor-text hover:bg-editor-surface'
          )}
          title="Toggle snap to grid"
        >
          Snap
        </button>
      </div>

      <div className="w-px h-5 bg-editor-border" />

      {/* Zoom controls */}
      <div className="flex items-center gap-1 relative">
        <IconButton
          icon={<ZoomOut className="w-3.5 h-3.5" />}
          tooltip="Zoom out"
          variant="dark-ghost"
          size="sm"
          onClick={() => setZoom(viewport.zoom - 0.1)}
          tooltipSide="bottom"
        />
        <button
          onClick={() => setShowZoomMenu(v => !v)}
          className="h-7 px-2 text-xs font-mono text-editor-text hover:bg-editor-surface rounded transition-colors flex items-center gap-1"
        >
          {zoomPercent}%
          <ChevronDown className="w-3 h-3 text-editor-muted" />
        </button>
        <IconButton
          icon={<ZoomIn className="w-3.5 h-3.5" />}
          tooltip="Zoom in"
          variant="dark-ghost"
          size="sm"
          onClick={() => setZoom(viewport.zoom + 0.1)}
          tooltipSide="bottom"
        />
        <IconButton
          icon={<Maximize2 className="w-3.5 h-3.5" />}
          tooltip="Fit to screen"
          variant="dark-ghost"
          size="sm"
          onClick={() => {
            const workspace = document.getElementById('canvas-workspace')
            if (workspace) {
              fitToScreen(workspace.clientWidth, workspace.clientHeight)
            }
          }}
          tooltipSide="bottom"
        />

        {/* Zoom dropdown */}
        {showZoomMenu && (
          <div
            className="absolute top-full mt-1 right-0 w-28 bg-editor-panel border border-editor-border rounded-lg shadow-lg z-50 py-1"
            onMouseLeave={() => setShowZoomMenu(false)}
          >
            {zoomLevels.map(z => (
              <button
                key={z}
                onClick={() => { setZoom(z / 100); setShowZoomMenu(false) }}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-1.5 text-xs hover:bg-editor-surface transition-colors',
                  zoomPercent === z ? 'text-accent' : 'text-editor-text'
                )}
              >
                <span>{z}%</span>
                {zoomPercent === z && <Check className="w-3 h-3" />}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="w-px h-5 bg-editor-border" />

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <IconButton
          icon={<Eye className="w-4 h-4" />}
          tooltip="Preview"
          variant="dark-ghost"
          onClick={onPreview}
          tooltipSide="bottom"
        />
        <IconButton
          icon={<Save className="w-4 h-4" />}
          tooltip="Save (Ctrl+S)"
          variant="dark-ghost"
          onClick={handleSave}
          tooltipSide="bottom"
        />
        <Button
          variant="primary"
          size="sm"
          leftIcon={<Download className="w-3.5 h-3.5" />}
          onClick={onExport}
          loading={saving}
        >
          Export
        </Button>
      </div>
    </header>
  )
}

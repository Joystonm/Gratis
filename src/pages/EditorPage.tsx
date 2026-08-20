import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Konva from 'konva'
import { useEditorStore } from '@/stores/editorStore'
import { useProjectStore } from '@/stores/projectStore'
import { EditorTopBar } from '@/editor/EditorTopBar'
import { LeftToolbar } from '@/editor/LeftToolbar'
import { Sidebar } from '@/editor/Sidebar'
import { Canvas } from '@/editor/Canvas'
import { PropertiesPanel } from '@/editor/PropertiesPanel'
import { ExportDialog } from '@/editor/ExportDialog'
import { useHotkeys } from 'react-hotkeys-hook'
import { toastError, toastSuccess } from '@/stores/toastStore'
import type { Layer } from '@/types'

// ============================================================
// Status Bar
// ============================================================

function StatusBar() {
  const { project, viewport, selection, setZoom } = useEditorStore()
  const zoom = Math.round(viewport.zoom * 100)
  const selectedCount = selection.layerIds.length

  return (
    <div className="h-7 bg-editor-panel border-t border-editor-border flex items-center px-4 gap-4 shrink-0">
      {/* Canvas size */}
      <span className="text-xs text-editor-muted font-mono">
        {project?.width} × {project?.height}px
      </span>

      <div className="h-3 w-px bg-editor-border" />

      {/* Zoom quick buttons */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => setZoom(viewport.zoom - 0.1)}
          className="text-xs text-editor-muted hover:text-editor-text px-1 transition-colors"
        >
          −
        </button>
        <button
          onClick={() => setZoom(1)}
          className="text-xs text-editor-muted hover:text-editor-text w-10 text-center font-mono transition-colors"
        >
          {zoom}%
        </button>
        <button
          onClick={() => setZoom(viewport.zoom + 0.1)}
          className="text-xs text-editor-muted hover:text-editor-text px-1 transition-colors"
        >
          +
        </button>
      </div>

      <div className="flex-1" />

      {/* Selection info */}
      {selectedCount > 0 && (
        <span className="text-xs text-editor-muted">
          {selectedCount} layer{selectedCount > 1 ? 's' : ''} selected
        </span>
      )}
    </div>
  )
}

// ============================================================
// Editor Page
// ============================================================

export function EditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const stageRef = useRef<Konva.Stage>(null)

  const { project, setProject, undo, redo, canUndo, canRedo, removeLayer, duplicateLayer, selection, deselectAll, fitToScreen } = useEditorStore()
  const { saveProject, loadProjects } = useProjectStore()
  const projectsRef = useRef(useProjectStore.getState().projects)

  const [showExport, setShowExport] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load project
  useEffect(() => {
    async function load() {
      if (!id) return navigate('/projects')

      setLoading(true)
      try {
        await loadProjects()
        const projects = useProjectStore.getState().projects
        const proj = projects.find(p => p.id === id)
        if (!proj) {
          toastError('Project not found', 'Redirecting to projects…')
          setTimeout(() => navigate('/projects'), 1500)
          return
        }
        setProject(proj)
      } catch {
        toastError('Failed to load project')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  // Auto-save every 30s
  useEffect(() => {
    if (!project) return
    const timer = setInterval(async () => {
      try {
        await saveProject({ ...project, updatedAt: Date.now() })
        useEditorStore.getState().setIsDirty(false)
      } catch {}
    }, 30000)
    return () => clearInterval(timer)
  }, [project])

  // Keyboard shortcuts
  useHotkeys('ctrl+z, cmd+z', (e) => { e.preventDefault(); undo() }, { enableOnFormTags: false })
  useHotkeys('ctrl+shift+z, cmd+shift+z', (e) => { e.preventDefault(); redo() }, { enableOnFormTags: false })
  useHotkeys('ctrl+s, cmd+s', async (e) => {
    e.preventDefault()
    if (!project) return
    try {
      await saveProject({ ...project, updatedAt: Date.now() })
      toastSuccess('Saved')
    } catch { toastError('Save failed') }
  }, { enableOnFormTags: false })
  useHotkeys('delete, backspace', () => {
    const { selection, getLayers, removeLayer } = useEditorStore.getState()
    selection.layerIds.forEach(id => {
      const layer = getLayers().find(l => l.id === id)
      if (layer && layer.type !== 'background') removeLayer(id)
    })
  }, { enableOnFormTags: false })
  useHotkeys('escape', () => deselectAll(), { enableOnFormTags: false })
  useHotkeys('ctrl+d, cmd+d', (e) => {
    e.preventDefault()
    selection.layerIds.forEach(id => duplicateLayer(id))
  }, { enableOnFormTags: false })

  // Arrow key nudging
  useHotkeys('arrowleft', () => nudgeSelected(-1, 0), { enableOnFormTags: false })
  useHotkeys('arrowright', () => nudgeSelected(1, 0), { enableOnFormTags: false })
  useHotkeys('arrowup', () => nudgeSelected(0, -1), { enableOnFormTags: false })
  useHotkeys('arrowdown', () => nudgeSelected(0, 1), { enableOnFormTags: false })
  useHotkeys('shift+arrowleft', () => nudgeSelected(-10, 0), { enableOnFormTags: false })
  useHotkeys('shift+arrowright', () => nudgeSelected(10, 0), { enableOnFormTags: false })
  useHotkeys('shift+arrowup', () => nudgeSelected(0, -10), { enableOnFormTags: false })
  useHotkeys('shift+arrowdown', () => nudgeSelected(0, 10), { enableOnFormTags: false })

  const nudgeSelected = useCallback((dx: number, dy: number) => {
    const { selection, getLayers, updateLayer } = useEditorStore.getState()
    selection.layerIds.forEach(id => {
      const layer = getLayers().find(l => l.id === id)
      if (layer && !layer.locked) {
        updateLayer(id, { x: layer.x + dx, y: layer.y + dy })
      }
    })
  }, [])

  if (loading) {
    return (
      <div className="h-screen bg-editor-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-editor-muted text-sm">Loading project…</p>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="h-screen bg-editor-bg flex items-center justify-center text-editor-muted">
        Project not found
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-editor-bg overflow-hidden">
      {/* Top bar */}
      <EditorTopBar
        onExport={() => setShowExport(true)}
        onPreview={() => setShowPreview(true)}
      />

      {/* Main editor area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left toolbar */}
        <LeftToolbar />

        {/* Sidebar (context-sensitive panels) */}
        <Sidebar />

        {/* Canvas workspace */}
        <Canvas className="flex-1" stageRef={stageRef} />

        {/* Right properties panel */}
        <PropertiesPanel />
      </div>

      {/* Status bar */}
      <StatusBar />

      {/* Export dialog */}
      <ExportDialog
        open={showExport}
        onClose={() => setShowExport(false)}
        stageRef={stageRef}
      />
    </div>
  )
}

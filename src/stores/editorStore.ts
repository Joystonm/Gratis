import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import type {
  Layer, Project, ID, ImageLayer, TextLayer, ShapeLayer, BackgroundLayer,
  EditorSelection, EditorViewport, HistoryEntry
} from '@/types'
import { generateId } from '@/utils'

const MAX_HISTORY = 50

interface EditorStore {
  // Project
  project: Project | null
  setProject: (project: Project) => void
  updateProject: (updates: Partial<Project>) => void

  // Layers
  getLayers: () => Layer[]
  addLayer: (layer: Layer) => void
  updateLayer: (id: ID, updates: Partial<Layer>) => void
  removeLayer: (id: ID) => void
  duplicateLayer: (id: ID) => void
  reorderLayers: (ids: ID[]) => void
  bringForward: (id: ID) => void
  sendBackward: (id: ID) => void
  bringToFront: (id: ID) => void
  sendToBack: (id: ID) => void

  // Selection
  selection: EditorSelection
  selectLayer: (id: ID, addToSelection?: boolean) => void
  selectLayers: (ids: ID[]) => void
  deselectAll: () => void
  getSelectedLayers: () => Layer[]

  // Viewport
  viewport: EditorViewport
  setZoom: (zoom: number) => void
  setPan: (panX: number, panY: number) => void
  fitToScreen: (containerWidth: number, containerHeight: number) => void

  // History (undo/redo)
  history: HistoryEntry[]
  historyIndex: number
  canUndo: boolean
  canRedo: boolean
  pushHistory: (label: string) => void
  undo: () => void
  redo: () => void

  // Active tool
  activeTool: EditorTool
  setActiveTool: (tool: EditorTool) => void

  // Active sidebar panel
  activeSidebarPanel: SidebarPanel | null
  setActiveSidebarPanel: (panel: SidebarPanel | null) => void

  // UI state
  showGrid: boolean
  showGuides: boolean
  showRulers: boolean
  snapEnabled: boolean
  toggleGrid: () => void
  toggleGuides: () => void
  toggleRulers: () => void
  toggleSnap: () => void

  // Dirty state (unsaved changes)
  isDirty: boolean
  setIsDirty: (dirty: boolean) => void
}

export type EditorTool = 
  | 'select' 
  | 'text' 
  | 'shape-rect' 
  | 'shape-circle' 
  | 'shape-line' 
  | 'shape-arrow'
  | 'draw'
  | 'crop'
  | 'pan'

export type SidebarPanel = 
  | 'layers'
  | 'templates'
  | 'images'
  | 'uploads'
  | 'text'
  | 'shapes'
  | 'ai'
  | 'background'
  | 'elements'
  | 'cloudinary'

function makeHistoryEntry(label: string, layers: Layer[]): HistoryEntry {
  return {
    id: generateId(),
    timestamp: Date.now(),
    label,
    layers: JSON.parse(JSON.stringify(layers)), // deep clone
  }
}

export const useEditorStore = create<EditorStore>()(
  subscribeWithSelector((set, get) => ({
    // Project
    project: null,
    setProject: (project) => {
      set({ project, isDirty: false })
      const initialHistory = makeHistoryEntry('Open project', project.layers)
      set({ history: [initialHistory], historyIndex: 0, canUndo: false, canRedo: false })
    },
    updateProject: (updates) => {
      const { project } = get()
      if (!project) return
      set({ project: { ...project, ...updates, updatedAt: Date.now() }, isDirty: true })
    },

    // Layers
    getLayers: () => get().project?.layers ?? [],
    
    addLayer: (layer) => {
      const { project } = get()
      if (!project) return
      const updatedProject = { ...project, layers: [...project.layers, layer], updatedAt: Date.now() }
      set({ project: updatedProject, isDirty: true })
      get().pushHistory(`Add ${layer.type} layer`)
      set({ selection: { layerIds: [layer.id] } })
    },

    updateLayer: (id, updates) => {
      const { project } = get()
      if (!project) return
      const layers = project.layers.map(l => 
        l.id === id ? { ...l, ...updates } as Layer : l
      )
      set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
    },

    removeLayer: (id) => {
      const { project, selection } = get()
      if (!project) return
      const layers = project.layers.filter(l => l.id !== id)
      const newSelection = { layerIds: selection.layerIds.filter(sid => sid !== id) }
      set({ project: { ...project, layers, updatedAt: Date.now() }, selection: newSelection, isDirty: true })
      get().pushHistory('Delete layer')
    },

    duplicateLayer: (id) => {
      const { project } = get()
      if (!project) return
      const layer = project.layers.find(l => l.id === id)
      if (!layer) return
      const newLayer: Layer = {
        ...JSON.parse(JSON.stringify(layer)),
        id: generateId(),
        name: `${layer.name} copy`,
        x: layer.x + 20,
        y: layer.y + 20,
      }
      const idx = project.layers.findIndex(l => l.id === id)
      const layers = [...project.layers]
      layers.splice(idx + 1, 0, newLayer)
      set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true, selection: { layerIds: [newLayer.id] } })
      get().pushHistory('Duplicate layer')
    },

    reorderLayers: (ids) => {
      const { project } = get()
      if (!project) return
      const layerMap = new Map(project.layers.map(l => [l.id, l]))
      const layers = ids.map(id => layerMap.get(id)!).filter(Boolean)
      set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
    },

    bringForward: (id) => {
      const { project } = get()
      if (!project) return
      const layers = [...project.layers]
      const idx = layers.findIndex(l => l.id === id)
      if (idx < layers.length - 1) {
        ;[layers[idx], layers[idx + 1]] = [layers[idx + 1], layers[idx]]
        set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
        get().pushHistory('Bring forward')
      }
    },

    sendBackward: (id) => {
      const { project } = get()
      if (!project) return
      const layers = [...project.layers]
      const idx = layers.findIndex(l => l.id === id)
      // Don't move past index 0 (background layer should stay at bottom)
      if (idx > 1) {
        ;[layers[idx], layers[idx - 1]] = [layers[idx - 1], layers[idx]]
        set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
        get().pushHistory('Send backward')
      }
    },

    bringToFront: (id) => {
      const { project } = get()
      if (!project) return
      const layers = [...project.layers]
      const idx = layers.findIndex(l => l.id === id)
      if (idx !== -1) {
        const [layer] = layers.splice(idx, 1)
        layers.push(layer)
        set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
        get().pushHistory('Bring to front')
      }
    },

    sendToBack: (id) => {
      const { project } = get()
      if (!project) return
      const layers = [...project.layers]
      const idx = layers.findIndex(l => l.id === id)
      const layer = layers[idx]
      if (layer?.type === 'background') return // can't move background
      if (idx > 1) {
        layers.splice(idx, 1)
        layers.splice(1, 0, layer) // insert after background (index 0)
        set({ project: { ...project, layers, updatedAt: Date.now() }, isDirty: true })
        get().pushHistory('Send to back')
      }
    },

    // Selection
    selection: { layerIds: [] },
    selectLayer: (id, addToSelection = false) => {
      const { selection } = get()
      if (addToSelection) {
        const layerIds = selection.layerIds.includes(id)
          ? selection.layerIds.filter(sid => sid !== id)
          : [...selection.layerIds, id]
        set({ selection: { layerIds } })
      } else {
        set({ selection: { layerIds: [id] } })
      }
    },
    selectLayers: (ids) => set({ selection: { layerIds: ids } }),
    deselectAll: () => set({ selection: { layerIds: [] } }),
    getSelectedLayers: () => {
      const { project, selection } = get()
      if (!project) return []
      return project.layers.filter(l => selection.layerIds.includes(l.id))
    },

    // Viewport
    viewport: { zoom: 1, panX: 0, panY: 0 },
    setZoom: (zoom) => set(state => ({ viewport: { ...state.viewport, zoom: Math.max(0.1, Math.min(10, zoom)) } })),
    setPan: (panX, panY) => set(state => ({ viewport: { ...state.viewport, panX, panY } })),
    fitToScreen: (containerWidth, containerHeight) => {
      const { project } = get()
      if (!project) return
      const padding = 80
      const scaleX = (containerWidth - padding * 2) / project.width
      const scaleY = (containerHeight - padding * 2) / project.height
      const zoom = Math.min(scaleX, scaleY, 2)
      const panX = (containerWidth - project.width * zoom) / 2
      const panY = (containerHeight - project.height * zoom) / 2
      set({ viewport: { zoom, panX, panY } })
    },

    // History
    history: [],
    historyIndex: -1,
    canUndo: false,
    canRedo: false,

    pushHistory: (label) => {
      const { project, history, historyIndex } = get()
      if (!project) return
      const entry = makeHistoryEntry(label, project.layers)
      // Truncate forward history
      const newHistory = [...history.slice(0, historyIndex + 1), entry].slice(-MAX_HISTORY)
      const newIndex = newHistory.length - 1
      set({ history: newHistory, historyIndex: newIndex, canUndo: newIndex > 0, canRedo: false })
    },

    undo: () => {
      const { history, historyIndex, project } = get()
      if (!project || historyIndex <= 0) return
      const newIndex = historyIndex - 1
      const entry = history[newIndex]
      set({
        project: { ...project, layers: JSON.parse(JSON.stringify(entry.layers)), updatedAt: Date.now() },
        historyIndex: newIndex,
        canUndo: newIndex > 0,
        canRedo: true,
        selection: { layerIds: [] },
        isDirty: true,
      })
    },

    redo: () => {
      const { history, historyIndex, project } = get()
      if (!project || historyIndex >= history.length - 1) return
      const newIndex = historyIndex + 1
      const entry = history[newIndex]
      set({
        project: { ...project, layers: JSON.parse(JSON.stringify(entry.layers)), updatedAt: Date.now() },
        historyIndex: newIndex,
        canUndo: true,
        canRedo: newIndex < history.length - 1,
        selection: { layerIds: [] },
        isDirty: true,
      })
    },

    // Active tool
    activeTool: 'select',
    setActiveTool: (tool) => set({ activeTool: tool }),

    // Active sidebar panel
    activeSidebarPanel: null,
    setActiveSidebarPanel: (panel) => set({ activeSidebarPanel: panel }),

    // UI toggles
    showGrid: false,
    showGuides: true,
    showRulers: true,
    snapEnabled: true,
    toggleGrid: () => set(s => ({ showGrid: !s.showGrid })),
    toggleGuides: () => set(s => ({ showGuides: !s.showGuides })),
    toggleRulers: () => set(s => ({ showRulers: !s.showRulers })),
    toggleSnap: () => set(s => ({ snapEnabled: !s.snapEnabled })),

    // Dirty state
    isDirty: false,
    setIsDirty: (dirty) => set({ isDirty: dirty }),
  }))
)

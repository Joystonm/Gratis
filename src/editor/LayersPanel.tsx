import { useState } from 'react'
import {
  Eye, EyeOff, Lock, Unlock, Trash2, Copy, ChevronUp,
  ChevronDown, Type, Image as ImageIcon, Shapes, Layers, GripVertical,
  MoreHorizontal
} from 'lucide-react'
import { useEditorStore } from '@/stores/editorStore'
import type { Layer } from '@/types'
import { cn } from '@/utils'
import { IconButton } from '@/components/ui/IconButton'

function LayerIcon({ type }: { type: Layer['type'] }) {
  const icons = {
    image: <ImageIcon className="w-3.5 h-3.5" />,
    text: <Type className="w-3.5 h-3.5" />,
    shape: <Shapes className="w-3.5 h-3.5" />,
    background: <Layers className="w-3.5 h-3.5" />,
  }
  const colors = {
    image: 'text-blue-400',
    text: 'text-green-400',
    shape: 'text-yellow-400',
    background: 'text-purple-400',
  }
  return <span className={cn(colors[type])}>{icons[type]}</span>
}

interface LayerItemProps {
  layer: Layer
  isSelected: boolean
  index: number
  total: number
  onSelect: (shift: boolean) => void
  onToggleVisible: () => void
  onToggleLock: () => void
  onDelete: () => void
  onDuplicate: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  onRename: (name: string) => void
}

function LayerItem({
  layer, isSelected, index, total,
  onSelect, onToggleVisible, onToggleLock, onDelete, onDuplicate,
  onMoveUp, onMoveDown, onRename
}: LayerItemProps) {
  const [renaming, setRenaming] = useState(false)
  const [nameValue, setNameValue] = useState(layer.name)
  const [showMenu, setShowMenu] = useState(false)

  function submitRename() {
    onRename(nameValue.trim() || layer.name)
    setRenaming(false)
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-1.5 px-2 py-1.5 rounded-md cursor-pointer select-none',
        'transition-colors text-sm',
        isSelected
          ? 'bg-accent/15 text-editor-text'
          : 'hover:bg-editor-surface text-editor-muted hover:text-editor-text',
        !layer.visible && 'opacity-40'
      )}
      onClick={(e) => onSelect(e.shiftKey)}
    >
      {/* Drag handle */}
      <GripVertical className="w-3 h-3 opacity-0 group-hover:opacity-40 cursor-grab shrink-0" />

      {/* Layer icon */}
      <LayerIcon type={layer.type} />

      {/* Name */}
      <div className="flex-1 min-w-0">
        {renaming ? (
          <input
            type="text"
            value={nameValue}
            onChange={e => setNameValue(e.target.value)}
            onBlur={submitRename}
            onKeyDown={e => { if (e.key === 'Enter') submitRename(); if (e.key === 'Escape') setRenaming(false) }}
            autoFocus
            onClick={e => e.stopPropagation()}
            className="w-full bg-editor-bg text-editor-text text-xs px-1 rounded border border-accent/40 focus:outline-none"
          />
        ) : (
          <span
            className="text-xs truncate block"
            onDoubleClick={e => { e.stopPropagation(); setRenaming(true) }}
          >
            {layer.name}
          </span>
        )}
      </div>

      {/* Actions (visible on hover/selected) */}
      <div className={cn(
        'flex items-center gap-0.5',
        'opacity-0 group-hover:opacity-100',
        isSelected && 'opacity-100'
      )}>
        {/* Visibility */}
        <button
          onClick={e => { e.stopPropagation(); onToggleVisible() }}
          className="p-0.5 rounded hover:bg-editor-border/50 transition-colors"
          title={layer.visible ? 'Hide layer' : 'Show layer'}
        >
          {layer.visible
            ? <Eye className="w-3 h-3" />
            : <EyeOff className="w-3 h-3" />
          }
        </button>

        {/* Lock */}
        <button
          onClick={e => { e.stopPropagation(); onToggleLock() }}
          className="p-0.5 rounded hover:bg-editor-border/50 transition-colors"
          title={layer.locked ? 'Unlock layer' : 'Lock layer'}
        >
          {layer.locked
            ? <Lock className="w-3 h-3 text-warning" />
            : <Unlock className="w-3 h-3" />
          }
        </button>

        {/* More menu */}
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setShowMenu(v => !v) }}
            className="p-0.5 rounded hover:bg-editor-border/50 transition-colors"
          >
            <MoreHorizontal className="w-3 h-3" />
          </button>
          {showMenu && (
            <div
              className="absolute right-0 top-full mt-1 w-36 bg-editor-panel border border-editor-border rounded-lg shadow-lg z-50 py-1"
              onMouseLeave={() => setShowMenu(false)}
            >
              {[
                { label: 'Rename', action: () => setRenaming(true), icon: null },
                { label: 'Duplicate', action: onDuplicate, icon: <Copy className="w-3 h-3" /> },
                { label: 'Move up', action: onMoveUp, icon: <ChevronUp className="w-3 h-3" />, disabled: index >= total - 1 },
                { label: 'Move down', action: onMoveDown, icon: <ChevronDown className="w-3 h-3" />, disabled: index <= 0 },
                'divider' as const,
                { label: 'Delete', action: onDelete, icon: <Trash2 className="w-3 h-3" />, danger: true, disabled: layer.type === 'background' },
              ].map((item, i) =>
                item === 'divider' ? (
                  <div key={i} className="my-1 h-px bg-editor-border" />
                ) : (
                  <button
                    key={item.label}
                    disabled={'disabled' in item ? item.disabled : false}
                    onClick={e => { e.stopPropagation(); item.action(); setShowMenu(false) }}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-1.5 text-xs transition-colors',
                      'hover:bg-editor-surface',
                      'danger' in item && item.danger ? 'text-error hover:text-error' : 'text-editor-text',
                      ('disabled' in item && item.disabled) && 'opacity-40 cursor-not-allowed'
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function LayersPanel() {
  const {
    getLayers, updateLayer, removeLayer, duplicateLayer,
    bringForward, sendBackward, selection, selectLayer, deselectAll
  } = useEditorStore()

  const layers = getLayers()
  // Reverse for display (top layer shows first)
  const reversed = [...layers].reverse()

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 flex items-center justify-between border-b border-editor-border">
        <span className="text-xs font-semibold uppercase tracking-widest text-editor-muted">Layers</span>
        <span className="text-xs text-editor-muted">{layers.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {reversed.map((layer, reversedIdx) => {
          const originalIdx = layers.length - 1 - reversedIdx
          const isSelected = selection.layerIds.includes(layer.id)

          return (
            <LayerItem
              key={layer.id}
              layer={layer}
              isSelected={isSelected}
              index={originalIdx}
              total={layers.length}
              onSelect={(shift) => {
                if (!shift) selectLayer(layer.id)
                else selectLayer(layer.id, true)
              }}
              onToggleVisible={() => updateLayer(layer.id, { visible: !layer.visible })}
              onToggleLock={() => updateLayer(layer.id, { locked: !layer.locked })}
              onDelete={() => { if (layer.type !== 'background') removeLayer(layer.id) }}
              onDuplicate={() => duplicateLayer(layer.id)}
              onMoveUp={() => bringForward(layer.id)}
              onMoveDown={() => sendBackward(layer.id)}
              onRename={(name) => updateLayer(layer.id, { name })}
            />
          )
        })}
      </div>

      {layers.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs text-editor-muted text-center px-4">
            No layers yet. Add text, shapes, or images to get started.
          </p>
        </div>
      )}
    </div>
  )
}

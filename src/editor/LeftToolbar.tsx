import {
  MousePointer2, LayoutTemplate, Image as ImageIcon, Upload, Type,
  Shapes, Wallpaper, Wand2, FolderOpen, Layers, Cloud
} from 'lucide-react'
import { useEditorStore, type EditorTool, type SidebarPanel } from '@/stores/editorStore'
import { IconButton } from '@/components/ui/IconButton'
import { cn } from '@/utils'

interface ToolEntry {
  id: EditorTool | SidebarPanel
  type: 'tool' | 'panel'
  icon: typeof MousePointer2
  tooltip: string
  accent?: boolean
}

const TOOL_ENTRIES: ToolEntry[] = [
  { id: 'select', type: 'tool', icon: MousePointer2, tooltip: 'Select (V)' },
]

const PANEL_ENTRIES: ToolEntry[] = [
  { id: 'layers',     type: 'panel', icon: Layers,        tooltip: 'Layers'          },
  { id: 'templates',  type: 'panel', icon: LayoutTemplate, tooltip: 'Templates'       },
  { id: 'images',     type: 'panel', icon: ImageIcon,      tooltip: 'Images'          },
  { id: 'uploads',    type: 'panel', icon: Upload,         tooltip: 'Uploads'         },
  { id: 'text',       type: 'panel', icon: Type,           tooltip: 'Text'            },
  { id: 'shapes',     type: 'panel', icon: Shapes,         tooltip: 'Shapes'          },
  { id: 'background', type: 'panel', icon: Wallpaper,      tooltip: 'Background'      },
  { id: 'ai',         type: 'panel', icon: Wand2,          tooltip: 'Local Tools'     },
  { id: 'cloudinary', type: 'panel', icon: Cloud,          tooltip: 'Image Tools', accent: true },
]

export function LeftToolbar() {
  const { activeTool, setActiveTool, activeSidebarPanel, setActiveSidebarPanel } = useEditorStore()

  function handleToolClick(entry: ToolEntry) {
    if (entry.type === 'tool') {
      setActiveTool(entry.id as EditorTool)
    } else {
      const panel = entry.id as SidebarPanel
      setActiveSidebarPanel(activeSidebarPanel === panel ? null : panel)
    }
  }

  return (
    <aside className="w-12 bg-editor-panel border-r border-editor-border flex flex-col items-center py-2 gap-1 shrink-0">
      {/* Primary tools */}
      {TOOL_ENTRIES.map(entry => (
        <IconButton
          key={entry.id}
          icon={<entry.icon className="w-4 h-4" />}
          tooltip={entry.tooltip}
          variant="dark-ghost"
          active={activeTool === entry.id}
          onClick={() => handleToolClick(entry)}
          tooltipSide="right"
          className="w-9 h-9"
        />
      ))}

      <div className="w-6 h-px bg-editor-border my-1" />

      {/* Panel launchers */}
      {PANEL_ENTRIES.map(entry => {
        const isActive = activeSidebarPanel === entry.id
        // Image Tools gets a special blue tint treatment
        if (entry.accent) {
          return (
            <button
              key={entry.id}
              onClick={() => handleToolClick(entry)}
              title={entry.tooltip}
              aria-label={entry.tooltip}
              className={cn(
                'w-9 h-9 rounded-md flex items-center justify-center transition-colors relative',
                isActive
                  ? 'bg-blue-500/20 text-blue-400'
                  : 'text-editor-muted hover:bg-editor-surface hover:text-editor-text',
              )}
            >
              <entry.icon className="w-4 h-4" />
              {/* Blue dot indicator */}
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-400" />
            </button>
          )
        }
        return (
          <IconButton
            key={entry.id}
            icon={<entry.icon className="w-4 h-4" />}
            tooltip={entry.tooltip}
            variant="dark-ghost"
            active={isActive}
            onClick={() => handleToolClick(entry)}
            tooltipSide="right"
            className="w-9 h-9"
          />
        )
      })}

      <div className="flex-1" />

      {/* Projects link */}
      <IconButton
        icon={<FolderOpen className="w-4 h-4" />}
        tooltip="My Projects"
        variant="dark-ghost"
        onClick={() => {
          window.open('/projects', '_blank')
        }}
        tooltipSide="right"
        className="w-9 h-9"
      />
    </aside>
  )
}

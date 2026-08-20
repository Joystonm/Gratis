import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Clock, Trash2, Copy, Sparkles, Search, FolderOpen } from 'lucide-react'
import { useProjectStore } from '@/stores/projectStore'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/utils'
import { cn } from '@/utils'
import { toastSuccess, toastError } from '@/stores/toastStore'
import type { Project } from '@/types'

function ProjectCard({ project, onOpen, onDuplicate, onDelete }: {
  project: Project
  onOpen: () => void
  onDuplicate: () => void
  onDelete: () => void
}) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  return (
    <div className="group relative bg-surface-card rounded-xl border border-hairline hover:border-hairline-strong hover:shadow-sm transition-all overflow-hidden">
      {/* Thumbnail */}
      <div
        className="aspect-[4/3] bg-gradient-to-br from-canvas to-surface-strong cursor-pointer overflow-hidden flex items-center justify-center"
        onClick={onOpen}
      >
        {project.thumbnail ? (
          <img
            src={project.thumbnail}
            alt={project.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-center p-4">
            <div className="w-8 h-8 rounded-lg bg-surface-strong flex items-center justify-center mx-auto mb-2">
              <Sparkles className="w-4 h-4 text-muted" />
            </div>
            <span className="text-xs text-muted">{project.width} × {project.height}px</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-medium text-ink truncate">{project.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Clock className="w-3 h-3 text-muted" />
              <span className="text-xs text-muted">{formatDate(project.updatedAt)}</span>
            </div>
            <div className="text-xs text-muted-soft mt-0.5">{project.width} × {project.height}px</div>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={e => { e.stopPropagation(); onDuplicate() }}
          className="p-1.5 rounded-md bg-surface-card/90 backdrop-blur-sm border border-hairline hover:bg-surface-strong transition-colors shadow-sm"
          title="Duplicate"
        >
          <Copy className="w-3 h-3 text-body" />
        </button>
        {confirmDelete ? (
          <div className="flex items-center gap-1">
            <button
              onClick={e => { e.stopPropagation(); onDelete(); setConfirmDelete(false) }}
              className="px-2 py-1 text-xs rounded-md bg-error text-white font-medium"
            >
              Delete
            </button>
            <button
              onClick={e => { e.stopPropagation(); setConfirmDelete(false) }}
              className="px-2 py-1 text-xs rounded-md bg-surface-card border border-hairline text-body"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={e => { e.stopPropagation(); setConfirmDelete(true) }}
            className="p-1.5 rounded-md bg-surface-card/90 backdrop-blur-sm border border-hairline hover:bg-surface-strong transition-colors shadow-sm"
            title="Delete"
          >
            <Trash2 className="w-3 h-3 text-body" />
          </button>
        )}
      </div>
    </div>
  )
}

export function ProjectsPage() {
  const navigate = useNavigate()
  const { projects, isLoading, loadProjects, deleteProject, duplicateProject } = useProjectStore()
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProjects()
  }, [])

  const filtered = projects.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  async function handleDuplicate(id: string) {
    try {
      await duplicateProject(id)
      toastSuccess('Project duplicated')
    } catch {
      toastError('Failed to duplicate project')
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteProject(id)
      toastSuccess('Project deleted')
    } catch {
      toastError('Failed to delete project')
    }
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* Header */}
      <header className="bg-canvas border-b border-hairline sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-7 h-7 bg-accent rounded-lg flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-base font-semibold text-ink">Gratis</span>
          </div>
          <nav className="flex items-center gap-4">
            <button onClick={() => navigate('/templates')} className="text-sm text-body hover:text-ink transition-colors">Templates</button>
            <button onClick={() => navigate('/assets')} className="text-sm text-body hover:text-ink transition-colors">Assets</button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />} onClick={() => navigate('/create')}>
              New Design
            </Button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-normal text-ink tracking-tight">Projects</h1>
            <p className="text-body mt-1">{projects.length} design{projects.length !== 1 ? 's' : ''} saved locally</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              placeholder="Search projects…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-md border border-hairline bg-surface-card text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-hairline">
                <div className="aspect-[4/3] skeleton" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-2/3 skeleton rounded" />
                  <div className="h-3 w-1/2 skeleton rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-surface-strong rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted" />
            </div>
            <h2 className="text-xl font-medium text-ink mb-2">
              {search ? 'No matching projects' : 'No projects yet'}
            </h2>
            <p className="text-body mb-6">
              {search ? 'Try a different search term.' : 'Create your first design to get started.'}
            </p>
            {!search && (
              <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={() => navigate('/create')}>
                Create Design
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* New project card */}
            <button
              onClick={() => navigate('/create')}
              className="aspect-[4/3] rounded-xl border-2 border-dashed border-hairline hover:border-accent/40 flex flex-col items-center justify-center gap-2 transition-colors hover:bg-accent-subtle/50 text-muted hover:text-accent"
            >
              <Plus className="w-6 h-6" />
              <span className="text-sm font-medium">New Design</span>
            </button>

            {filtered.map(project => (
              <ProjectCard
                key={project.id}
                project={project}
                onOpen={() => navigate(`/editor/${project.id}`)}
                onDuplicate={() => handleDuplicate(project.id)}
                onDelete={() => handleDelete(project.id)}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

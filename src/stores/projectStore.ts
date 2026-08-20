import { create } from 'zustand'
import type { Project } from '@/types'
import * as projectStorage from '@/services/storage/projectStorage'

interface ProjectStore {
  projects: Project[]
  isLoading: boolean
  error: string | null
  loadProjects: () => Promise<void>
  saveProject: (project: Project) => Promise<void>
  deleteProject: (id: string) => Promise<void>
  duplicateProject: (id: string) => Promise<Project | null>
}

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  loadProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const projects = await projectStorage.getAllProjects()
      set({ projects: projects.sort((a, b) => b.updatedAt - a.updatedAt) })
    } catch (err) {
      set({ error: 'Failed to load projects' })
      console.error('Failed to load projects:', err)
    } finally {
      set({ isLoading: false })
    }
  },

  saveProject: async (project) => {
    try {
      await projectStorage.saveProject(project)
      const { projects } = get()
      const existing = projects.findIndex(p => p.id === project.id)
      if (existing >= 0) {
        const updated = [...projects]
        updated[existing] = project
        set({ projects: updated.sort((a, b) => b.updatedAt - a.updatedAt) })
      } else {
        set({ projects: [project, ...projects] })
      }
    } catch (err) {
      console.error('Failed to save project:', err)
      throw err
    }
  },

  deleteProject: async (id) => {
    try {
      await projectStorage.deleteProject(id)
      const { projects } = get()
      set({ projects: projects.filter(p => p.id !== id) })
    } catch (err) {
      console.error('Failed to delete project:', err)
      throw err
    }
  },

  duplicateProject: async (id) => {
    const { projects } = get()
    const original = projects.find(p => p.id === id)
    if (!original) return null
    const duplicate: Project = {
      ...JSON.parse(JSON.stringify(original)),
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${original.name} (copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    }
    await get().saveProject(duplicate)
    return duplicate
  },
}))

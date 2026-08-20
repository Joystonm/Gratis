import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { Project, UploadedAsset } from '@/types'

interface GratisDB extends DBSchema {
  projects: {
    key: string
    value: Project
    indexes: { 'by-updated': number }
  }
  assets: {
    key: string
    value: UploadedAsset
    indexes: { 'by-uploaded': number }
  }
  preferences: {
    key: string
    value: unknown
  }
}

const DB_NAME = 'gratis-db'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<GratisDB>> | null = null

function getDB(): Promise<IDBPDatabase<GratisDB>> {
  if (!dbPromise) {
    dbPromise = openDB<GratisDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Projects store
        const projectStore = db.createObjectStore('projects', { keyPath: 'id' })
        projectStore.createIndex('by-updated', 'updatedAt')

        // Assets store
        const assetStore = db.createObjectStore('assets', { keyPath: 'id' })
        assetStore.createIndex('by-uploaded', 'uploadedAt')

        // Preferences store
        db.createObjectStore('preferences')
      },
    })
  }
  return dbPromise
}

// ============================================================
// Projects
// ============================================================

export async function getAllProjects(): Promise<Project[]> {
  const db = await getDB()
  return db.getAll('projects')
}

export async function getProject(id: string): Promise<Project | undefined> {
  const db = await getDB()
  return db.get('projects', id)
}

export async function saveProject(project: Project): Promise<void> {
  const db = await getDB()
  await db.put('projects', project)
}

export async function deleteProject(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('projects', id)
}

// ============================================================
// Assets
// ============================================================

export async function getAllAssets(): Promise<UploadedAsset[]> {
  const db = await getDB()
  return db.getAll('assets')
}

export async function saveAsset(asset: UploadedAsset): Promise<void> {
  const db = await getDB()
  await db.put('assets', asset)
}

export async function deleteAsset(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('assets', id)
}

// ============================================================
// Preferences
// ============================================================

export async function getPreference<T>(key: string): Promise<T | undefined> {
  const db = await getDB()
  return db.get('preferences', key) as Promise<T | undefined>
}

export async function setPreference(key: string, value: unknown): Promise<void> {
  const db = await getDB()
  await db.put('preferences', value, key)
}

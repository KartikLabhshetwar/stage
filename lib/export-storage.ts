/**
 * IndexedDB utility for storing exported images and user preferences
 */

const DB_NAME = 'stage-exports'
const DB_VERSION = 1
const EXPORTS_STORE = 'exports'
const PREFS_STORE = 'preferences'

interface ExportEntry {
  id: string
  blob: Blob
  format: 'png'
  quality: number
  scale: number
  timestamp: number
  fileName: string
}

interface ExportPreferences {
  id: 'export-preferences'
  format: 'png'
  quality: number
  scale: number
}

/**
 * Initialize IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create exports store
      if (!db.objectStoreNames.contains(EXPORTS_STORE)) {
        const exportsStore = db.createObjectStore(EXPORTS_STORE, { keyPath: 'id' })
        exportsStore.createIndex('timestamp', 'timestamp', { unique: false })
      }

      // Create preferences store
      if (!db.objectStoreNames.contains(PREFS_STORE)) {
        db.createObjectStore(PREFS_STORE, { keyPath: 'id' })
      }
    }
  })
}

/**
 * Save export preferences
 */
export async function saveExportPreferences(prefs: Omit<ExportPreferences, 'id'>): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PREFS_STORE], 'readwrite')
    const store = transaction.objectStore(PREFS_STORE)

    const entry: ExportPreferences = {
      id: 'export-preferences',
      ...prefs,
    }

    const request = store.put(entry)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get export preferences
 */
export async function getExportPreferences(): Promise<ExportPreferences | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([PREFS_STORE], 'readonly')
    const store = transaction.objectStore(PREFS_STORE)
    const request = store.get('export-preferences')

    request.onsuccess = () => {
      const entry = request.result as ExportPreferences | undefined
      resolve(entry || null)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Save exported image blob
 */
export async function saveExportedImage(
  blob: Blob,
  format: 'png',
  quality: number,
  scale: number,
  fileName: string
): Promise<string> {
  const db = await openDB()
  const id = `export-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE], 'readwrite')
    const store = transaction.objectStore(EXPORTS_STORE)

    const entry: ExportEntry = {
      id,
      blob,
      format,
      quality,
      scale,
      timestamp: Date.now(),
      fileName,
    }

    const request = store.put(entry)

    request.onsuccess = () => resolve(id)
    request.onerror = () => reject(request.error)
  })
}

/**
 * Get exported image blob
 */
export async function getExportedImage(id: string): Promise<ExportEntry | null> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE], 'readonly')
    const store = transaction.objectStore(EXPORTS_STORE)
    const request = store.get(id)

    request.onsuccess = () => {
      const entry = request.result as ExportEntry | undefined
      resolve(entry || null)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Get all exported images
 */
export async function getAllExportedImages(): Promise<ExportEntry[]> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE], 'readonly')
    const store = transaction.objectStore(EXPORTS_STORE)
    const request = store.getAll()

    request.onsuccess = () => {
      const entries = request.result as ExportEntry[]
      // Sort by timestamp descending
      entries.sort((a, b) => b.timestamp - a.timestamp)
      resolve(entries)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Delete exported image
 */
export async function deleteExportedImage(id: string): Promise<void> {
  const db = await openDB()

  return new Promise((resolve, reject) => {
    const transaction = db.transaction([EXPORTS_STORE], 'readwrite')
    const store = transaction.objectStore(EXPORTS_STORE)
    const request = store.delete(id)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

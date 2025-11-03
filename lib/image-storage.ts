/**
 * IndexedDB utility for storing and retrieving image blobs
 * This maintains full image quality while providing persistence
 */

const DB_NAME = "canvas-images";
const DB_VERSION = 1;
const STORE_NAME = "images";

interface ImageStorageEntry {
  id: string;
  blob: Blob;
  type: string;
  timestamp: number;
}

/**
 * Initialize IndexedDB database
 */
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });
}

/**
 * Save an image blob to IndexedDB
 * Returns a unique ID for the image
 */
export async function saveImageBlob(blob: Blob, imageId: string): Promise<string> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    
    const entry: ImageStorageEntry = {
      id: imageId,
      blob: blob,
      type: blob.type,
      timestamp: Date.now(),
    };
    
    const request = store.put(entry);
    
    request.onsuccess = () => resolve(imageId);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Retrieve an image blob from IndexedDB
 */
export async function getImageBlob(imageId: string): Promise<Blob | null> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(imageId);
    
    request.onsuccess = () => {
      const entry = request.result as ImageStorageEntry | undefined;
      resolve(entry?.blob || null);
    };
    
    request.onerror = () => reject(request.error);
  });
}

/**
 * Delete an image blob from IndexedDB
 */
export async function deleteImageBlob(imageId: string): Promise<void> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(imageId);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * Check if an image exists in IndexedDB
 */
export async function hasImageBlob(imageId: string): Promise<boolean> {
  const blob = await getImageBlob(imageId);
  return blob !== null;
}

/**
 * Generate a blob URL from a stored image ID
 * This recreates the blob URL from the stored blob
 */
export async function getBlobUrlFromStored(imageId: string): Promise<string | null> {
  const blob = await getImageBlob(imageId);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}

/**
 * Get all stored image IDs
 */
export async function getAllImageIds(): Promise<string[]> {
  const db = await openDB();
  
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAllKeys();
    
    request.onsuccess = () => {
      const keys = request.result as string[];
      resolve(keys);
    };
    
    request.onerror = () => reject(request.error);
  });
}


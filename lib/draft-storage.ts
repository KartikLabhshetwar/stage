// autosave drafts

import { EditorState, ImageState, OmitFunctions } from './store';

const DB_NAME = 'stage-draft';
const STORE_NAME = 'draft';
const VERSION_KEY = 'stage-draft-version';

// image store + editor store
export interface DraftStorage {
  id: string;
  editorState: OmitFunctions<EditorState>;
  imageState: OmitFunctions<ImageState>;
  timestamp: number;
}

// helper function that converts File into base64 string
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      if (fr.result) {
        resolve(fr.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    fr.onerror = () => reject(fr.error);
    fr.readAsDataURL(file);
  });
};

// helper to convert blob URL to base64
export const blobUrlToBase64 = async (blobUrl: string): Promise<string> => {
  try {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error converting blob URL to base64:', error);
    throw error;
  }
};

// Get current version from localStorage or default to 1
function getCurrentVersion(): number {
  const stored = localStorage.getItem(VERSION_KEY);
  return stored ? parseInt(stored, 10) : 1;
}

// Save version to localStorage
function saveVersion(version: number): void {
  localStorage.setItem(VERSION_KEY, version.toString());
}

// initialize indexeddb
async function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const version = getCurrentVersion();
    const request = indexedDB.open(DB_NAME, version);

    request.onerror = () => {
      console.error('IndexedDB error:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      const db = request.result;

      // If object store doesn't exist, we need to upgrade the database
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.close();

        // Increment version to trigger onupgradeneeded
        const newVersion = db.version + 1;
        saveVersion(newVersion);

        const upgradeRequest = indexedDB.open(DB_NAME, newVersion);

        upgradeRequest.onupgradeneeded = (event) => {
          const upgradeDb = (event.target as IDBOpenDBRequest).result;
          if (!upgradeDb.objectStoreNames.contains(STORE_NAME)) {
            upgradeDb.createObjectStore(STORE_NAME, { keyPath: 'id' });
          }
        };

        upgradeRequest.onsuccess = () => {
          resolve(upgradeRequest.result);
        };

        upgradeRequest.onerror = () => {
          console.error('IndexedDB upgrade error:', upgradeRequest.error);
          reject(upgradeRequest.error);
        };
      } else {
        resolve(db);
      }
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Save the new version
      saveVersion(db.version);

      // Create object store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

// save draft to indexeddb
export async function saveDraft(
  editorState: OmitFunctions<EditorState>,
  imageState: OmitFunctions<ImageState>,
): Promise<void> {
  try {
    const db = await openDB();

    const draft: DraftStorage = {
      id: 'draft',
      editorState,
      imageState,
      timestamp: Date.now(),
    };

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const request = store.put(draft);

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        console.error('Error saving draft:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to save draft:', error);
    throw error;
  }
}

// get draft from indexeddb
export async function getDraft(): Promise<DraftStorage | null> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get('draft');

      request.onsuccess = () => {
        const draft = request.result as DraftStorage | undefined;
        resolve(draft ?? null);
      };

      request.onerror = () => {
        console.error('Error loading draft:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to get draft:', error);
    return null;
  }
}

// delete draft from indexeddb
export async function deleteDraft(): Promise<void> {
  try {
    const db = await openDB();

    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete('draft');

      request.onsuccess = () => {
        resolve();
      };
      request.onerror = () => {
        console.error('Error deleting draft:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('Failed to delete draft:', error);
    throw error;
  }
}

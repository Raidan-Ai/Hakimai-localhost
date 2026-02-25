import { openDB, IDBPDatabase } from 'idb';

/**
 * Hakim AI - Offline Edge-Compute Sync Utility
 * Manages local storage of triage data during connectivity outages.
 */

const DB_NAME = 'HakimOfflineDB';
const STORE_NAME = 'triage_queue';

interface TriageEntry {
  id?: number;
  symptomsText: string;
  geographicLocation: string;
  timestamp: string;
  synced: boolean;
}

export async function initDB(): Promise<IDBPDatabase> {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
}

/**
 * Saves triage data locally when offline.
 */
export async function saveTriageLocally(data: Omit<TriageEntry, 'synced' | 'id'>) {
  const db = await initDB();
  await db.add(STORE_NAME, { ...data, synced: false });
  console.log('[OFFLINE] Triage data saved to local IndexedDB.');
}

/**
 * Background sync function to push local data to the server once online.
 */
export async function syncOfflineData() {
  if (!navigator.onLine) return;

  const db = await initDB();
  const tx = db.transaction(STORE_NAME, 'readwrite');
  const store = tx.objectStore(STORE_NAME);
  const allEntries: TriageEntry[] = await store.getAll();

  const unsynced = allEntries.filter(entry => !entry.synced);

  if (unsynced.length === 0) return;

  console.log(`[SYNC] Attempting to sync ${unsynced.length} records...`);

  for (const entry of unsynced) {
    try {
      const response = await fetch('/api/audit', { // Reusing audit endpoint for demo
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'OFFLINE_SYNC',
          resource: 'TriageData',
          userId: 'SYSTEM_SYNC',
          payload: entry
        })
      });

      if (response.ok) {
        await store.delete(entry.id!);
        console.log(`[SYNC] Successfully synced record ${entry.id}`);
      }
    } catch (error) {
      console.error(`[SYNC] Failed to sync record ${entry.id}:`, error);
      break; // Stop if we hit a network error again
    }
  }
}

// Listen for online status to trigger sync
if (typeof window !== 'undefined') {
  window.addEventListener('online', syncOfflineData);
}

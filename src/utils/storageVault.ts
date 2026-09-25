// IndexedDB and LocalStorage abstraction for true downloadable offline operation

const DB_NAME = 'PharmMed_ERP_Vault';
const DB_VERSION = 1;
const STORE_NAME = 'institutional_records';

export interface StorageVaultState {
  metrics: any[];
  sops: any[];
  audits: any[];
  courses: any[];
  assets: any[];
  chemicals: any[];
  budgets: any[];
  backups: any[];
  auditLogs: any[];
  syncQueue: any[];
  lastSyncedTimestamp: string;
}

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported'));
      return;
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveVaultData<T>(key: string, data: T): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(data, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    // Fallback to localStorage if IndexedDB is restricted
    try {
      localStorage.setItem(`pharmmed_${key}`, JSON.stringify(data));
    } catch (e) {
      console.warn('Storage quota or fallback error:', e);
    }
  }
}

export async function loadVaultData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => {
        if (req.result !== undefined) {
          resolve(req.result as T);
        } else {
          // Check localStorage fallback
          const lsData = localStorage.getItem(`pharmmed_${key}`);
          if (lsData) {
            try {
              resolve(JSON.parse(lsData));
              return;
            } catch {
              // fallback to default
            }
          }
          resolve(defaultValue);
        }
      };
      req.onerror = () => resolve(defaultValue);
    });
  } catch {
    const lsData = localStorage.getItem(`pharmmed_${key}`);
    if (lsData) {
      try {
        return JSON.parse(lsData);
      } catch {
        return defaultValue;
      }
    }
    return defaultValue;
  }
}

// Compute deterministic SHA-256 style hash for backup exports
export async function generateSHA256Checksum(content: string): Promise<string> {
  if (window.crypto && window.crypto.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(content);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  // Fallback pseudorandom hash
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(16, '0') + 'c7e9a8f2';
}

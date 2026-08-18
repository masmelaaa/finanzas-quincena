// Respaldo automático en IndexedDB: una segunda copia de los datos, independiente
// de localStorage. Sirve de red de seguridad si localStorage se corrompe o se
// borra (algunos navegadores lo limpian bajo presión de espacio con más facilidad
// que IndexedDB). No reemplaza el export manual — es un respaldo silencioso.

const DB_NAME = "quincena-backup";
const STORE = "backups";
const KEY = "latest";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function saveBackup(json: string): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({ json, savedAt: new Date().toISOString() }, KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  } catch {
    // IndexedDB puede no estar disponible (modo privado, etc.) — no es crítico.
  }
}

export async function loadBackup(): Promise<{ json: string; savedAt: string } | null> {
  try {
    const db = await openDb();
    const result = await new Promise<{ json: string; savedAt: string } | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(KEY);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => reject(req.error);
    });
    db.close();
    return result;
  } catch {
    return null;
  }
}

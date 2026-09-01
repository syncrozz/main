/**
 * Safe LocalStorage Helper with QuotaExceeded error handling and self-pruning.
 */

export function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err: any) {
    const isQuotaError = 
      err?.name === 'QuotaExceededError' || 
      err?.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      err?.code === 22 ||
      err?.code === 1014 ||
      err?.message?.includes('exceeded the quota') ||
      err?.message?.includes('QuotaExceeded');

    if (isQuotaError) {
      console.warn(`[SafeStorage] LocalStorage quota reached when saving key "${key}". Cleaning old cache...`);
      // Try to clear non-essential cached keys
      tryPruneLocalStorage();

      // Retry once after pruning
      try {
        localStorage.setItem(key, value);
        return true;
      } catch (retryErr) {
        console.warn(`[SafeStorage] Could not persist key "${key}" to LocalStorage even after pruning. Continuing in-memory.`, retryErr);
        return false;
      }
    } else {
      console.warn(`[SafeStorage] LocalStorage error on key "${key}":`, err);
      return false;
    }
  }
}

export function safeLocalStorageGet<T = string>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null || raw === undefined) return fallback;
    return raw as unknown as T;
  } catch {
    return fallback;
  }
}

export function safeLocalStorageRemove(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch {}
}

/**
 * Remove stale or temporary caches to free space
 */
function tryPruneLocalStorage(): void {
  try {
    // List of non-critical temporary keys that can be pruned if quota is reached
    const prunableKeys = [
      'firebase:previous_websocket_failure',
      'loglevel:webpack-dev-server'
    ];

    for (const k of prunableKeys) {
      localStorage.removeItem(k);
    }
  } catch {}
}

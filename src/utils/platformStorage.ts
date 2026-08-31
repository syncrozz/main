import { PlatformItem } from '../types';
import { PLATFORMS_DATA } from '../data/platforms';
import { saveDeletedDefaultPlatformIdsToFirestore } from '../services/firestoreService';

const CUSTOM_PLATFORMS_STORAGE_KEY = 'syncrozz_custom_platforms_v1';
const DELETED_DEFAULT_PLATFORMS_KEY = 'syncrozz_deleted_default_platforms_v1';

/**
 * Get locally stored custom platforms
 */
export function getLocalCustomPlatforms(): PlatformItem[] {
  try {
    const data = localStorage.getItem(CUSTOM_PLATFORMS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load custom platforms from storage:', e);
    return [];
  }
}

/**
 * Get IDs of default platforms marked as hidden/deleted
 */
export function getDeletedDefaultPlatformIds(): string[] {
  try {
    const data = localStorage.getItem(DELETED_DEFAULT_PLATFORMS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error('Failed to load deleted platform IDs:', e);
    return [];
  }
}

/**
 * Save custom platforms to localStorage
 */
export function saveLocalCustomPlatforms(platforms: PlatformItem[]): void {
  try {
    localStorage.setItem(CUSTOM_PLATFORMS_STORAGE_KEY, JSON.stringify(platforms));
  } catch (e) {
    console.error('Failed to save custom platforms to storage:', e);
  }
}

/**
 * Save deleted default platform IDs
 */
export function saveDeletedDefaultPlatformIds(ids: string[]): void {
  try {
    localStorage.setItem(DELETED_DEFAULT_PLATFORMS_KEY, JSON.stringify(ids));
    saveDeletedDefaultPlatformIdsToFirestore(ids).catch(() => {});
  } catch (e) {
    console.error('Failed to save deleted platform IDs:', e);
  }
}

/**
 * Helper to safely extract creation or update timestamp from a platform
 */
export function getPlatformTimestamp(item: PlatformItem): number {
  if (!item) return 0;
  if (typeof item.updatedAt === 'number' && item.updatedAt > 0) return item.updatedAt;
  if (typeof item.updatedAt === 'string') {
    const parsed = new Date(item.updatedAt).getTime();
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  if (typeof item.createdAt === 'number' && item.createdAt > 0) return item.createdAt;
  if (typeof item.createdAt === 'string') {
    const parsed = new Date(item.createdAt).getTime();
    if (!isNaN(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

/**
 * Get combined list of all platforms (built-in defaults + custom added, with overrides)
 * Newly added custom platforms are ALWAYS positioned at the top in newest-first order.
 *
 * Real-time synchronization guarantee:
 * When firestoreCustomList is provided (from live Firebase onSnapshot), Firestore is the
 * authoritative cloud state.
 */
export function getAllPlatforms(firestoreCustomList?: PlatformItem[] | null, firestoreDeletedIds?: string[] | null): PlatformItem[] {
  const localCustom = getLocalCustomPlatforms();
  const localDeleted = getDeletedDefaultPlatformIds();
  
  // If Firestore provides deletedIds, synchronize with local storage
  const deletedIds = new Set([
    ...(firestoreDeletedIds !== undefined && firestoreDeletedIds !== null ? firestoreDeletedIds : localDeleted)
  ]);

  // Combine platforms into a map by id
  const customMap = new Map<string, PlatformItem>();

  if (firestoreCustomList && Array.isArray(firestoreCustomList)) {
    // 1. Live Firestore Cloud State is primary authority
    firestoreCustomList.forEach((item) => {
      if (item && item.id) {
        customMap.set(item.id, item);
      }
    });

    // 2. If there are pending local updates with strictly newer timestamp, keep them
    localCustom.forEach((localItem) => {
      if (localItem && localItem.id) {
        const firestoreItem = customMap.get(localItem.id);
        if (firestoreItem) {
          const localTime = getPlatformTimestamp(localItem);
          const firestoreTime = getPlatformTimestamp(firestoreItem);
          if (localTime > firestoreTime) {
            customMap.set(localItem.id, localItem);
          }
        }
      }
    });
  } else {
    // Fallback to local storage if Firestore has not emitted yet
    localCustom.forEach((item) => {
      if (item && item.id) {
        customMap.set(item.id, item);
      }
    });
  }

  const defaultIdSet = new Set(PLATFORMS_DATA.map(p => p.id));

  // Collect brand new custom platforms (not in default PLATFORMS_DATA)
  const customPlatformsList: PlatformItem[] = [];
  customMap.forEach((item, id) => {
    if (!defaultIdSet.has(id) && !deletedIds.has(id)) {
      customPlatformsList.push(item);
    }
  });

  // Sort custom platforms newest-first (descending timestamp).
  customPlatformsList.sort((a, b) => {
    const timeA = getPlatformTimestamp(a);
    const timeB = getPlatformTimestamp(b);
    if (timeA && timeB) {
      return timeB - timeA;
    }
    if (timeA && !timeB) return -1;
    if (!timeA && timeB) return 1;
    return 0;
  });

  // Built-in default platforms (with any overrides applied from customMap)
  const defaultPlatformsList: PlatformItem[] = [];
  PLATFORMS_DATA.forEach((def) => {
    if (deletedIds.has(def.id)) {
      return;
    }
    if (customMap.has(def.id)) {
      defaultPlatformsList.push(customMap.get(def.id)!);
    } else {
      defaultPlatformsList.push(def);
    }
  });

  // Combine: Custom/Newly added platforms are ALWAYS positioned at the top, followed by default platforms
  return [...customPlatformsList, ...defaultPlatformsList];
}

/**
 * Add or update a platform
 */
export function savePlatform(platform: PlatformItem): PlatformItem[] {
  const current = getLocalCustomPlatforms();
  const deletedIds = getDeletedDefaultPlatformIds().filter(id => id !== platform.id);
  saveDeletedDefaultPlatformIds(deletedIds);

  const index = current.findIndex((p) => p.id === platform.id);
  let updated: PlatformItem[];

  const now = Date.now();
  const platformWithTimestamp: PlatformItem = {
    ...platform,
    createdAt: platform.createdAt || (index >= 0 ? current[index]?.createdAt : undefined) || now,
    updatedAt: now,
    isCustom: platform.isCustom ?? true
  };

  if (index >= 0) {
    updated = [...current];
    updated[index] = platformWithTimestamp;
  } else {
    // New item: Prepend to the top so newest is always first
    updated = [platformWithTimestamp, ...current];
  }

  saveLocalCustomPlatforms(updated);
  return getAllPlatforms(updated);
}

/**
 * Delete a custom platform or hide a default platform
 */
export function deletePlatform(platformId: string): PlatformItem[] {
  const isDefault = PLATFORMS_DATA.some((p) => p.id === platformId);
  
  if (isDefault) {
    const deleted = getDeletedDefaultPlatformIds();
    if (!deleted.includes(platformId)) {
      saveDeletedDefaultPlatformIds([...deleted, platformId]);
    }
  }

  const current = getLocalCustomPlatforms().filter((p) => p.id !== platformId);
  saveLocalCustomPlatforms(current);

  return getAllPlatforms(current);
}

/**
 * Reset all platforms to default factory settings
 */
export function resetAllPlatformsToDefault(): PlatformItem[] {
  localStorage.removeItem(CUSTOM_PLATFORMS_STORAGE_KEY);
  localStorage.removeItem(DELETED_DEFAULT_PLATFORMS_KEY);
  return [...PLATFORMS_DATA];
}

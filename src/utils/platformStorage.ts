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
 * Get combined list of all platforms (built-in defaults + custom added, with overrides)
 */
export function getAllPlatforms(firestoreCustomList?: PlatformItem[], firestoreDeletedIds?: string[]): PlatformItem[] {
  const localCustom = getLocalCustomPlatforms();
  const localDeleted = getDeletedDefaultPlatformIds();
  
  const deletedIds = new Set([
    ...localDeleted,
    ...(firestoreDeletedIds || [])
  ]);

  // Combine both firestore and local custom platforms into a map by id
  const customMap = new Map<string, PlatformItem>();

  // 1. Load firestore items
  if (firestoreCustomList && Array.isArray(firestoreCustomList)) {
    firestoreCustomList.forEach((item) => {
      if (item && item.id) {
        customMap.set(item.id, item);
      }
    });
  }

  // 2. Load local items (local items merge seamlessly and take precedence for local edits)
  localCustom.forEach((item) => {
    if (item && item.id) {
      customMap.set(item.id, item);
    }
  });

  // Start with default platforms that are not deleted
  const result: PlatformItem[] = [];
  const processedIds = new Set<string>();

  PLATFORMS_DATA.forEach((def) => {
    if (deletedIds.has(def.id)) {
      return;
    }
    if (customMap.has(def.id)) {
      result.push(customMap.get(def.id)!);
    } else {
      result.push(def);
    }
    processedIds.add(def.id);
  });

  // Add brand new custom platforms
  customMap.forEach((item, id) => {
    if (!processedIds.has(id) && !deletedIds.has(id)) {
      result.push(item);
      processedIds.add(id);
    }
  });

  return result;
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

  if (index >= 0) {
    updated = [...current];
    updated[index] = platform;
  } else {
    updated = [platform, ...current];
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

import fs from 'fs';
import path from 'path';
import { PlatformItem } from '../types.ts';
import { CarouselSlide } from '../utils/carouselStorage.ts';

export interface CloudStoreData {
  version: number;
  lastUpdated: number;
  platforms: PlatformItem[];
  customUrls: Record<string, string>;
  carouselSlides: CarouselSlide[];
  deletedDefaultIds: string[];
  ogImages: Record<string, string>;
  inquiries: any[];
}

const STORE_FILE_PATH = path.join(process.cwd(), '.syncrozz_store.json');

// In-memory runtime cache
let memoryStore: CloudStoreData = {
  version: 1,
  lastUpdated: Date.now(),
  platforms: [],
  customUrls: {},
  carouselSlides: [],
  deletedDefaultIds: [],
  ogImages: {},
  inquiries: []
};

let isInitialized = false;

function saveStoreToDisk() {
  try {
    fs.writeFileSync(STORE_FILE_PATH, JSON.stringify(memoryStore, null, 2), 'utf-8');
  } catch (error) {
    // Disk write might fail in read-only sandbox, ignore safely
  }
}

export function loadCloudStore(): CloudStoreData {
  if (isInitialized) {
    return memoryStore;
  }

  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const raw = fs.readFileSync(STORE_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        memoryStore = {
          version: parsed.version || 1,
          lastUpdated: parsed.lastUpdated || Date.now(),
          platforms: Array.isArray(parsed.platforms) ? parsed.platforms : [],
          customUrls: parsed.customUrls || {},
          carouselSlides: Array.isArray(parsed.carouselSlides) ? parsed.carouselSlides : [],
          deletedDefaultIds: Array.isArray(parsed.deletedDefaultIds) ? parsed.deletedDefaultIds : [],
          ogImages: parsed.ogImages || {},
          inquiries: Array.isArray(parsed.inquiries) ? parsed.inquiries : []
        };

        if (memoryStore.deletedDefaultIds.length > 0) {
          const delSet = new Set(memoryStore.deletedDefaultIds);
          memoryStore.platforms = memoryStore.platforms.filter((p) => !delSet.has(p.id));
        }
      }
    }
  } catch (error) {
    console.warn('CloudStore disk load warning, using in-memory defaults:', error);
  }

  isInitialized = true;
  return memoryStore;
}

export function getFullCloudState(): CloudStoreData {
  loadCloudStore();
  return { ...memoryStore };
}

export function getStorePlatforms(): PlatformItem[] {
  loadCloudStore();
  return memoryStore.platforms;
}

export function upsertStorePlatform(platform: PlatformItem): PlatformItem {
  loadCloudStore();
  if (platform.ogImage) {
    memoryStore.ogImages[platform.id] = platform.ogImage;
  }
  const index = memoryStore.platforms.findIndex((p) => p.id === platform.id);
  if (index >= 0) {
    memoryStore.platforms[index] = { ...platform };
  } else {
    memoryStore.platforms.push({ ...platform });
  }
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
  return platform;
}

export function upsertStoreMultiplePlatforms(newPlatforms: PlatformItem[]): PlatformItem[] {
  loadCloudStore();
  const map = new Map<string, PlatformItem>(memoryStore.platforms.map((p) => [p.id, p]));
  newPlatforms.forEach((p) => {
    if (p && p.id) {
      if (p.ogImage) {
        memoryStore.ogImages[p.id] = p.ogImage;
      }
      map.set(p.id, { ...p });
    }
  });
  memoryStore.platforms = Array.from(map.values());
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
  return memoryStore.platforms;
}

export function deleteStorePlatform(platformId: string): void {
  loadCloudStore();
  memoryStore.platforms = memoryStore.platforms.filter((p) => p.id !== platformId);
  if (!memoryStore.deletedDefaultIds.includes(platformId)) {
    memoryStore.deletedDefaultIds.push(platformId);
  }
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function getStoreCustomUrls(): Record<string, string> {
  loadCloudStore();
  return memoryStore.customUrls || {};
}

export function setStoreCustomUrl(platformId: string, url: string): void {
  loadCloudStore();
  memoryStore.customUrls[platformId] = url;
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function removeStoreCustomUrl(platformId: string): void {
  loadCloudStore();
  delete memoryStore.customUrls[platformId];
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function getStoreCarouselSlides(): CarouselSlide[] {
  loadCloudStore();
  return memoryStore.carouselSlides || [];
}

export function setStoreCarouselSlides(slides: CarouselSlide[]): void {
  loadCloudStore();
  memoryStore.carouselSlides = [...slides];
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function getStoreOgImages(): Record<string, string> {
  loadCloudStore();
  return memoryStore.ogImages || {};
}

export function setStoreOgImage(platformId: string, imageUrl: string): void {
  loadCloudStore();
  memoryStore.ogImages[platformId] = imageUrl;
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function removeStoreOgImage(platformId: string): void {
  loadCloudStore();
  delete memoryStore.ogImages[platformId];
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function getStoreDeletedDefaultIds(): string[] {
  loadCloudStore();
  return memoryStore.deletedDefaultIds || [];
}

export function setStoreDeletedDefaultIds(ids: string[]): void {
  loadCloudStore();
  memoryStore.deletedDefaultIds = [...ids];
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function mergeStoreClientState(clientState: Partial<CloudStoreData>): CloudStoreData {
  loadCloudStore();
  if (clientState.platforms !== undefined && Array.isArray(clientState.platforms)) {
    memoryStore.platforms = clientState.platforms;
    clientState.platforms.forEach((p) => {
      if (p && p.id && p.ogImage && !memoryStore.ogImages[p.id]) {
        memoryStore.ogImages[p.id] = p.ogImage;
      }
    });
  }
  if (clientState.customUrls !== undefined && typeof clientState.customUrls === 'object') {
    memoryStore.customUrls = { ...memoryStore.customUrls, ...clientState.customUrls };
  }
  if (clientState.carouselSlides !== undefined && Array.isArray(clientState.carouselSlides)) {
    memoryStore.carouselSlides = clientState.carouselSlides;
  }
  if (clientState.deletedDefaultIds !== undefined && Array.isArray(clientState.deletedDefaultIds)) {
    memoryStore.deletedDefaultIds = Array.from(new Set([...memoryStore.deletedDefaultIds, ...clientState.deletedDefaultIds]));
    const delSet = new Set(memoryStore.deletedDefaultIds);
    memoryStore.platforms = memoryStore.platforms.filter((p) => !delSet.has(p.id));
  }
  if (clientState.ogImages !== undefined && typeof clientState.ogImages === 'object') {
    memoryStore.ogImages = { ...memoryStore.ogImages, ...clientState.ogImages };
  }
  if (clientState.inquiries !== undefined && Array.isArray(clientState.inquiries)) {
    const existingInquiriesMap = new Map(memoryStore.inquiries.map((i: any) => [i.id, i]));
    clientState.inquiries.forEach((inq: any) => {
      if (inq && inq.id) existingInquiriesMap.set(inq.id, inq);
    });
    memoryStore.inquiries = Array.from(existingInquiriesMap.values());
  }

  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
  return { ...memoryStore };
}

export function addStoreInquiry(inquiryData: any): any {
  loadCloudStore();
  const newInquiry = {
    id: inquiryData.id || `inquiry_${Date.now()}`,
    name: inquiryData.name,
    email: inquiryData.email,
    organization: inquiryData.organization || null,
    platformOfInterest: inquiryData.platformOfInterest || null,
    message: inquiryData.message,
    status: 'new',
    createdAt: new Date().toISOString()
  };
  memoryStore.inquiries.unshift(newInquiry);
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
  return newInquiry;
}

export function updateStoreInquiry(id: string | number, updates: any): void {
  loadCloudStore();
  const index = memoryStore.inquiries.findIndex((i: any) => i.id === id || String(i.id) === String(id));
  if (index >= 0) {
    memoryStore.inquiries[index] = { ...memoryStore.inquiries[index], ...updates };
    memoryStore.version += 1;
    memoryStore.lastUpdated = Date.now();
    saveStoreToDisk();
  }
}

export function deleteStoreInquiry(id: string | number): void {
  loadCloudStore();
  memoryStore.inquiries = memoryStore.inquiries.filter((i: any) => i.id !== id && String(i.id) !== String(id));
  memoryStore.version += 1;
  memoryStore.lastUpdated = Date.now();
  saveStoreToDisk();
}

export function getStoreInquiries(): any[] {
  loadCloudStore();
  return memoryStore.inquiries || [];
}

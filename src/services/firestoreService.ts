import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  onSnapshot, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  disableNetwork, 
  enableNetwork,
  FirestoreError 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { compressDataUrl } from '../utils/imageCompressor';

export interface FirestoreOgImage {
  platformId: string;
  imageUrl: string;
  updatedAt: string;
  updatedBy?: string;
}

export interface FirestoreAuditLog {
  eventType: string;
  userEmail: string;
  status: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING';
  details: string;
  timestamp: number;
  ip?: string;
}

// Circuit breaker for Firestore quota, missing database, or offline status
let isNetworkDisabled = false;
let isDatabaseNotFound = false;
let firestoreQuotaExhaustedUntil = 0;
let reEnableTimer: ReturnType<typeof setTimeout> | null = null;
const activeUnsubscribes = new Set<() => void>();

export function isQuotaExhausted(): boolean {
  return isNetworkDisabled || isDatabaseNotFound || Date.now() < firestoreQuotaExhaustedUntil;
}

export function isFirestoreAvailable(): boolean {
  return !isNetworkDisabled && !isDatabaseNotFound && Date.now() >= firestoreQuotaExhaustedUntil;
}

export function teardownAllSubscriptions(): void {
  activeUnsubscribes.forEach((unsub) => {
    try {
      unsub();
    } catch {}
  });
  activeUnsubscribes.clear();
}

function handleFirestoreError(context: string, error: any): void {
  const errCode = error?.code || '';
  const errMsg = error?.message || (typeof error === 'string' ? error : '');

  // Handle missing or unprovisioned Firestore database (HTTP 404 / NOT_FOUND)
  if (
    errCode === 'not-found' ||
    errMsg.includes('not found') ||
    errMsg.includes('NOT_FOUND') ||
    errMsg.includes('does not exist') ||
    errMsg.includes('404') ||
    errMsg.includes('Database')
  ) {
    if (!isDatabaseNotFound) {
      isDatabaseNotFound = true;
      isNetworkDisabled = true;
      console.info(`[SYNCROZZ] Pangkalan data Firestore belum wujud di Google Cloud. Beroperasi secara lancar dalam mod storan setempat (local & server store).`);
      teardownAllSubscriptions();
      disableNetwork(db).catch(() => {});
    }
    return;
  }

  // Handle resource exhausted or quota exceeded
  if (
    errCode === 'resource-exhausted' ||
    errCode === 'unavailable' ||
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('resource-exhausted')
  ) {
    firestoreQuotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
    if (!isNetworkDisabled) {
      isNetworkDisabled = true;
      console.warn(`[Firestore] Had kuota dicapai semasa "${context}". Mod storan setempat diaktifkan.`);
      teardownAllSubscriptions();
      disableNetwork(db).catch(() => {});

      if (reEnableTimer) clearTimeout(reEnableTimer);
      reEnableTimer = setTimeout(() => {
        isNetworkDisabled = false;
        enableNetwork(db).catch(() => {});
      }, 5 * 60 * 1000);
    }
    return;
  }

  // Handle permission-denied / insufficient permissions
  if (
    errCode === 'permission-denied' ||
    errMsg.includes('insufficient permissions') ||
    errMsg.includes('permission-denied')
  ) {
    if (!isNetworkDisabled) {
      isNetworkDisabled = true;
      console.info(`[SYNCROZZ] Akses Firestore terhad oleh sekuriti awan. Sistem beroperasi lancar melalui Pelayan Awan Segerak SYNCROZZ (Cloud Store API).`);
      teardownAllSubscriptions();
      disableNetwork(db).catch(() => {});
    }
    return;
  }

  // General warnings
  console.warn(`[Firestore] Notice during "${context}":`, error?.message || error);
}

function safeSnapshotListener(
  ref: any,
  onData: (snapshot: any) => void,
  context: string
): () => void {
  if (isQuotaExhausted()) return () => {};

  try {
    let active = true;
    let cleanupFn: (() => void) | null = null;

    const unsub = onSnapshot(
      ref,
      (snapshot) => {
        if (!active) return;
        try {
          onData(snapshot);
        } catch (err) {
          console.warn(`[Firestore] Ralat memproses snapshot "${context}":`, err);
        }
      },
      (error) => {
        active = false;
        if (cleanupFn) {
          activeUnsubscribes.delete(cleanupFn);
        }
        try {
          unsub();
        } catch {}
        handleFirestoreError(context, error);
      }
    );

    cleanupFn = () => {
      active = false;
      if (cleanupFn) {
        activeUnsubscribes.delete(cleanupFn);
      }
      try {
        unsub();
      } catch {}
    };

    activeUnsubscribes.add(cleanupFn);
    return cleanupFn;
  } catch (e) {
    handleFirestoreError(`${context} init`, e);
    return () => {};
  }
}

// 1. Sync Custom OG Images with Firestore
export async function saveOgImageToFirestore(platformId: string, imageUrl: string, userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    let finalImage = imageUrl;
    if (finalImage.startsWith('data:image/') && finalImage.length > 80000) {
      try {
        finalImage = await compressDataUrl(finalImage, { maxWidth: 1200, maxHeight: 630, quality: 0.85 });
      } catch {}
    }

    const docRef = doc(db, 'platformOgImages', platformId);
    await setDoc(docRef, {
      platformId,
      imageUrl: finalImage,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('saveOgImage', error);
  }
}

export async function removeOgImageFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', platformId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError('removeOgImage', error);
  }
}

export function subscribeToOgImages(callback: (images: Record<string, string>) => void): () => void {
  const colRef = collection(db, 'platformOgImages');
  return safeSnapshotListener(
    colRef,
    (snapshot) => {
      if (snapshot.empty) return;
      const result: Record<string, string> = {};
      snapshot.forEach((docSnap: any) => {
        if (docSnap.id.startsWith('config_') || docSnap.id.startsWith('__')) return;
        const data = docSnap.data() as FirestoreOgImage;
        if (data.platformId && data.imageUrl) {
          result[data.platformId] = data.imageUrl;
        }
      });
      if (Object.keys(result).length > 0) {
        callback(result);
      }
    },
    'subscribeToOgImages'
  );
}

// 2. Audit Logging to Firestore
export async function logAuditEventToFirestore(
  eventTypeOrObject: string | { eventType: string; userEmail: string; status: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING'; details: string },
  userEmail?: string,
  status?: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING',
  details?: string
): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const colRef = collection(db, 'auditLogs');
    if (typeof eventTypeOrObject === 'object') {
      await addDoc(colRef, {
        eventType: eventTypeOrObject.eventType,
        userEmail: eventTypeOrObject.userEmail,
        status: eventTypeOrObject.status,
        details: eventTypeOrObject.details,
        timestamp: Date.now()
      });
    } else {
      await addDoc(colRef, {
        eventType: eventTypeOrObject,
        userEmail: userEmail || 'unknown',
        status: status || 'INFO',
        details: details || '',
        timestamp: Date.now()
      });
    }
  } catch (error) {
    handleFirestoreError('logAuditEvent', error);
  }
}

export const logAuditEvent = logAuditEventToFirestore;

export function subscribeToAuditLogs(callback: (logs: any[]) => void): () => void {
  const colRef = collection(db, 'auditLogs');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
  return safeSnapshotListener(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() }));
      callback(logs);
    },
    'subscribeToAuditLogs'
  );
}

// 3. Dynamic Platforms Synchronization with Firestore
export async function savePlatformToFirestore(platform: any, userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
    const docSnap = await getDoc(docRef);
    let platformsList: any[] = [];
    if (docSnap.exists()) {
      platformsList = docSnap.data().platforms || [];
    }
    const idx = platformsList.findIndex((p) => p.id === platform.id);
    const nowIso = new Date().toISOString();
    const existingItem = idx >= 0 ? platformsList[idx] : null;
    const updatedPlatform = {
      ...platform,
      createdAt: platform.createdAt || existingItem?.createdAt || nowIso,
      updatedAt: nowIso,
      updatedBy: userEmail || 'admin'
    };
    if (idx >= 0) {
      platformsList[idx] = updatedPlatform;
    } else {
      platformsList.unshift(updatedPlatform);
    }
    await setDoc(docRef, {
      platforms: platformsList,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('savePlatform', error);
  }
}

export async function deletePlatformFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const platformsList = (docSnap.data().platforms || []).filter((p: any) => p.id !== platformId);
      await setDoc(docRef, {
        platforms: platformsList,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError('deletePlatform', error);
  }
}

export function subscribeToCustomPlatforms(callback: (platforms: any[]) => void): () => void {
  const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
  return safeSnapshotListener(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.platforms)) {
          callback(data.platforms);
        }
      }
    },
    'subscribeToCustomPlatforms'
  );
}

// 4. Custom Platform URLs Synchronization with Firestore
export async function saveCustomPlatformUrlToFirestore(platformId: string, url: string, userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
    const docSnap = await getDoc(docRef);
    let urlsMap: Record<string, string> = {};
    if (docSnap.exists()) {
      urlsMap = docSnap.data().urls || {};
    }
    urlsMap[platformId] = url;
    await setDoc(docRef, {
      urls: urlsMap,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('saveCustomPlatformUrl', error);
  }
}

export async function removeCustomPlatformUrlFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const urlsMap = { ...(docSnap.data().urls || {}) };
      delete urlsMap[platformId];
      await setDoc(docRef, {
        urls: urlsMap,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    handleFirestoreError('removeCustomPlatformUrl', error);
  }
}

export function subscribeToCustomPlatformUrls(callback: (urls: Record<string, string>) => void): () => void {
  const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
  return safeSnapshotListener(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && typeof data.urls === 'object') {
          callback(data.urls);
        }
      }
    },
    'subscribeToCustomPlatformUrls'
  );
}

// 5. Deleted Default Platforms Synchronization
export async function saveDeletedDefaultPlatformIdsToFirestore(ids: string[], userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_deleted_platforms');
    await setDoc(docRef, {
      deletedIds: ids,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('saveDeletedDefaultPlatformIds', error);
  }
}

export function subscribeToDeletedDefaultPlatforms(callback: (ids: string[]) => void): () => void {
  const docRef = doc(db, 'platformOgImages', 'config_deleted_platforms');
  return safeSnapshotListener(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.deletedIds)) {
          callback(data.deletedIds);
        }
      }
    },
    'subscribeToDeletedDefaultPlatforms'
  );
}

// 6. Hero Carousel Slides Synchronization
export async function saveCarouselSlidesToFirestore(slides: any[], userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    // Compress any large base64 slide images to stay under Firestore document limit
    const processedSlides = await Promise.all(
      slides.map(async (slide) => {
        if (slide.imageUrl && slide.imageUrl.startsWith('data:image/') && slide.imageUrl.length > 80000) {
          try {
            const compressed = await compressDataUrl(slide.imageUrl, { maxWidth: 1200, maxHeight: 675, quality: 0.8 });
            return { ...slide, imageUrl: compressed };
          } catch {
            return slide;
          }
        }
        return slide;
      })
    );

    const docRef = doc(db, 'platformOgImages', 'config_hero_carousel');
    await setDoc(docRef, {
      slides: processedSlides,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('saveCarouselSlides', error);
  }
}

export function subscribeToCarouselSlides(callback: (slides: any[]) => void): () => void {
  const docRef = doc(db, 'platformOgImages', 'config_hero_carousel');
  return safeSnapshotListener(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.slides)) {
          callback(data.slides);
        }
      }
    },
    'subscribeToCarouselSlides'
  );
}

// 7. Contact Inquiries Synchronization (Real-time sync to all admin tabs)
export async function saveInquiryToFirestore(inquiry: any): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_inquiries');
    const docSnap = await getDoc(docRef);
    let inquiriesList: any[] = [];
    if (docSnap.exists()) {
      inquiriesList = docSnap.data().inquiries || [];
    }
    const idx = inquiriesList.findIndex((i: any) => i.id === inquiry.id);
    const nowIso = new Date().toISOString();
    const itemToSave = {
      ...inquiry,
      createdAt: inquiry.createdAt || nowIso,
      updatedAt: nowIso,
      status: inquiry.status || 'new',
      read: inquiry.read ?? false
    };

    if (idx >= 0) {
      inquiriesList[idx] = { ...inquiriesList[idx], ...itemToSave };
    } else {
      inquiriesList.unshift(itemToSave);
    }

    await setDoc(docRef, {
      inquiries: inquiriesList,
      lastUpdated: nowIso,
      lastAction: 'SAVE_INQUIRY'
    });
  } catch (error) {
    handleFirestoreError('saveInquiry', error);
  }
}

export function subscribeToInquiries(callback: (inquiries: any[]) => void): () => void {
  const docRef = doc(db, 'platformOgImages', 'config_inquiries');
  return safeSnapshotListener(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.inquiries || []);
      } else {
        callback([]);
      }
    },
    'subscribeToInquiries'
  );
}

export async function updateInquiryStatusInFirestore(
  inquiryId: string, 
  updatesOrStatus: Record<string, any> | string, 
  readOrUserEmail?: boolean | string,
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_inquiries');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    let updates: Record<string, any> = {};
    let email = typeof readOrUserEmail === 'string' ? readOrUserEmail : userEmail;

    if (typeof updatesOrStatus === 'string') {
      updates = { 
        status: updatesOrStatus, 
        read: typeof readOrUserEmail === 'boolean' ? readOrUserEmail : (updatesOrStatus !== 'new') 
      };
    } else {
      updates = updatesOrStatus || {};
    }

    let inquiriesList: any[] = docSnap.data().inquiries || [];
    inquiriesList = inquiriesList.map((item: any) => {
      if (item.id === inquiryId) {
        return {
          ...item,
          ...updates,
          updatedAt: new Date().toISOString(),
          updatedBy: email || 'admin'
        };
      }
      return item;
    });

    await setDoc(docRef, {
      inquiries: inquiriesList,
      lastUpdated: new Date().toISOString(),
      lastAction: 'UPDATE_INQUIRY'
    });
  } catch (error) {
    handleFirestoreError('updateInquiryStatus', error);
  }
}

export async function deleteInquiryFromFirestore(inquiryId: string, userEmail?: string): Promise<void> {
  if (isQuotaExhausted()) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_inquiries');
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return;

    let inquiriesList: any[] = docSnap.data().inquiries || [];
    inquiriesList = inquiriesList.filter((item: any) => item.id !== inquiryId);

    await setDoc(docRef, {
      inquiries: inquiriesList,
      lastUpdated: new Date().toISOString(),
      lastAction: 'DELETE_INQUIRY',
      lastDeletedBy: userEmail || 'admin'
    });
  } catch (error) {
    handleFirestoreError('deleteInquiry', error);
  }
}

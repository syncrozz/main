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

// Circuit breaker for Firestore quota or resource-exhaustion
let isNetworkDisabled = false;
let firestoreQuotaExhaustedUntil = 0;
let reEnableTimer: ReturnType<typeof setTimeout> | null = null;

export function isQuotaExhausted(): boolean {
  return isNetworkDisabled || Date.now() < firestoreQuotaExhaustedUntil;
}

function handleFirestoreError(context: string, error: any): void {
  const errCode = error?.code || '';
  const errMsg = error?.message || (typeof error === 'string' ? error : '');

  if (
    errCode === 'resource-exhausted' ||
    errCode === 'unavailable' ||
    errMsg.includes('Quota exceeded') ||
    errMsg.includes('resource-exhausted')
  ) {
    firestoreQuotaExhaustedUntil = Date.now() + 5 * 60 * 1000;
    if (!isNetworkDisabled) {
      isNetworkDisabled = true;
      console.warn(`[Firestore] Quota reached during "${context}". Disabling Firestore network to prevent backend overload and falling back to local/server store.`);
      disableNetwork(db).catch(() => {});

      if (reEnableTimer) clearTimeout(reEnableTimer);
      reEnableTimer = setTimeout(() => {
        isNetworkDisabled = false;
        enableNetwork(db).catch(() => {});
      }, 5 * 60 * 1000);
    }
  } else {
    console.warn(`[Firestore] Notice during "${context}":`, error?.message || error);
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
  if (isQuotaExhausted()) return () => {};

  try {
    const colRef = collection(db, 'platformOgImages');
    return onSnapshot(colRef, (snapshot) => {
      const result: Record<string, string> = {};
      snapshot.forEach((docSnap) => {
        if (docSnap.id.startsWith('config_') || docSnap.id.startsWith('__')) return;
        const data = docSnap.data() as FirestoreOgImage;
        if (data.platformId && data.imageUrl) {
          result[data.platformId] = data.imageUrl;
        }
      });
      callback(result);
    }, (error) => {
      handleFirestoreError('subscribeToOgImages', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToOgImages init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const colRef = collection(db, 'auditLogs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(logs);
    }, (error) => {
      handleFirestoreError('subscribeToAuditLogs', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToAuditLogs init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().platforms || []);
      } else {
        callback([]);
      }
    }, (error) => {
      handleFirestoreError('subscribeToCustomPlatforms', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToCustomPlatforms init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().urls || {});
      } else {
        callback({});
      }
    }, (error) => {
      handleFirestoreError('subscribeToCustomPlatformUrls', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToCustomPlatformUrls init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const docRef = doc(db, 'platformOgImages', 'config_deleted_platforms');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.deletedIds || []);
      } else {
        callback([]);
      }
    }, (error) => {
      handleFirestoreError('subscribeToDeletedDefaultPlatforms', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToDeletedDefaultPlatforms init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const docRef = doc(db, 'platformOgImages', 'config_hero_carousel');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.slides || []);
      } else {
        callback([]);
      }
    }, (error) => {
      handleFirestoreError('subscribeToCarouselSlides', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToCarouselSlides init', e);
    return () => {};
  }
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
  if (isQuotaExhausted()) return () => {};

  try {
    const docRef = doc(db, 'platformOgImages', 'config_inquiries');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback(data.inquiries || []);
      } else {
        callback([]);
      }
    }, (error) => {
      handleFirestoreError('subscribeToInquiries', error);
    });
  } catch (e) {
    handleFirestoreError('subscribeToInquiries init', e);
    return () => {};
  }
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

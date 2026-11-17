import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocFromServer,
  updateDoc,
  deleteDoc,
  onSnapshot,
  addDoc,
  query,
  orderBy,
  limit,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { compressDataUrl } from '../utils/imageCompressor';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

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

export function buildFirestoreErrorInfo(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  return {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
}

function handleFirestoreError(
  context: string,
  error: any,
  operationType: OperationType = OperationType.WRITE,
  path: string | null = null
): void {
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
      console.info(
        '[SYNCROZZ] Pangkalan data Firestore belum tersedia. Beroperasi dalam mod storan pelayan & setempat.'
      );
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
      console.warn(`[Firestore] Had kuota dicapai semasa "${context}".`);
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

  if (errCode === 'permission-denied' || errMsg.includes('permission-denied')) {
    const errInfo = buildFirestoreErrorInfo(error, operationType, path);
    console.warn(`[Firestore] Permission denied during "${context}":`, JSON.stringify(errInfo));
    return;
  }

  console.warn(`[Firestore] Notice during "${context}":`, errMsg || error);
}

export async function testConnection(): Promise<{ ok: boolean; error?: string }> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return { ok: true };
  } catch (error: any) {
    const errMsg = error?.message || String(error);
    if (errMsg.includes('the client is offline')) {
      console.warn('Firestore connection test: client appears offline or unconfigured.');
    }
    return { ok: false, error: errMsg };
  }
}

function safeSnapshotListener(
  ref: any,
  onData: (snapshot: any) => void,
  context: string,
  path: string
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
        handleFirestoreError(context, error, OperationType.LIST, path);
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
    handleFirestoreError(`${context} init`, e, OperationType.LIST, path);
    return () => {};
  }
}

// 1. Sync Custom OG Images with Firestore
export async function saveOgImageToFirestore(
  platformId: string,
  imageUrl: string,
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    let finalImage = imageUrl;
    if (finalImage.startsWith('data:image/') && finalImage.length > 80000) {
      try {
        finalImage = await compressDataUrl(finalImage, {
          maxWidth: 1200,
          maxHeight: 630,
          quality: 0.85,
        });
      } catch {}
    }

    const docRef = doc(db, 'platformOgImages', platformId);
    await setDoc(docRef, {
      platformId,
      imageUrl: finalImage,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || auth.currentUser.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError('saveOgImage', error, OperationType.WRITE, `platformOgImages/${platformId}`);
  }
}

export async function removeOgImageFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'platformOgImages', platformId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError('removeOgImage', error, OperationType.DELETE, `platformOgImages/${platformId}`);
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
        if (docSnap.id.startsWith('config_') || docSnap.id.startsWith('__') || docSnap.id === 'test_sync_probe') {
          return;
        }
        const data = docSnap.data() as FirestoreOgImage;
        if (data.platformId && data.imageUrl) {
          result[data.platformId] = data.imageUrl;
        }
      });
      if (Object.keys(result).length > 0) {
        callback(result);
      }
    },
    'subscribeToOgImages',
    'platformOgImages'
  );
}

// 2. Audit Logging to Firestore (Admin-only write & read)
export async function logAuditEventToFirestore(
  eventTypeOrObject:
    | string
    | {
        eventType: string;
        userEmail: string;
        status: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING';
        details: string;
      },
  userEmail?: string,
  status?: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING',
  details?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const colRef = collection(db, 'auditLogs');
    if (typeof eventTypeOrObject === 'object') {
      await addDoc(colRef, {
        eventType: eventTypeOrObject.eventType,
        userEmail: eventTypeOrObject.userEmail || auth.currentUser.email || 'unknown',
        status: eventTypeOrObject.status,
        details: eventTypeOrObject.details || '',
        timestamp: Date.now(),
      });
    } else {
      await addDoc(colRef, {
        eventType: eventTypeOrObject,
        userEmail: userEmail || auth.currentUser.email || 'unknown',
        status: status || 'INFO',
        details: details || '',
        timestamp: Date.now(),
      });
    }
  } catch (error) {
    handleFirestoreError('logAuditEvent', error, OperationType.CREATE, 'auditLogs');
  }
}

export const logAuditEvent = logAuditEventToFirestore;

export function subscribeToAuditLogs(callback: (logs: any[]) => void): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, 'auditLogs');
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
  return safeSnapshotListener(
    q,
    (snapshot) => {
      const logs = snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() }));
      callback(logs);
    },
    'subscribeToAuditLogs',
    'auditLogs'
  );
}

// 3. Dynamic Platforms Synchronization with Firestore
export async function savePlatformToFirestore(platform: any, userEmail?: string): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

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
    const actor = userEmail || auth.currentUser.email || 'admin';
    const updatedPlatform = {
      ...platform,
      createdAt: platform.createdAt || existingItem?.createdAt || nowIso,
      updatedAt: nowIso,
      updatedBy: actor,
    };
    if (idx >= 0) {
      platformsList[idx] = updatedPlatform;
    } else {
      platformsList.unshift(updatedPlatform);
    }
    await setDoc(docRef, {
      platforms: platformsList,
      updatedAt: nowIso,
      updatedBy: actor,
    });
  } catch (error) {
    handleFirestoreError('savePlatform', error, OperationType.WRITE, 'platformOgImages/config_custom_platforms');
  }
}

export async function deletePlatformFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const platformsList = (docSnap.data().platforms || []).filter((p: any) => p.id !== platformId);
      await setDoc(docRef, {
        platforms: platformsList,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.email || 'admin',
      });
    }
  } catch (error) {
    handleFirestoreError('deletePlatform', error, OperationType.WRITE, 'platformOgImages/config_custom_platforms');
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
    'subscribeToCustomPlatforms',
    'platformOgImages/config_custom_platforms'
  );
}

// 4. Custom Platform URLs Synchronization with Firestore
export async function saveCustomPlatformUrlToFirestore(
  platformId: string,
  url: string,
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

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
      updatedBy: userEmail || auth.currentUser.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError('saveCustomPlatformUrl', error, OperationType.WRITE, 'platformOgImages/config_custom_urls');
  }
}

export async function removeCustomPlatformUrlFromFirestore(platformId: string): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const urlsMap = { ...(docSnap.data().urls || {}) };
      delete urlsMap[platformId];
      await setDoc(docRef, {
        urls: urlsMap,
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser.email || 'admin',
      });
    }
  } catch (error) {
    handleFirestoreError('removeCustomPlatformUrl', error, OperationType.WRITE, 'platformOgImages/config_custom_urls');
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
    'subscribeToCustomPlatformUrls',
    'platformOgImages/config_custom_urls'
  );
}

// 5. Deleted Default Platforms Synchronization
export async function saveDeletedDefaultPlatformIdsToFirestore(
  ids: string[],
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'platformOgImages', 'config_deleted_platforms');
    await setDoc(docRef, {
      deletedIds: ids,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || auth.currentUser.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError(
      'saveDeletedDefaultPlatformIds',
      error,
      OperationType.WRITE,
      'platformOgImages/config_deleted_platforms'
    );
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
    'subscribeToDeletedDefaultPlatforms',
    'platformOgImages/config_deleted_platforms'
  );
}

// 6. Hero Carousel Slides Synchronization
export async function saveCarouselSlidesToFirestore(
  slides: any[],
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const processedSlides = await Promise.all(
      slides.map(async (slide) => {
        if (slide.imageUrl && slide.imageUrl.startsWith('data:image/') && slide.imageUrl.length > 80000) {
          try {
            const compressed = await compressDataUrl(slide.imageUrl, {
              maxWidth: 1200,
              maxHeight: 675,
              quality: 0.8,
            });
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
      updatedBy: userEmail || auth.currentUser.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError(
      'saveCarouselSlides',
      error,
      OperationType.WRITE,
      'platformOgImages/config_hero_carousel'
    );
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
    'subscribeToCarouselSlides',
    'platformOgImages/config_hero_carousel'
  );
}

// 7. Contact Inquiries Synchronization (Dedicated `inquiries` collection for strict PII isolation)
export async function saveInquiryToFirestore(inquiry: any): Promise<void> {
  if (isQuotaExhausted()) return;

  const inquiryId = String(inquiry.id || `inq_${Date.now()}`);
  const nowIso = new Date().toISOString();

  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await setDoc(docRef, {
      id: inquiryId,
      name: String(inquiry.name || '').trim().slice(0, 120),
      email: String(inquiry.email || '').trim().slice(0, 200),
      phone: inquiry.phone ? String(inquiry.phone).trim().slice(0, 40) : '',
      organization: inquiry.organization ? String(inquiry.organization).trim().slice(0, 160) : '',
      platformInterest: inquiry.platformInterest ? String(inquiry.platformInterest).trim().slice(0, 120) : 'Umum',
      message: String(inquiry.message || '').trim().slice(0, 4000),
      status: 'new',
      read: false,
      createdAt: typeof inquiry.createdAt === 'number' ? inquiry.createdAt : Date.now(),
      updatedAt: nowIso,
    });
  } catch (error) {
    handleFirestoreError('saveInquiry', error, OperationType.CREATE, `inquiries/${inquiryId}`);
  }
}

export function subscribeToInquiries(callback: (inquiries: any[]) => void): () => void {
  if (!auth.currentUser) return () => {};
  const colRef = collection(db, 'inquiries');
  const q = query(colRef, orderBy('createdAt', 'desc'), limit(200));
  return safeSnapshotListener(
    q,
    (snapshot) => {
      const list = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      callback(list);
    },
    'subscribeToInquiries',
    'inquiries'
  );
}

export async function updateInquiryStatusInFirestore(
  inquiryId: string,
  updatesOrStatus: Record<string, any> | string,
  readOrUserEmail?: boolean | string,
  userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    let updates: Record<string, any> = {};
    const email = typeof readOrUserEmail === 'string' ? readOrUserEmail : userEmail;

    if (typeof updatesOrStatus === 'string') {
      updates = {
        status: updatesOrStatus,
        read: typeof readOrUserEmail === 'boolean' ? readOrUserEmail : updatesOrStatus !== 'new',
      };
    } else {
      updates = updatesOrStatus || {};
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date().toISOString(),
      updatedBy: email || auth.currentUser.email || 'admin',
    });
  } catch (error) {
    handleFirestoreError('updateInquiryStatus', error, OperationType.UPDATE, `inquiries/${inquiryId}`);
  }
}

export async function deleteInquiryFromFirestore(
  inquiryId: string,
  _userEmail?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;

  try {
    const docRef = doc(db, 'inquiries', inquiryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError('deleteInquiry', error, OperationType.DELETE, `inquiries/${inquiryId}`);
  }
}

// 8. Authoritative Secondary Admins Firestore Sync (Master Admin Only)
export async function syncAdminToFirestore(
  email: string,
  addedBy: string,
  name?: string
): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || cleanEmail === 'khaikerr@gmail.com') return;

  try {
    const docRef = doc(db, 'admins', cleanEmail);
    await setDoc(docRef, {
      email: cleanEmail,
      ...(name ? { name } : {}),
      role: 'ADMIN',
      addedBy: addedBy.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError('syncAdminToFirestore', error, OperationType.WRITE, `admins/${cleanEmail}`);
  }
}

export async function removeAdminFromFirestore(email: string): Promise<void> {
  if (isQuotaExhausted() || !auth.currentUser) return;
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || cleanEmail === 'khaikerr@gmail.com') return;

  try {
    const docRef = doc(db, 'admins', cleanEmail);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError('removeAdminFromFirestore', error, OperationType.DELETE, `admins/${cleanEmail}`);
  }
}

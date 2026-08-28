import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc, 
  onSnapshot, 
  addDoc,
  query,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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

// 1. Sync Custom OG Images with Firestore
export async function saveOgImageToFirestore(platformId: string, imageUrl: string, userEmail?: string): Promise<void> {
  try {
    const docRef = doc(db, 'platformOgImages', platformId);
    await setDoc(docRef, {
      platformId,
      imageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    console.error('Error saving OG image to Firestore:', error);
  }
}

export async function removeOgImageFromFirestore(platformId: string): Promise<void> {
  try {
    const docRef = doc(db, 'platformOgImages', platformId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting OG image from Firestore:', error);
  }
}

export function subscribeToOgImages(callback: (images: Record<string, string>) => void): () => void {
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
      console.warn('Firestore OG subscription notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to Firestore OG images:', e);
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
    console.warn('Error saving audit log to Firestore:', error);
  }
}

export const logAuditEvent = logAuditEventToFirestore;

export function subscribeToAuditLogs(callback: (logs: any[]) => void): () => void {
  try {
    const colRef = collection(db, 'auditLogs');
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(50));
    return onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(logs);
    }, (error) => {
      console.warn('Firestore Audit subscription notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to audit logs:', e);
    return () => {};
  }
}

// 3. Dynamic Platforms Synchronization with Firestore (using public platformOgImages namespace)
export async function savePlatformToFirestore(platform: any, userEmail?: string): Promise<void> {
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
    console.error('Error saving platform to Firestore:', error);
  }
}

export async function deletePlatformFromFirestore(platformId: string): Promise<void> {
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
    console.error('Error deleting platform from Firestore:', error);
  }
}

export function subscribeToCustomPlatforms(callback: (platforms: any[]) => void): () => void {
  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_platforms');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().platforms || []);
      } else {
        callback([]);
      }
    }, (error) => {
      console.warn('Firestore Custom Platforms notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to custom platforms:', e);
    return () => {};
  }
}

// 4. Custom Platform URLs Synchronization with Firestore
export async function saveCustomPlatformUrlToFirestore(platformId: string, url: string, userEmail?: string): Promise<void> {
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
    console.error('Error saving custom platform URL to Firestore:', error);
  }
}

export async function removeCustomPlatformUrlFromFirestore(platformId: string): Promise<void> {
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
    console.error('Error deleting custom platform URL from Firestore:', error);
  }
}

export function subscribeToCustomPlatformUrls(callback: (urls: Record<string, string>) => void): () => void {
  try {
    const docRef = doc(db, 'platformOgImages', 'config_custom_urls');
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.data().urls || {});
      } else {
        callback({});
      }
    }, (error) => {
      console.warn('Firestore Custom URLs notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to custom platform URLs:', e);
    return () => {};
  }
}

// 5. Deleted Default Platforms Synchronization
export async function saveDeletedDefaultPlatformIdsToFirestore(ids: string[], userEmail?: string): Promise<void> {
  try {
    const docRef = doc(db, 'platformOgImages', 'config_deleted_platforms');
    await setDoc(docRef, {
      deletedIds: ids,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    console.error('Error saving deleted default platforms to Firestore:', error);
  }
}

export function subscribeToDeletedDefaultPlatforms(callback: (ids: string[]) => void): () => void {
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
      console.warn('Firestore Deleted Default Platforms notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to deleted default platforms:', e);
    return () => {};
  }
}

// 6. Hero Carousel Slides Synchronization
export async function saveCarouselSlidesToFirestore(slides: any[], userEmail?: string): Promise<void> {
  try {
    const docRef = doc(db, 'platformOgImages', 'config_hero_carousel');
    await setDoc(docRef, {
      slides,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    console.error('Error saving carousel slides to Firestore:', error);
  }
}

export function subscribeToCarouselSlides(callback: (slides: any[]) => void): () => void {
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
      console.warn('Firestore Carousel Slides notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to carousel slides:', e);
    return () => {};
  }
}

// 7. Contact Inquiries Synchronization (Real-time sync to all admin tabs)
export async function saveInquiryToFirestore(inquiry: any): Promise<void> {
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
    console.error('Error saving inquiry to Firestore:', error);
  }
}

export function subscribeToInquiries(callback: (inquiries: any[]) => void): () => void {
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
      console.warn('Firestore Inquiries notice:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to inquiries:', e);
    return () => {};
  }
}

export async function updateInquiryStatusInFirestore(
  inquiryId: string, 
  updatesOrStatus: Record<string, any> | string, 
  readOrUserEmail?: boolean | string,
  userEmail?: string
): Promise<void> {
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
    console.error('Error updating inquiry status in Firestore:', error);
  }
}

export async function deleteInquiryFromFirestore(inquiryId: string, userEmail?: string): Promise<void> {
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
    console.error('Error deleting inquiry from Firestore:', error);
  }
}



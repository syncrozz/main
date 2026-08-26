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
  eventType: string,
  userEmail: string,
  status: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING',
  details: string
): Promise<void> {
  try {
    const colRef = collection(db, 'auditLogs');
    await addDoc(colRef, {
      eventType,
      userEmail,
      status,
      details,
      timestamp: Date.now()
    });
  } catch (error) {
    console.warn('Error saving audit log to Firestore:', error);
  }
}

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
    const updatedPlatform = {
      ...platform,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    };
    if (idx >= 0) {
      platformsList[idx] = updatedPlatform;
    } else {
      platformsList.push(updatedPlatform);
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

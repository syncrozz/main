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
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreOgImage;
        if (data.platformId && data.imageUrl) {
          result[data.platformId] = data.imageUrl;
        }
      });
      callback(result);
    }, (error) => {
      console.warn('Firestore OG subscription error:', error);
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
      console.warn('Firestore Audit subscription error:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to audit logs:', e);
    return () => {};
  }
}

// 3. Dynamic Platforms Synchronization with Firestore
export async function savePlatformToFirestore(platform: any, userEmail?: string): Promise<void> {
  try {
    const docRef = doc(db, 'customPlatforms', platform.id);
    await setDoc(docRef, {
      ...platform,
      updatedAt: new Date().toISOString(),
      updatedBy: userEmail || 'admin'
    });
  } catch (error) {
    console.error('Error saving platform to Firestore:', error);
  }
}

export async function deletePlatformFromFirestore(platformId: string): Promise<void> {
  try {
    const docRef = doc(db, 'customPlatforms', platformId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting platform from Firestore:', error);
  }
}

export function subscribeToCustomPlatforms(callback: (platforms: any[]) => void): () => void {
  try {
    const colRef = collection(db, 'customPlatforms');
    return onSnapshot(colRef, (snapshot) => {
      const list: any[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      callback(list);
    }, (error) => {
      console.warn('Firestore Custom Platforms subscription error:', error);
    });
  } catch (e) {
    console.warn('Could not subscribe to custom platforms:', e);
    return () => {};
  }
}

import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let authClient: Auth | null = null;

export function getAdminAuth(): Auth | null {
  try {
    if (!authClient) {
      if (!getApps().length) {
        initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
      authClient = getAuth();
    }
    return authClient;
  } catch (err) {
    console.warn('firebase-admin initialization deferred or unavailable:', err);
    return null;
  }
}

export const adminAuth = {
  verifyIdToken: async (token: string) => {
    const auth = getAdminAuth();
    if (!auth) throw new Error('Firebase Admin Auth not initialized');
    return auth.verifyIdToken(token);
  },
};

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';
import firebaseConfig from '../../firebase-applet-config.json';

function readClientEnv(key: string): string | undefined {
  try {
    const env = (import.meta as any)?.env;
    const val = env?.[key];
    return typeof val === 'string' && val.trim() ? val.trim() : undefined;
  } catch {
    return undefined;
  }
}

const resolvedFirebaseConfig = {
  apiKey: readClientEnv('VITE_FIREBASE_API_KEY') || firebaseConfig.apiKey,
  authDomain: readClientEnv('VITE_FIREBASE_AUTH_DOMAIN') || firebaseConfig.authDomain,
  projectId: readClientEnv('VITE_FIREBASE_PROJECT_ID') || firebaseConfig.projectId,
  storageBucket: readClientEnv('VITE_FIREBASE_STORAGE_BUCKET') || firebaseConfig.storageBucket,
  messagingSenderId:
    readClientEnv('VITE_FIREBASE_MESSAGING_SENDER_ID') || firebaseConfig.messagingSenderId,
  appId: readClientEnv('VITE_FIREBASE_APP_ID') || firebaseConfig.appId,
  measurementId: readClientEnv('VITE_FIREBASE_MEASUREMENT_ID') || firebaseConfig.measurementId || '',
};

const resolvedDatabaseId =
  readClientEnv('VITE_FIREBASE_DATABASE_ID') || firebaseConfig.firestoreDatabaseId || '';

export const FIREBASE_CLIENT_META = {
  projectId: resolvedFirebaseConfig.projectId,
  authDomain: resolvedFirebaseConfig.authDomain,
  storageBucket: resolvedFirebaseConfig.storageBucket,
  firestoreDatabaseId: resolvedDatabaseId || '(default)',
  measurementId: resolvedFirebaseConfig.measurementId,
};

// Initialize Firebase App (singleton)
const app = !getApps().length ? initializeApp(resolvedFirebaseConfig) : getApp();

// Initialize Firestore Database (named database if configured, otherwise (default))
const customDbId =
  resolvedDatabaseId && resolvedDatabaseId !== '(default)' ? resolvedDatabaseId : undefined;

export const db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);

// Initialize Firebase Auth with Google Provider (explicit account selection)
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let analyticsInstance: Analytics | null = null;
let analyticsInitPromise: Promise<Analytics | null> | null = null;

/**
 * Safely initialize Firebase Analytics in supported browser contexts when measurementId is present.
 */
export async function initFirebaseAnalytics(): Promise<Analytics | null> {
  if (typeof window === 'undefined' || !resolvedFirebaseConfig.measurementId) {
    return null;
  }
  if (analyticsInstance) {
    return analyticsInstance;
  }
  if (!analyticsInitPromise) {
    analyticsInitPromise = (async () => {
      try {
        const supported = await isSupported();
        if (supported) {
          analyticsInstance = getAnalytics(app);
          return analyticsInstance;
        }
      } catch {
        // Ignore Analytics initialization failures in restricted/headless environments
      }
      return null;
    })();
  }
  return analyticsInitPromise;
}

export default app;

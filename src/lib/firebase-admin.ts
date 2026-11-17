import { initializeApp, getApps, cert, type ServiceAccount } from 'firebase-admin/app';
import { getAuth, type Auth, type DecodedIdToken } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json' with { type: 'json' };

let authClient: Auth | null = null;

const LEGACY_REMOVED_PROJECT_ID = 'gen-lang-client-0739778545';

export const FIREBASE_PROJECT_ID =
  (typeof process !== 'undefined' && process.env?.FIREBASE_PROJECT_ID?.trim()) ||
  firebaseConfig.projectId;

export const MASTER_ADMIN_EMAIL = 'khaikerr@gmail.com';

if (!FIREBASE_PROJECT_ID || FIREBASE_PROJECT_ID === LEGACY_REMOVED_PROJECT_ID) {
  throw new Error(
    `Invalid FIREBASE_PROJECT_ID configuration ("${FIREBASE_PROJECT_ID}"). Migration requires syncrozz3.`
  );
}

function parseServiceAccountFromEnv(): ServiceAccount | null {
  const raw =
    (typeof process !== 'undefined' && process.env?.FIREBASE_SERVICE_ACCOUNT_JSON?.trim()) || '';
  if (!raw) return null;

  try {
    const jsonText = raw.startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
    const parsed = JSON.parse(jsonText);
    if (parsed && typeof parsed === 'object' && parsed.client_email && parsed.private_key) {
      return parsed as ServiceAccount;
    }
  } catch (err) {
    console.warn('Ignoring invalid FIREBASE_SERVICE_ACCOUNT_JSON payload:', err);
  }
  return null;
}

export function getAdminAuth(): Auth | null {
  try {
    if (!authClient) {
      if (!getApps().length) {
        const serviceAccount = parseServiceAccountFromEnv();
        if (serviceAccount) {
          initializeApp({
            credential: cert(serviceAccount),
            projectId: FIREBASE_PROJECT_ID,
          });
        } else {
          initializeApp({
            projectId: FIREBASE_PROJECT_ID,
          });
        }
      }
      authClient = getAuth();
    }
    return authClient;
  } catch (err) {
    console.warn('firebase-admin initialization deferred or unavailable:', err);
    return null;
  }
}

export async function verifyGoogleFirebaseIdToken(token: string): Promise<DecodedIdToken> {
  if (!token || typeof token !== 'string' || token.split('.').length !== 3) {
    throw new Error('Invalid Firebase ID token format');
  }

  const auth = getAdminAuth();
  if (!auth) {
    throw new Error('Firebase Admin Auth not initialized');
  }

  // Cryptographically verifies RSA signature against Google's Firebase Auth public keys,
  // plus audience (syncrozz3), issuer, subject, and expiration.
  const decoded = await auth.verifyIdToken(token);

  const expectedIssuer = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
  if (
    decoded.aud !== FIREBASE_PROJECT_ID ||
    decoded.iss !== expectedIssuer ||
    decoded.aud === LEGACY_REMOVED_PROJECT_ID
  ) {
    throw new Error(`Token issuer or audience mismatch (expected project ${FIREBASE_PROJECT_ID})`);
  }

  if (!decoded.sub) {
    throw new Error('Token missing subject');
  }

  if (!decoded.email || decoded.email_verified !== true) {
    throw new Error('Verified Google email is required');
  }

  const signInProvider = decoded.firebase?.sign_in_provider;
  if (signInProvider !== 'google.com') {
    throw new Error('Google authentication provider is required');
  }

  return decoded;
}

export const adminAuth = {
  verifyIdToken: async (token: string) => verifyGoogleFirebaseIdToken(token),
};

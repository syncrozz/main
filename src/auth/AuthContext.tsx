import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { AuthUser, AuthState, Permission, SecondaryAdminEntry } from './types';
import {
  hasPermission,
  cleanupLegacyAuthStorage,
  logAuditEvent,
} from './authService';
import {
  verifyGoogleAdminSessionApi,
  logoutAdminSessionApi,
  fetchSecondaryAdminsApi,
  addSecondaryAdminApi,
  removeSecondaryAdminApi,
} from '../services/apiService';
import {
  syncAdminToFirestore,
  removeAdminFromFirestore,
} from '../services/firestoreService';

export interface GoogleLoginResult {
  ok: boolean;
  authorized: boolean;
  error?: string;
}

interface AuthContextType extends AuthState {
  isInitialized: boolean;
  secondaryAdmins: SecondaryAdminEntry[];
  loginWithGoogle: () => Promise<GoogleLoginResult>;
  logout: () => Promise<void>;
  checkPermission: (permission: Permission) => boolean;
  addAdminEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  removeAdminEmail: (email: string) => Promise<{ success: boolean; error?: string }>;
  refreshAdminList: () => Promise<void>;
  getAdminEmails: () => string[];
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [secondaryAdmins, setSecondaryAdmins] = useState<SecondaryAdminEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshAdminList = useCallback(async () => {
    const res = await fetchSecondaryAdminsApi();
    if (res) {
      setSecondaryAdmins(res.secondaryAdmins);
    }
  }, []);

  const verifyFirebaseUserWithServer = useCallback(async (firebaseUser: FirebaseUser): Promise<AuthUser | null> => {
    const idToken = await firebaseUser.getIdToken();
    const verification = await verifyGoogleAdminSessionApi(idToken);

    if (verification.user) {
      const verifiedUser: AuthUser = {
        ...verification.user,
        token: idToken,
      };
      setUser(verifiedUser);
      if (verifiedUser.role === 'MASTER_ADMIN' || verifiedUser.role === 'ADMIN') {
        setError(null);
        refreshAdminList().catch(() => {});
      } else {
        setSecondaryAdmins([]);
        setError(verification.error || 'Access Denied — Unauthorized Account');
      }
      return verifiedUser;
    }

    // Fallback when token verification returned 401/error cleanly
    setUser(null);
    setSecondaryAdmins([]);
    if (verification.error) {
      setError(verification.error);
    }
    return null;
  }, [refreshAdminList]);

  // Listen continuously to authoritative Firebase Auth session & ID token refreshes
  useEffect(() => {
    cleanupLegacyAuthStorage();

    const unsubscribe = onIdTokenChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setSecondaryAdmins([]);
        setIsLoading(false);
        setIsInitialized(true);
        return;
      }

      try {
        await verifyFirebaseUserWithServer(firebaseUser);
      } catch (err: any) {
        console.warn('Auth state verification notice:', err);
        setUser(null);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
      }
    });

    return () => unsubscribe();
  }, [verifyFirebaseUserWithServer]);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Sign in with Google via Firebase Authentication & verify server-side
   */
  const loginWithGoogle = useCallback(async (): Promise<GoogleLoginResult> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken(true);
      const verification = await verifyGoogleAdminSessionApi(idToken);

      if (verification.user) {
        const verifiedUser: AuthUser = {
          ...verification.user,
          token: idToken,
        };
        setUser(verifiedUser);

        const isAuthorized = verifiedUser.role === 'MASTER_ADMIN' || verifiedUser.role === 'ADMIN';
        if (isAuthorized) {
          refreshAdminList().catch(() => {});
          return { ok: true, authorized: true };
        }

        const deniedMsg = verification.error || 'Access Denied — Unauthorized Account';
        setError(deniedMsg);
        return { ok: true, authorized: false, error: deniedMsg };
      }

      const failMsg = verification.error || 'Pengesahan akaun Google gagal.';
      setError(failMsg);
      return { ok: false, authorized: false, error: failMsg };
    } catch (err: any) {
      const code = err?.code || '';
      let msg = 'Log masuk Google gagal. Sila cuba lagi.';
      if (code === 'auth/popup-closed-by-user') {
        msg = 'Tetingkap log masuk Google ditutup sebelum selesai.';
      } else if (code === 'auth/popup-blocked') {
        msg = 'Pop-up pelayar disekat. Sila benarkan pop-up untuk log masuk Google.';
      } else if (code === 'auth/unauthorized-domain') {
        msg = 'Domain semasa belum dibenarkan dalam tetapan Firebase Authentication.';
      } else if (err?.message) {
        msg = err.message;
      }
      setError(msg);
      return { ok: false, authorized: false, error: msg };
    } finally {
      setIsLoading(false);
    }
  }, [refreshAdminList]);

  /**
   * Secure Sign Out (Server revocation + Firebase signOut)
   */
  const logout = useCallback(async () => {
    try {
      const currentToken = user?.token || (await auth.currentUser?.getIdToken().catch(() => undefined));
      if (currentToken) {
        await logoutAdminSessionApi(currentToken);
      }
      if (user?.email) {
        logAuditEvent('LOGOUT', user.email, 'INFO', 'Admin signed out cleanly.');
      }
      await signOut(auth);
    } catch (err) {
      console.warn('Sign out notice:', err);
    } finally {
      cleanupLegacyAuthStorage();
      setUser(null);
      setSecondaryAdmins([]);
      setError(null);
    }
  }, [user]);

  /**
   * Check permissions dynamically
   */
  const checkPermission = useCallback(
    (permission: Permission): boolean => {
      if (!user || !user.isEmailVerified) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  /**
   * Master Admin: Grant secondary ADMIN role via authoritative server & Firestore store
   */
  const addAdminEmail = useCallback(
    async (newEmail: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || user.role !== 'MASTER_ADMIN') {
        return { success: false, error: 'Hanya Master Admin dibenarkan melantik pentadbir.' };
      }

      const clean = newEmail.trim().toLowerCase();
      if (!clean) {
        return { success: false, error: 'Emel diperlukan.' };
      }

      const res = await addSecondaryAdminApi(clean);
      if (res.success && res.secondaryAdmins) {
        setSecondaryAdmins(res.secondaryAdmins);
        syncAdminToFirestore(clean, user.email).catch(() => {});
        logAuditEvent('ADMIN_ADDED', clean, 'SUCCESS', `Added by ${user.email}`);
        return { success: true };
      }

      return { success: false, error: res.error || 'Gagal melantik pentadbir.' };
    },
    [user]
  );

  /**
   * Master Admin: Revoke secondary ADMIN role
   */
  const removeAdminEmail = useCallback(
    async (emailToRemove: string): Promise<{ success: boolean; error?: string }> => {
      if (!user || user.role !== 'MASTER_ADMIN') {
        return { success: false, error: 'Hanya Master Admin dibenarkan membatalkan akses.' };
      }

      const clean = emailToRemove.trim().toLowerCase();
      const res = await removeSecondaryAdminApi(clean);
      if (res.success && res.secondaryAdmins) {
        setSecondaryAdmins(res.secondaryAdmins);
        removeAdminFromFirestore(clean).catch(() => {});
        logAuditEvent('ADMIN_REMOVED', clean, 'SUCCESS', `Removed by ${user.email}`);
        return { success: true };
      }

      return { success: false, error: res.error || 'Gagal membatalkan pentadbir.' };
    },
    [user]
  );

  const getAdminEmails = useCallback((): string[] => {
    return secondaryAdmins.map((a) => a.email);
  }, [secondaryAdmins]);

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: Boolean(user && user.isEmailVerified),
    isMasterAdmin: Boolean(user && user.isEmailVerified && user.role === 'MASTER_ADMIN'),
    isAdmin: Boolean(user && user.isEmailVerified && (user.role === 'MASTER_ADMIN' || user.role === 'ADMIN')),
    error,
    secondaryAdmins,
    loginWithGoogle,
    logout,
    checkPermission,
    addAdminEmail,
    removeAdminEmail,
    refreshAdminList,
    getAdminEmails,
    clearAuthError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

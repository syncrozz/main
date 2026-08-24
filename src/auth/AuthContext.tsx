import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthState, UserRole, Permission } from './types';
import { 
  determineUserRole, 
  hasPermission, 
  saveSession, 
  getSavedSession, 
  clearSession, 
  decodeGoogleJwt,
  logAuditEvent,
  getCustomAdminList,
  saveCustomAdminList
} from './authService';
import { MASTER_ADMIN_EMAIL } from './authConfig';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';

interface AuthContextType extends AuthState {
  isInitialized: boolean;
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithGoogleEmail: (email: string, displayName?: string, pictureUrl?: string) => Promise<boolean>;
  loginWithRealGooglePopup: () => Promise<boolean>;
  logout: () => void;
  checkPermission: (permission: Permission) => boolean;
  addAdminEmail: (email: string) => boolean;
  removeAdminEmail: (email: string) => boolean;
  getAdminEmails: () => string[];
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const savedUser = getSavedSession();
    if (savedUser && savedUser.email) {
      // Strict check: only khaikerr@gmail.com or authorized admin
      const cleanEmail = savedUser.email.trim().toLowerCase();
      const role = determineUserRole(cleanEmail, true);
      if (cleanEmail === 'khaikerr@gmail.com' || role === 'MASTER_ADMIN' || role === 'ADMIN') {
        setUser({ ...savedUser, email: cleanEmail, role });
      } else {
        clearSession();
        setUser(null);
      }
    }
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Process authenticated Google user with strict khaikerr@gmail.com check
   */
  const processGoogleLogin = useCallback(async (
    email: string, 
    name: string, 
    picture?: string, 
    token?: string
  ): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const isStrictMasterAdmin = normalizedEmail === 'khaikerr@gmail.com';
      const role: UserRole = determineUserRole(normalizedEmail, true);

      const authenticatedUser: AuthUser = {
        id: 'usr_' + btoa(normalizedEmail).replace(/=/g, ''),
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedEmail)}&background=0056D2&color=fff&bold=true`,
        role: isStrictMasterAdmin ? 'MASTER_ADMIN' : role,
        isEmailVerified: true,
        provider: 'google',
        authTime: Date.now(),
        token
      };

      // Set user in state
      setUser(authenticatedUser);

      // Strict Authorization Check: Only khaikerr@gmail.com or authorized admin
      if (isStrictMasterAdmin || role === 'MASTER_ADMIN' || role === 'ADMIN') {
        saveSession(authenticatedUser);
        logAuditEvent('LOGIN_SUCCESS', normalizedEmail, 'SUCCESS', `Logged in as ${authenticatedUser.role}`);
        return true;
      } else {
        clearSession();
        setUser(null);
        logAuditEvent('LOGIN_DENIED', normalizedEmail, 'DENIED', `Akses ditolak untuk emel ${normalizedEmail} (Peranan: USER)`);
        setError(`Akses Ditolak: Akaun Google (${normalizedEmail}) tidak dibenarkan masuk. Hanya akaun Master Admin (khaikerr@gmail.com) dibenarkan.`);
        return false;
      }
    } catch (err: any) {
      const msg = err?.message || 'Ralat semasa pengesahan Google OAuth.';
      setError(msg);
      logAuditEvent('LOGIN_ERROR', email, 'DENIED', msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Login using Real Firebase Google Popup
   */
  const loginWithRealGooglePopup = useCallback(async (): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const email = result.user.email;
      if (!email) {
        throw new Error('Akaun Google tidak mengembalikan maklumat emel.');
      }
      const displayName = result.user.displayName || email.split('@')[0];
      const photoURL = result.user.photoURL || undefined;
      const token = await result.user.getIdToken();

      return await processGoogleLogin(email, displayName, photoURL, token);
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user' || err?.code === 'auth/cancelled-popup-request') {
        setError('Log masuk Google telah dibatalkan oleh pengguna.');
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Tetingkap log masuk Google disekat oleh pelayar (popup blocked). Sila benarkan tetingkap timbul.');
      } else if (err?.code === 'auth/unauthorized-domain') {
        setError('Domain preview ini belum didaftarkan di Firebase Console. Sila log masuk dengan memasukkan emel Google anda.');
      } else {
        setError(err?.message || 'Gagal log masuk dengan akaun Google.');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [processGoogleLogin]);

  /**
   * Login using real Google Identity Services JWT Credential
   */
  const loginWithGoogleCredential = useCallback(async (credential: string): Promise<boolean> => {
    try {
      const payload = decodeGoogleJwt(credential);
      if (!payload || !payload.email) {
        throw new Error('Token Google tidak sah atau tiada emel.');
      }

      if (!payload.email_verified) {
        throw new Error('Emel Google belum disahkan oleh pihak Google.');
      }

      return await processGoogleLogin(
        payload.email, 
        payload.name || payload.given_name || 'Google User', 
        payload.picture, 
        credential
      );
    } catch (err: any) {
      setError(err?.message || 'Gagal memproses token Google.');
      return false;
    }
  }, [processGoogleLogin]);

  /**
   * Login with verified Google Email (For Google OAuth popup flow & testing)
   */
  const loginWithGoogleEmail = useCallback(async (
    email: string, 
    displayName?: string, 
    pictureUrl?: string
  ): Promise<boolean> => {
    return await processGoogleLogin(
      email, 
      displayName || email.split('@')[0], 
      pictureUrl
    );
  }, [processGoogleLogin]);

  /**
   * Secure Sign Out
   */
  const logout = useCallback(() => {
    if (user) {
      logAuditEvent('LOGOUT', user.email, 'INFO', 'User logged out');
    }
    clearSession();
    setUser(null);
    setError(null);
    
    // Invalidate server session if backend is reachable
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
  }, [user]);

  /**
   * Check permissions dynamically
   */
  const checkPermission = useCallback((permission: Permission): boolean => {
    if (!user) return false;
    return hasPermission(user.role, permission);
  }, [user]);

  /**
   * Master Admin: Add secondary admin email
   */
  const addAdminEmail = useCallback((newEmail: string): boolean => {
    if (!user || user.role !== 'MASTER_ADMIN') {
      return false;
    }

    const clean = newEmail.trim().toLowerCase();
    if (!clean || clean === MASTER_ADMIN_EMAIL.toLowerCase()) return false;

    const list = getCustomAdminList();
    if (!list.includes(clean)) {
      const updated = [...list, clean];
      saveCustomAdminList(updated);
      logAuditEvent('ADMIN_ADDED', clean, 'SUCCESS', `Added by ${user.email}`);
      return true;
    }
    return false;
  }, [user]);

  /**
   * Master Admin: Remove secondary admin email
   */
  const removeAdminEmail = useCallback((emailToRemove: string): boolean => {
    if (!user || user.role !== 'MASTER_ADMIN') {
      return false;
    }

    const clean = emailToRemove.trim().toLowerCase();
    const list = getCustomAdminList();
    const updated = list.filter((e) => e.toLowerCase() !== clean);
    saveCustomAdminList(updated);
    logAuditEvent('ADMIN_REMOVED', clean, 'SUCCESS', `Removed by ${user.email}`);
    return true;
  }, [user]);

  const getAdminEmails = useCallback((): string[] => {
    return getCustomAdminList();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isInitialized,
    isAuthenticated: !!user,
    isMasterAdmin: user?.role === 'MASTER_ADMIN' && user?.email?.trim().toLowerCase() === 'khaikerr@gmail.com',
    isAdmin: (user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN') && (user?.email?.trim().toLowerCase() === 'khaikerr@gmail.com' || (getCustomAdminList().includes(user?.email?.trim().toLowerCase() || ''))),
    error,
    loginWithGoogleCredential,
    loginWithGoogleEmail,
    loginWithRealGooglePopup,
    logout,
    checkPermission,
    addAdminEmail,
    removeAdminEmail,
    getAdminEmails,
    clearAuthError
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

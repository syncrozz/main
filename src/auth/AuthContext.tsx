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

interface AuthContextType extends AuthState {
  loginWithGoogleCredential: (credential: string) => Promise<boolean>;
  loginWithGoogleEmail: (email: string, displayName?: string, pictureUrl?: string) => Promise<boolean>;
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
  const [error, setError] = useState<string | null>(null);

  // Initialize session on mount
  useEffect(() => {
    const savedUser = getSavedSession();
    if (savedUser) {
      setUser(savedUser);
    }
    setIsLoading(false);
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Process authenticated Google user
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
      const role: UserRole = determineUserRole(normalizedEmail, true);

      const authenticatedUser: AuthUser = {
        id: 'usr_' + btoa(normalizedEmail).replace(/=/g, ''),
        email: normalizedEmail,
        name: name || normalizedEmail.split('@')[0],
        picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedEmail)}&background=0056D2&color=fff&bold=true`,
        role,
        isEmailVerified: true,
        provider: 'google',
        authTime: Date.now(),
        token
      };

      // Set user in state
      setUser(authenticatedUser);
      saveSession(authenticatedUser);

      // Authorization Check
      if (role === 'MASTER_ADMIN' || role === 'ADMIN') {
        logAuditEvent('LOGIN_SUCCESS', normalizedEmail, 'SUCCESS', `Logged in as ${role}`);
        return true;
      } else {
        logAuditEvent('LOGIN_DENIED', normalizedEmail, 'DENIED', `Attempted admin login with role ${role}`);
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
    isAuthenticated: !!user,
    isMasterAdmin: user?.role === 'MASTER_ADMIN',
    isAdmin: user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN',
    error,
    loginWithGoogleCredential,
    loginWithGoogleEmail,
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

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthState, Permission } from './types';
import { 
  hasPermission, 
  saveSession, 
  clearSession, 
  logAuditEvent,
  getCustomAdminList,
  saveCustomAdminList,
  apiAdminLogin,
  apiVerifySession,
  apiAdminLogout,
  getAdminToken,
  saveAdminToken,
  clearAdminToken
} from './authService';

interface AuthContextType extends AuthState {
  isInitialized: boolean;
  loginWithPin: (pin: string) => Promise<boolean>;
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

  // Initialize session on mount by checking authoritative server session
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      const token = getAdminToken();
      if (token) {
        try {
          const verifiedUser = await apiVerifySession(token);
          if (isMounted) {
            if (verifiedUser && (verifiedUser.role === 'MASTER_ADMIN' || verifiedUser.role === 'ADMIN')) {
              const userWithToken = { ...verifiedUser, token };
              setUser(userWithToken);
              saveSession(userWithToken);
            } else {
              clearAdminToken();
              clearSession();
              setUser(null);
            }
          }
        } catch {
          if (isMounted) {
            clearAdminToken();
            clearSession();
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          clearAdminToken();
          clearSession();
          setUser(null);
        }
      }
      if (isMounted) {
        setIsLoading(false);
        setIsInitialized(true);
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Validate & Login with 4-Digit Admin Access PIN via authoritative server API
   */
  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await apiAdminLogin(pin);
      if (res.success && res.token && res.user) {
        const userWithToken = { ...res.user, token: res.token };
        saveAdminToken(res.token);
        saveSession(userWithToken);
        setUser(userWithToken);
        logAuditEvent('PIN_LOGIN_SUCCESS', res.user.email, 'SUCCESS', 'Admin Access PIN disahkan oleh pelayan.');
        return true;
      } else {
        const msg = res.error || 'PIN tidak sah. Sila cuba lagi.';
        setError(msg);
        logAuditEvent('PIN_LOGIN_FAILED', 'unknown', 'DENIED', msg);
        return false;
      }
    } catch (err: any) {
      const msg = err?.message || 'Ralat pengesahan PIN.';
      setError(msg);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Secure Sign Out with Server Revocation
   */
  const logout = useCallback(async () => {
    const token = getAdminToken();
    if (user) {
      logAuditEvent('LOGOUT', user.email, 'INFO', 'Admin signed out');
    }
    await apiAdminLogout(token || undefined);
    clearAdminToken();
    clearSession();
    setUser(null);
    setError(null);
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
    if (!clean) return false;

    const list = getCustomAdminList();
    if (!list.includes(clean)) {
      const updated = [...list, clean];
      saveCustomAdminList(updated);
      logAuditEvent('ADMIN_ADDED', clean, 'SUCCESS', `Added by ${user.email}`);

      const token = getAdminToken();
      if (token) {
        fetch('/api/admin/users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ newAdminEmail: clean })
        }).catch(() => {});
      }
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

    const token = getAdminToken();
    if (token) {
      fetch(`/api/admin/users/${encodeURIComponent(clean)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }).catch(() => {});
    }
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
    isMasterAdmin: user?.role === 'MASTER_ADMIN',
    isAdmin: user?.role === 'MASTER_ADMIN' || user?.role === 'ADMIN',
    error,
    loginWithPin,
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


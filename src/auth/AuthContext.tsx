import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthUser, AuthState, UserRole, Permission } from './types';
import { 
  hasPermission, 
  saveSession, 
  getSavedSession, 
  clearSession, 
  logAuditEvent,
  getCustomAdminList,
  saveCustomAdminList,
  validateAdminPin,
  createAdminSessionFromPin
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

  // Initialize session on mount
  useEffect(() => {
    const savedUser = getSavedSession();
    if (savedUser && (savedUser.role === 'MASTER_ADMIN' || savedUser.role === 'ADMIN')) {
      setUser(savedUser);
    } else {
      clearSession();
      setUser(null);
    }
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  const clearAuthError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Validate & Login with 4-Digit Admin Access PIN (5313)
   */
  const loginWithPin = useCallback(async (pin: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const isValid = validateAdminPin(pin);
      if (isValid) {
        const adminUser = createAdminSessionFromPin();
        setUser(adminUser);
        saveSession(adminUser);
        logAuditEvent('PIN_LOGIN_SUCCESS', 'admin', 'SUCCESS', 'Admin Access PIN 5313 disahkan.');
        return true;
      } else {
        setError('PIN tidak sah. Sila cuba lagi.');
        logAuditEvent('PIN_LOGIN_FAILED', 'unknown', 'DENIED', 'Percubaan PIN gagal.');
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
   * Secure Sign Out
   */
  const logout = useCallback(() => {
    if (user) {
      logAuditEvent('LOGOUT', user.email, 'INFO', 'Admin signed out');
    }
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


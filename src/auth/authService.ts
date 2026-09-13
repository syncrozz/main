import { AuthUser, UserRole, Permission, AuditLogEntry } from './types';
import { MASTER_ADMIN_EMAILS, ROLE_PERMISSIONS } from './authConfig';
import { logAuditEventToFirestore } from '../services/firestoreService';

const SESSION_KEY = 'syncrozz_auth_session';
const ADMIN_TOKEN_KEY = 'syncrozz_admin_token';
const ADMIN_REGISTRY_KEY = 'syncrozz_admin_registry';
const AUDIT_LOGS_KEY = 'syncrozz_audit_logs';

/**
 * Server-side Admin PIN Authentication
 * Client sends input PIN to server, server validates and issues an authoritative session token.
 */
export async function apiAdminLogin(pin: string): Promise<{
  success: boolean;
  token?: string;
  user?: AuthUser;
  error?: string;
}> {
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin.trim() })
    });
    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'PIN keselamatan tidak sah. Sila cuba lagi.'
      };
    }
    return {
      success: true,
      token: data.token,
      user: data.user
    };
  } catch (err) {
    console.error('Network error during PIN validation:', err);
    return {
      success: false,
      error: 'Ralat sambungan pelayan semasa mengesahkan PIN.'
    };
  }
}

/**
 * Authoritative Server Session Verification
 */
export async function apiVerifySession(token: string): Promise<AuthUser | null> {
  if (!token) return null;
  try {
    const res = await fetch('/api/admin/session', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user || null;
  } catch {
    return null;
  }
}

/**
 * Server Session Revocation
 */
export async function apiAdminLogout(token?: string): Promise<void> {
  try {
    const activeToken = token || getAdminToken();
    if (activeToken) {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${activeToken}`
        }
      });
    }
  } catch (err) {
    console.warn('Logout notice:', err);
  } finally {
    clearSession();
  }
}

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function saveAdminToken(token: string): void {
  try {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save admin token', e);
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } catch (e) {
    console.error('Failed to clear admin token', e);
  }
}

/**
 * Backward-compatible helper: validate PIN via server
 */
export async function validateAdminPin(pin: string): Promise<boolean> {
  const result = await apiAdminLogin(pin);
  return result.success;
}

/**
 * Get dynamic admin list from storage
 */
export function getCustomAdminList(): string[] {
  try {
    const raw = localStorage.getItem(ADMIN_REGISTRY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save custom admin list (Master Admin capability only)
 */
export function saveCustomAdminList(admins: string[]): void {
  try {
    localStorage.setItem(ADMIN_REGISTRY_KEY, JSON.stringify(admins));
  } catch (err) {
    console.error('Failed to save admin registry', err);
  }
}

/**
 * CENTRAL AUTHORIZATION ENGINE
 * Determines the role of any verified Google user.
 * Separates authentication (who the user is) from authorization (what they can do).
 */
export function determineUserRole(email: string, isEmailVerified: boolean = true): UserRole {
  if (!email || !isEmailVerified) {
    return 'USER';
  }

  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check Master Admin Identity
  const isMaster = MASTER_ADMIN_EMAILS.some(
    (masterEmail) => masterEmail.toLowerCase() === normalizedEmail
  );

  if (isMaster) {
    return 'MASTER_ADMIN';
  }

  // 2. Check Secondary Admin Registry
  const customAdmins = getCustomAdminList();
  const isSecondaryAdmin = customAdmins.some(
    (adminEmail) => adminEmail.toLowerCase() === normalizedEmail
  );

  if (isSecondaryAdmin) {
    return 'ADMIN';
  }

  // 3. Default to standard USER (unauthorized for admin panel)
  return 'USER';
}

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.permissions.includes(permission);
}

/**
 * Check if user is allowed to access Admin Panel
 */
export function canAccessAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'MASTER_ADMIN' || user.role === 'ADMIN';
}

/**
 * Check if user is Master Admin
 */
export function isMasterAdmin(user: AuthUser | null): boolean {
  if (!user) return false;
  return user.role === 'MASTER_ADMIN';
}

/**
 * Audit Logging Service
 */
export function logAuditEvent(action: string, email: string, status: 'SUCCESS' | 'DENIED' | 'INFO', details?: string): void {
  try {
    const entry: AuditLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      email,
      action,
      status,
      details
    };

    const existingLogs = getAuditLogs();
    const updatedLogs = [entry, ...existingLogs].slice(0, 100); // keep last 100 logs
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));

    // Sync with Firestore in real-time
    logAuditEventToFirestore(action, email, status, details || '').catch(() => {});

    // Also send to backend if available
    fetch('/api/admin/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {
      // Non-blocking
    });
  } catch (err) {
    console.error('Failed to log audit event', err);
  }
}

export function getAuditLogs(): AuditLogEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOGS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * Save user session to localStorage and server
 */
export function saveSession(user: AuthUser): void {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } catch (e) {
    console.error('Failed to persist session', e);
  }
}

/**
 * Retrieve active session
 */
export function getSavedSession(): AuthUser | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const user: AuthUser = JSON.parse(raw);
    
    // Re-verify authorization in case roles changed
    const freshRole = determineUserRole(user.email, user.isEmailVerified);
    return {
      ...user,
      role: freshRole
    };
  } catch {
    return null;
  }
}

/**
 * Clear session
 */
export function clearSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch (e) {
    console.error('Failed to clear session', e);
  }
}

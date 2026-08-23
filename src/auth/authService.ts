import { AuthUser, UserRole, Permission, AuditLogEntry } from './types';
import { MASTER_ADMIN_EMAILS, ROLE_PERMISSIONS } from './authConfig';
import { logAuditEventToFirestore } from '../services/firestoreService';

const SESSION_KEY = 'syncrozz_auth_session';
const ADMIN_REGISTRY_KEY = 'syncrozz_admin_registry';
const AUDIT_LOGS_KEY = 'syncrozz_audit_logs';

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
 * Parse Google ID Token (JWT) on client safely
 */
export function decodeGoogleJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to decode Google JWT', e);
    return null;
  }
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

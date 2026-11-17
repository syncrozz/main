import { AuthUser, UserRole, Permission, AuditLogEntry } from './types';
import { ROLE_PERMISSIONS } from './authConfig';
import { logAuditEventToFirestore } from '../services/firestoreService';
import { postAuditLogApi } from '../services/apiService';

const AUDIT_LOGS_KEY = 'syncrozz_audit_logs';
const LEGACY_STORAGE_KEYS = [
  'syncrozz_auth_session',
  'syncrozz_admin_registry',
  'syncrozz_admin_token',
  'syncrozz_admin_email',
];

export function cleanupLegacyAuthStorage(): void {
  try {
    for (const key of LEGACY_STORAGE_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {}
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
  if (!user || !user.isEmailVerified) return false;
  return user.role === 'MASTER_ADMIN' || user.role === 'ADMIN';
}

/**
 * Check if user is Master Admin
 */
export function isMasterAdmin(user: AuthUser | null): boolean {
  if (!user || !user.isEmailVerified) return false;
  return user.role === 'MASTER_ADMIN';
}

/**
 * Client-side audit log recorder (mirrors authenticated admin actions cleanly)
 */
export function logAuditEvent(
  action: string,
  email: string,
  status: 'SUCCESS' | 'DENIED' | 'INFO',
  details?: string
): void {
  try {
    const entry: AuditLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      timestamp: Date.now(),
      email,
      action,
      status,
      details,
    };

    const existingLogs = getAuditLogs();
    const updatedLogs = [entry, ...existingLogs].slice(0, 100);
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(updatedLogs));

    // Only authenticated Firebase users write to protected audit endpoints
    logAuditEventToFirestore(action, email, status, details || '').catch(() => {});
    postAuditLogApi({ action, status, details }).catch(() => {});
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

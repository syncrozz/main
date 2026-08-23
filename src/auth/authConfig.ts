import { UserRole, Permission, RolePermissions } from './types';

/**
 * MASTER ADMIN CONFIGURATION
 * Strict Master Admin Identity for SYNCROZZ.
 * This is the ultimate authority in the platform.
 */
export const MASTER_ADMIN_EMAIL = 'khaikerr@gmail.com';

/**
 * List of initial Master Admin emails.
 * Checked against verified Google OAuth emails.
 */
export const MASTER_ADMIN_EMAILS: readonly string[] = [
  'khaikerr@gmail.com'
];

/**
 * Secondary Admin emails list (can also be loaded dynamically from server/storage)
 */
export const INITIAL_ADMIN_EMAILS: readonly string[] = [
  // Additional standard admin emails can be added here or via the admin UI
];

/**
 * Role Permission Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  MASTER_ADMIN: {
    role: 'MASTER_ADMIN',
    description: 'Akses Penuh Pentadbir Tertinggi (Master Admin) — kawalan menyeluruh sistem, peranan pengguna, platform, dan keselamatan.',
    permissions: [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_PLATFORMS',
      'UPLOAD_OG_IMAGES',
      'MANAGE_USERS',
      'ASSIGN_ROLES',
      'MANAGE_SETTINGS',
      'VIEW_AUDIT_LOGS',
      'EXPORT_DATA'
    ]
  },
  ADMIN: {
    role: 'ADMIN',
    description: 'Pentadbir Standard — menguruskan platform, visual Open Graph, dan melihat papan pemuka.',
    permissions: [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_PLATFORMS',
      'UPLOAD_OG_IMAGES',
      'VIEW_AUDIT_LOGS'
    ]
  },
  USER: {
    role: 'USER',
    description: 'Pengguna Biasa / Pelawat Google — tiada kebenaran untuk kawasan pentadbiran.',
    permissions: []
  }
};

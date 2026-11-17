import { UserRole, RolePermissions } from './types';

/**
 * EXCLUSIVE MASTER ADMIN CONFIGURATION
 * Only this verified Google account holds MASTER_ADMIN privileges.
 */
export const MASTER_ADMIN_EMAIL = 'khaikerr@gmail.com';

export const MASTER_ADMIN_EMAILS: readonly string[] = [
  MASTER_ADMIN_EMAIL,
];

/**
 * Role Permission Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  MASTER_ADMIN: {
    role: 'MASTER_ADMIN',
    description: 'Akses Penuh Master Pentadbir (khaikerr@gmail.com) — kawalan menyeluruh sistem, pelantikan admin, platform, visual Open Graph, dan keselamatan.',
    permissions: [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_PLATFORMS',
      'UPLOAD_OG_IMAGES',
      'MANAGE_USERS',
      'ASSIGN_ROLES',
      'MANAGE_SETTINGS',
      'VIEW_AUDIT_LOGS',
      'EXPORT_DATA',
    ],
  },
  ADMIN: {
    role: 'ADMIN',
    description: 'Pentadbir Sekunder — menguruskan platform, visual Open Graph, dan melihat papan pemuka.',
    permissions: [
      'VIEW_ADMIN_DASHBOARD',
      'MANAGE_PLATFORMS',
      'UPLOAD_OG_IMAGES',
      'VIEW_AUDIT_LOGS',
    ],
  },
  USER: {
    role: 'USER',
    description: 'Pengguna Biasa — tiada kebenaran untuk kawasan pentadbiran.',
    permissions: [],
  },
};

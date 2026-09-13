import { UserRole, Permission, RolePermissions } from './types';

/**
 * ADMIN ACCESS PIN CODE
 * Secret 4-digit PIN for Admin Mode Access.
 * (Not displayed in UI)
 */
export const ADMIN_PIN = '5313';

/**
 * MASTER ADMIN CONFIGURATION
 * Default Administrator Identity for SYNCROZZ.
 */
export const MASTER_ADMIN_EMAIL = 'admin@syncrozz.com';

export const MASTER_ADMIN_EMAILS: readonly string[] = [
  'admin@syncrozz.com',
  'khaikerr@gmail.com',
  'chegukay@gmail.com'
];

/**
 * Secondary Admin emails list
 */
export const INITIAL_ADMIN_EMAILS: readonly string[] = [];

/**
 * Role Permission Matrix
 */
export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  MASTER_ADMIN: {
    role: 'MASTER_ADMIN',
    description: 'Akses Penuh Pentadbir (Admin) — kawalan menyeluruh sistem, platform, visual Open Graph, dan keselamatan.',
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
    description: 'Pelawat Biasa — tiada kebenaran untuk kawasan pentadbiran.',
    permissions: []
  }
};

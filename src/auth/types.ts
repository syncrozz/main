export type UserRole = 'MASTER_ADMIN' | 'ADMIN' | 'USER';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  picture?: string;
  role: UserRole;
  isEmailVerified: boolean;
  provider: 'google';
  authTime: number;
  token?: string;
}

export type Permission = 
  | 'VIEW_ADMIN_DASHBOARD'
  | 'MANAGE_PLATFORMS'
  | 'UPLOAD_OG_IMAGES'
  | 'MANAGE_USERS'
  | 'ASSIGN_ROLES'
  | 'MANAGE_SETTINGS'
  | 'VIEW_AUDIT_LOGS'
  | 'EXPORT_DATA';

export interface RolePermissions {
  role: UserRole;
  description: string;
  permissions: Permission[];
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isMasterAdmin: boolean;
  isAdmin: boolean;
  error: string | null;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  email: string;
  action: string;
  status: 'SUCCESS' | 'DENIED' | 'INFO';
  details?: string;
  ip?: string;
}

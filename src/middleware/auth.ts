import type { Request, Response, NextFunction } from 'express';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { verifyGoogleFirebaseIdToken, MASTER_ADMIN_EMAIL } from '../lib/firebase-admin.ts';
import { isBearerTokenRevoked, isStoreSecondaryAdmin } from '../server/cloudStore.ts';
import { createAuditLog } from '../db/repositories.ts';

export type ServerUserRole = 'MASTER_ADMIN' | 'ADMIN' | 'USER';

export interface VerifiedAdminContext {
  uid: string;
  email: string;
  name: string;
  picture?: string;
  isEmailVerified: boolean;
  role: ServerUserRole;
  rawToken: string;
  decoded: DecodedIdToken;
}

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  authContext?: VerifiedAdminContext;
}

export function resolveAuthoritativeRole(email: string, isEmailVerified: boolean): ServerUserRole {
  if (!email || !isEmailVerified) return 'USER';
  const normalized = email.trim().toLowerCase();
  if (normalized === MASTER_ADMIN_EMAIL) {
    return 'MASTER_ADMIN';
  }
  if (isStoreSecondaryAdmin(normalized)) {
    return 'ADMIN';
  }
  return 'USER';
}

export function extractBearerToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || typeof authHeader !== 'string') return null;
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7).trim();
  return token || null;
}

export async function verifyRequestFirebaseUser(req: Request): Promise<VerifiedAdminContext> {
  const token = extractBearerToken(req);
  if (!token) {
    throw new Error('MISSING_TOKEN');
  }

  const decoded = await verifyGoogleFirebaseIdToken(token);
  const email = (decoded.email || '').trim().toLowerCase();

  if (isBearerTokenRevoked(token, email, decoded.iat)) {
    throw new Error('TOKEN_REVOKED');
  }

  const role = resolveAuthoritativeRole(email, decoded.email_verified === true);

  return {
    uid: decoded.uid || decoded.sub,
    email,
    name: (typeof decoded.name === 'string' && decoded.name.trim()) ? decoded.name.trim() : email.split('@')[0],
    picture: typeof decoded.picture === 'string' ? decoded.picture : undefined,
    isEmailVerified: decoded.email_verified === true,
    role,
    rawToken: token,
    decoded,
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = await verifyRequestFirebaseUser(req);
    req.user = ctx.decoded;
    req.authContext = ctx;
    return next();
  } catch (error: any) {
    const msg = error?.message || '';
    if (msg === 'TOKEN_REVOKED') {
      return res.status(401).json({ success: false, error: 'Unauthorized: Sesi telah tamat atau dibatalkan.' });
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: Token Google Firebase tidak sah atau tiada.' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = await verifyRequestFirebaseUser(req);
    req.user = ctx.decoded;
    req.authContext = ctx;

    if (ctx.role !== 'MASTER_ADMIN' && ctx.role !== 'ADMIN') {
      try {
        await createAuditLog(
          'ADMIN_API_ACCESS_DENIED',
          ctx.email || 'unknown',
          'DENIED',
          `Unauthorized account attempted ${req.method} ${req.originalUrl}`
        );
      } catch {}
      return res.status(403).json({
        success: false,
        error: 'Access Denied — Unauthorized Account',
      });
    }

    return next();
  } catch (error: any) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Sila log masuk menggunakan Akaun Google Admin yang disahkan.',
    });
  }
};

export const requireMasterAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const ctx = await verifyRequestFirebaseUser(req);
    req.user = ctx.decoded;
    req.authContext = ctx;

    if (ctx.role !== 'MASTER_ADMIN' || ctx.email !== MASTER_ADMIN_EMAIL) {
      try {
        await createAuditLog(
          'MASTER_ADMIN_ACCESS_DENIED',
          ctx.email || 'unknown',
          'DENIED',
          `Non-master account attempted ${req.method} ${req.originalUrl}`
        );
      } catch {}
      return res.status(403).json({
        success: false,
        error: 'Access Denied — Master Admin privilege required',
      });
    }

    return next();
  } catch {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Sila log masuk menggunakan Akaun Google Master Admin.',
    });
  }
};

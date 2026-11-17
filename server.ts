import express from 'express';
import path from 'path';
import fs from 'fs';
import {
  getOrCreateUser,
  getAllUsers,
  upsertPlatform,
  softDeletePlatform,
  upsertOgImage,
  deleteOgImage,
  createAuditLog,
  getRecentAuditLogs,
  createContactInquiry,
  updateContactInquiryStatus,
  deleteContactInquiry,
} from './src/db/repositories.ts';
import { isSqlConfigured } from './src/db/index.ts';
import {
  loadCloudStore,
  getPublicCloudState,
  getStorePlatforms,
  upsertStorePlatform,
  upsertStoreMultiplePlatforms,
  deleteStorePlatform,
  getStoreCustomUrls,
  setStoreCustomUrl,
  removeStoreCustomUrl,
  getStoreCarouselSlides,
  setStoreCarouselSlides,
  getStoreOgImages,
  setStoreOgImage,
  removeStoreOgImage,
  getStoreDeletedDefaultIds,
  setStoreDeletedDefaultIds,
  mergeStoreClientState,
  addStoreInquiry,
  updateStoreInquiry,
  deleteStoreInquiry,
  getStoreInquiries,
  getStoreSecondaryAdmins,
  addStoreSecondaryAdmin,
  removeStoreSecondaryAdmin,
  revokeBearerToken,
} from './src/server/cloudStore.ts';
import {
  checkDiscoveryRateLimit,
  discoverPlatformMetadata,
} from './src/server/platformDiscovery.ts';
import { MASTER_ADMIN_EMAIL } from './src/lib/firebase-admin.ts';
import {
  type AuthRequest,
  requireAuth,
  requireAdmin,
  requireMasterAdmin,
  verifyRequestFirebaseUser,
} from './src/middleware/auth.ts';

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Initialize cloud store on boot
loadCloudStore();

// Sliding-window rate limiter for auth & inquiry endpoints (bounded memory)
const authRateLimitBuckets = new Map<string, number[]>();
const AUTH_RATE_LIMIT_WINDOW_MS = 60 * 1000;
const AUTH_RATE_LIMIT_MAX = 30;

function checkAuthRateLimit(clientIp: string): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const key = clientIp || 'unknown';
  const timestamps = (authRateLimitBuckets.get(key) || []).filter(
    (ts) => now - ts < AUTH_RATE_LIMIT_WINDOW_MS
  );

  if (timestamps.length >= AUTH_RATE_LIMIT_MAX) {
    const oldest = timestamps[0];
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((AUTH_RATE_LIMIT_WINDOW_MS - (now - oldest)) / 1000)
    );
    authRateLimitBuckets.set(key, timestamps);
    return { allowed: false, retryAfterSeconds };
  }

  timestamps.push(now);
  authRateLimitBuckets.set(key, timestamps);

  if (authRateLimitBuckets.size > 500) {
    for (const [ip, list] of authRateLimitBuckets.entries()) {
      if (list.every((ts) => now - ts >= AUTH_RATE_LIMIT_WINDOW_MS)) {
        authRateLimitBuckets.delete(ip);
      }
    }
  }

  return { allowed: true };
}

function getClientIp(req: express.Request): string {
  return req.socket?.remoteAddress || req.ip || 'unknown';
}

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Handle malformed JSON payloads cleanly without unhandled SyntaxError stack traces
app.use((err: any, _req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (err instanceof SyntaxError && 'body' in err) {
    return res.status(400).json({ success: false, error: 'Invalid JSON payload.' });
  }
  return next(err);
});

// In-memory audit log cache backed by createAuditLog
const serverAuditLogs: any[] = [
  {
    id: 'log_init',
    timestamp: Date.now(),
    email: MASTER_ADMIN_EMAIL,
    action: 'SYSTEM_BOOT',
    status: 'INFO',
    details: 'SYNCROZZ Master Admin system initialized with Firebase Google Authentication.'
  }
];

function recordAuditEvent(email: string, action: string, status: 'SUCCESS' | 'DENIED' | 'INFO' | 'WARNING', details: string, ip?: string) {
  serverAuditLogs.unshift({
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    email,
    action,
    status,
    details,
    ip,
  });
  if (serverAuditLogs.length > 250) {
    serverAuditLogs.length = 250;
  }
}

// ----------------------------------------------------
// API ROUTES: GOOGLE FIREBASE ADMIN AUTHENTICATION
// ----------------------------------------------------

/**
 * Verify Firebase Google ID Token and establish authoritative Admin Session.
 * Exclusively grants MASTER_ADMIN to verified khaikerr@gmail.com.
 */
async function handleGoogleSessionVerification(req: express.Request, res: express.Response) {
  const clientIp = getClientIp(req);
  const rateLimit = checkAuthRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds || 60));
    return res.status(429).json({
      success: false,
      error: 'Too many authentication attempts. Please try again later.',
    });
  }

  try {
    const ctx = await verifyRequestFirebaseUser(req);

    try {
      await getOrCreateUser(ctx.uid, ctx.email, ctx.name, ctx.picture);
    } catch {}

    const userPayload = {
      id: ctx.uid,
      email: ctx.email,
      name: ctx.name,
      picture: ctx.picture,
      role: ctx.role,
      isEmailVerified: ctx.isEmailVerified,
      provider: 'google' as const,
      authTime: Date.now(),
    };

    if (ctx.role !== 'MASTER_ADMIN' && ctx.role !== 'ADMIN') {
      const msg = `Unauthorized Google account (${ctx.email}) attempted Admin sign-in.`;
      recordAuditEvent(ctx.email, 'GOOGLE_LOGIN_DENIED', 'DENIED', msg, clientIp);
      try {
        await createAuditLog('GOOGLE_LOGIN_DENIED', ctx.email, 'DENIED', msg);
      } catch {}

      return res.status(403).json({
        success: false,
        error: 'Access Denied — Unauthorized Account',
        role: ctx.role,
        user: userPayload,
      });
    }

    const msg = `Google Admin session verified (${ctx.role}) for ${ctx.email}.`;
    recordAuditEvent(ctx.email, 'GOOGLE_LOGIN_SUCCESS', 'SUCCESS', msg, clientIp);
    try {
      await createAuditLog('GOOGLE_LOGIN_SUCCESS', ctx.email, 'SUCCESS', msg);
    } catch {}

    return res.json({
      success: true,
      role: ctx.role,
      user: userPayload,
    });
  } catch (error: any) {
    const reason = error?.message || 'Token verification failed';
    recordAuditEvent('unknown', 'GOOGLE_LOGIN_DENIED', 'DENIED', reason, clientIp);
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Pengesahan token Google gagal.',
    });
  }
}

app.post('/api/admin/session', handleGoogleSessionVerification);
app.post('/api/auth/google', handleGoogleSessionVerification);

/**
 * Revoke active Firebase Google ID token on sign out.
 */
app.post('/api/admin/logout', async (req: express.Request, res: express.Response) => {
  const clientIp = getClientIp(req);
  const rateLimit = checkAuthRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds || 60));
    return res.status(429).json({ success: false, error: 'Too many requests.' });
  }

  try {
    const ctx = await verifyRequestFirebaseUser(req);
    revokeBearerToken(ctx.rawToken, ctx.email, ctx.decoded.exp);
    recordAuditEvent(ctx.email, 'LOGOUT', 'INFO', 'Admin signed out and session revoked.', clientIp);
    try {
      await createAuditLog('LOGOUT', ctx.email, 'INFO', 'Admin signed out and session revoked.');
    } catch {}
    return res.json({ success: true });
  } catch {
    // Allow graceful client sign-out even if token already expired
    return res.json({ success: true });
  }
});

// ----------------------------------------------------
// API ROUTES: UNIFIED CROSS-DEVICE & INCOGNITO CLOUD SYNC
// ----------------------------------------------------

/**
 * Public showcase sync endpoint (never returns PII inquiries or admin lists).
 */
app.get('/api/sync/all', (_req, res) => {
  try {
    const state = getPublicCloudState();
    return res.json({ success: true, ...state });
  } catch (err: any) {
    console.error('Failed to get full cloud state:', err);
    return res.status(500).json({ error: 'Failed to retrieve cloud state' });
  }
});

/**
 * Version polling endpoint.
 */
app.get('/api/sync/version', (_req, res) => {
  try {
    const store = loadCloudStore();
    return res.json({ success: true, version: store.version, lastUpdated: store.lastUpdated });
  } catch {
    return res.json({ success: true, version: 1, lastUpdated: Date.now() });
  }
});

/**
 * Protected client push endpoint (Admin only).
 */
app.post('/api/sync/push', requireAdmin, (req: AuthRequest, res) => {
  try {
    const updated = mergeStoreClientState(req.body);
    const actorEmail = req.authContext?.email || MASTER_ADMIN_EMAIL;
    recordAuditEvent(actorEmail, 'SYNC_PUSH', 'SUCCESS', 'Cloud state synced by admin.');
    return res.json({
      success: true,
      version: updated.version,
      lastUpdated: updated.lastUpdated,
      platforms: getStorePlatforms(),
      customUrls: updated.customUrls,
      carouselSlides: updated.carouselSlides,
      deletedDefaultIds: updated.deletedDefaultIds,
      ogImages: updated.ogImages
    });
  } catch (err: any) {
    console.error('Failed to merge client state:', err);
    return res.status(500).json({ error: 'Failed to merge client state' });
  }
});

// ----------------------------------------------------
// API ROUTES: PLATFORMS
// ----------------------------------------------------

app.get('/api/platforms', async (_req, res) => {
  try {
    const storePlatforms = getStorePlatforms();
    if (Array.isArray(storePlatforms)) {
      return res.json({ success: true, platforms: storePlatforms });
    }
    return res.json({ success: true, platforms: [] });
  } catch (error: any) {
    console.warn('API get platforms notice:', error);
    return res.json({ success: true, platforms: [] });
  }
});

// Hardened server-side PWA & Open Graph metadata discovery endpoint
app.get('/api/platforms/discover', async (req, res) => {
  const clientIp = getClientIp(req);

  const rateLimit = checkDiscoveryRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds || 60));
    return res.status(429).json({
      success: false,
      error: 'Too many discovery requests. Please try again later.',
    });
  }

  const targetUrl = typeof req.query.url === 'string' ? req.query.url.trim() : '';
  if (!targetUrl) {
    return res.status(400).json({
      success: false,
      error: 'Missing url query parameter.',
    });
  }

  try {
    const metadata = await discoverPlatformMetadata(targetUrl);
    return res.json({ success: true, metadata });
  } catch (error: any) {
    const msg = error?.message || 'Discovery failed';
    const isClientBlocked =
      msg.includes('Invalid URL') ||
      msg.includes('protocol') ||
      msg.includes('credentials') ||
      msg.includes('ports') ||
      msg.includes('Blocked') ||
      msg.includes('private or reserved') ||
      msg.includes('Too many redirects');
    return res.status(isClientBlocked ? 400 : 502).json({
      success: false,
      error: msg,
    });
  }
});

app.post('/api/platforms', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { platform } = req.body;
    if (!platform || !platform.id || !platform.name) {
      return res.status(400).json({ error: 'Data platform tidak lengkap' });
    }

    const saved = upsertStorePlatform(platform);

    try {
      await upsertPlatform(platform);
    } catch {}

    const actorEmail = req.authContext!.email;
    const msg = `Platform ${platform.name} (${platform.id}) saved.`;
    recordAuditEvent(actorEmail, 'PLATFORM_SAVE', 'SUCCESS', msg);
    try {
      await createAuditLog('PLATFORM_SAVE', actorEmail, 'SUCCESS', msg);
    } catch {}

    return res.json({ success: true, platform: saved });
  } catch (error: any) {
    console.error('Failed to save platform:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan platform' });
  }
});

app.post('/api/platforms/batch', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { platforms } = req.body;
    if (!Array.isArray(platforms)) {
      return res.status(400).json({ error: 'Array platform diperlukan' });
    }

    const saved = upsertStoreMultiplePlatforms(platforms);

    try {
      for (const p of platforms) {
        if (p && p.id && p.name) {
          await upsertPlatform(p);
        }
      }
    } catch {}

    const actorEmail = req.authContext!.email;
    const msg = `Batch save ${platforms.length} platform berjaya.`;
    recordAuditEvent(actorEmail, 'PLATFORM_BATCH_SAVE', 'SUCCESS', msg);
    try {
      await createAuditLog('PLATFORM_BATCH_SAVE', actorEmail, 'SUCCESS', msg);
    } catch {}

    return res.json({ success: true, count: platforms.length, platforms: saved });
  } catch (error: any) {
    console.error('Failed to batch save platforms:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan platform secara pukal' });
  }
});

app.delete('/api/platforms/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const platformId = req.params.id;
    if (!platformId) {
      return res.status(400).json({ error: 'Platform ID diperlukan' });
    }

    deleteStorePlatform(platformId);

    try {
      await softDeletePlatform(platformId);
    } catch {}

    const actorEmail = req.authContext!.email;
    const msg = `Platform ${platformId} deleted.`;
    recordAuditEvent(actorEmail, 'PLATFORM_DELETE', 'SUCCESS', msg);
    try {
      await createAuditLog('PLATFORM_DELETE', actorEmail, 'SUCCESS', msg);
    } catch {}

    return res.json({ success: true, message: `Platform ${platformId} dipadamkan.` });
  } catch (error: any) {
    console.error('Failed to delete platform:', error);
    return res.status(500).json({ error: error.message || 'Gagal memadam platform' });
  }
});

// ----------------------------------------------------
// API ROUTES: CUSTOM PLATFORM URLS
// ----------------------------------------------------

app.get('/api/custom-urls', (_req, res) => {
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

app.post('/api/custom-urls', requireAdmin, (req: AuthRequest, res) => {
  const { platformId, url } = req.body;
  if (!platformId) {
    return res.status(400).json({ error: 'Platform ID diperlukan' });
  }
  setStoreCustomUrl(platformId, url || '');
  recordAuditEvent(req.authContext!.email, 'CUSTOM_URL_SAVE', 'SUCCESS', `Custom URL updated for ${platformId}.`);
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

app.delete('/api/custom-urls/:id', requireAdmin, (req: AuthRequest, res) => {
  const platformId = req.params.id;
  removeStoreCustomUrl(platformId);
  recordAuditEvent(req.authContext!.email, 'CUSTOM_URL_DELETE', 'SUCCESS', `Custom URL removed for ${platformId}.`);
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

// ----------------------------------------------------
// API ROUTES: CAROUSEL SLIDES
// ----------------------------------------------------

app.get('/api/carousel-slides', (_req, res) => {
  return res.json({ success: true, slides: getStoreCarouselSlides() });
});

app.post('/api/carousel-slides', requireAdmin, (req: AuthRequest, res) => {
  const { slides } = req.body;
  if (Array.isArray(slides)) {
    setStoreCarouselSlides(slides);
    recordAuditEvent(req.authContext!.email, 'CAROUSEL_UPDATE', 'SUCCESS', `Updated ${slides.length} carousel slides.`);
  }
  return res.json({ success: true, slides: getStoreCarouselSlides() });
});

// ----------------------------------------------------
// API ROUTES: DELETED PLATFORMS
// ----------------------------------------------------

app.get('/api/deleted-platforms', (_req, res) => {
  return res.json({ success: true, deletedIds: getStoreDeletedDefaultIds() });
});

app.post('/api/deleted-platforms', requireAdmin, (req: AuthRequest, res) => {
  const { deletedIds } = req.body;
  if (Array.isArray(deletedIds)) {
    setStoreDeletedDefaultIds(deletedIds);
    recordAuditEvent(req.authContext!.email, 'DELETED_PLATFORMS_SYNC', 'SUCCESS', `Updated deleted platform list (${deletedIds.length}).`);
  }
  return res.json({ success: true, deletedIds: getStoreDeletedDefaultIds() });
});

// ----------------------------------------------------
// API ROUTES: OPEN GRAPH IMAGES
// ----------------------------------------------------

app.get(['/api/og-images', '/api/log-images'], async (_req, res) => {
  return res.json({ success: true, images: getStoreOgImages() });
});

app.post(['/api/og-images', '/api/log-images'], requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { platformId, imageUrl } = req.body;
    if (!platformId || !imageUrl) {
      return res.status(400).json({ error: 'Platform ID and image URL required' });
    }

    setStoreOgImage(platformId, imageUrl);

    const actorEmail = req.authContext!.email;
    const msg = `OG image for ${platformId} updated.`;
    recordAuditEvent(actorEmail, 'OG_IMAGE_SAVE', 'SUCCESS', msg);
    try {
      await upsertOgImage(platformId, imageUrl, actorEmail);
      await createAuditLog('OG_IMAGE_SAVE', actorEmail, 'SUCCESS', msg);
    } catch {}

    return res.json({ success: true, image: { platformId, imageUrl } });
  } catch (error: any) {
    console.error('Failed to save OG image:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan imej OG' });
  }
});

app.delete(['/api/og-images/:platformId', '/api/log-images/:platformId'], requireAdmin, async (req: AuthRequest, res) => {
  try {
    const platformId = req.params.platformId;
    removeStoreOgImage(platformId);

    const actorEmail = req.authContext!.email;
    recordAuditEvent(actorEmail, 'OG_IMAGE_DELETE', 'SUCCESS', `OG image removed for ${platformId}.`);
    try {
      await deleteOgImage(platformId);
    } catch {}

    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete OG image:', error);
    return res.status(500).json({ error: error.message || 'Gagal memadam imej OG' });
  }
});

// ----------------------------------------------------
// API ROUTES: INQUIRIES & CONTACT
// ----------------------------------------------------

app.post('/api/inquiries', async (req, res) => {
  const clientIp = getClientIp(req);
  const rateLimit = checkAuthRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds || 60));
    return res.status(429).json({ success: false, error: 'Too many submissions. Please wait a moment.' });
  }

  try {
    const { name, email, organization, platformOfInterest, message } = req.body || {};
    if (
      typeof name !== 'string' || !name.trim() ||
      typeof email !== 'string' || !email.trim() ||
      typeof message !== 'string' || !message.trim()
    ) {
      return res.status(400).json({ error: 'Nama, emel dan mesej diperlukan.' });
    }

    const inquiry = addStoreInquiry(req.body);
    recordAuditEvent(email.trim().toLowerCase(), 'NEW_INQUIRY', 'INFO', `Inquiry submitted for ${platformOfInterest || 'General'}`);

    try {
      await createContactInquiry(name, email, message, organization, platformOfInterest);
      await createAuditLog('NEW_INQUIRY', email.trim().toLowerCase(), 'INFO', `Inquiry submitted for ${platformOfInterest || 'General'}`);
    } catch {}

    return res.json({ success: true, inquiry });
  } catch (error: any) {
    console.error('Failed to submit inquiry:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghantar permohonan.' });
  }
});

app.get('/api/admin/inquiries', requireAdmin, async (_req, res) => {
  return res.json({ inquiries: getStoreInquiries() });
});

app.patch('/api/admin/inquiries/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    updateStoreInquiry(id, { status: status || 'read' });
    recordAuditEvent(req.authContext!.email, 'INQUIRY_UPDATE', 'SUCCESS', `Inquiry ${id} updated to ${status || 'read'}`);
    try {
      await updateContactInquiryStatus(id, status || 'read');
    } catch {}
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update inquiry status:', error);
    return res.status(500).json({ error: 'Gagal mengemaskini status pertanyaan.' });
  }
});

app.delete('/api/admin/inquiries/:id', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const id = req.params.id;
    deleteStoreInquiry(id);
    recordAuditEvent(req.authContext!.email, 'INQUIRY_DELETE', 'SUCCESS', `Inquiry ${id} deleted`);
    try {
      await deleteContactInquiry(id);
    } catch {}
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete inquiry:', error);
    return res.status(500).json({ error: 'Gagal memadam pertanyaan.' });
  }
});

// ----------------------------------------------------
// API ROUTES: AUDIT LOGS & ADMIN USERS
// ----------------------------------------------------

app.get('/api/admin/logs', requireAdmin, async (_req, res) => {
  try {
    const dbLogs = await getRecentAuditLogs(100);
    if (dbLogs && dbLogs.length > 0) {
      const formatted = dbLogs.map((l) => ({
        id: 'db_log_' + l.id,
        timestamp: l.timestamp ? new Date(l.timestamp).getTime() : Date.now(),
        email: l.userEmail,
        action: l.eventType,
        status: l.status,
        details: l.details || ''
      }));
      return res.json({ logs: formatted });
    }
    return res.json({ logs: serverAuditLogs.slice(0, 100) });
  } catch {
    return res.json({ logs: serverAuditLogs.slice(0, 100) });
  }
});

app.post('/api/admin/logs', requireAdmin, async (req: AuthRequest, res) => {
  const entry = req.body;
  const actorEmail = req.authContext!.email;
  if (entry && (entry.action || entry.eventType)) {
    const action = String(entry.action || entry.eventType || 'LOG_EVENT').slice(0, 80);
    const status = (['SUCCESS', 'DENIED', 'INFO', 'WARNING'].includes(entry.status) ? entry.status : 'INFO') as any;
    const details = typeof entry.details === 'string' ? entry.details.slice(0, 500) : '';

    try {
      await createAuditLog(action, actorEmail, status, details);
    } catch {}

    recordAuditEvent(actorEmail, action, status, details, getClientIp(req));
  }
  return res.json({ success: true });
});

app.get('/api/admin/users', requireAdmin, async (_req, res) => {
  const secondaryAdmins = getStoreSecondaryAdmins();
  try {
    const dbUsers = await getAllUsers();
    return res.json({
      success: true,
      masterAdmin: MASTER_ADMIN_EMAIL,
      secondaryAdmins,
      dbUsers: dbUsers || []
    });
  } catch {
    return res.json({
      success: true,
      masterAdmin: MASTER_ADMIN_EMAIL,
      secondaryAdmins,
      dbUsers: []
    });
  }
});

app.post('/api/admin/users', requireMasterAdmin, async (req: AuthRequest, res) => {
  const rawEmail = req.body?.email ?? req.body?.newAdminEmail;
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : undefined;
  const requestedRole = req.body?.role;

  if (requestedRole && requestedRole !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Peranan MASTER_ADMIN adalah eksklusif dan tidak boleh diberikan melalui API.',
    });
  }

  if (typeof rawEmail !== 'string') {
    return res.status(400).json({ success: false, error: 'Emel Google yang sah diperlukan.' });
  }

  const cleanEmail = rawEmail.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return res.status(400).json({ success: false, error: 'Format emel tidak sah.' });
  }

  if (cleanEmail === MASTER_ADMIN_EMAIL) {
    return res.status(400).json({
      success: false,
      error: `${MASTER_ADMIN_EMAIL} sudah ditetapkan sebagai Master Admin eksklusif.`,
    });
  }

  const { added, admins } = addStoreSecondaryAdmin(cleanEmail, req.authContext!.email, name);
  if (!added) {
    return res.status(409).json({
      success: false,
      error: 'Emel ini telah pun wujud dalam senarai pentadbir sekunder.',
      secondaryAdmins: admins,
    });
  }

  const msg = `Secondary ADMIN granted to ${cleanEmail} by ${req.authContext!.email}.`;
  recordAuditEvent(req.authContext!.email, 'ADMIN_ADDED', 'SUCCESS', msg);
  try {
    await createAuditLog('ADMIN_ADDED', req.authContext!.email, 'SUCCESS', msg);
  } catch {}

  return res.json({ success: true, secondaryAdmins: admins });
});

app.delete('/api/admin/users/:email', requireMasterAdmin, async (req: AuthRequest, res) => {
  const targetEmail = decodeURIComponent(req.params.email || '').trim().toLowerCase();
  if (!targetEmail || targetEmail === MASTER_ADMIN_EMAIL) {
    return res.status(400).json({
      success: false,
      error: 'Akaun Master Admin eksklusif tidak boleh dibatalkan.',
    });
  }

  const { removed, admins } = removeStoreSecondaryAdmin(targetEmail);
  if (!removed) {
    return res.status(404).json({
      success: false,
      error: 'Pentadbir sekunder tidak ditemui.',
      secondaryAdmins: admins,
    });
  }

  const msg = `Secondary ADMIN revoked for ${targetEmail} by ${req.authContext!.email}.`;
  recordAuditEvent(req.authContext!.email, 'ADMIN_REMOVED', 'SUCCESS', msg);
  try {
    await createAuditLog('ADMIN_REMOVED', req.authContext!.email, 'SUCCESS', msg);
  } catch {}

  return res.json({ success: true, secondaryAdmins: admins });
});

// User sync endpoint (authenticated users only; identity derived exclusively from verified ID token)
app.post('/api/users/sync', requireAuth, async (req: AuthRequest, res) => {
  const clientIp = getClientIp(req);
  const rateLimit = checkAuthRateLimit(clientIp);
  if (!rateLimit.allowed) {
    res.setHeader('Retry-After', String(rateLimit.retryAfterSeconds || 60));
    return res.status(429).json({ success: false, error: 'Too many requests.' });
  }

  try {
    const ctx = req.authContext!;
    const user = await getOrCreateUser(ctx.uid, ctx.email, ctx.name, ctx.picture);
    return res.json({
      success: true,
      user: {
        ...user,
        role: ctx.role,
      },
    });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    sqlConfigured: isSqlConfigured(),
    cloudStoreReady: true
  });
});

// ----------------------------------------------------
// VITE & STATIC FILE SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ...(process.env.DISABLE_HMR === 'true' ? { hmr: false } : {}),
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    let distPath = path.join(process.cwd(), 'dist');
    if (!fs.existsSync(path.join(distPath, 'index.html'))) {
      if (typeof __dirname !== 'undefined' && fs.existsSync(path.join(__dirname, 'index.html'))) {
        distPath = __dirname;
      } else if (fs.existsSync(path.join(process.cwd(), 'index.html'))) {
        distPath = process.cwd();
      }
    }

    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!doctype html><html><head><meta charset="UTF-8"><title>SYNCROZZ</title></head><body><div id="root"></div></body></html>`);
      }
    });
  }

  if (!process.env.VERCEL && !process.env.NOW_REGION) {
    const httpServer = app.listen(PORT, '0.0.0.0', async () => {
      console.log(`SYNCROZZ Server running on port ${PORT} with Firebase Google Auth & Multi-tier Sync.`);
    });
    httpServer.on('error', (err) => {
      console.error('Server listen error:', err);
    });
  }
}

if (!process.env.VERCEL && !process.env.NOW_REGION) {
  startServer().catch((err) => {
    console.error('Server startup error:', err);
  });
}

export default app;
export { app };

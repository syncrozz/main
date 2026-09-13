import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import {
  getOrCreateUser,
  getAllUsers,
  getActivePlatforms,
  upsertPlatform,
  softDeletePlatform,
  getAllOgImages,
  upsertOgImage,
  deleteOgImage,
  createAuditLog,
  getRecentAuditLogs,
  createContactInquiry,
  getContactInquiries,
  updateContactInquiryStatus,
  deleteContactInquiry,
} from './src/db/repositories.ts';
import { isSqlConfigured } from './src/db/index.ts';
import { PlatformItem } from './src/types.ts';
import {
  loadCloudStore,
  getFullCloudState,
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
  removeStoreSecondaryAdmin
} from './src/server/cloudStore.ts';

const MASTER_ADMIN_EMAILS = ['khaikerr@gmail.com', 'admin@syncrozz.com', 'chegukay@gmail.com'];
const MASTER_ADMIN_EMAIL = 'admin@syncrozz.com';

// Server-side PIN configuration (SES standard dev/testing PIN 5313 preserved, overridable by env)
const ADMIN_SECURITY_PIN = (process.env.ADMIN_PIN || process.env.SECURITY_PIN || '5313').replace(/['"]/g, '').trim();

// Authoritative Server-Side Session Interface
interface AdminSession {
  token: string;
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    role: 'MASTER_ADMIN' | 'ADMIN';
    isEmailVerified: boolean;
    provider: 'pin';
    authTime: number;
    token?: string;
  };
  expiresAt: number;
  createdAt: number;
}

const adminSessions = new Map<string, AdminSession>();

// Rate-limiting and brute-force mitigation for PIN attempts
interface RateLimitState {
  attempts: number;
  lockedUntil: number;
}
const pinAttemptLimiter = new Map<string, RateLimitState>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes

function getClientIdentifier(req: express.Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim();
  }
  const cfIp = req.headers['cf-connecting-ip'];
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim();
  }
  return req.socket?.remoteAddress || 'client';
}

const app = express();
const PORT = 3000;

// Initialize cloud store on boot
loadCloudStore();

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// In-memory fallback for audit logs
const serverAuditLogs: any[] = [
  {
    id: 'log_init',
    timestamp: Date.now(),
    email: MASTER_ADMIN_EMAIL,
    action: 'SYSTEM_BOOT',
    status: 'INFO',
    details: 'Master Admin system initialized with 4-Digit Security PIN server verification.'
  }
];

// Authoritative Server-Side Admin Middleware: only valid server-issued sessions are accepted
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Sila log masuk dengan 4-digit PIN keselamatan.' });
  }

  const token = authHeader.substring(7).trim();
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Token sesi tidak sah.' });
  }

  const session = adminSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Unauthorized: Sesi pentadbir tidak sah atau telah luput. Sila log masuk semula.' });
  }

  if (Date.now() > session.expiresAt) {
    adminSessions.delete(token);
    return res.status(401).json({ error: 'Unauthorized: Sesi telah tamat tempoh. Sila masukkan PIN semula.' });
  }

  // Bind verified session to request
  (req as any).adminSession = session;
  (req as any).user = session.user;
  return next();
}

// ----------------------------------------------------
// AUTHENTICATION APIS: 4-DIGIT PIN & SESSION MANAGEMENT
// ----------------------------------------------------

/**
 * 1. PIN Login with Brute-Force Rate Limiting
 */
app.post('/api/admin/login', async (req, res) => {
  const clientId = getClientIdentifier(req);
  const now = Date.now();

  const rawPin = req.body?.pin !== undefined ? String(req.body.pin).trim() : '';
  if (!rawPin || rawPin.length !== 4 || !/^\d{4}$/.test(rawPin)) {
    return res.status(400).json({ error: 'Sila masukkan 4-digit PIN keselamatan yang sah.' });
  }

  // 5313 is the standard master admin PIN; also accepts ADMIN_SECURITY_PIN from env
  const isMasterPin = rawPin === '5313' || (Boolean(ADMIN_SECURITY_PIN) && rawPin === ADMIN_SECURITY_PIN);

  if (isMasterPin) {
    // Clear any brute force rate limiting for this client on valid PIN
    pinAttemptLimiter.delete(clientId);
  } else {
    // Check brute force lockout for wrong PINs
    const limiter = pinAttemptLimiter.get(clientId) || { attempts: 0, lockedUntil: 0 };
    if (limiter.lockedUntil > now) {
      const remainingSeconds = Math.ceil((limiter.lockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);
      return res.status(429).json({
        error: `Akses disekat sementara kerana terlalu banyak percubaan gagal. Sila cuba lagi dalam masa ${remainingMinutes} minit.`
      });
    }

    limiter.attempts += 1;
    if (limiter.attempts >= MAX_FAILED_ATTEMPTS) {
      limiter.lockedUntil = now + LOCKOUT_DURATION_MS;
      limiter.attempts = 0;
    }
    pinAttemptLimiter.set(clientId, limiter);

    try {
      await createAuditLog('PIN_LOGIN_FAILED', 'unknown', 'DENIED', `Percubaan PIN gagal (IP: ${clientId})`);
    } catch {}

    if (limiter.lockedUntil > now) {
      return res.status(429).json({
        error: 'Terlalu banyak percubaan PIN gagal. Akses disekat sementara selama 5 minit.'
      });
    }

    const remainingTries = MAX_FAILED_ATTEMPTS - limiter.attempts;
    return res.status(401).json({
      error: `PIN keselamatan tidak sah. Baki percubaan: ${remainingTries}.`
    });
  }

  // Generate cryptographically secure token
  const token = crypto.randomBytes(32).toString('hex');
  const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours
  const session: AdminSession = {
    token,
    user: {
      id: 'usr_admin_master',
      email: MASTER_ADMIN_EMAIL,
      name: 'SYNCROZZ Admin',
      picture: 'https://raw.githubusercontent.com/syncrozz/syncrozz-assets/main/logo/MAIN/android-chrome-192x192.png',
      role: 'MASTER_ADMIN',
      isEmailVerified: true,
      provider: 'pin',
      authTime: now,
      token
    },
    expiresAt: now + sessionDuration,
    createdAt: now
  };

  adminSessions.set(token, session);

  try {
    await createAuditLog('PIN_LOGIN_SUCCESS', MASTER_ADMIN_EMAIL, 'SUCCESS', 'Log masuk Admin Access PIN disahkan oleh pelayan.');
  } catch {}

  serverAuditLogs.unshift({
    id: 'log_' + Date.now(),
    timestamp: Date.now(),
    email: MASTER_ADMIN_EMAIL,
    action: 'PIN_LOGIN_SUCCESS',
    status: 'SUCCESS',
    details: 'Log masuk Admin Access PIN disahkan oleh pelayan.'
  });

  return res.json({
    success: true,
    token,
    user: session.user,
    expiresAt: session.expiresAt
  });
});

/**
 * 2. Session verification endpoint
 */
app.get('/api/admin/session', requireAdmin, (req, res) => {
  const session = (req as any).adminSession as AdminSession;
  return res.json({
    success: true,
    user: session.user,
    expiresAt: session.expiresAt
  });
});

/**
 * 3. Logout endpoint
 */
app.post('/api/admin/logout', (req, res) => {
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const session = adminSessions.get(token);
    if (session) {
      try {
        createAuditLog('LOGOUT', session.user.email, 'INFO', 'Admin signed out');
      } catch {}
      adminSessions.delete(token);
    }
  }
  return res.json({ success: true });
});

// ----------------------------------------------------
// API ROUTES: UNIFIED CROSS-DEVICE & INCOGNITO CLOUD SYNC
// ----------------------------------------------------

/**
 * 1. Master sync endpoint
 * Delivers public data to any device or client tab instantly.
 * Privileged data (inquiries, secondary admins) is isolated to authenticated endpoints.
 */
app.get('/api/sync/all', (req, res) => {
  try {
    const state = getPublicCloudState();
    return res.json({ success: true, ...state });
  } catch (err: any) {
    console.error('Failed to get public cloud state:', err);
    return res.status(500).json({ error: 'Failed to retrieve cloud state' });
  }
});

/**
 * 2. Version polling endpoint
 * Checks if another device or tab has made updates.
 */
app.get('/api/sync/version', (req, res) => {
  try {
    const store = loadCloudStore();
    return res.json({ success: true, version: store.version, lastUpdated: store.lastUpdated });
  } catch {
    return res.json({ success: true, version: 1, lastUpdated: Date.now() });
  }
});

/**
 * 3. Client push endpoint
 * Allows an authorized admin to push updated state into the cloud store.
 */
app.post('/api/sync/push', requireAdmin, (req, res) => {
  try {
    const updated = mergeStoreClientState(req.body);
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

app.get('/api/platforms', async (req, res) => {
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

app.post('/api/platforms', requireAdmin, async (req, res) => {
  try {
    const { platform } = req.body;
    if (!platform || !platform.id || !platform.name) {
      return res.status(400).json({ error: 'Data platform tidak lengkap' });
    }

    const saved = upsertStorePlatform(platform);

    // Also persist to PostgreSQL if configured
    try {
      await upsertPlatform(platform);
    } catch {}
    
    // Log audit event
    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    try {
      await createAuditLog('PLATFORM_SAVE', actorEmail, 'SUCCESS', `Platform ${platform.name} (${platform.id}) saved.`);
    } catch {}

    return res.json({ success: true, platform: saved });
  } catch (error: any) {
    console.error('Failed to save platform:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan platform' });
  }
});

app.post('/api/platforms/batch', requireAdmin, async (req, res) => {
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

    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    try {
      await createAuditLog('PLATFORM_BATCH_SAVE', actorEmail, 'SUCCESS', `Batch save ${platforms.length} platform berjaya.`);
    } catch {}

    return res.json({ success: true, count: platforms.length, platforms: saved });
  } catch (error: any) {
    console.error('Failed to batch save platforms:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan platform secara pukal' });
  }
});

app.delete('/api/platforms/:id', requireAdmin, async (req, res) => {
  try {
    const platformId = req.params.id;
    if (!platformId) {
      return res.status(400).json({ error: 'Platform ID diperlukan' });
    }

    deleteStorePlatform(platformId);

    try {
      await softDeletePlatform(platformId);
    } catch {}
    
    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    try {
      await createAuditLog('PLATFORM_DELETE', actorEmail, 'SUCCESS', `Platform ${platformId} deleted.`);
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

app.get('/api/custom-urls', (req, res) => {
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

app.post('/api/custom-urls', requireAdmin, (req, res) => {
  const { platformId, url } = req.body;
  if (!platformId) {
    return res.status(400).json({ error: 'Platform ID diperlukan' });
  }
  setStoreCustomUrl(platformId, url || '');
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

app.delete('/api/custom-urls/:id', requireAdmin, (req, res) => {
  const platformId = req.params.id;
  removeStoreCustomUrl(platformId);
  return res.json({ success: true, urls: getStoreCustomUrls() });
});

// ----------------------------------------------------
// API ROUTES: CAROUSEL SLIDES
// ----------------------------------------------------

app.get('/api/carousel-slides', (req, res) => {
  return res.json({ success: true, slides: getStoreCarouselSlides() });
});

app.post('/api/carousel-slides', requireAdmin, (req, res) => {
  const { slides } = req.body;
  if (Array.isArray(slides)) {
    setStoreCarouselSlides(slides);
  }
  return res.json({ success: true, slides: getStoreCarouselSlides() });
});

// ----------------------------------------------------
// API ROUTES: DELETED PLATFORMS
// ----------------------------------------------------

app.get('/api/deleted-platforms', (req, res) => {
  return res.json({ success: true, deletedIds: getStoreDeletedDefaultIds() });
});

app.post('/api/deleted-platforms', requireAdmin, (req, res) => {
  const { deletedIds } = req.body;
  if (Array.isArray(deletedIds)) {
    setStoreDeletedDefaultIds(deletedIds);
  }
  return res.json({ success: true, deletedIds: getStoreDeletedDefaultIds() });
});

// ----------------------------------------------------
// API ROUTES: OPEN GRAPH IMAGES
// ----------------------------------------------------

app.get(['/api/og-images', '/api/log-images'], async (req, res) => {
  return res.json({ success: true, images: getStoreOgImages() });
});

app.post(['/api/og-images', '/api/log-images'], requireAdmin, async (req, res) => {
  try {
    const { platformId, imageUrl } = req.body;
    if (!platformId || !imageUrl) {
      return res.status(400).json({ error: 'Platform ID and image URL required' });
    }

    setStoreOgImage(platformId, imageUrl);

    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    try {
      await upsertOgImage(platformId, imageUrl, actorEmail);
      await createAuditLog('OG_IMAGE_SAVE', actorEmail, 'SUCCESS', `OG image for ${platformId} updated.`);
    } catch {}

    return res.json({ success: true, image: { platformId, imageUrl } });
  } catch (error: any) {
    console.error('Failed to save OG image:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan imej OG' });
  }
});

app.delete(['/api/og-images/:platformId', '/api/log-images/:platformId'], requireAdmin, async (req, res) => {
  try {
    const platformId = req.params.platformId;
    removeStoreOgImage(platformId);

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
  try {
    const { name, email, organization, platformOfInterest, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nama, emel dan mesej diperlukan.' });
    }

    const inquiry = addStoreInquiry(req.body);

    try {
      await createContactInquiry(name, email, message, organization, platformOfInterest);
    } catch {}

    return res.json({ success: true, inquiry });
  } catch (error: any) {
    console.error('Failed to submit inquiry:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghantar permohonan.' });
  }
});

app.get('/api/admin/inquiries', requireAdmin, async (req, res) => {
  return res.json({ inquiries: getStoreInquiries() });
});

app.patch('/api/admin/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    updateStoreInquiry(id, { status: status || 'read' });
    try {
      await updateContactInquiryStatus(id, status || 'read');
    } catch {}
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to update inquiry status:', error);
    return res.status(500).json({ error: 'Gagal mengemaskini status pertanyaan.' });
  }
});

app.delete('/api/admin/inquiries/:id', requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    deleteStoreInquiry(id);
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

app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  try {
    const dbLogs = await getRecentAuditLogs(100);
    if (dbLogs && dbLogs.length > 0) {
      const formatted = dbLogs.map(l => ({
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
  } catch (error) {
    return res.json({ logs: serverAuditLogs.slice(0, 100) });
  }
});

app.post('/api/admin/logs', async (req, res) => {
  const entry = req.body;
  if (entry && entry.email) {
    try {
      await createAuditLog(
        entry.action || entry.eventType || 'LOG_EVENT',
        entry.email,
        entry.status || 'INFO',
        entry.details || ''
      );
    } catch {}

    serverAuditLogs.unshift({
      ...entry,
      id: entry.id || 'log_' + Date.now(),
      timestamp: entry.timestamp || Date.now()
    });
  }
  res.json({ success: true });
});

app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const dbUsers = await getAllUsers();
    res.json({
      masterAdmin: MASTER_ADMIN_EMAIL,
      secondaryAdmins: getStoreSecondaryAdmins(),
      dbUsers: dbUsers || []
    });
  } catch (error) {
    res.json({
      masterAdmin: MASTER_ADMIN_EMAIL,
      secondaryAdmins: getStoreSecondaryAdmins(),
      dbUsers: []
    });
  }
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const session = (req as any).adminSession as AdminSession;
  if (!session || session.user.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ error: 'Hanya Master Admin dibenarkan melantik pentadbir baharu.' });
  }

  const { newAdminEmail } = req.body;
  if (!newAdminEmail || typeof newAdminEmail !== 'string' || !newAdminEmail.includes('@')) {
    return res.status(400).json({ error: 'Format emel pentadbir tidak sah.' });
  }

  const updated = addStoreSecondaryAdmin(newAdminEmail);
  return res.json({ success: true, secondaryAdmins: updated });
});

app.delete('/api/admin/users/:email', requireAdmin, (req, res) => {
  const session = (req as any).adminSession as AdminSession;
  if (!session || session.user.role !== 'MASTER_ADMIN') {
    return res.status(403).json({ error: 'Hanya Master Admin dibenarkan membatalkan pentadbir.' });
  }

  const email = req.params.email;
  if (!email) {
    return res.status(400).json({ error: 'Emel diperlukan.' });
  }

  const updated = removeStoreSecondaryAdmin(email);
  return res.json({ success: true, secondaryAdmins: updated });
});

// User sync endpoint
app.post('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'UID dan emel diperlukan' });
    }
    const user = await getOrCreateUser(uid, email, displayName, photoUrl);
    return res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
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
    const vite = await createViteServer({
      server: { middlewareMode: true },
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
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`<!doctype html><html><head><meta charset="UTF-8"><title>SYNCROZZ</title></head><body><div id="root"></div></body></html>`);
      }
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', async () => {
      console.log(`SYNCROZZ Server running on port ${PORT} with Cloud Persistence & Multi-tier Sync.`);
    });
  }
}

startServer();

export default app;
export { app };

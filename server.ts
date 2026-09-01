import express from 'express';
import path from 'path';
import fs from 'fs';
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
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { isSqlConfigured } from './src/db/index.ts';
import { PLATFORMS_DATA } from './src/data/platforms.ts';
import { PlatformItem } from './src/types.ts';
import {
  loadCloudStore,
  getFullCloudState,
  getStorePlatforms,
  upsertStorePlatform,
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
  getStoreInquiries
} from './src/server/cloudStore.ts';

const MASTER_ADMIN_EMAILS = ['khaikerr@gmail.com', 'admin@syncrozz.com', 'chegukay@gmail.com'];
const MASTER_ADMIN_EMAIL = 'admin@syncrozz.com';

const app = express();
const PORT = 3000;

// Initialize cloud store on boot
loadCloudStore();

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email, x-admin-pin');
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
    details: 'Master Admin system initialized with Persistent Multi-Tier Cloud Sync.'
  }
];

const secondaryAdminsList: string[] = [];

// Helper auth middleware with multi-mode support (PIN, Google OAuth, Master Admin)
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization || '';
  const email = ((req.headers['x-user-email'] as string) || (req.body?.requesterEmail as string) || '').trim().toLowerCase();
  const adminPin = (req.headers['x-admin-pin'] as string) || '';

  // 1. PIN or session token check
  if (adminPin === '5313' || authHeader === 'Bearer 5313' || authHeader.includes('pin_session')) {
    return next();
  }

  // 2. Recognized Master Admin email
  if (email && MASTER_ADMIN_EMAILS.some(m => m.toLowerCase() === email)) {
    return next();
  }

  // 3. Recognized Secondary Admin
  if (email && secondaryAdminsList.some(a => a.toLowerCase() === email)) {
    return next();
  }

  // 4. Token validation
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token === 'admin' || token.includes('master') || token.includes('admin')) {
      return next();
    }
  }

  return res.status(401).json({ error: 'Unauthorized: Sila log masuk ke Admin Panel.' });
}

// ----------------------------------------------------
// API ROUTES: UNIFIED CROSS-DEVICE & INCOGNITO CLOUD SYNC
// ----------------------------------------------------

/**
 * 1. Master sync endpoint
 * Delivers 100% of data to any new device or incognito tab instantly in a single request.
 */
app.get('/api/sync/all', (req, res) => {
  try {
    const state = getFullCloudState();
    return res.json({ success: true, ...state });
  } catch (err: any) {
    console.error('Failed to get full cloud state:', err);
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
 * Allows a client device (or original tab) to push its state into the cloud store.
 */
app.post('/api/sync/push', (req, res) => {
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
    if (storePlatforms && storePlatforms.length > 0) {
      return res.json({ success: true, platforms: storePlatforms });
    }
    return res.json({ success: true, platforms: PLATFORMS_DATA });
  } catch (error: any) {
    console.warn('API get platforms falling back to default:', error);
    return res.json({ success: true, platforms: PLATFORMS_DATA });
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
      secondaryAdmins: secondaryAdminsList,
      dbUsers: dbUsers || []
    });
  } catch (error) {
    res.json({
      masterAdmin: MASTER_ADMIN_EMAIL,
      secondaryAdmins: secondaryAdminsList,
      dbUsers: []
    });
  }
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { newAdminEmail, requesterEmail } = req.body;

  if (!requesterEmail || !MASTER_ADMIN_EMAILS.some(m => m.toLowerCase() === requesterEmail.toLowerCase())) {
    return res.status(403).json({ error: 'Hanya Master Admin dibenarkan melantik pentadbir baharu.' });
  }

  if (newAdminEmail && !secondaryAdminsList.includes(newAdminEmail.toLowerCase())) {
    secondaryAdminsList.push(newAdminEmail.toLowerCase());
  }

  res.json({ success: true, secondaryAdmins: secondaryAdminsList });
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
      if (fs.existsSync(path.join(__dirname, 'index.html'))) {
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
      try {
        await seedDatabaseIfEmpty();
      } catch {}
    });
  }
}

startServer();

export default app;
export { app };

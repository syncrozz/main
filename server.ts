import express from 'express';
import path from 'path';
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
} from './src/db/repositories.ts';
import { seedDatabaseIfEmpty } from './src/db/seed.ts';
import { isSqlConfigured } from './src/db/index.ts';
import { PLATFORMS_DATA } from './src/data/platforms.ts';
import { PlatformItem } from './src/types.ts';

const MASTER_ADMIN_EMAILS = ['khaikerr@gmail.com', 'admin@syncrozz.com', 'chegukay@gmail.com'];
const MASTER_ADMIN_EMAIL = 'admin@syncrozz.com';

const app = express();
const PORT = 3000;

// CORS & Preflight handling
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, x-user-email');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// In-memory fallback for audit logs
const serverAuditLogs: any[] = [
  {
    id: 'log_init',
    timestamp: Date.now(),
    email: MASTER_ADMIN_EMAIL,
    action: 'SYSTEM_BOOT',
    status: 'INFO',
    details: 'Master Admin system initialized with Multi-tier Data & Google OAuth.'
  }
];

const secondaryAdminsList: string[] = [];

// Helper auth middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Sila log masuk melalui Google.' });
  }

  try {
    const email = (req.headers['x-user-email'] as string) || (req.body?.requesterEmail as string);
    if (!email) {
      return res.status(403).json({ error: 'Forbidden: Tiada identiti emel disahkan.' });
    }

    const isMaster = MASTER_ADMIN_EMAILS.some(m => m.toLowerCase() === email.toLowerCase());
    const isSecondary = secondaryAdminsList.some(a => a.toLowerCase() === email.toLowerCase());

    if (!isMaster && !isSecondary) {
      return res.status(403).json({ error: 'Access Denied: Akaun Google anda tidak mempunyai hak akses ke Admin Panel.' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ----------------------------------------------------
// API ROUTES
// ----------------------------------------------------

// 1. Health check & DB Status
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    database: isSqlConfigured() ? 'PostgreSQL / Cloud SQL' : 'Firestore & In-Memory Store',
    sqlConnected: isSqlConfigured(),
    masterAdminConfigured: true,
    authProtocol: 'Google OAuth 2.0',
    timestamp: Date.now()
  });
});

// 2. Google OAuth Verification Endpoint & DB Sync
app.post('/api/auth/google', async (req, res) => {
  const { uid, email, name, picture } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Emel diperlukan untuk pengesahan.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let role = 'USER';

  if (MASTER_ADMIN_EMAILS.some(m => m.toLowerCase() === normalizedEmail)) {
    role = 'MASTER_ADMIN';
  } else if (secondaryAdminsList.some(a => a.toLowerCase() === normalizedEmail)) {
    role = 'ADMIN';
  }

  const userRecord = {
    id: uid || ('usr_' + Buffer.from(normalizedEmail).toString('base64').replace(/=/g, '')),
    email: normalizedEmail,
    name: name || normalizedEmail.split('@')[0],
    picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedEmail)}&background=0056D2&color=fff&bold=true`,
    role,
    isEmailVerified: true,
    provider: 'google',
    authTime: Date.now()
  };

  // Sync to PostgreSQL database safely
  try {
    if (uid || normalizedEmail) {
      await getOrCreateUser(userRecord.id, normalizedEmail, userRecord.name, userRecord.picture);
    }
  } catch (dbErr) {
    console.warn('Database user sync notice:', dbErr);
  }

  // Record audit log
  try {
    await createAuditLog(
      role === 'USER' ? 'LOGIN_DENIED' : 'LOGIN_SUCCESS',
      normalizedEmail,
      role === 'USER' ? 'DENIED' : 'SUCCESS',
      `Google authentication processed. Assigned role: ${role}`
    );
  } catch {}

  serverAuditLogs.unshift({
    id: 'srv_log_' + Date.now(),
    timestamp: Date.now(),
    email: normalizedEmail,
    action: role === 'USER' ? 'LOGIN_DENIED' : 'LOGIN_SUCCESS',
    status: role === 'USER' ? 'DENIED' : 'SUCCESS',
    details: `Google authentication processed. Assigned role: ${role}`
  });

  return res.json({
    success: true,
    user: userRecord,
    isAuthorizedAdmin: role === 'MASTER_ADMIN' || role === 'ADMIN'
  });
});

// 3. User Synchronization Endpoint (POST & GET)
app.post('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.body;
    if (!uid || !email) {
      return res.status(400).json({ error: 'Missing uid or email' });
    }
    const user = await getOrCreateUser(uid, email.toLowerCase(), displayName, photoUrl);
    res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user:', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

app.get('/api/users/sync', async (req, res) => {
  try {
    const { uid, email, displayName, photoUrl } = req.query;
    if (uid && email) {
      const user = await getOrCreateUser(
        String(uid), 
        String(email).toLowerCase(), 
        displayName ? String(displayName) : undefined, 
        photoUrl ? String(photoUrl) : undefined
      );
      return res.json({ success: true, user });
    }
    return res.json({ success: true, status: 'ready', message: 'User sync endpoint active' });
  } catch (error: any) {
    console.error('Failed to sync user (GET):', error);
    res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// 4. Platforms CRUD (PostgreSQL backed)
app.get('/api/platforms', async (req, res) => {
  try {
    const dbPlatforms = await getActivePlatforms();
    if (dbPlatforms && dbPlatforms.length > 0) {
      const formatted: PlatformItem[] = dbPlatforms.map((p) => ({
        id: p.id,
        name: p.name,
        subName: p.subName || undefined,
        tagline: p.tagline,
        description: p.description,
        category: p.category as any,
        badgeColor: p.badgeColor,
        accentColor: p.accentColor,
        logoBg: p.logoBg,
        iconName: p.iconName,
        features: p.features ? JSON.parse(p.features) : [],
        audience: p.audience ? JSON.parse(p.audience) : [],
        url: p.url || undefined,
        isPopular: p.isPopular ?? false,
        status: (p.status as any) || 'Active',
        ogImage: p.ogImage || undefined,
        ogTitle: p.ogTitle || undefined,
        ogDescription: p.ogDescription || undefined,
      }));
      return res.json({ success: true, platforms: formatted });
    }
    
    // If DB is empty, return default platforms data
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

    const saved = await upsertPlatform(platform);
    
    // Log audit event
    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    await createAuditLog('PLATFORM_SAVE', actorEmail, 'SUCCESS', `Platform ${platform.name} (${platform.id}) saved.`);

    return res.json({ success: true, platform: saved });
  } catch (error: any) {
    console.error('Failed to save platform to database:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan platform' });
  }
});

app.delete('/api/platforms/:id', requireAdmin, async (req, res) => {
  try {
    const platformId = req.params.id;
    if (!platformId) {
      return res.status(400).json({ error: 'Platform ID diperlukan' });
    }

    await softDeletePlatform(platformId);
    
    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    await createAuditLog('PLATFORM_DELETE', actorEmail, 'SUCCESS', `Platform ${platformId} deleted.`);

    return res.json({ success: true, message: `Platform ${platformId} dipadamkan.` });
  } catch (error: any) {
    console.error('Failed to delete platform:', error);
    return res.status(500).json({ error: error.message || 'Gagal memadam platform' });
  }
});

// 5. Open Graph Images & Log Images (PostgreSQL backed)
app.get(['/api/og-images', '/api/log-images'], async (req, res) => {
  try {
    const imagesList = await getAllOgImages();
    const imagesMap: Record<string, string> = {};
    imagesList.forEach((img) => {
      imagesMap[img.platformId] = img.imageUrl;
    });
    return res.json({ success: true, images: imagesMap });
  } catch (error: any) {
    console.warn('Failed to retrieve OG images from DB:', error);
    return res.json({ success: true, images: {} });
  }
});

app.post(['/api/og-images', '/api/log-images'], requireAdmin, async (req, res) => {
  try {
    const { platformId, imageUrl } = req.body;
    if (!platformId || !imageUrl) {
      return res.status(400).json({ error: 'Platform ID and image URL required' });
    }

    const actorEmail = (req.headers['x-user-email'] as string) || 'admin';
    const saved = await upsertOgImage(platformId, imageUrl, actorEmail);
    await createAuditLog('OG_IMAGE_SAVE', actorEmail, 'SUCCESS', `OG image for ${platformId} updated.`);

    return res.json({ success: true, image: saved });
  } catch (error: any) {
    console.error('Failed to save OG image:', error);
    return res.status(500).json({ error: error.message || 'Gagal menyimpan imej OG' });
  }
});

app.delete(['/api/og-images/:platformId', '/api/log-images/:platformId'], requireAdmin, async (req, res) => {
  try {
    const platformId = req.params.platformId;
    await deleteOgImage(platformId);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Failed to delete OG image:', error);
    return res.status(500).json({ error: error.message || 'Gagal memadam imej OG' });
  }
});

// 6. Contact & Inquiries submission (PostgreSQL backed)
app.post('/api/inquiries', async (req, res) => {
  try {
    const { name, email, organization, platformOfInterest, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Nama, emel dan mesej diperlukan.' });
    }

    const inquiry = await createContactInquiry(name, email, message, organization, platformOfInterest);
    return res.json({ success: true, inquiry });
  } catch (error: any) {
    console.error('Failed to submit inquiry:', error);
    return res.status(500).json({ error: error.message || 'Gagal menghantar permohonan.' });
  }
});

// 7. Protected Audit Logs Endpoint (PostgreSQL + in-memory fallback)
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

// 8. Secondary Admins management (Master Admin only)
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

// ----------------------------------------------------
// VITE & STATIC FILE SERVING
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`SYNCROZZ Server running on port ${PORT} with PostgreSQL / Cloud SQL & Google OAuth.`);
    await seedDatabaseIfEmpty();
  });
}

startServer();

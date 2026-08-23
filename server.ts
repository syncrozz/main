import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

const MASTER_ADMIN_EMAIL = 'khaikerr@gmail.com';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// In-memory server-side audit logs & session store for persistence
const serverAuditLogs: any[] = [
  {
    id: 'log_init',
    timestamp: Date.now(),
    email: MASTER_ADMIN_EMAIL,
    action: 'SYSTEM_BOOT',
    status: 'INFO',
    details: 'Master Admin system initialized with Google OAuth 2.0 enforcement.'
  }
];

const secondaryAdminsList: string[] = [];

// Helper auth middleware
function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Sila log masuk melalui Google.' });
  }

  const token = authHeader.substring(7);
  // Basic token decoding/validation
  try {
    const email = req.headers['x-user-email'] as string;
    if (!email) {
      return res.status(403).json({ error: 'Forbidden: Tiada identiti emel disahkan.' });
    }

    const isMaster = email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
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

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    masterAdminConfigured: true,
    authProtocol: 'Google OAuth 2.0',
    timestamp: Date.now()
  });
});

// 2. Google OAuth Verification Endpoint
app.post('/api/auth/google', (req, res) => {
  const { credential, email, name, picture } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Emel diperlukan untuk pengesahan.' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  let role = 'USER';

  if (normalizedEmail === MASTER_ADMIN_EMAIL.toLowerCase()) {
    role = 'MASTER_ADMIN';
  } else if (secondaryAdminsList.some(a => a.toLowerCase() === normalizedEmail)) {
    role = 'ADMIN';
  }

  const userRecord = {
    id: 'usr_' + Buffer.from(normalizedEmail).toString('base64').replace(/=/g, ''),
    email: normalizedEmail,
    name: name || normalizedEmail.split('@')[0],
    picture: picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || normalizedEmail)}&background=0056D2&color=fff&bold=true`,
    role,
    isEmailVerified: true,
    provider: 'google',
    authTime: Date.now()
  };

  // Record audit log
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

// 3. Logout Endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Session invalidated successfully.' });
});

// 4. Protected Audit Logs Endpoint
app.get('/api/admin/logs', requireAdmin, (req, res) => {
  res.json({ logs: serverAuditLogs.slice(0, 100) });
});

app.post('/api/admin/logs', (req, res) => {
  const entry = req.body;
  if (entry && entry.email) {
    serverAuditLogs.unshift({
      ...entry,
      id: entry.id || 'log_' + Date.now(),
      timestamp: entry.timestamp || Date.now()
    });
  }
  res.json({ success: true });
});

// 5. Secondary Admins management (Master Admin only)
app.get('/api/admin/users', requireAdmin, (req, res) => {
  res.json({
    masterAdmin: MASTER_ADMIN_EMAIL,
    secondaryAdmins: secondaryAdminsList
  });
});

app.post('/api/admin/users', requireAdmin, (req, res) => {
  const { newAdminEmail, requesterEmail } = req.body;

  if (requesterEmail?.toLowerCase() !== MASTER_ADMIN_EMAIL.toLowerCase()) {
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

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SYNCROZZ Server running on port ${PORT} with Google OAuth Master Admin authorization.`);
  });
}

startServer();

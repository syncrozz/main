import path from 'path';
import fs from 'fs';
import express from 'express';
import { app } from './src/server/app.ts';

const PORT = Number(process.env.PORT) || 3000;

// ----------------------------------------------------
// VITE & STATIC FILE SERVING (LOCAL DEV & NODE SERVER)
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const vitePkg = 'vite';
    const { createServer: createViteServer } = await import(vitePkg);
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

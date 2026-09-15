import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fetchSpTodayRates } from './src/utils/spTodayService';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json());

  // API endpoint: Fetch real-time Dollar exchange rate from https://sp-today.com/en
  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const data = await fetchSpTodayRates();
      res.setHeader('Cache-Control', 'public, max-age=60'); // cache 1 min
      return res.json({
        success: true,
        ...data
      });
    } catch (err: any) {
      console.error('Error in /api/exchange-rate:', err);
      return res.status(500).json({
        success: false,
        error: err?.message || 'Failed to fetch exchange rate from sp-today.com'
      });
    }
  });

  // Health endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware for development vs static files in production
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});

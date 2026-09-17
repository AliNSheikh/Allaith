import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { fetchSpTodayRates, CURRENT_MARKET_BASELINE } from './src/utils/spTodayService';
import { GoogleGenAI } from '@google/genai';

let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Persistent Store Settings Storage on server
const SETTINGS_FILE_PATH = path.join(process.cwd(), 'data', 'store_settings.json');

function readStoredSettings(): Record<string, any> | null {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('Error reading store_settings.json:', err);
  }
  return null;
}

function writeStoredSettings(settings: Record<string, any>): void {
  try {
    const dir = path.dirname(SETTINGS_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Error writing store_settings.json:', err);
  }
}

// In-memory persistent visit tracker (in addition to client-side localStorage and Supabase)
interface StoredVisit {
  id: string;
  timestamp: string;
  path: string;
  page_title: string;
  referrer: string;
  device: string;
  visitor_id: string;
}
const storedVisits: StoredVisit[] = [];

async function startServer() {
  const app = express();
  const PORT = 3000;

  // JSON middleware
  app.use(express.json({ limit: '10mb' }));

  // Dynamic Google-compatible XML Sitemap (e.g. domain/sitemap.xml)
  app.get('/sitemap.xml', (req, res) => {
    const host = req.get('host') || 'allaith.vercel.app';
    const proto = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const domainQuery = (req.query.domain as string) || '';
    const baseUrl = domainQuery
      ? (domainQuery.startsWith('http') ? domainQuery : `https://${domainQuery}`)
      : `${proto}://${host}`;
    const now = new Date().toISOString().split('T')[0];

    const defaultSlugs = [
      '',
      '/catalog',
      '/offers',
      '/category/smartphones',
      '/category/tablets',
      '/category/chargers_power',
      '/category/accessories',
      '/maintenance',
      '/request-phone',
      '/product/apple-iphone-16-pro-max',
      '/product/samsung-galaxy-s25-ultra',
      '/product/apple-macbook-pro-16-m3-max',
      '/product/xiaomi-redmi-note-13-pro-plus',
      '/product/apple-ipad-pro-m4-13',
      '/product/apple-watch-ultra-2'
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${defaultSlugs.map(slug => `  <url>
    <loc>${baseUrl}${slug ? `#${slug.startsWith('/') ? slug.slice(1) : slug}` : '/'}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${slug === '' ? 'daily' : 'weekly'}</changefreq>
    <priority>${slug === '' ? '1.0' : slug.startsWith('/product') ? '0.9' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=1800');
    return res.send(xml);
  });

  // API endpoint: Real-time Dollar exchange rate from sp-today.com
  app.get('/api/exchange-rate', async (req, res) => {
    try {
      const isForce = req.query.refresh === '1' || req.query.force === 'true';
      const data = await fetchSpTodayRates();
      if (isForce) {
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      } else {
        res.setHeader('Cache-Control', 'public, max-age=60');
      }
      return res.json({
        success: true,
        ...data
      });
    } catch (err: any) {
      console.warn('Fallback rate applied for /api/exchange-rate:', err);
      return res.json({
        success: true,
        ...CURRENT_MARKET_BASELINE,
        fetched_at: new Date().toISOString()
      });
    }
  });

  // API endpoint: Multi-turn Gemini AI Chatbot for Al-Laith Store Assistant
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { messages, activeCurrency, exchangeRate } = req.body;
      const ai = getAI();

      if (!ai) {
        // Smart fallback response if API key is not yet set
        return res.json({
          reply: 'أهلاً بك في متجر الليث للاتصالات! نحن بخدمتك في اللاذقية وسائر المحافظات السورية. نوفر أحدث الهواتف الذكية مع كفالة رسمية، ومخبر صيانة إلكتروني متخصص وقطع غيار أصلية. كيف يمكنني مساعدتك في استفسارك اليوم؟',
          model: 'local-fallback'
        });
      }

      const systemInstruction = `أنت المساعد الذكي الرسمي لمتجر "الليث للاتصالات" (Al-Laith for Telecommunications) في سوريا.
المتجر يقع في اللاذقية - شارع 8 آذار، هاتف وتساب: 963944000000.
خدمات المتجر:
1. بيع أحدث الهواتف الذكية (iPhone, Samsung, Xiaomi) والأجهزة اللوحية والإكسسوارات الأصلية.
2. مخبر صيانة متخصص لفحص وتصليح اللوحات الإلكترونية، تبديل الشاشات والبطاريات مع كفالة.
3. توصيل وشحن آمن لكافة المحافظات السورية والدفع نقداً عند الاستلام.
4. سعر الصرف اليومي المعتمد للدولار: ${exchangeRate || 15000} ليرة سورية.
أجب الزبائن بلباقة واحترافية وبشكل مفيد وسريع، واقترح عليهم الأجهزة المناسبة ومواصفاتها والأسعار بالليرة والدولار.`;

      // Format conversation history for Gemini
      const formattedContents = (messages || []).map((m: { role: string; content: string }) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      if (formattedContents.length === 0) {
        formattedContents.push({ role: 'user', parts: [{ text: 'مرحبا' }] });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      return res.json({
        reply: response.text || 'مرحباً بك! تفضل كيف يمكنني مساعدتك اليوم؟',
        model: 'gemini-3.5-flash'
      });
    } catch (err: any) {
      console.error('Error in /api/ai/chat:', err);
      return res.json({
        reply: 'أهلاً بك في متجر الليث للاتصالات! فريقنا جاهز للإجابة عن أسعار الأجهزة وكفالتها وخدمات الصيانة. يمكنك أيضاً مراسلتنا مباشرة عبر وتساب.',
        fallback: true
      });
    }
  });

  // API endpoint: Automatic translation of Arabic specifications into English
  app.post('/api/ai/translate', async (req, res) => {
    try {
      const { title_ar, description_ar, specs } = req.body;
      const ai = getAI();

      if (!ai) {
        // Simple fallback translation
        return res.json({
          title_en: title_ar || '',
          description_en: description_ar || '',
          specs: specs || []
        });
      }

      const prompt = `Translate the following product information and technical specifications from Arabic to English for an e-commerce electronics store:
Title: "${title_ar}"
Description: "${description_ar}"
Specs: ${JSON.stringify(specs || [])}

Return a valid JSON object strictly matching this schema:
{
  "title_en": "translated English title",
  "description_en": "translated English description",
  "specs": [
    { "key_ar": "المعالج", "key_en": "Processor", "val_ar": "A17 Pro", "val_en": "A17 Pro" }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          responseMimeType: 'application/json'
        }
      });

      let parsed = {};
      try {
        parsed = JSON.parse(response.text || '{}');
      } catch {
        parsed = {};
      }

      return res.json(parsed);
    } catch (err: any) {
      console.error('Error in /api/ai/translate:', err);
      return res.status(500).json({ error: 'Translation failed' });
    }
  });

  // API endpoint: Permanent Analytics Visit Logger
  app.post('/api/analytics/track', (req, res) => {
    const { path: visitPath, page_title, referrer, device, visitor_id } = req.body;
    const visit: StoredVisit = {
      id: 'v_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      path: visitPath || '/',
      page_title: page_title || 'Home',
      referrer: referrer || 'Direct',
      device: device || 'desktop',
      visitor_id: visitor_id || 'anon'
    };
    storedVisits.push(visit);
    if (storedVisits.length > 5000) storedVisits.shift(); // Keep last 5000 in memory
    return res.json({ success: true, count: storedVisits.length, visit });
  });

  // API endpoint: Reset analytics visits
  app.post('/api/analytics/reset', (req, res) => {
    storedVisits.length = 0;
    return res.json({
      success: true,
      count: 0,
      reset_at: new Date().toISOString(),
      message: 'All analytics and visit logs have been reset to zero.'
    });
  });

  app.get('/api/analytics/summary', (req, res) => {
    return res.json({
      total_visits: storedVisits.length,
      visits: storedVisits.slice(-500)
    });
  });

  // API endpoints: Store Settings (Server & Database Synchronization)
  app.get('/api/settings', (req, res) => {
    try {
      const settings = readStoredSettings();
      return res.json({
        success: true,
        settings: settings || null
      });
    } catch (err: any) {
      console.error('Error in GET /api/settings:', err);
      return res.status(500).json({ success: false, error: err?.message });
    }
  });

  app.post('/api/settings', (req, res) => {
    try {
      const current = readStoredSettings() || {};
      const updated = {
        ...current,
        ...req.body,
        updated_at: new Date().toISOString()
      };
      writeStoredSettings(updated);
      return res.json({
        success: true,
        settings: updated
      });
    } catch (err: any) {
      console.error('Error in POST /api/settings:', err);
      return res.status(500).json({ success: false, error: err?.message });
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

import type { IncomingMessage, ServerResponse } from 'http';
import https from 'https';

interface ExchangeData {
  currency: string;
  source: string;
  city: string;
  city_ar: string;
  old_lira: {
    buy: number;
    sell: number;
    formatted_buy: string;
    formatted_sell: string;
    symbol: string;
    symbol_en: string;
  };
  new_lira: {
    buy: number;
    sell: number;
    formatted_buy: string;
    formatted_sell: string;
    symbol: string;
    symbol_en: string;
  };
  change_percent: number;
  updated_at: string;
  fetched_at: string;
  cities: Record<string, {
    name_ar: string;
    buy: number;
    sell: number;
    change: number;
    new_buy: number;
    new_sell: number;
  }>;
}

const BASELINE_RATE: ExchangeData = {
  currency: 'USD',
  source: 'https://sp-today.com/en',
  city: 'Damascus',
  city_ar: 'دمشق',
  old_lira: {
    buy: 13575,
    sell: 13650,
    formatted_buy: '13,575 ل.س قديمة',
    formatted_sell: '13,650 ل.س قديمة',
    symbol: 'ل.س (قديمة)',
    symbol_en: 'Old SYP'
  },
  new_lira: {
    buy: 135.75,
    sell: 136.50,
    formatted_buy: '135.75 ل.س جديدة',
    formatted_sell: '136.50 ل.س جديدة',
    symbol: 'ل.س (جديدة)',
    symbol_en: 'New SYP'
  },
  change_percent: 0.74,
  updated_at: new Date().toISOString(),
  fetched_at: new Date().toISOString(),
  cities: {
    damascus: {
      name_ar: 'دمشق',
      buy: 13575,
      sell: 13650,
      change: 0.74,
      new_buy: 135.75,
      new_sell: 136.50
    },
    alhasakah: {
      name_ar: 'الحسكة',
      buy: 13650,
      sell: 13700,
      change: 1.68,
      new_buy: 136.50,
      new_sell: 137.00
    }
  }
};

function fetchLiveFromSpToday(): Promise<ExchangeData> {
  return new Promise((resolve, reject) => {
    const req = https.get('https://sp-today.com/en', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 7000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        return resolve({ ...BASELINE_RATE, fetched_at: new Date().toISOString() });
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const unescaped = data.replace(/\\\\"/g, '"').replace(/\\"/g, '"');
          const usdKey = unescaped.indexOf('"code":"USD"');
          if (usdKey === -1) {
            return resolve({ ...BASELINE_RATE, fetched_at: new Date().toISOString() });
          }

          const chunk = unescaped.substring(usdKey, usdKey + 1200);
          let damascusBuy = 13575;
          let damascusSell = 13650;
          let damascusChange = 0.74;

          const damascusMatch = chunk.match(/"damascus":\s*\{([^}]+)\}/);
          if (damascusMatch) {
            const b = damascusMatch[1].match(/"buy":\s*([0-9.]+)/);
            const s = damascusMatch[1].match(/"sell":\s*([0-9.]+)/);
            const ch = damascusMatch[1].match(/"change":\s*([-0-9.]+)/);
            if (b) damascusBuy = Number(b[1]);
            if (s) damascusSell = Number(s[1]);
            if (ch) damascusChange = Number(ch[1]);
          }

          let hasakahBuy = 13650;
          let hasakahSell = 13700;
          let hasakahChange = 1.68;
          const alhasakahMatch = chunk.match(/"alhasakah":\s*\{([^}]+)\}/);
          if (alhasakahMatch) {
            const b = alhasakahMatch[1].match(/"buy":\s*([0-9.]+)/);
            const s = alhasakahMatch[1].match(/"sell":\s*([0-9.]+)/);
            const ch = alhasakahMatch[1].match(/"change":\s*([-0-9.]+)/);
            if (b) hasakahBuy = Number(b[1]);
            if (s) hasakahSell = Number(s[1]);
            if (ch) hasakahChange = Number(ch[1]);
          }

          const updatedAtMatch = chunk.match(/"updated_at":\s*"([^"]+)"/);
          const updatedAt = updatedAtMatch ? updatedAtMatch[1] : new Date().toISOString();

          const result: ExchangeData = {
            currency: 'USD',
            source: 'https://sp-today.com/en',
            city: 'Damascus',
            city_ar: 'دمشق',
            old_lira: {
              buy: damascusBuy,
              sell: damascusSell,
              formatted_buy: `${damascusBuy.toLocaleString()} ل.س قديمة`,
              formatted_sell: `${damascusSell.toLocaleString()} ل.س قديمة`,
              symbol: 'ل.س (قديمة)',
              symbol_en: 'Old SYP'
            },
            new_lira: {
              buy: Number((damascusBuy / 100).toFixed(2)),
              sell: Number((damascusSell / 100).toFixed(2)),
              formatted_buy: `${(damascusBuy / 100).toFixed(2)} ل.س جديدة`,
              formatted_sell: `${(damascusSell / 100).toFixed(2)} ل.س جديدة`,
              symbol: 'ل.س (جديدة)',
              symbol_en: 'New SYP'
            },
            change_percent: damascusChange,
            updated_at: updatedAt,
            fetched_at: new Date().toISOString(),
            cities: {
              damascus: {
                name_ar: 'دمشق',
                buy: damascusBuy,
                sell: damascusSell,
                change: damascusChange,
                new_buy: Number((damascusBuy / 100).toFixed(2)),
                new_sell: Number((damascusSell / 100).toFixed(2))
              },
              alhasakah: {
                name_ar: 'الحسكة',
                buy: hasakahBuy,
                sell: hasakahSell,
                change: hasakahChange,
                new_buy: Number((hasakahBuy / 100).toFixed(2)),
                new_sell: Number((hasakahSell / 100).toFixed(2))
              }
            }
          };

          resolve(result);
        } catch (e) {
          resolve({ ...BASELINE_RATE, fetched_at: new Date().toISOString() });
        }
      });
    });

    req.on('error', () => {
      resolve({ ...BASELINE_RATE, fetched_at: new Date().toISOString() });
    });
  });
}

export default async function handler(req: any, res: any) {
  // Enable CORS for frontend
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const isForceRefresh = req.query?.refresh === '1' || req.query?.force === 'true';
    const rateData = await fetchLiveFromSpToday();

    if (isForceRefresh) {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    } else {
      res.setHeader('Cache-Control', 'public, s-maxage=60, max-age=60, stale-while-revalidate=120');
    }

    return res.status(200).json({
      success: true,
      ...rateData
    });
  } catch (error: any) {
    return res.status(200).json({
      success: true,
      ...BASELINE_RATE,
      fetched_at: new Date().toISOString()
    });
  }
}

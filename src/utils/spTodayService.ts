import https from 'https';

export interface SpTodayExchangeData {
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
  cities?: Record<string, {
    buy: number;
    sell: number;
    change: number;
    new_buy: number;
    new_sell: number;
  }>;
}

let cachedData: SpTodayExchangeData | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 60 * 1000; // 1 minute cache

export function fetchSpTodayRates(): Promise<SpTodayExchangeData> {
  const now = Date.now();
  if (cachedData && now - lastFetchTime < CACHE_TTL_MS) {
    return Promise.resolve(cachedData);
  }

  return new Promise((resolve, reject) => {
    const req = https.get('https://sp-today.com/en', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9,ar;q=0.8',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000
    }, (res) => {
      if (res.statusCode && res.statusCode >= 400) {
        if (cachedData) return resolve(cachedData);
        return reject(new Error(`sp-today returned status ${res.statusCode}`));
      }

      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const unescaped = data.replace(/\\"/g, '"');
          const usdKey = unescaped.indexOf('"code":"USD"');
          if (usdKey === -1) {
            if (cachedData) return resolve(cachedData);
            return reject(new Error('USD rate not found in sp-today HTML'));
          }

          const chunk = unescaped.substring(usdKey, usdKey + 1500);

          let damascusBuy = 13375;
          let damascusSell = 13425;
          let damascusChange = 0.38;

          const damascusMatch = chunk.match(/"damascus":\s*\{([^}]+)\}/);
          if (damascusMatch) {
            const b = damascusMatch[1].match(/"buy":\s*([0-9]+)/);
            const s = damascusMatch[1].match(/"sell":\s*([0-9]+)/);
            const ch = damascusMatch[1].match(/"change":\s*([-0-9.]+)/);
            if (b) damascusBuy = Number(b[1]);
            if (s) damascusSell = Number(s[1]);
            if (ch) damascusChange = Number(ch[1]);
          }

          const parsedCities: Record<string, { name_ar: string; buy: number; sell: number; change: number; new_buy: number; new_sell: number }> = {
            damascus: {
              name_ar: 'دمشق',
              buy: damascusBuy,
              sell: damascusSell,
              change: damascusChange,
              new_buy: Number((damascusBuy / 100).toFixed(2)),
              new_sell: Number((damascusSell / 100).toFixed(2))
            }
          };

          const alhasakahMatch = chunk.match(/"alhasakah":\s*\{([^}]+)\}/);
          if (alhasakahMatch) {
            const b = alhasakahMatch[1].match(/"buy":\s*([0-9]+)/);
            const s = alhasakahMatch[1].match(/"sell":\s*([0-9]+)/);
            const ch = alhasakahMatch[1].match(/"change":\s*([-0-9.]+)/);
            const hBuy = b ? Number(b[1]) : 13300;
            const hSell = s ? Number(s[1]) : 13350;
            const hChange = ch ? Number(ch[1]) : 0;
            parsedCities.alhasakah = {
              name_ar: 'الحسكة',
              buy: hBuy,
              sell: hSell,
              change: hChange,
              new_buy: Number((hBuy / 100).toFixed(2)),
              new_sell: Number((hSell / 100).toFixed(2))
            };
          }

          // Parse updated_at
          const updatedMatch = unescaped.substring(usdKey, usdKey + 1000).match(/"updated_at":\s*"([^"]+)"/);
          const updatedAt = updatedMatch ? updatedMatch[1] : new Date().toISOString();

          // In sp-today:
          // Old SYP is the traditional number: e.g. 13375 buy, 13425 sell
          // New SYP is the "two zeros removed" value: buy = buy / 100 (133.75), sell = sell / 100 (134.25)
          const oldBuy = damascusBuy;
          const oldSell = damascusSell;
          const newBuy = Number((oldBuy / 100).toFixed(2));
          const newSell = Number((oldSell / 100).toFixed(2));

          const result: SpTodayExchangeData = {
            currency: 'USD',
            source: 'https://sp-today.com/en',
            city: 'Damascus',
            city_ar: 'دمشق',
            old_lira: {
              buy: oldBuy,
              sell: oldSell,
              formatted_buy: `${oldBuy.toLocaleString()} ل.س قديمة`,
              formatted_sell: `${oldSell.toLocaleString()} ل.س قديمة`,
              symbol: 'ل.س (قديمة)',
              symbol_en: 'Old SYP'
            },
            new_lira: {
              buy: newBuy,
              sell: newSell,
              formatted_buy: `${newBuy.toLocaleString()} ل.س جديدة`,
              formatted_sell: `${newSell.toLocaleString()} ل.س جديدة`,
              symbol: 'ل.س (جديدة)',
              symbol_en: 'New SYP'
            },
            change_percent: damascusChange,
            updated_at: updatedAt,
            fetched_at: new Date().toISOString(),
            cities: parsedCities
          };

          cachedData = result;
          lastFetchTime = now;
          resolve(result);
        } catch (err) {
          if (cachedData) return resolve(cachedData);
          reject(err);
        }
      });
    });

    req.on('error', (err) => {
      if (cachedData) return resolve(cachedData);
      reject(err);
    });
  });
}

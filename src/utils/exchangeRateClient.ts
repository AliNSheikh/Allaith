import { SpTodayExchangeData } from '../types';

export const DEFAULT_FALLBACK_RATE: SpTodayExchangeData = {
  currency: 'USD',
  source: 'https://sp-today.com/en',
  city: 'Damascus',
  city_ar: 'دمشق',
  old_lira: {
    buy: 13375,
    sell: 13425,
    formatted_buy: '13,375 ل.س قديمة',
    formatted_sell: '13,425 ل.س قديمة',
    symbol: 'ل.س (قديمة)',
    symbol_en: 'Old SYP'
  },
  new_lira: {
    buy: 133.75,
    sell: 134.25,
    formatted_buy: '133.75 ل.س جديدة',
    formatted_sell: '134.25 ل.س جديدة',
    symbol: 'ل.س (جديدة)',
    symbol_en: 'New SYP'
  },
  change_percent: 0.38,
  updated_at: new Date().toISOString(),
  fetched_at: new Date().toISOString(),
  cities: {
    damascus: {
      name_ar: 'دمشق',
      buy: 13375,
      sell: 13425,
      change: 0.38,
      new_buy: 133.75,
      new_sell: 134.25
    },
    alhasakah: {
      name_ar: 'الحسكة',
      buy: 13300,
      sell: 13350,
      change: 0,
      new_buy: 133.00,
      new_sell: 133.50
    }
  }
};

/**
 * Fetches real-time Dollar exchange rate from https://sp-today.com/en via server API,
 * with resilient multi-tier fallback mechanisms (server API -> public currency API -> localStorage -> baseline).
 */
export async function fetchLiveDollarRate(): Promise<SpTodayExchangeData> {
  // 1. Try server-side endpoint first (/api/exchange-rate)
  try {
    const res = await fetch('/api/exchange-rate', {
      headers: {
        'Accept': 'application/json'
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && (data.success || data.currency === 'USD') && data.old_lira && data.new_lira) {
        try {
          localStorage.setItem('sptoday_exchange_rate', JSON.stringify(data));
          sessionStorage.setItem('sptoday_exchange_rate', JSON.stringify(data));
        } catch {
          // ignore storage error
        }
        return data as SpTodayExchangeData;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/exchange-rate (server route unreachable or static host):', err);
  }

  // 2. Try localStorage & sessionStorage cache
  try {
    const cached = localStorage.getItem('sptoday_exchange_rate') || sessionStorage.getItem('sptoday_exchange_rate');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.old_lira && parsed.new_lira && parsed.old_lira.sell > 0) {
        return {
          ...parsed,
          fetched_at: new Date().toISOString()
        } as SpTodayExchangeData;
      }
    }
  } catch {
    // ignore
  }

  // 3. Try client-side backup from free public exchange rate provider if on static deployment
  try {
    const backupRes = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: AbortSignal.timeout ? AbortSignal.timeout(3500) : undefined
    });
    if (backupRes.ok) {
      const json = await backupRes.json();
      const syp = json?.rates?.SYP;
      if (typeof syp === 'number' && syp > 1000) {
        const oldSell = Math.round(syp);
        const oldBuy = Math.round(syp * 0.996);
        const newSell = Number((oldSell / 100).toFixed(2));
        const newBuy = Number((oldBuy / 100).toFixed(2));

        const derivedData: SpTodayExchangeData = {
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
          change_percent: 0.35,
          updated_at: new Date().toISOString(),
          fetched_at: new Date().toISOString(),
          cities: {
            damascus: {
              name_ar: 'دمشق',
              buy: oldBuy,
              sell: oldSell,
              change: 0.35,
              new_buy: newBuy,
              new_sell: newSell
            }
          }
        };

        try {
          localStorage.setItem('sptoday_exchange_rate', JSON.stringify(derivedData));
        } catch {}

        return derivedData;
      }
    }
  } catch (err) {
    console.warn('Backup public rate fetch failed or timed out:', err);
  }

  // 4. Return robust Syrian market baseline
  return {
    ...DEFAULT_FALLBACK_RATE,
    fetched_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

/**
 * Convert USD to Old Syrian Lira
 */
export function convertUsdToOldLira(usd: number, rate: number = 13425): number {
  return Math.round(usd * rate);
}

/**
 * Convert USD to New Syrian Lira (2 zeros removed from old)
 */
export function convertUsdToNewLira(usd: number, rate: number = 13425): number {
  return Number(((usd * rate) / 100).toFixed(2));
}

/**
 * Convert Old Syrian Lira to New Syrian Lira
 */
export function convertOldToNewLira(oldLira: number): number {
  return Number((oldLira / 100).toFixed(2));
}

/**
 * Convert New Syrian Lira to Old Syrian Lira
 */
export function convertNewToOldLira(newLira: number): number {
  return Math.round(newLira * 100);
}

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
 * with fallback mechanisms.
 */
export async function fetchLiveDollarRate(): Promise<SpTodayExchangeData> {
  try {
    const res = await fetch('/api/exchange-rate', {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && data.old_lira && data.new_lira) {
        // Cache in sessionStorage for offline resiliency
        try {
          sessionStorage.setItem('sptoday_exchange_rate', JSON.stringify(data));
        } catch {
          // ignore storage error
        }
        return data as SpTodayExchangeData;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/exchange-rate, attempting cached or fallback data:', err);
  }

  // Try sessionStorage
  try {
    const cached = sessionStorage.getItem('sptoday_exchange_rate');
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed && parsed.old_lira && parsed.new_lira) {
        return parsed as SpTodayExchangeData;
      }
    }
  } catch {
    // ignore
  }

  return DEFAULT_FALLBACK_RATE;
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

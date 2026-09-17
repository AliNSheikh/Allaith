import { SpTodayExchangeData } from '../types';

export const DEFAULT_FALLBACK_RATE: SpTodayExchangeData = {
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

const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes maximum cache lifetime

/**
 * Fetches real-time Dollar exchange rate from https://sp-today.com/en via server API (Vercel serverless / Express),
 * with cache expiration checking and force refresh capability.
 */
export async function fetchLiveDollarRate(forceRefresh = false): Promise<SpTodayExchangeData> {
  const now = Date.now();

  // If force refresh requested, immediately invalidate browser cache
  if (forceRefresh) {
    try {
      localStorage.removeItem('sptoday_exchange_rate');
      sessionStorage.removeItem('sptoday_exchange_rate');
    } catch {
      // ignore
    }
  }

  // 1. Try server-side endpoint first (/api/exchange-rate) with cache-busting timestamp
  try {
    const queryParam = forceRefresh ? `?refresh=1&_t=${now}` : `?_t=${now}`;
    const res = await fetch(`/api/exchange-rate${queryParam}`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Pragma': 'no-cache'
      }
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const data = await res.json();
      if (data && (data.success || data.currency === 'USD') && data.old_lira && data.new_lira && data.old_lira.sell > 0) {
        const payloadToCache = {
          ...data,
          cached_at: now
        };
        try {
          localStorage.setItem('sptoday_exchange_rate', JSON.stringify(payloadToCache));
          sessionStorage.setItem('sptoday_exchange_rate', JSON.stringify(payloadToCache));
        } catch {
          // ignore storage error
        }
        return data as SpTodayExchangeData;
      }
    }
  } catch (err) {
    console.warn('Could not fetch from /api/exchange-rate (server route unreachable or static host):', err);
  }

  // 2. Try localStorage & sessionStorage cache ONLY if NOT force-refreshing AND still within TTL (3 mins)
  if (!forceRefresh) {
    try {
      const cached = localStorage.getItem('sptoday_exchange_rate') || sessionStorage.getItem('sptoday_exchange_rate');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cachedAt = Number(parsed.cached_at) || 0;
        const isFresh = now - cachedAt < CACHE_TTL_MS;

        // Reject stale cache older than 3 minutes to prevent outdated rate display
        if (isFresh && parsed && parsed.old_lira && parsed.new_lira && parsed.old_lira.sell > 0) {
          return {
            ...parsed,
            fetched_at: new Date().toISOString()
          } as SpTodayExchangeData;
        }
      }
    } catch {
      // ignore
    }
  }

  // 3. Return Syrian market baseline with current timestamp
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

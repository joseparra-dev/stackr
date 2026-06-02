import type { PriceMap } from './coingecko.types';
import { PRICE_CACHE_TTL_MS } from './coingecko.types';

export interface CacheEntry {
  readonly price: number;
  readonly fetchedAt: number;
}

export function isFresh(
  entry: CacheEntry,
  now: number,
  ttlMs: number = PRICE_CACHE_TTL_MS,
): boolean {
  return now - entry.fetchedAt < ttlMs;
}

export function getStaleIds(
  ids: readonly string[],
  cache: ReadonlyMap<string, CacheEntry>,
  now: number,
  ttlMs: number = PRICE_CACHE_TTL_MS,
): readonly string[] {
  const seen = new Set<string>();
  const stale: string[] = [];

  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);

    const entry = cache.get(id);
    if (!entry || !isFresh(entry, now, ttlMs)) {
      stale.push(id);
    }
  }

  return stale;
}

export function mergePrices(
  cache: ReadonlyMap<string, CacheEntry>,
  fresh: PriceMap,
  now: number,
): Map<string, CacheEntry> {
  const next = new Map(cache);

  for (const [id, price] of Object.entries(fresh)) {
    next.set(id, { price, fetchedAt: now });
  }

  return next;
}

export function entriesToPriceMap(cache: ReadonlyMap<string, CacheEntry>): PriceMap {
  const result: PriceMap = {};

  for (const [id, entry] of cache) {
    result[id] = entry.price;
  }

  return result;
}

export function pricesForIds(
  ids: readonly string[],
  cache: ReadonlyMap<string, CacheEntry>,
): PriceMap {
  const seen = new Set<string>();
  const result: PriceMap = {};

  for (const id of ids) {
    if (seen.has(id)) continue;
    seen.add(id);

    const entry = cache.get(id);
    if (entry) result[id] = entry.price;
  }

  return result;
}

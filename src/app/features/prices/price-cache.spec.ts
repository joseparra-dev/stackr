import { describe, expect, it } from 'vitest';

import { PRICE_CACHE_TTL_MS } from './coingecko.types';
import {
  entriesToPriceMap,
  getStaleIds,
  isFresh,
  mergePrices,
  pricesForIds,
  type CacheEntry,
} from './price-cache';

const NOW = 1_000_000;

function entry(price: number, ageMs: number): CacheEntry {
  return { price, fetchedAt: NOW - ageMs };
}

describe('isFresh', () => {
  it('returns true when entry is within the default TTL', () => {
    expect(isFresh(entry(100, PRICE_CACHE_TTL_MS - 1), NOW)).toBe(true);
  });

  it('returns false when entry is at or past the default TTL', () => {
    expect(isFresh(entry(100, PRICE_CACHE_TTL_MS), NOW)).toBe(false);
    expect(isFresh(entry(100, PRICE_CACHE_TTL_MS + 1), NOW)).toBe(false);
  });

  it('respects a custom TTL', () => {
    expect(isFresh(entry(100, 5_000), NOW, 10_000)).toBe(true);
    expect(isFresh(entry(100, 10_000), NOW, 10_000)).toBe(false);
  });
});

describe('getStaleIds', () => {
  it('returns an empty array for empty input', () => {
    expect(getStaleIds([], new Map(), NOW)).toEqual([]);
  });

  it('returns ids missing from cache', () => {
    expect(getStaleIds(['bitcoin'], new Map(), NOW)).toEqual(['bitcoin']);
  });

  it('returns ids with stale cache entries', () => {
    const cache = new Map<string, CacheEntry>([['bitcoin', entry(67_000, PRICE_CACHE_TTL_MS)]]);

    expect(getStaleIds(['bitcoin'], cache, NOW)).toEqual(['bitcoin']);
  });

  it('omits ids with fresh cache entries', () => {
    const cache = new Map<string, CacheEntry>([['bitcoin', entry(67_000, PRICE_CACHE_TTL_MS - 1)]]);

    expect(getStaleIds(['bitcoin'], cache, NOW)).toEqual([]);
  });

  it('deduplicates ids while preserving order', () => {
    expect(getStaleIds(['ethereum', 'bitcoin', 'ethereum'], new Map(), NOW)).toEqual([
      'ethereum',
      'bitcoin',
    ]);
  });
});

describe('mergePrices', () => {
  it('adds fresh prices without removing unrelated cache entries', () => {
    const cache = new Map<string, CacheEntry>([['ethereum', entry(3_400, 1_000)]]);

    const merged = mergePrices(cache, { bitcoin: 67_000 }, NOW);

    expect(merged.get('ethereum')).toEqual(entry(3_400, 1_000));
    expect(merged.get('bitcoin')).toEqual({ price: 67_000, fetchedAt: NOW });
  });

  it('overwrites stale entries with fresh prices', () => {
    const cache = new Map<string, CacheEntry>([['bitcoin', entry(60_000, 60_000)]]);

    const merged = mergePrices(cache, { bitcoin: 67_000 }, NOW);

    expect(merged.get('bitcoin')).toEqual({ price: 67_000, fetchedAt: NOW });
  });
});

describe('entriesToPriceMap', () => {
  it('maps cache entries to a flat price record', () => {
    const cache = new Map<string, CacheEntry>([
      ['bitcoin', { price: 67_000, fetchedAt: NOW }],
      ['ethereum', { price: 3_400, fetchedAt: NOW }],
    ]);

    expect(entriesToPriceMap(cache)).toEqual({
      bitcoin: 67_000,
      ethereum: 3_400,
    });
  });
});

describe('pricesForIds', () => {
  it('returns only requested ids that exist in cache', () => {
    const cache = new Map<string, CacheEntry>([
      ['bitcoin', { price: 67_000, fetchedAt: NOW }],
      ['ethereum', { price: 3_400, fetchedAt: NOW }],
    ]);

    expect(pricesForIds(['bitcoin', 'solana', 'bitcoin'], cache)).toEqual({
      bitcoin: 67_000,
    });
  });
});

export type PriceMap = Record<string, number>;

export type CoinGeckoSimplePriceResponse = Record<string, { readonly usd: number }>;

export const PRICE_CACHE_TTL_MS = 30_000;
export const POLL_INTERVAL_MS = 30_000;

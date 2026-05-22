# ADR 0005 — CoinGecko as primary price source

## Status

Accepted (2026-05).

## Context

We need crypto asset metadata and prices. Free tier APIs available.

## Options considered

1. **CoinGecko** — free, comprehensive, no auth required for basic use.
2. **CoinMarketCap** — requires API key even for free tier.
3. **Binance API only** — limited to assets on Binance.

## Decision

**CoinGecko as primary, Binance WebSocket as optional real-time enhancer.**

## Rationale

- CoinGecko free tier: no auth required, ~10-30 requests/min, includes top ~10,000 assets.
- Endpoints used: `/coins/list` (catalog), `/simple/price` (batch prices), `/coins/{id}/market_chart` (historical).
- Binance WebSocket free real-time prices for top assets — supplements CoinGecko for snappier UX.
- Documented, well-maintained, dominant in retail crypto tools.

## Trade-offs accepted

- Rate limited at 10-30/min. Mitigated: cache prices for 30s client-side, batch requests.
- CoinGecko might add auth in future. Mitigated: env var for API key easy to add.

## Consequences

- `CoinGeckoService` implements rate-limited fetch + retry with exponential backoff.
- Asset catalog synced into `public.assets` table once daily.
- Historical prices cached in `public.price_snapshots` (24h TTL).
- Optional Binance WS only attempted for top 10 assets in user portfolio.

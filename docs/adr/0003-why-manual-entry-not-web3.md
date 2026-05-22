# ADR 0003 — Manual transaction entry, no Web3

## Status

Accepted (2026-05).

## Context

User needs to populate their portfolio. Options: connect wallets (Metamask, etc.) for automatic reading, OR manual entry.

## Options considered

1. **Manual entry** — user logs each buy/sell.
2. **Web3 wallet connection** — read on-chain balances.
3. **Exchange API integration** — connect Binance/Coinbase via API keys.

## Decision

**Manual entry only.**

## Rationale

- Web3 integration adds minimum 3 weeks: WalletConnect setup, multiple chain support, RPC providers, error handling for failed reads.
- Exchange API requires KYC, API key management, encryption — out of scope for a portfolio app.
- Manual entry simplifies UX and removes external dependencies on chains/exchanges.
- The interesting work is the analytics dashboard, not the data ingestion.

## Trade-offs accepted

- User must input transactions themselves. Targeted user (serious investor with spreadsheet) accepts this.
- Cannot show real on-chain balances (e.g., wallet showing 1.2 BTC will not auto-update if user transfers in/out).

## Consequences

- Focus engineering on dashboards, P&L, charts.
- Transaction form must be excellent — it's the main data input.
- Future: ROADMAP mentions wallet integration as v2.

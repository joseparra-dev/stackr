# Stackr

> A treasury-grade personal portfolio tracker for crypto investors.

Track your crypto buys and sells. See total portfolio value, P&L, allocation, and historical performance — all live, all in one place.

**Status:** In active development. Target launch: mid-2026.

## Why

Existing crypto trackers fall into two camps: heavy exchange clients (Binance, Coinbase) or hobby projects with shallow UX. Stackr fills the gap: treasury-grade analytics for serious individual investors who track positions manually.

## Stack

- **Frontend:** Angular 21 (standalone + signals), Tailwind v4, Angular CDK
- **Backend (BaaS):** Supabase (PostgreSQL + Auth + RLS)
- **Charts:** ng-apexcharts
- **External APIs:** CoinGecko (prices), Binance WebSocket (real-time)
- **Testing:** Vitest + Playwright
- **CI/CD:** GitHub Actions + Vercel
- **Workflow:** AI-augmented development with Cursor + Anthropic Skills + ADR-driven decisions

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full stack rationale and [`docs/adr/`](./docs/adr/) for major architectural decisions.

## Documentation

- [Product Requirements](./docs/PRD.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Roadmap](./docs/ROADMAP.md)
- [Non-Goals](./docs/NON-GOALS.md) — what we explicitly DON'T build
- [Architecture Decision Records](./docs/adr/)
- [Agent guidelines](./AGENTS.md) — for AI pair-programming context

## Local development

Prerequisites: Node 20+, pnpm 9+, Supabase CLI.

```bash
# Install dependencies
pnpm install

# Copy environment file and fill in your Supabase credentials
cp .env.example .env.local

# Start dev server
pnpm start

# Run tests
pnpm test
pnpm e2e

# Lint, type-check, build
pnpm lint && pnpm type-check && pnpm build
```

## Author

[Jose Parra](https://joseparra.dev) — Senior Frontend Engineer, Angular Specialist.

## License

MIT

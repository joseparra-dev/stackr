# Roadmap — Stackr (6 weeks)

## Week 1 — Foundation: Auth + Shell

**Goal:** User can sign in with Google, sees an empty dashboard inside the shell layout.

- [ ] HU-01 — Supabase client provider via DI
- [ ] HU-02 — AuthService with Google OAuth
- [ ] HU-03 — authGuard + protected route layout
- [ ] HU-04 — Login page with Google sign-in button
- [ ] HU-05 — Shell layout (topbar + sidebar + theme toggle)

Acceptance: Sign in → dashboard loads → logout → redirected to login. Theme toggle works without flicker.

## Week 2 — Transactions CRUD

**Goal:** User can add/edit/delete transactions and see them in a table.

- [ ] HU-06 — Supabase migrations + local DB setup
- [ ] HU-07 — Asset autocomplete (CoinGecko search)
- [ ] HU-08 — TransactionForm dialog (reactive form + validations)
- [ ] HU-09 — TransactionsStore + TransactionsService
- [ ] HU-10 — Transactions page (table + empty state)

Acceptance: Add a transaction → appears in table immediately. Edit, delete work. Page reloads keep data.

## Week 3 — Prices + P&L

**Goal:** Dashboard shows real portfolio value and P&L using live prices.

- [ ] HU-11 — CoinGeckoService with polling + caching
- [ ] HU-12 — PricesStore (Signals-based)
- [ ] HU-13 — HoldingsStore (computed from txns + prices)
- [ ] HU-14 — Dashboard portfolio summary cards

Acceptance: Dashboard shows total value in USD, total P&L (abs + %), updates every 30s with live prices.

## Week 4 — Charts + History

**Goal:** Visual portfolio insights via charts and detailed history.

- [ ] HU-15 — Allocation donut chart
- [ ] HU-16 — Portfolio value historical chart (7/30/90 days)
- [ ] HU-17 — Holdings page (detailed table per asset)
- [ ] HU-18 — Transactions filters (asset, type, date range)

Acceptance: Donut shows current allocation %. Historical chart shows portfolio value over selected timeframe. Holdings page shows quantity, avg cost, current value, P&L per asset.

## Week 5 — Polish

**Goal:** Production-grade UX. App feels finished.

- [ ] HU-19 — Empty states for all features
- [ ] HU-20 — Loading skeletons + error states
- [ ] HU-21 — i18n (en/es) with Angular i18n
- [ ] HU-22 — Accessibility audit + fixes (target Lighthouse a11y = 100)

Acceptance: Lighthouse Performance ≥ 90, A11y = 100, Best Practices ≥ 95. All states handled (loading, empty, error).

## Week 6 — Launch

**Goal:** Stackr is live, documented, and ready to be linked in your CV/LinkedIn.

- [ ] HU-23 — Settings page (theme, language, account)
- [ ] HU-24 — Sentry integration + Vercel deploy
- [ ] HU-25 — README polish + production deploy
- [ ] HU-26 — Zoneless change detection migration

Acceptance (HU-25): Live at `stackr.joseparra.dev` (or domain of choice). README has architecture, screenshots, decisions linked. LinkedIn post drafted.

Acceptance (HU-26): `provideZonelessChangeDetection()`, no `zone.js` polyfill, tests green (`pnpm test`, `pnpm build`). No `NavigatorLockAcquireTimeoutError` in dev console.

---

## Future considerations (NOT in v1)

If you have new feature ideas during the build, add them here. Do not implement them in v1.

- Web3 wallet connection
- Live trading via exchange APIs
- DeFi positions (Aave, Compound, staking)
- NFTs
- Full tax reports (FIFO/LIFO/HIFO)
- Multi-currency display
- Push notifications / price alerts
- Social features
- Native mobile app via Capacitor
- Multi-portfolio per user
- CSV import from exchanges
- Reorganize `features/transactions/` into subfolders (`transaction-list/`, `utils/`) before holdings/filters add more files
- AI-powered investment insights

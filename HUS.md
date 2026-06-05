# User Stories (HUs) — Stackr MVP

> Source of truth for the 26 user stories of the MVP.
> Copy each block as a GitHub Issue and assign to its Sprint milestone.
> Drag to the "Stackr — Roadmap" Project board.

---

## HU-01 — feat(core): Supabase client provider via DI

**Size:** M | **Sprint:** Week 1

### User Story

As a developer, I want a single typed Supabase client provided via DI, so that any service can inject it without instantiating clients manually.

### Acceptance Criteria

- [ ] `core/supabase/supabase.client.ts` exports an injection token `SUPABASE_CLIENT`.
- [ ] Provider reads env vars from `environment.ts`.
- [ ] Auth session persists across page reloads.
- [ ] Unit test verifies the client is configured with anon key.

---

## HU-02 — feat(auth): AuthService with Google OAuth

**Size:** M | **Sprint:** Week 1

### User Story

As a user, I want to sign in with Google in 1 click, so that I don't have to create another password.

### Acceptance Criteria

- [ ] `AuthService.signInWithGoogle()` triggers Supabase OAuth flow.
- [ ] `AuthService.signOut()` clears session and redirects to `/login`.
- [ ] `AuthStore` exposes `user`, `isAuthenticated`, `loading` signals.
- [ ] Session restored on app load (silent rehydrate).
- [ ] Tests cover happy path + error mapping (popup blocked, network).

---

## HU-03 — feat(auth): authGuard + protected layout

**Size:** S | **Sprint:** Week 1

### User Story

As an unauthenticated user, I should be redirected to `/login` when I try to access any protected route.

### Acceptance Criteria

- [ ] Functional `authGuard` checks `AuthStore.isAuthenticated()`.
- [ ] Unauthenticated → redirect to `/login` with `returnUrl` query param.
- [ ] Authenticated visiting `/login` → redirect to `/`.
- [ ] `app.routes.ts` uses guard on protected branch.

---

## HU-04 — feat(auth): Login page

**Size:** M | **Sprint:** Week 1

### User Story

As a new user, I want a clear login page with a single "Sign in with Google" button.

### Acceptance Criteria

- [ ] `/login` shows centered card with app name, tagline, Google button.
- [ ] Button shows loading state during OAuth.
- [ ] Errors shown as inline toast/banner.
- [ ] Responsive (mobile 320px+).
- [ ] Accessible: keyboard nav, ARIA labels.

---

## HU-05 — feat(layout): Shell with topbar + sidebar + theme toggle

**Size:** L | **Sprint:** Week 1

### User Story

As an authenticated user, I want a consistent shell with navigation and a theme toggle on every page.

### Acceptance Criteria

- [ ] `ShellComponent` wraps protected routes.
- [ ] Topbar: app logo, current page title, user menu, theme toggle.
- [ ] Sidebar (collapsible on mobile): links to Dashboard, Transactions, Holdings, Settings.
- [ ] Theme toggle persists choice in localStorage.
- [ ] No FOUC on theme switch.
- [ ] Responsive: sidebar becomes drawer on mobile.

---

## HU-06 — chore(db): Apply Supabase migrations

**Size:** S | **Sprint:** Week 2

### User Story

As a developer, I want the database schema and RLS policies applied so the app can read/write data.

### Acceptance Criteria

- [ ] Local Supabase running via `supabase start`.
- [ ] `supabase db push` applies all 5 migrations cleanly.
- [ ] Manual smoke test: insert/select on each table from SQL editor.
- [ ] RLS test: simulate two users, confirm isolation.

---

## HU-07 — feat(assets): Asset autocomplete with CoinGecko

**Size:** M | **Sprint:** Week 2

### User Story

As a user adding a transaction, I want to search for an asset by name or symbol and select it.

### Acceptance Criteria

- [ ] `AssetsService.search(query)` calls CoinGecko `/search` and caches results.
- [ ] Combobox component shows top 10 matches with icon, name, symbol, rank.
- [ ] Debounced 300ms.
- [ ] On select, fills the transaction form's asset field.
- [ ] Caches selected assets locally to avoid re-fetching.

---

## HU-08 — feat(transactions): TransactionForm dialog

**Size:** L | **Sprint:** Week 2

### User Story

As a user, I want a form to add or edit a transaction with validations.

### Acceptance Criteria

- [ ] Dialog opens from "+ Add transaction" button.
- [ ] Reactive form fields: asset (combobox), type (radio buy/sell), quantity (numeric), price per unit (numeric), fee (numeric, optional), executed_at (datetime), notes (textarea, 500 char limit).
- [ ] Validations: quantity > 0, price >= 0, fee >= 0, executed_at <= now.
- [ ] Same dialog works for edit (prefilled).
- [ ] Submit shows loading state; success toast on confirm.
- [ ] Errors mapped from AppError.

---

## HU-09 — feat(transactions): Store + Service for CRUD

**Size:** M | **Sprint:** Week 2

### User Story

As a developer, I want a clean store/service pair for transaction CRUD.

### Acceptance Criteria

- [ ] `TransactionsService` wraps Supabase queries: list, getById, create, update, delete.
- [ ] All methods throw AppError on failure.
- [ ] `TransactionsStore` exposes signals: transactions, loading, error, totalCount, hasTransactions.
- [ ] Optimistic UI updates on add/edit/delete; rollback on error.
- [ ] 80%+ test coverage on store.

---

## HU-10 — feat(transactions): Transactions page with table + empty state

**Size:** L | **Sprint:** Week 2

### User Story

As a user, I want to see all my transactions in a clean, scannable table.

### Acceptance Criteria

- [ ] `/transactions` page shows table: date, asset (icon + symbol), type, quantity, price, fee, total, actions (edit/delete).
- [ ] Empty state when no transactions: illustration + "Add your first transaction" CTA.
- [ ] Action menu per row: edit, delete (with confirmation dialog).
- [ ] Responsive: table becomes cards on mobile.
- [ ] Accessible: ARIA roles, keyboard nav.

---

## HU-11 — feat(prices): CoinGeckoService with polling + caching

**Size:** M | **Sprint:** Week 3

### User Story

As a developer, I want a service that fetches current prices in batch, with caching and rate-limit handling.

### Acceptance Criteria

- [ ] `CoinGeckoService.getPrices(assetIds: string[])` returns `Record<assetId, priceUSD>`.
- [ ] Cache prices in memory for 30 seconds.
- [ ] Implements exponential backoff on rate-limit (429).
- [ ] Polls every 30s when at least one asset is held.
- [ ] Stops polling when window is hidden (Page Visibility API).
- [ ] Tests with MSW for happy path + retry + rate-limit.

---

## HU-12 — feat(prices): PricesStore

**Size:** S | **Sprint:** Week 3

### User Story

As a developer, I want a Signals-based store that exposes current prices reactively.

### Acceptance Criteria

- [ ] `PricesStore` injected at root.
- [ ] `prices: Signal<Record<assetId, priceUSD>>` readonly.
- [ ] `loading`, `error` signals.
- [ ] Method `subscribeToAssets(ids)` starts polling.
- [ ] Tests verify reactive updates.

---

## HU-13 — feat(holdings): HoldingsStore (derived)

**Size:** L | **Sprint:** Week 3

### User Story

As a developer, I want a store that computes holdings from transactions + prices.

### Acceptance Criteria

- [ ] `HoldingsStore.holdings` is `computed()` from `TransactionsStore` + `PricesStore`.
- [ ] `calculateHoldings(txns, prices)` pure function in `@shared/utils/math.ts`.
- [ ] Implements weighted-average cost basis (see ADR-0006).
- [ ] Exposes computed: `totalValueUSD`, `totalCostUSD`, `totalPnLUSD`, `totalPnLPercent`.
- [ ] 100% test coverage on `calculateHoldings` (deterministic fixtures).

---

## HU-14 — feat(dashboard): Portfolio summary cards

**Size:** M | **Sprint:** Week 3

### User Story

As a user, I want to see at a glance my total portfolio value and P&L.

### Acceptance Criteria

- [ ] Dashboard `/` shows 3 cards: Total Value (USD), Total P&L (abs + %), Top Holding (asset + %).
- [ ] P&L green if positive, red if negative.
- [ ] Cards update reactively as prices change.
- [ ] Empty state when no transactions yet.
- [ ] Responsive: cards stack on mobile.

---

## HU-15 — feat(dashboard): Allocation donut chart

**Size:** M | **Sprint:** Week 4

### User Story

As a user, I want to see what % of my portfolio is in each asset.

### Acceptance Criteria

- [ ] Donut chart on dashboard.
- [ ] Each slice is an asset, sized by current USD value.
- [ ] Legend shows asset symbol + percentage.
- [ ] Hover/tap reveals: name, value USD, % of total.
- [ ] Themeable (light/dark).
- [ ] Accessible: ARIA label with summary, sr-only details.

---

## HU-16 — feat(dashboard): Historical portfolio value chart

**Size:** L | **Sprint:** Week 4

### User Story

As a user, I want to see how my portfolio value has changed over the last 7/30/90 days.

### Acceptance Criteria

- [ ] Area/line chart on dashboard.
- [ ] Tabs: 7d, 30d, 90d.
- [ ] Computes daily portfolio value by combining historical prices (`price_snapshots`) with held quantity per day.
- [ ] Loading skeleton while computing.
- [ ] Themeable.
- [ ] Empty state when not enough data (< 2 days).

---

## HU-17 — feat(holdings): Holdings page with detail table

**Size:** M | **Sprint:** Week 4

### User Story

As a user, I want to see per-asset details: quantity, avg cost, current value, P&L.

### Acceptance Criteria

- [ ] `/holdings` page table: asset (icon + name + symbol), quantity, avg cost USD, current price USD, current value USD, P&L (abs + %).
- [ ] Sortable by any column.
- [ ] Click row to filter transactions page by that asset.
- [ ] Responsive: stack as cards on mobile.

---

## HU-18 — feat(transactions): Filters (asset, type, date range)

**Size:** M | **Sprint:** Week 4

### User Story

As a user with many transactions, I want to filter to find specific ones.

### Acceptance Criteria

- [ ] Filter bar on `/transactions`: asset combobox (multi), type (buy/sell/all), date range.
- [ ] Filters apply reactively, no apply button.
- [ ] Filters reflected in URL params (shareable links).
- [ ] "Clear filters" button.
- [ ] Empty state with filters active vs no transactions.

---

## HU-19 — feat(shared): Empty states for all features

**Size:** M | **Sprint:** Week 5

### User Story

As a new user, I want clear guidance on what to do when I see an empty area.

### Acceptance Criteria

- [ ] `EmptyStateComponent` in `shared/ui/`: icon, title, message, optional CTA.
- [ ] Used in: empty transactions, empty filters, empty holdings, no chart data.
- [ ] Consistent visual language.
- [ ] Accessible: ARIA region.

---

## HU-20 — feat(shared): Loading skeletons + error states

**Size:** L | **Sprint:** Week 5

### User Story

As a user, I want feedback while data loads and a clear message when something fails.

### Acceptance Criteria

- [ ] `SkeletonComponent` for cards, table rows, charts.
- [ ] Every async UI shows skeleton (not spinner) while loading.
- [ ] Errors show inline message + retry button.
- [ ] Network errors (offline) banner at top.
- [ ] Sentry receives unhandled errors.

---

## HU-21 — feat(i18n): English + Spanish translations

**Size:** L | **Sprint:** Week 5

### User Story

As a Spanish-speaking user, I want the app in my language.

### Acceptance Criteria

- [ ] All UI text in `src/locales/en.json` + `src/locales/es.json`.
- [ ] Angular i18n configured.
- [ ] Language toggle in Settings page.
- [ ] Default to browser language; persist user choice in profile.
- [ ] No hardcoded strings in templates (lint catches them).

---

## HU-22 — chore(a11y): Accessibility audit + fixes

**Size:** L | **Sprint:** Week 5

### User Story

As a user with assistive tech, I want the app fully usable.

### Acceptance Criteria

- [ ] Lighthouse a11y score = 100.
- [ ] All interactive elements reachable by keyboard.
- [ ] Focus traps in dialogs.
- [ ] Color contrast WCAG AA (verified in light + dark themes).
- [ ] Screen reader announces route changes and form errors.
- [ ] axe-core test suite passes.

---

## HU-23 — feat(settings): Settings page

**Size:** M | **Sprint:** Week 6

### User Story

As a user, I want to manage my theme, language, and account.

### Acceptance Criteria

- [ ] `/settings` page with sections: Account (email, sign out), Appearance (theme dark/light/system), Language (en/es), Danger Zone (delete account).
- [ ] All changes persist to `profiles` table.
- [ ] Delete account triggers cascade delete with confirmation dialog.

---

## HU-24 — chore(ops): Sentry + Vercel deploy

**Size:** M | **Sprint:** Week 6

### User Story

As an engineer, I want production monitoring and automated deploys.

### Acceptance Criteria

- [ ] Sentry project created; DSN in env.
- [ ] Global `ErrorHandler` ships errors to Sentry.
- [ ] Source maps uploaded on production build.
- [ ] Vercel connected to repo; auto-deploy `main` branch.
- [ ] Preview deploys per PR.
- [ ] Custom domain `stackr.joseparra.dev` configured (or chosen).

---

## HU-25 — docs(launch): README polish + production deploy

**Size:** M | **Sprint:** Week 6

### User Story

As a recruiter visiting the repo, I want a compelling README that sells the project.

### Acceptance Criteria

- [ ] README has: hero screenshot, live demo link, "Why" section, key features with screenshots, stack with reasoning, architecture diagram, ADR links, local dev instructions, testing strategy, author info.
- [ ] Multiple screenshots (light + dark).
- [ ] Bullet-pointed engineering decisions ("Why X over Y").
- [ ] Lighthouse scores visible.
- [ ] License: MIT.
- [ ] LinkedIn post drafted.

---

## HU-26 — chore(core): Zoneless change detection migration

**Size:** M | **Sprint:** Week 6 (post-launch tech debt)

### User Story

As a developer, I want Stackr to run without `zone.js`, so the app aligns with Angular 21 defaults (signals + zoneless CD) and avoids spurious Supabase auth lock errors in the console.

### Context

Supabase Auth uses `navigator.locks` by default when `zone.js` patches native `Promise`, which surfaces `NavigatorLockAcquireTimeoutError` in dev (HMR, multiple tabs). The error is benign but noisy. Angular’s recommended fix is zoneless change detection; an in-process `processLock` ships as an interim hardening step on the same branch.

### Acceptance Criteria

**Interim:**

- [x] Supabase client uses `processLock` instead of default `navigatorLock` (`auth.lock` in `supabase.client.ts`).
- [x] Sentry `ignoreErrors` filters benign `LockAcquireTimeoutError` variants (no false Issues in prod).
- [x] `@supabase/auth-js` declared as a direct dependency (same major as `@supabase/supabase-js`).

**Full migration:**

- [x] `provideZonelessChangeDetection()` registered in `app.config.ts`.
- [x] `zone.js` removed from `angular.json` polyfills.
- [x] Vitest setup uses zoneless test bed (`setupTestBed({ zoneless: true })`; `setup-zone` removed).
- [x] `zone.js` removed from `package.json` dependencies.
- [x] `pnpm lint`, `pnpm type-check`, `pnpm test`, and `pnpm build` pass.
- [ ] `pnpm e2e` pass (no Playwright specs in repo yet).
- [ ] Manual check: no `NavigatorLockAcquireTimeoutError` on `pnpm start` after login/session refresh.

### Notes

- Not part of HU-24 (Sentry/Vercel); that HU is already in production.
- Branch: `52-chorecore-zoneless-change-detection-migration`.

# Product Requirements — Stackr

## Vision

A treasury-grade personal portfolio tracker for crypto investors. Built as a portfolio piece showcasing senior frontend engineering and fintech domain knowledge.

## Target user

> A crypto investor who has bought/sold across exchanges over months or years and wants a single dashboard to see total portfolio value, P&L, allocation, and performance over time — without connecting wallets or sharing private keys.

## User scenario (the only one that matters)

1. User opens `stackr.dev` → "Sign in with Google" → enters dashboard.
2. Sees a portfolio summary: total value in USD, total P&L (absolute + %), allocation breakdown.
3. Clicks "+ Add transaction" → fills modal form (asset, type buy/sell, quantity, price, date, optional fee + notes) → submits.
4. Dashboard updates instantly with new totals.
5. Navigates to /transactions → sees full history, filterable by asset/type/date.
6. Navigates to /holdings → sees per-asset details (quantity, avg cost, current value, P&L).
7. Toggles dark/light theme → instant, no flicker.
8. Closes browser → reopens days later → all data still there.

## MVP features (closed list)

1. **Google OAuth authentication** with persistent session.
2. **Transaction CRUD** — create, read, update, delete; reactive forms with validations.
3. **Portfolio overview** — total value, P&L cards, allocation chart.
4. **Live prices** — CoinGecko polling every 30s; optional Binance WebSocket for real-time.
5. **Historical value chart** — last 7/30/90 days of portfolio value evolution.
6. **Transaction history table** — sortable, filterable, paginated.

## Out of MVP / Future

See `NON-GOALS.md`. Anything not in the MVP list above is OUT for v1.

## Success criteria

| Metric                                                          | Target                                     |
| --------------------------------------------------------------- | ------------------------------------------ |
| Time to value (first transaction added → see dashboard updated) | < 30 seconds from signup                   |
| Lighthouse Performance (mobile)                                 | ≥ 90                                       |
| Lighthouse Accessibility                                        | 100                                        |
| Lighthouse Best Practices                                       | ≥ 95                                       |
| Bundle size (initial JS)                                        | < 250 KB transferred                       |
| Unit test coverage (utils + stores)                             | ≥ 80%                                      |
| E2E critical flows passing                                      | 3 (login, add transaction, view dashboard) |
| TypeScript errors at any point                                  | 0                                          |
| ESLint warnings at any point                                    | 0                                          |
| Production uptime via Vercel                                    | 100%                                       |

## Constraints

- USD only (no multi-currency in v1).
- Manual transaction entry only (no exchange API imports, no wallet connection).
- Single portfolio per user.
- English + Spanish (i18n from day 1).

## Tech assumptions

- Modern browser (last 2 versions of Chrome/Firefox/Safari/Edge).
- Responsive: mobile (320px+) → tablet → desktop (up to ultrawide).
- Internet required (no offline mode in MVP).

## Non-functional requirements

- All money calculations server-validated with PostgreSQL CHECK constraints.
- All user data protected by Supabase Row-Level Security.
- Errors visible to user are user-friendly; technical details only in Sentry.
- All forms accessible (ARIA labels, keyboard nav, focus management).

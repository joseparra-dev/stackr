# Stackr — AGENTS.md

> Entrypoint for any AI agent (Cursor, Claude Code, Copilot) working on this repo.
> Read this file before doing anything.

## What is Stackr

Stackr is a treasury-grade personal portfolio tracker for crypto investors. Users sign in with Google, manually log buy/sell transactions, and see portfolio value, P&L, allocation, and historical performance — all live.

This is a portfolio piece by Jose Parra (Senior Frontend Engineer, Angular specialist), targeting fintech roles in remote LATAM. **Quality and craftsmanship are the goal — not feature breadth.**

## Stack (as of 2026-05)

| Layer          | Tool                                   | Version                   |
| -------------- | -------------------------------------- | ------------------------- |
| Framework      | Angular                                | 21+ (standalone, signals) |
| Styling        | Tailwind CSS                           | 4.x                       |
| Primitives     | Angular CDK                            | 21+                       |
| Charts         | ng-apexcharts                          | latest                    |
| Icons          | lucide-angular                         | latest                    |
| Backend (BaaS) | Supabase                               | latest                    |
| Env vars       | @ngx-env/builder                       | latest                    |
| Testing (unit) | Vitest + @analogjs/vite-plugin-angular | latest                    |
| Testing (E2E)  | Playwright                             | latest                    |
| Linting        | ESLint flat config + angular-eslint    | latest                    |
| Formatting     | Prettier + prettier-plugin-tailwindcss | latest                    |
| Git hooks      | Husky + lint-staged + commitlint       | latest                    |
| Errors         | Sentry (free tier)                     | latest                    |
| CI/CD          | GitHub Actions + Vercel                | —                         |

## Documentation

- `docs/PRD.md` — Product Requirements (what we build and why).
- `docs/ARCHITECTURE.md` — Technical architecture decisions.
- `docs/ROADMAP.md` — 6-week plan with milestones.
- `docs/NON-GOALS.md` — Explicit list of what we DON'T build.
- `docs/adr/` — Architecture Decision Records.

## Key conventions

- **Standalone components only.** No NgModules.
- **Signals first.** RxJS only for streams (WebSocket prices).
- **`.page.ts` for route-level components, `.component.ts` for reusables.**
- **Path aliases:** `@app/`, `@core/`, `@shared/`, `@features/`, `@env/`.
- **No barrel files** except `src/app/shared/ui/index.ts`.
- **Strict TypeScript.** No `any`. Use `unknown` + narrow.
- **`AppError` class** for all error flow.
- **Tailwind utility classes only.** No inline styles.
- **Folder by feature.** See `docs/ARCHITECTURE.md`.

Detailed enforced rules in `.cursor/rules/`.

## Workflow

1. Pick an issue from GitHub Project ("Stackr — Roadmap").
2. Create branch `feat/<issue>-name` or `fix/<issue>-name`.
3. Code following `.cursor/rules/`.
4. Locally: `pnpm lint && pnpm type-check && pnpm test && pnpm build` must pass.
5. Commit with Conventional Commits (commitlint enforces).
6. Open PR against `main`. CI runs.
7. Merge with squash. Delete branch.

## Local commands

```bash
pnpm start         # dev server at localhost:4200
pnpm test          # unit tests (Vitest)
pnpm test:watch
pnpm e2e           # Playwright E2E
pnpm lint
pnpm format
pnpm build
pnpm type-check
pnpm ng <command>  # Angular CLI (DO NOT use `pnpm dlx ng` — won't work)
pnpm db:push       # apply Supabase migrations
```

## Environment

Variables loaded via `@ngx-env/builder` from `.env.local` at build time. Only `NG_APP_*` prefixed vars are exposed to client.

Required (see `.env.example`):

- `NG_APP_SUPABASE_URL`
- `NG_APP_SUPABASE_ANON_KEY`
- `NG_APP_COINGECKO_BASE_URL`
- `NG_APP_SENTRY_DSN` (optional)
- `NG_APP_ENV`

## Common gotchas (battle-tested)

1. **`pnpm dlx ng` does NOT work.** Use `pnpm exec ng` or `pnpm ng`. The `ng` binary belongs to `@angular/cli`, not a standalone package.
2. **Vitest needs `@angular/compiler` imported FIRST** in `src/test-setup.ts` before any other Angular import.
3. **`zone.js` must be installed explicitly** in some Angular 21 setups. If tests fail with "Cannot find package 'zone.js'", run `pnpm add zone.js`.
4. **`src/env.d.ts` is auto-generated** by `@ngx-env/builder`. It's ignored from ESLint. Do not modify by hand.
5. **`@analogjs/vite-plugin-angular` (NOT `@analogjs/vitest-angular/plugin`)** is the correct import in `vitest.config.ts`.
6. **`@angular/platform-browser-dynamic/testing` no longer exists** in Angular 21. Use `@angular/platform-browser/testing`.

## Out of scope

See `docs/NON-GOALS.md`. Common ones:

- ❌ Web3 wallet connection (Metamask, WalletConnect)
- ❌ Live trading
- ❌ DeFi positions
- ❌ NFTs
- ❌ Push notifications
- ❌ Multi-portfolio per user
- ❌ Native mobile app

If a new feature idea appears, add it to `docs/ROADMAP.md` under "Future considerations". Do NOT implement.

## When in doubt

- Read `.cursor/rules/<area>.mdc`.
- Read relevant ADR in `docs/adr/`.
- If still unclear: ASK before coding. Don't guess on architectural decisions.

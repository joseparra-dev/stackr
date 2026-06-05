# Performance wave 2 — investigation findings (HU-28)

Baseline: Lighthouse mobile on **authenticated dashboard** (`https://stackr.joseparra.dev/`, incognito, Slow 4G) after HU-27.

| Metric | HU-27 post-merge |
|--------|-------------------|
| Performance | 83 |
| LCP | 3.9 s |
| CLS | 0.114 |
| Unused JS | ~212 KiB |
| Speed Index | 2.4 s |

## ApexCharts — three lazy chunks, one runtime load

`stats.json` (production build) shows three Apex-related lazy chunks:

| Chunk | Entry | Raw size |
|-------|-------|----------|
| `apexcharts-esm` | `apexcharts/dist/apexcharts.esm.js` | ~538 KiB |
| `apexcharts-ssr-esm` | `apexcharts/dist/apexcharts.ssr.esm.js` | ~543 KiB |
| `core-esm` | `apexcharts/dist/core.esm.js` | ~347 KiB |

**Root cause:** `ng-apexcharts@2.4` ships a single FESM bundle exporting `ChartComponent`, `ChartCoreComponent`, `ChartSSRComponent`, and `ChartHydrateComponent`. Each uses a different dynamic `import()` target (`apexcharts/client`, `apexcharts/core`, `apexcharts/ssr`). esbuild emits one lazy chunk per target even though only one path runs in our SPA.

Only `dashboard-portfolio-history` imports `ng-apexcharts`. At runtime **only the path used by the rendered component** downloads (verified: `ChartComponent` → `apexcharts/client`).

**Clean fix (implemented):** Switch to `ChartCoreComponent` (`apx-chart-core`) with `import 'apexcharts/line'` for area charts. Documented by ng-apexcharts as the tree-shakeable variant (~core + line vs full client). No bundler aliases or forks.

**Not a fix:** Forcing esbuild to drop SSR/core chunks while still importing from `ng-apexcharts` public API — would require a library fork.

## LCP (~3.9 s on dashboard)

Primary contributors (in order):

1. Initial JS parse (Angular + Supabase ~665 KiB raw initial bundle)
2. Self-hosted fonts in CSS bundle (~42 KiB styles, woff2 decode)
3. Dashboard data fetch (transactions → summary cards paint)

LCP element is expected to be **summary card text** or heading, not the deferred chart.

## CLS (0.114)

Likely combined:

1. `font-display: swap` on Inter (text metrics shift when woff2 applies)
2. Skeleton → summary cards content swap on dashboard
3. `@defer` chart placeholder → chart height change when scrolled into view (below fold; minor contribution on initial load)

No CSS hacks applied without a traced culprit. Font metrics are bundled via `@fontsource`; further CLS work may need reserved min-heights on dashboard sections (follow-up).

## Source maps on deploy

`scripts/sentry-upload-sourcemaps.mjs` already uploads then deletes `.map` files when `SENTRY_AUTH_TOKEN` is set. Maps were still present when upload is skipped (local builds). **Fix:** always strip `.map` from `dist/stackr/browser` after production build.

## Sentry on critical path

`initSentry()` runs synchronously in `provideAppInitializer`. `@sentry/angular` also loads via `SentryErrorHandler` in the main chunk. **Fix (implemented):** `scheduleSentryInit()` — dynamic `import('./sentry')` on `requestIdleCallback`.

**Initializer constraint ([NG0203](https://angular.dev/errors/NG0203)):** `inject()` inside `provideAppInitializer` must run synchronously in the callback body. Calling `inject()` inside `.then()` after `i18n.bootstrap()` exits the injection context and breaks bootstrap (`AuthStore` never instantiates).

## i18n initial bundle

`I18nService` statically imported `en.json` + `es.json` (~18 KiB) into the vendor chunk. **Fix (implemented):** keep `en.json` eager (fallback tree); lazy-load `es.json` as `es-json` chunk (~7 KiB) when locale is `es`.

## Post-implementation build deltas (vs HU-27)

| Metric | HU-27 | HU-28 |
|--------|-------|-------|
| Initial raw | 665 KiB | **659 KiB** (−6 KiB, `es.json` out of initial) |
| Chart runtime chunk | `apexcharts-esm` ~538 KiB | `core-esm` graph ~348 KiB + line plugins |
| `dashboard-portfolio-history` | 12 KiB | 30 KiB (includes `apexcharts/line` registration) |

`apexcharts-ssr-esm` / `apexcharts-esm` chunks remain in the build graph (ng-apexcharts FESM) but are **not downloaded** when using `ChartCoreComponent`.

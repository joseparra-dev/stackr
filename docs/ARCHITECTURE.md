# Architecture — Stackr

## High-level overview

```
┌─────────────────────────────────────────────┐
│              Angular 21 SPA                 │
│  (standalone components + signals + Tailwind)│
└──────────────┬──────────────────────────────┘
               │
               ├──> Supabase (PostgreSQL + Auth + RLS + Realtime)
               │       └─> user data: profiles, transactions
               │
               ├──> CoinGecko REST API (public, no auth)
               │       └─> asset catalog, prices, historical
               │
               └──> Binance WebSocket (optional)
                       └─> real-time price streams
```

## Folder structure (folder-by-feature)

```
src/app/
├── app.config.ts            # bootstrapApplication config
├── app.routes.ts            # root routes (lazy-loaded)
├── app.component.ts         # shell root
│
├── core/                    # singletons, no UI
│   ├── auth/                # AuthService, authGuard, AuthStore
│   ├── supabase/            # client provider + tokens
│   ├── errors/              # AppError class + global handler + mapper
│   ├── theme/               # ThemeService (dark/light toggle)
│   ├── i18n/                # i18n setup
│   └── analytics/           # Sentry config
│
├── shared/                  # reusable UI + utils
│   ├── ui/                  # Button, Card, Input, Select, Dialog, etc.
│   ├── layout/              # Shell, Topbar, Sidebar
│   ├── pipes/               # CurrencyCryptoPipe, etc.
│   ├── directives/
│   └── utils/               # math (P&L, FIFO), date, format
│
└── features/                # self-contained features
    ├── auth/                # /login, /auth/callback
    ├── dashboard/           # /  (home)
    ├── transactions/        # /transactions
    ├── holdings/            # /holdings
    ├── prices/              # NO route — data layer (CoinGecko + WS)
    ├── assets/              # NO route — asset catalog
    └── settings/            # /settings
```

**Rationale:** see `adr/0007-why-folder-by-feature.md`.

## Naming conventions

- Files: `kebab-case.ts`
- `*.page.ts` — route-level component, PascalCase class with `Page` suffix (e.g. `login.page.ts` → `LoginPage`). Suffix exists because "is this a route?" is a question we ask repeatedly during navigation/refactors.
- Other components: **no suffix** in file or class — follow Angular 21+ CLI default (e.g. `button.ts` → `Button`). The `@Component()` decorator and folder context already convey what it is. Repeating "Component" was redundant noise.
- `*.service.ts` — services (`@Injectable({ providedIn: 'root' })`).
- `*.store.ts` — state stores (Signals-based).
- `*.guard.ts` — functional guards (camelCase function names).
- `*.types.ts` — interfaces/types only.
- `*.spec.ts` — Vitest unit tests.
- `*.e2e.spec.ts` — Playwright E2E.

See `adr/0008-component-naming-convention.md`.

## State management

Native Angular Signals + service-based stores. **No NgRx.**

Each feature with state has a `*.store.ts`:

```ts
@Injectable({ providedIn: 'root' })
export class TransactionsStore {
  private readonly service = inject(TransactionsService);

  private readonly _transactions = signal<Transaction[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<AppError | null>(null);

  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly totalCount = computed(() => this._transactions().length);
  readonly hasTransactions = computed(() => this._transactions().length > 0);

  async load() {
    /* ... */
  }
  async add(input: NewTransaction) {
    /* ... */
  }
  async update(id: string, patch: Partial<Transaction>) {
    /* ... */
  }
  async remove(id: string) {
    /* ... */
  }
}
```

### Derived state via `computed()`

`HoldingsStore` is 100% derived from `TransactionsStore` and `PricesStore`:

```ts
readonly holdings = computed<Holding[]>(() => {
  const txns = this.transactionsStore.transactions();
  const prices = this.pricesStore.prices();
  return calculateHoldings(txns, prices);
});

readonly totalValueUSD = computed(() =>
  this.holdings().reduce((sum, h) => sum + h.currentValueUSD, 0)
);
```

Rationale: see `adr/0002-why-signals-not-ngrx.md`.

## Routing

All routes lazy-loaded. Shell (topbar + sidebar) wraps protected routes.

```ts
export const routes: Routes = [
  {
    path: 'login',
    loadChildren: () => import('@features/auth/auth.routes'),
  },
  {
    path: '',
    canActivate: [authGuard],
    component: ShellComponent,
    children: [
      { path: '', loadChildren: () => import('@features/dashboard/dashboard.routes') },
      {
        path: 'transactions',
        loadChildren: () => import('@features/transactions/transactions.routes'),
      },
      { path: 'holdings', loadChildren: () => import('@features/holdings/holdings.routes') },
      { path: 'settings', loadChildren: () => import('@features/settings/settings.routes') },
    ],
  },
  { path: '**', redirectTo: '' },
];
```

## Database schema (PostgreSQL via Supabase)

4 tables. See `supabase/migrations/` for exact SQL.

- **`profiles`** — extends `auth.users`, stores display preferences (theme, locale, currency).
- **`assets`** — catalog of cryptocurrencies (synced from CoinGecko).
- **`transactions`** — core table. Buy/sell records with quantity, price, fee, date.
- **`price_snapshots`** — daily price history per asset (for historical chart).

### Critical schema decisions

- `numeric(28, 12)` for quantity (NEVER float for money).
- `numeric(20, 8)` for prices and fees.
- `transaction_type` enum (`buy` | `sell`).
- `CHECK` constraints enforce positive quantities, non-future dates.
- `ON DELETE CASCADE` from `auth.users` cascades to profiles and transactions.

## Row-Level Security (RLS)

Every user-data table has RLS enabled. Default deny; explicit policies grant access.

```sql
-- transactions: users CRUD only their own
create policy "txns_select_own" on transactions
  for select using (auth.uid() = user_id);
create policy "txns_insert_own" on transactions
  for insert with check (auth.uid() = user_id);
-- ...
```

Rationale: see `adr/0001-why-supabase.md`.

## Error handling

Single `AppError` class:

```ts
export type AppErrorCode =
  | 'auth/unauthorized'
  | 'auth/session-expired'
  | 'network/offline'
  | 'network/timeout'
  | 'api/rate-limit'
  | 'api/server-error'
  | 'validation/invalid-input'
  | 'unknown';

export class AppError extends Error {
  constructor(
    public readonly code: AppErrorCode,
    message: string,
    public readonly cause?: unknown,
  ) {
    super(message);
  }
}
```

Rules:

- Services throw or return `AppError`, never raw exceptions.
- Stores capture errors in dedicated `_error` signal.
- Components render error UI based on `error.code`, never raw messages.
- Global `ErrorHandler` ships unhandled errors to Sentry.
- **Fail closed:** auth fail → redirect to login. DB write fail → toast + rollback optimistic update. Price fetch fail → holdings show without USD value but DON'T crash.

## API integration

| API                                  | Use case         | Auth | Rate limit | Fallback                                    |
| ------------------------------------ | ---------------- | ---- | ---------- | ------------------------------------------- |
| CoinGecko `/coins/list`              | Asset catalog    | None | 10-30/min  | Cache in `assets` table 24h                 |
| CoinGecko `/simple/price`            | Current prices   | None | 10-30/min  | Polling 30s, in-memory cache                |
| CoinGecko `/coins/{id}/market_chart` | Historical       | None | 10-30/min  | Cache in `price_snapshots` 24h              |
| Binance WebSocket                    | Real-time prices | None | N/A        | Fallback to CoinGecko polling on disconnect |

Rate limit handling: exponential backoff + request queue.

## Design tokens + theming

CSS variables in `src/styles.css`, consumed by Tailwind v4 via `@theme`.

- **Dark primary**: `--color-bg: #0a0a0b`, `--color-surface: #131316`, `--color-text: #f4f4f5`.
- **Light secondary**: `--color-bg: #ffffff`, `--color-surface: #fafafa`, `--color-text: #18181b`.

Toggle via `data-theme` attribute on `<html>`. Inline script in `index.html` applies theme before Angular loads (no FOUC).

## Testing strategy

| Layer                         | Tool         | Coverage target                   |
| ----------------------------- | ------------ | --------------------------------- |
| Pure utils (math, formatters) | Vitest       | 100% — financial math is critical |
| Stores                        | Vitest       | 80%+                              |
| Services (HTTP)               | Vitest + MSW | 70%+                              |
| Components                    | Vitest       | 30-50% (only critical UI)         |
| E2E critical flows            | Playwright   | 3 flows                           |

## Performance budget

- Initial JS: < 250 KB transferred (gzip).
- Lazy-load all routes.
- `ChangeDetectionStrategy.OnPush` always.
- `@defer` for below-the-fold blocks.
- Tailwind v4 PurgeCSS reduces CSS to ~10 KB.

## Security

- All env vars accessible to client are `NG_APP_*` prefixed (public anon key, public URLs).
- Supabase service_role key NEVER in frontend.
- RLS policies tested with multiple users before deploy.
- CSP headers configured at Vercel.
- Inputs always validated client + server (CHECK constraints).
- Angular escapes templates by default. No `[innerHTML]` with user content.

## CI/CD

- **GitHub Actions** on every PR: `lint + type-check + test + build`.
- **Playwright E2E** on `main` branch only (slower, runs nightly + before deploy).
- **Vercel preview deploys** automatically per PR.
- **Production deploy** on merge to `main`.

## Common gotchas

(See `AGENTS.md` for the full list.)

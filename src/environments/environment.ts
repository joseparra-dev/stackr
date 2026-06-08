// Values are inlined at build time by @ngx-env/builder (esbuild `define`).
// Every NG_APP_* key referenced here MUST exist at build time, otherwise the
// access is left untouched and `import.meta.env` resolves to `undefined` at
// runtime (white screen). The committed `.env` baseline guarantees all keys
// are always defined; `.env.local` and the hosting provider override them.
export const environment = {
  production: false,
  supabase: {
    url: import.meta.env['NG_APP_SUPABASE_URL'] ?? '',
    anonKey: import.meta.env['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
  coingecko: {
    baseUrl: import.meta.env['NG_APP_COINGECKO_BASE_URL'] ?? 'https://api.coingecko.com/api/v3',
    apiKey: import.meta.env['NG_APP_COINGECKO_API_KEY'] ?? '',
  },
  sentryDsn: import.meta.env['NG_APP_SENTRY_DSN'] ?? '',
};

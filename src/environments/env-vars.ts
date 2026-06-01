type EnvKey =
  | 'NG_APP_SUPABASE_URL'
  | 'NG_APP_SUPABASE_ANON_KEY'
  | 'NG_APP_COINGECKO_BASE_URL'
  | 'NG_APP_SENTRY_DSN'
  | 'NG_APP_ENV';

/** Safe read for @ngx-env/builder vars — avoids crash when `import.meta.env` is missing. */
export function envVar(key: EnvKey, fallback = ''): string {
  const value = import.meta.env?.[key];
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

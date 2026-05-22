export const environment = {
  production: true,
  supabase: {
    url: import.meta.env['NG_APP_SUPABASE_URL'] ?? '',
    anonKey: import.meta.env['NG_APP_SUPABASE_ANON_KEY'] ?? '',
  },
  coingecko: {
    baseUrl: import.meta.env['NG_APP_COINGECKO_BASE_URL'] ?? 'https://api.coingecko.com/api/v3',
  },
  sentryDsn: import.meta.env['NG_APP_SENTRY_DSN'] ?? '',
};

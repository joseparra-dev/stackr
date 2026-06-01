import { envVar } from './env-vars';

export const environment = {
  production: false,
  supabase: {
    url: envVar('NG_APP_SUPABASE_URL'),
    anonKey: envVar('NG_APP_SUPABASE_ANON_KEY'),
  },
  coingecko: {
    baseUrl: envVar('NG_APP_COINGECKO_BASE_URL', 'https://api.coingecko.com/api/v3'),
  },
  sentryDsn: envVar('NG_APP_SENTRY_DSN'),
};

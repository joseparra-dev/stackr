import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js';

import { environment } from '@env/environment';

const STORAGE_KEY = 'stackr.auth.token';

const DEFAULT_OPTIONS: SupabaseClientOptions<'public'> = {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    // PKCE over implicit flow: mitigates token interception on OAuth redirect (OWASP A07).
    flowType: 'pkce',
    storageKey: STORAGE_KEY,
  },
};

/** Exposed so tests can override credentials without touching `import.meta.env`. */
export const SUPABASE_URL = new InjectionToken<string>('SUPABASE_URL');

/** Publishable (anon) key — safe in the client, RLS enforces access. NEVER the `service_role` key. */
export const SUPABASE_ANON_KEY = new InjectionToken<string>('SUPABASE_ANON_KEY');

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SUPABASE_CLIENT');

export interface ProvideSupabaseConfig {
  readonly url?: string;
  readonly anonKey?: string;
}

export function provideSupabase(config?: ProvideSupabaseConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SUPABASE_URL, useValue: config?.url ?? environment.supabase.url },
    { provide: SUPABASE_ANON_KEY, useValue: config?.anonKey ?? environment.supabase.anonKey },
    {
      provide: SUPABASE_CLIENT,
      useFactory: (url: string, anonKey: string): SupabaseClient => {
        // Fail closed: never boot silently against an unconfigured backend.
        if (!url || !anonKey) {
          throw new Error(
            '[Supabase] Missing NG_APP_SUPABASE_URL or NG_APP_SUPABASE_ANON_KEY. ' +
              'Set them in .env.local before starting the app.',
          );
        }
        return createClient(url, anonKey, DEFAULT_OPTIONS);
      },
      deps: [SUPABASE_URL, SUPABASE_ANON_KEY],
    },
  ]);
}

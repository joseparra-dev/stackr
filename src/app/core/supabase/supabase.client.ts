import { InjectionToken, makeEnvironmentProviders } from '@angular/core';
import type { EnvironmentProviders } from '@angular/core';
import { processLock } from '@supabase/auth-js';
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
    // Web Locks API + zone.js (Angular polyfill) causes spurious
    // NavigatorLockAcquireTimeoutError in dev. In-process lock is enough
    // for a single tab; cross-tab sync uses BroadcastChannel in auth-js.
    lock: processLock,
  },
};

export type CreateSupabaseClient = (
  url: string,
  anonKey: string,
  options: SupabaseClientOptions<'public'>,
) => SupabaseClient;

export const SUPABASE_URL = new InjectionToken<string>('SUPABASE_URL');

/** Publishable (anon) key — safe in the client, RLS enforces access. NEVER the `service_role` key. */
export const SUPABASE_ANON_KEY = new InjectionToken<string>('SUPABASE_ANON_KEY');

/**
 * Factory used to build the Supabase client. Injected (instead of imported
 * statically) so tests can swap it without relying on module mocking,
 * which is brittle across CI/Linux + pnpm symlinks.
 */
export const SUPABASE_CREATE_CLIENT = new InjectionToken<CreateSupabaseClient>(
  'SUPABASE_CREATE_CLIENT',
);

export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient>('SUPABASE_CLIENT');

export interface ProvideSupabaseConfig {
  readonly url?: string;
  readonly anonKey?: string;
  readonly createClient?: CreateSupabaseClient;
}

export function provideSupabase(config?: ProvideSupabaseConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: SUPABASE_URL, useValue: config?.url ?? environment.supabase.url },
    { provide: SUPABASE_ANON_KEY, useValue: config?.anonKey ?? environment.supabase.anonKey },
    {
      provide: SUPABASE_CREATE_CLIENT,
      useValue: config?.createClient ?? (createClient as CreateSupabaseClient),
    },
    {
      provide: SUPABASE_CLIENT,
      useFactory: (url: string, anonKey: string, factory: CreateSupabaseClient): SupabaseClient => {
        // Fail closed: never boot silently against an unconfigured backend.
        if (!url || !anonKey) {
          throw new Error(
            '[Supabase] Missing NG_APP_SUPABASE_URL or NG_APP_SUPABASE_ANON_KEY. ' +
              'Set them in .env.local before starting the app.',
          );
        }
        return factory(url, anonKey, DEFAULT_OPTIONS);
      },
      deps: [SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_CREATE_CLIENT],
    },
  ]);
}

import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import type { Session, SupabaseClient } from '@supabase/supabase-js';

import { AppError } from '@core/errors/app-error';
import { mapSupabaseAuthError } from '@core/errors/map-supabase-auth-error';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import type { AuthEvent, AuthSubscription } from './auth.types';

// Supabase also emits USER_UPDATED, MFA_*, PASSWORD_RECOVERY, etc. — none
// of those change the auth surface we expose today.
const FORWARDED_EVENTS: ReadonlySet<string> = new Set<AuthEvent>([
  'INITIAL_SESSION',
  'SIGNED_IN',
  'SIGNED_OUT',
  'TOKEN_REFRESHED',
]);

/**
 * Thin, stateless wrapper around `supabase.auth`. Maps every vendor error
 * to {@link AppError} so the rest of the app never depends on the SDK
 * shape. State lives in `AuthStore`.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = inject<SupabaseClient>(SUPABASE_CLIENT);
  private readonly document = inject(DOCUMENT);

  /**
   * Resolves *before* the actual browser redirect — by design, this method
   * does not "await login". The session is restored later via the
   * `SIGNED_IN` event after Google sends the user back to /auth/callback.
   */
  async signInWithGoogle(redirectTo?: string): Promise<void> {
    const targetRedirect = redirectTo ?? this.defaultRedirectUrl();

    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: targetRedirect,
          // `offline` + `consent` ensure Google returns a refresh token even
          // for returning users — without these the session dies after 1h.
          queryParams: { access_type: 'offline', prompt: 'consent' },
        },
      });
      if (error) throw error;
    } catch (cause) {
      throw mapSupabaseAuthError(cause);
    }
  }

  async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
    } catch (cause) {
      throw mapSupabaseAuthError(cause);
    }
  }

  async getCurrentSession(): Promise<Session | null> {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) throw error;
      return data.session;
    } catch (cause) {
      throw mapSupabaseAuthError(cause);
    }
  }

  onAuthStateChange(
    callback: (event: AuthEvent, session: Session | null) => void,
  ): AuthSubscription {
    const {
      data: { subscription },
    } = this.supabase.auth.onAuthStateChange((event, session) => {
      if (!FORWARDED_EVENTS.has(event)) return;
      callback(event as AuthEvent, session);
    });

    return { unsubscribe: () => subscription.unsubscribe() };
  }

  private defaultRedirectUrl(): string {
    // Reads `window` via DI'd DOCUMENT so SSR and tests don't blow up.
    const origin = this.document.defaultView?.location.origin ?? '';
    if (!origin) {
      // Fail closed: refuse to start an OAuth flow we can't return from.
      throw new AppError(
        'unknown',
        'Cannot derive an origin for the OAuth redirect (no window available).',
      );
    }
    return `${origin}/auth/callback`;
  }
}

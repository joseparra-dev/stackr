import { AuthError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { AppError } from './app-error';
import { mapSupabaseAuthError } from './map-supabase-auth-error';

function makeAuthError(message: string, status?: number, code?: string): AuthError {
  return new AuthError(message, status, code);
}

describe('mapSupabaseAuthError', () => {
  it('passes through values that are already AppError', () => {
    const original = new AppError('auth/unauthorized', 'nope');
    const mapped = mapSupabaseAuthError(original);
    expect(mapped).toBe(original);
  });

  it('maps native fetch TypeError to network/offline', () => {
    const native = new TypeError('Failed to fetch');
    const mapped = mapSupabaseAuthError(native);

    expect(mapped).toBeInstanceOf(AppError);
    expect(mapped.code).toBe('network/offline');
    expect(mapped.cause).toBe(native);
  });

  it('maps generic AuthError without a known code to auth/unauthorized', () => {
    const err = makeAuthError('Invalid grant', 401, 'invalid_credentials');
    const mapped = mapSupabaseAuthError(err);

    expect(mapped.code).toBe('auth/unauthorized');
    expect(mapped.message).toBe('Invalid grant');
    expect(mapped.cause).toBe(err);
  });

  it('maps session-related codes to auth/session-expired', () => {
    const cases = [
      'session_not_found',
      'session_expired',
      'refresh_token_not_found',
      'refresh_token_already_used',
      'flow_state_expired',
      'bad_jwt',
    ];

    for (const code of cases) {
      const err = makeAuthError('expired', 401, code);
      const mapped = mapSupabaseAuthError(err);
      expect(mapped.code, `code "${code}" should map to session-expired`).toBe(
        'auth/session-expired',
      );
    }
  });

  it('maps rate-limit codes to api/rate-limit', () => {
    const err = makeAuthError('Slow down', 429, 'over_request_rate_limit');
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.code).toBe('api/rate-limit');
  });

  it('maps 5xx AuthError to api/server-error', () => {
    const err = makeAuthError('Internal', 500, 'unexpected_failure');
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.code).toBe('api/server-error');
  });

  it('maps AuthRetryableFetchError with status<500 to network/offline', () => {
    const err = makeAuthError('network blip', 0);
    err.name = 'AuthRetryableFetchError';
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.code).toBe('network/offline');
  });

  it('maps AuthSessionMissingError to auth/session-expired', () => {
    const err = makeAuthError('Auth session missing!', 400);
    err.name = 'AuthSessionMissingError';
    const mapped = mapSupabaseAuthError(err);
    expect(mapped.code).toBe('auth/session-expired');
  });

  it('maps non-Auth, non-network values to unknown', () => {
    const mapped = mapSupabaseAuthError({ weird: true });
    expect(mapped.code).toBe('unknown');
  });
});

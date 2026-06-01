import { AppError } from '@core/errors/app-error';
import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { describe, expect, it } from 'vitest';

describe('mapSupabaseError', () => {
  it('passes through values that are already AppError', () => {
    const original = new AppError('auth/unauthorized', 'nope');
    expect(mapSupabaseError(original)).toBe(original);
  });

  it('maps fetch failures to network/offline', () => {
    expect(mapSupabaseError(new TypeError('Failed to fetch')).code).toBe('network/offline');
  });

  it('maps check_violation to validation/invalid-input', () => {
    expect(mapSupabaseError({ code: '23514', message: 'check failed' }).code).toBe(
      'validation/invalid-input',
    );
  });

  it('maps unauthorized SQLSTATE to auth/unauthorized', () => {
    expect(mapSupabaseError({ code: '28000', message: 'unauthorized' }).code).toBe(
      'auth/unauthorized',
    );
  });

  it('maps unknown codes to api/server-error', () => {
    expect(mapSupabaseError({ code: '99999', message: 'boom' }).code).toBe('api/server-error');
  });
});

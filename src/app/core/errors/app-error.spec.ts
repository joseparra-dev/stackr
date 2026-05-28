import { describe, expect, it } from 'vitest';

import { AppError, errorMessage } from './app-error';
import type { AppErrorCode } from './app-error';

describe('AppError', () => {
  it('captures code, message, and cause', () => {
    const cause = new Error('boom');
    const err = new AppError('network/offline', 'No internet', cause);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe('network/offline');
    expect(err.message).toBe('No internet');
    expect(err.cause).toBe(cause);
    expect(err.name).toBe('AppError');
  });

  describe('from', () => {
    it('returns the same instance when given an AppError', () => {
      const original = new AppError('auth/unauthorized', 'nope');
      const wrapped = AppError.from(original);
      expect(wrapped).toBe(original);
    });

    it('wraps a native Error preserving the message', () => {
      const native = new Error('fetch failed');
      const wrapped = AppError.from(native);

      expect(wrapped).toBeInstanceOf(AppError);
      expect(wrapped.code).toBe('unknown');
      expect(wrapped.message).toBe('fetch failed');
      expect(wrapped.cause).toBe(native);
    });

    it('wraps non-Error values using the fallback message', () => {
      const wrapped = AppError.from('string thrown', 'Something failed');

      expect(wrapped.code).toBe('unknown');
      expect(wrapped.message).toBe('Something failed');
      expect(wrapped.cause).toBe('string thrown');
    });
  });
});

describe('errorMessage', () => {
  it.each<AppErrorCode>([
    'auth/unauthorized',
    'auth/session-expired',
    'network/offline',
    'network/timeout',
    'api/rate-limit',
    'api/server-error',
    'validation/invalid-input',
    'unknown',
  ])('returns a non-empty user-facing message for code %s', (code) => {
    const result = errorMessage(code);
    expect(result).toBeTruthy();
    expect(result.length).toBeGreaterThan(0);
    expect(result).not.toContain('undefined');
    expect(result).not.toContain('null');
  });
  it('does not leak vendor internals in messages', () => {
    const allMessages: string[] = [
      'auth/unauthorized',
      'auth/session-expired',
      'network/offline',
      'network/timeout',
      'api/rate-limit',
      'api/server-error',
      'validation/invalid-input',
      'unknown',
    ].map((c) => errorMessage(c as AppErrorCode));
    for (const msg of allMessages) {
      expect(msg.toLowerCase()).not.toContain('supabase');
      expect(msg.toLowerCase()).not.toContain('postgres');
      expect(msg.toLowerCase()).not.toContain('jwt');
    }
  });
});

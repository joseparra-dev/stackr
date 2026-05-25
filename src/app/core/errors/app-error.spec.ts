import { describe, expect, it } from 'vitest';

import { AppError } from './app-error';

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

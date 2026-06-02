import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';

import { backoffDelayMs, isRateLimitError, withExponentialBackoff } from './fetch-with-backoff';

describe('backoffDelayMs', () => {
  it('doubles the delay for each attempt', () => {
    expect(backoffDelayMs(0)).toBe(1_000);
    expect(backoffDelayMs(1)).toBe(2_000);
    expect(backoffDelayMs(2)).toBe(4_000);
  });
});

describe('isRateLimitError', () => {
  it('returns true for api/rate-limit AppError', () => {
    expect(isRateLimitError(new AppError('api/rate-limit', 'Rate limited'))).toBe(true);
  });

  it('returns false for other errors', () => {
    expect(isRateLimitError(new AppError('api/server-error', 'Server error'))).toBe(false);
    expect(isRateLimitError(new Error('boom'))).toBe(false);
  });
});

describe('withExponentialBackoff', () => {
  it('returns the result on the first successful attempt', async () => {
    const fn = vi.fn().mockResolvedValue('ok');

    await expect(withExponentialBackoff(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('retries rate-limit errors with increasing delays', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new AppError('api/rate-limit', 'Rate limited'))
      .mockRejectedValueOnce(new AppError('api/rate-limit', 'Rate limited'))
      .mockResolvedValue('ok');

    await expect(withExponentialBackoff(fn, { sleep })).resolves.toBe('ok');

    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
    expect(sleep).toHaveBeenNthCalledWith(1, 1_000);
    expect(sleep).toHaveBeenNthCalledWith(2, 2_000);
  });

  it('throws after max attempts are exhausted', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockRejectedValue(new AppError('api/rate-limit', 'Rate limited'));

    await expect(withExponentialBackoff(fn, { sleep, maxAttempts: 3 })).rejects.toMatchObject({
      code: 'api/rate-limit',
    });

    expect(fn).toHaveBeenCalledTimes(3);
    expect(sleep).toHaveBeenCalledTimes(2);
  });

  it('does not retry non-rate-limit errors', async () => {
    const sleep = vi.fn().mockResolvedValue(undefined);
    const fn = vi.fn().mockRejectedValue(new AppError('api/server-error', 'Server error'));

    await expect(withExponentialBackoff(fn, { sleep })).rejects.toMatchObject({
      code: 'api/server-error',
    });

    expect(fn).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });
});

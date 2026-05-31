import { HttpErrorResponse } from '@angular/common/http';

import { AppError, type AppErrorCode } from './app-error';

function isNetworkError(value: unknown): boolean {
  return value instanceof TypeError && /fetch|network/i.test(value.message);
}

function codeForHttpStatus(status: number): AppErrorCode {
  if (status === 429) return 'api/rate-limit';
  if (status >= 500) return 'api/server-error';
  if (status === 408 || status === 0) return 'network/timeout';
  if (status >= 400) return 'validation/invalid-input';
  return 'unknown';
}

function messageForHttpStatus(status: number): string {
  if (status === 429) return 'CoinGecko rate limit reached. Try again shortly.';
  if (status >= 500) return 'CoinGecko is temporarily unavailable.';
  if (status === 408 || status === 0) return 'Request timed out.';
  if (status >= 400) return 'Invalid asset search request.';
  return 'Failed to fetch asset catalog.';
}

/** Maps CoinGecko / HTTP failures to {@link AppError}. Pure function — easy to test. */
export function mapCoinGeckoError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  if (isNetworkError(value)) {
    return new AppError('network/offline', 'No internet connection', value);
  }
  if (value instanceof HttpErrorResponse) {
    return new AppError(codeForHttpStatus(value.status), messageForHttpStatus(value.status), value);
  }
  return AppError.from(value, 'Failed to fetch asset catalog');
}

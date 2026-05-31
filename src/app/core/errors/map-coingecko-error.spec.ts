import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';

import { AppError } from './app-error';
import { mapCoinGeckoError } from './map-coingecko-error';

describe('mapCoinGeckoError', () => {
  it('passes through values that are already AppError', () => {
    const original = new AppError('api/rate-limit', 'slow down');
    expect(mapCoinGeckoError(original)).toBe(original);
  });

  it('maps fetch failures to network/offline', () => {
    const mapped = mapCoinGeckoError(new TypeError('Failed to fetch'));
    expect(mapped.code).toBe('network/offline');
  });

  it('maps HTTP 429 to api/rate-limit', () => {
    const mapped = mapCoinGeckoError(
      new HttpErrorResponse({ status: 429, statusText: 'Too Many Requests' }),
    );
    expect(mapped.code).toBe('api/rate-limit');
  });

  it('maps HTTP 500 to api/server-error', () => {
    const mapped = mapCoinGeckoError(
      new HttpErrorResponse({ status: 503, statusText: 'Unavailable' }),
    );
    expect(mapped.code).toBe('api/server-error');
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { environment } from '@env/environment';
import { PRICE_CACHE_TTL_MS } from './coingecko.types';

import { CoinGeckoService } from './coingecko.service';

const PRICES_URL = `${environment.coingecko.baseUrl}/simple/price`;

describe('CoinGeckoService', () => {
  let service: CoinGeckoService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    service = TestBed.inject(CoinGeckoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    vi.restoreAllMocks();
  });

  it('returns an empty map for empty input without HTTP', async () => {
    await expect(service.getPrices([])).resolves.toEqual({});
    httpMock.expectNone(PRICES_URL);
  });

  it('maps CoinGecko simple price response to PriceMap', async () => {
    const promise = service.getPrices(['bitcoin', 'ethereum']);

    const req = httpMock.expectOne(`${PRICES_URL}?ids=bitcoin,ethereum&vs_currencies=usd`);
    req.flush({
      bitcoin: { usd: 67_000 },
      ethereum: { usd: 3_400 },
    });

    await expect(promise).resolves.toEqual({
      bitcoin: 67_000,
      ethereum: 3_400,
    });
  });

  it('deduplicates asset ids before fetching', async () => {
    const promise = service.getPrices(['bitcoin', 'bitcoin', 'ethereum']);

    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin,ethereum&vs_currencies=usd`).flush({
      bitcoin: { usd: 67_000 },
      ethereum: { usd: 3_400 },
    });

    await expect(promise).resolves.toEqual({
      bitcoin: 67_000,
      ethereum: 3_400,
    });
  });

  it('omits ids missing from the CoinGecko response', async () => {
    const promise = service.getPrices(['bitcoin', 'unknown-coin']);

    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin,unknown-coin&vs_currencies=usd`).flush({
      bitcoin: { usd: 67_000 },
    });

    await expect(promise).resolves.toEqual({ bitcoin: 67_000 });
  });

  it('returns cached prices without a second HTTP request within TTL', async () => {
    const first = service.getPrices(['bitcoin']);
    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin&vs_currencies=usd`).flush({
      bitcoin: { usd: 67_000 },
    });
    await first;

    const second = await service.getPrices(['bitcoin']);

    expect(second).toEqual({ bitcoin: 67_000 });
    httpMock.expectNone(PRICES_URL);
  });

  it('refetches stale cache entries after TTL expires', async () => {
    let now = 1_000_000;
    vi.spyOn(Date, 'now').mockImplementation(() => now);

    const first = service.getPrices(['bitcoin']);
    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin&vs_currencies=usd`).flush({
      bitcoin: { usd: 67_000 },
    });
    await first;

    now += PRICE_CACHE_TTL_MS;

    const second = service.getPrices(['bitcoin']);
    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin&vs_currencies=usd`).flush({
      bitcoin: { usd: 68_000 },
    });

    await expect(second).resolves.toEqual({ bitcoin: 68_000 });
  });

  it('throws AppError when CoinGecko keeps returning HTTP 429', async () => {
    vi.useFakeTimers();

    const promise = service.getPrices(['solana']);

    for (let attempt = 0; attempt < 3; attempt++) {
      httpMock.expectOne(`${PRICES_URL}?ids=solana&vs_currencies=usd`).flush(null, {
        status: 429,
        statusText: 'Too Many Requests',
      });
      if (attempt < 2) {
        await vi.advanceTimersByTimeAsync(1_000 * 2 ** attempt);
      }
    }

    await expect(promise).rejects.toMatchObject({ code: 'api/rate-limit' });
    vi.useRealTimers();
  });

  it('retries on HTTP 429 and succeeds on a later attempt', async () => {
    vi.useFakeTimers();

    const promise = service.getPrices(['bitcoin']);

    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin&vs_currencies=usd`).flush(null, {
      status: 429,
      statusText: 'Too Many Requests',
    });
    await vi.advanceTimersByTimeAsync(1_000);

    httpMock.expectOne(`${PRICES_URL}?ids=bitcoin&vs_currencies=usd`).flush({
      bitcoin: { usd: 67_000 },
    });

    await expect(promise).resolves.toEqual({ bitcoin: 67_000 });
    vi.useRealTimers();
  });
});

import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { environment } from '@env/environment';

import { AssetsService } from './assets.service';

describe('AssetsService', () => {
  let service: AssetsService;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    service = TestBed.inject(AssetsService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('returns an empty array for queries shorter than two characters', async () => {
    await expect(service.search('b')).resolves.toEqual([]);
    httpMock.expectNone(`${environment.coingecko.baseUrl}/search`);
  });

  it('maps CoinGecko coins to AssetSearchResult and limits to ten items', async () => {
    const promise = service.search('bit');

    const req = httpMock.expectOne(`${environment.coingecko.baseUrl}/search?query=bit`);
    req.flush({
      coins: Array.from({ length: 12 }, (_, index) => ({
        id: `coin-${index}`,
        name: `Coin ${index}`,
        symbol: `c${index}`,
        market_cap_rank: index + 1,
        thumb: `https://example.com/${index}.png`,
      })),
    });

    const results = await promise;

    expect(results).toHaveLength(10);
    expect(results[0]).toEqual({
      id: 'coin-0',
      name: 'Coin 0',
      symbol: 'C0',
      marketCapRank: 1,
      thumbUrl: 'https://example.com/0.png',
    });
  });

  it('returns cached results without a second HTTP request', async () => {
    const first = service.search('eth');
    httpMock.expectOne(`${environment.coingecko.baseUrl}/search?query=eth`).flush({
      coins: [
        {
          id: 'ethereum',
          name: 'Ethereum',
          symbol: 'eth',
          market_cap_rank: 2,
          thumb: 'https://example.com/eth.png',
        },
      ],
    });
    await first;

    const second = await service.search('ETH');

    expect(second).toHaveLength(1);
    expect(second[0]?.id).toBe('ethereum');
    httpMock.expectNone(`${environment.coingecko.baseUrl}/search`);
  });

  it('throws AppError when CoinGecko returns HTTP 429', async () => {
    const promise = service.search('sol');
    httpMock.expectOne(`${environment.coingecko.baseUrl}/search?query=sol`).flush(null, {
      status: 429,
      statusText: 'Too Many Requests',
    });

    await expect(promise).rejects.toMatchObject({ code: 'api/rate-limit' });
  });

  it('stores and retrieves selected assets from the local cache', () => {
    const asset = {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      marketCapRank: 1,
      thumbUrl: 'https://example.com/btc.png',
    };

    service.cacheSelected(asset);

    expect(service.getCachedSelected('bitcoin')).toEqual(asset);
    expect(service.getCachedSelected('missing')).toBeUndefined();
  });
});

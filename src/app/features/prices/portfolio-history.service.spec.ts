import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { CoinGeckoService } from './coingecko.service';
import { PortfolioHistoryService } from './portfolio-history.service';
import { PriceSnapshotsService } from './price-snapshots.service';

describe('PortfolioHistoryService', () => {
  let service: PortfolioHistoryService;
  let snapshots: { getForRange: ReturnType<typeof vi.fn>; upsert: ReturnType<typeof vi.fn> };
  let coinGecko: { getDailyPrices: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    snapshots = {
      getForRange: vi.fn().mockResolvedValue(new Map()),
      upsert: vi.fn().mockResolvedValue(undefined),
    };
    coinGecko = {
      getDailyPrices: vi.fn().mockResolvedValue(new Map([['2026-06-01', 60_000]])),
    };

    TestBed.configureTestingModule({
      providers: [
        PortfolioHistoryService,
        { provide: PriceSnapshotsService, useValue: snapshots },
        { provide: CoinGeckoService, useValue: coinGecko },
      ],
    });

    service = TestBed.inject(PortfolioHistoryService);
  });

  it('fetches missing daily prices and upserts snapshots', async () => {
    const tx = makeTransaction({
      asset: bitcoinAsset,
      executedAt: '2026-06-01T12:00:00.000Z',
      quantity: 1,
    });

    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-06-07T12:00:00.000Z'));

    const points = await service.loadSeries([tx], ['bitcoin'], 7);

    expect(coinGecko.getDailyPrices).toHaveBeenCalledWith('bitcoin', 7);
    expect(snapshots.upsert).toHaveBeenCalled();
    expect(points.some((point) => point.valueUsd > 0)).toBe(true);

    vi.useRealTimers();
  });
});

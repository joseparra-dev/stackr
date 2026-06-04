import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { PortfolioHistoryService } from '@features/prices/portfolio-history.service';

import { PortfolioHistoryStore } from './portfolio-history.store';

describe('PortfolioHistoryStore', () => {
  let store: PortfolioHistoryStore;
  let service: { loadSeries: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    service = {
      loadSeries: vi.fn().mockResolvedValue([
        { date: '2026-06-01', valueUsd: 100 },
        { date: '2026-06-02', valueUsd: 200 },
      ]),
    };

    TestBed.configureTestingModule({
      providers: [
        PortfolioHistoryStore,
        { provide: PortfolioHistoryService, useValue: service },
      ],
    });

    store = TestBed.inject(PortfolioHistoryStore);
  });

  it('loads series for the selected range', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset });
    await store.load([tx], ['bitcoin']);

    expect(service.loadSeries).toHaveBeenCalledWith([tx], ['bitcoin'], 7);
    expect(store.points().length).toBe(2);
    expect(store.hasEnoughData()).toBe(true);
  });

  it('clears points when there are no transactions', async () => {
    await store.load([], []);
    expect(store.points()).toEqual([]);
    expect(service.loadSeries).not.toHaveBeenCalled();
  });
});

import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HoldingsStore } from '@features/holdings/holdings.store';
import { PricesStore } from '@features/prices/prices.store';
import type { PriceMap } from '@features/prices/coingecko.types';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { HoldingsPage } from './holdings.page';

describe('HoldingsPage', () => {
  let fixture: ComponentFixture<HoldingsPage>;
  let router: Router;
  let mocks: {
    transactions: ReturnType<typeof signal<TransactionWithAsset[]>>;
    prices: ReturnType<typeof signal<PriceMap>>;
    transactionsStore: {
      transactions: ReturnType<typeof signal<TransactionWithAsset[]>>['asReadonly'];
      loading: ReturnType<typeof signal<boolean>>['asReadonly'];
      load: ReturnType<typeof vi.fn>;
    };
    pricesStore: { subscribeToAssets: ReturnType<typeof vi.fn> };
  };

  beforeEach(async () => {
    const transactions = signal<TransactionWithAsset[]>([]);
    const loading = signal(false);
    const prices = signal<PriceMap>({});

    mocks = {
      transactions,
      prices,
      transactionsStore: {
        transactions: transactions.asReadonly(),
        loading: loading.asReadonly(),
        load: vi.fn().mockResolvedValue(undefined),
      },
      pricesStore: {
        prices: prices.asReadonly(),
        loading: signal(false).asReadonly(),
        error: signal(null).asReadonly(),
        subscribeToAssets: vi.fn(),
        clearError: vi.fn(),
      },
    };

    await TestBed.configureTestingModule({
      imports: [HoldingsPage],
      providers: [
        provideRouter([]),
        HoldingsStore,
        { provide: TransactionsStore, useValue: mocks.transactionsStore },
        { provide: PricesStore, useValue: mocks.pricesStore },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(HoldingsPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows empty state when there are no open holdings', () => {
    expect(fixture.nativeElement.textContent).toContain('No holdings yet');
  });

  it('shows holdings table when positions exist', async () => {
    mocks.transactions.set([
      makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 }),
    ]);
    mocks.prices.set({ bitcoin: 60_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('BTC');
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
  });

  it('navigates to filtered transactions when a row is selected', async () => {
    mocks.transactions.set([makeTransaction({ asset: bitcoinAsset })]);
    mocks.prices.set({ bitcoin: 60_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentInstance.onHoldingSelect({
      assetId: 'bitcoin',
      symbol: 'BTC',
      name: 'Bitcoin',
      thumbUrl: '',
      quantity: 1,
      avgCostUsd: 1,
      currentPriceUsd: 1,
      costBasisUsd: 1,
      currentValueUsd: 1,
      pnlRealizedUsd: 0,
      pnlUnrealizedUsd: 0,
      pnlTotalUsd: 0,
      pnlPercent: 0,
    });

    expect(router.navigate).toHaveBeenCalledWith(['/transactions'], {
      queryParams: { asset: 'bitcoin' },
    });
  });
});

import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { PricesStore } from '@features/prices/prices.store';
import type { PriceMap } from '@features/prices/coingecko.types';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { HoldingsStore } from './holdings.store';

function makeStoreMocks() {
  const transactions = signal<TransactionWithAsset[]>([]);
  const prices = signal<PriceMap>({});

  return {
    transactions,
    prices,
    transactionsStore: {
      transactions: transactions.asReadonly(),
      loading: signal(false).asReadonly(),
      error: signal(null).asReadonly(),
      totalCount: signal(0).asReadonly(),
      hasTransactions: signal(false).asReadonly(),
      load: async () => undefined,
      clearError: () => undefined,
      add: async () => undefined,
      edit: async () => undefined,
      remove: async () => undefined,
    },
    pricesStore: {
      prices: prices.asReadonly(),
      loading: signal(false).asReadonly(),
      error: signal(null).asReadonly(),
      subscribeToAssets: () => undefined,
      clearError: () => undefined,
    },
  };
}

describe('HoldingsStore', () => {
  let mocks: ReturnType<typeof makeStoreMocks>;

  beforeEach(() => {
    mocks = makeStoreMocks();
    TestBed.configureTestingModule({
      providers: [
        HoldingsStore,
        { provide: TransactionsStore, useValue: mocks.transactionsStore },
        { provide: PricesStore, useValue: mocks.pricesStore },
      ],
    });
  });

  it('starts with empty holdings and zero totals', () => {
    const store = TestBed.inject(HoldingsStore);

    expect(store.holdings()).toEqual([]);
    expect(store.totalValueUSD()).toBe(0);
    expect(store.totalCostUSD()).toBe(0);
    expect(store.totalPnLUSD()).toBe(0);
    expect(store.totalPnLPercent()).toBe(0);
  });

  it('derives holdings from transactions and prices', () => {
    const store = TestBed.inject(HoldingsStore);

    mocks.transactions.set([
      makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 }),
    ]);
    mocks.prices.set({ bitcoin: 60_000 });

    expect(store.holdings()).toHaveLength(1);
    expect(store.holdings()[0]?.symbol).toBe('BTC');
    expect(store.totalValueUSD()).toBe(60_000);
    expect(store.totalCostUSD()).toBe(50_000);
    expect(store.totalPnLUSD()).toBe(10_000);
    expect(store.totalPnLPercent()).toBe(20);
  });

  it('updates totals reactively when prices change', () => {
    const store = TestBed.inject(HoldingsStore);

    mocks.transactions.set([
      makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 }),
    ]);
    mocks.prices.set({ bitcoin: 60_000 });

    expect(store.totalValueUSD()).toBe(60_000);

    mocks.prices.set({ bitcoin: 70_000 });

    expect(store.totalValueUSD()).toBe(70_000);
    expect(store.totalPnLUSD()).toBe(20_000);
  });
});

import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HoldingsStore } from '@features/holdings/holdings.store';
import { PricesStore } from '@features/prices/prices.store';
import type { PriceMap } from '@features/prices/coingecko.types';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { DashboardPage } from './dashboard.page';

@Component({
  selector: 'app-allocation-chart',
  template: '<div data-testid="allocation-chart-stub"></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
class AllocationChartStub {}

function makeStoreMocks() {
  const transactions = signal<TransactionWithAsset[]>([]);
  const loading = signal(false);
  const prices = signal<PriceMap>({});

  return {
    transactions,
    loading,
    prices,
    transactionsStore: {
      transactions: transactions.asReadonly(),
      loading: loading.asReadonly(),
      error: signal(null).asReadonly(),
      totalCount: computed(() => transactions().length),
      hasTransactions: computed(() => transactions().length > 0),
      load: vi.fn().mockResolvedValue(undefined),
      clearError: vi.fn(),
      add: vi.fn(),
      edit: vi.fn(),
      remove: vi.fn(),
    },
    pricesStore: {
      prices: prices.asReadonly(),
      loading: signal(false).asReadonly(),
      error: signal(null).asReadonly(),
      subscribeToAssets: vi.fn(),
      clearError: vi.fn(),
    },
  };
}

describe('DashboardPage', () => {
  let fixture: ComponentFixture<DashboardPage>;
  let mocks: ReturnType<typeof makeStoreMocks>;

  beforeEach(async () => {
    mocks = makeStoreMocks();

    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        HoldingsStore,
        { provide: TransactionsStore, useValue: mocks.transactionsStore },
        { provide: PricesStore, useValue: mocks.pricesStore },
      ],
    })
      .overrideComponent(DashboardPage, {
        set: { imports: [AllocationChartStub] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads transactions on init', () => {
    expect(mocks.transactionsStore.load).toHaveBeenCalled();
  });

  it('shows empty state when there are no transactions', () => {
    expect(fixture.nativeElement.textContent).toContain('Your portfolio at a glance');
    expect(fixture.nativeElement.textContent).not.toContain('Total value');
  });

  it('shows summary cards when transactions exist', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });

    mocks.transactions.set([tx]);
    mocks.prices.set({ bitcoin: 60_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Total value');
    expect(text).toContain('Total P&L');
    expect(text).toContain('Top holding');
    expect(text).toContain('BTC');
  });

  it('subscribes to prices for held asset ids', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset });

    mocks.transactions.set([tx]);

    fixture.detectChanges();
    await fixture.whenStable();

    expect(mocks.pricesStore.subscribeToAssets).toHaveBeenCalledWith(['bitcoin']);
  });

  it('applies success tone for positive PnL', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });

    mocks.transactions.set([tx]);
    mocks.prices.set({ bitcoin: 60_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.text-success')).toBeTruthy();
  });

  it('shows allocation chart when portfolio has value', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });

    mocks.transactions.set([tx]);
    mocks.prices.set({ bitcoin: 60_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[data-testid="allocation-chart-stub"]')).toBeTruthy();
  });

  it('hides allocation chart when portfolio value is zero', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });

    mocks.transactions.set([tx]);
    mocks.prices.set({});

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('[data-testid="allocation-chart-stub"]')).toBeNull();
  });

  it('applies danger tone for negative PnL', async () => {
    const tx = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });

    mocks.transactions.set([tx]);
    mocks.prices.set({ bitcoin: 40_000 });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.text-danger')).toBeTruthy();
  });
});

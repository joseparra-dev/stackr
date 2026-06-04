import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { Router } from '@angular/router';

import { HoldingsStore } from '@features/holdings/holdings.store';
import { PricesStore } from '@features/prices/prices.store';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { Holding } from '@shared/utils/holdings.types';

import { TRANSACTIONS_ASSET_FILTER_PARAM } from '@features/transactions/transactions-filter';

import { HoldingsTable } from './holdings-table';
import { nextSortState, sortHoldings, type HoldingsSortKey, type SortDirection } from './holdings-sort';

@Component({
  selector: 'app-holdings-page',
  imports: [HoldingsTable],
  templateUrl: './holdings.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsPage {
  private readonly router = inject(Router);
  private readonly transactionsStore = inject(TransactionsStore);
  private readonly pricesStore = inject(PricesStore);
  private readonly holdingsStore = inject(HoldingsStore);

  private readonly sortKey = signal<HoldingsSortKey>('currentValue');
  private readonly sortDirection = signal<SortDirection>('desc');

  readonly loading = this.transactionsStore.loading;
  readonly hasHoldings = computed(() => this.holdingsStore.holdings().length > 0);

  readonly sortedHoldings = computed(() =>
    sortHoldings(
      this.holdingsStore.holdings(),
      this.sortKey(),
      this.sortDirection(),
    ),
  );

  readonly tableSortKey = this.sortKey.asReadonly();
  readonly tableSortDirection = this.sortDirection.asReadonly();

  constructor() {
    void this.transactionsStore.load();

    effect(() => {
      const assetIds = this.transactionsStore.transactions().map((tx) => tx.assetId);
      untracked(() => this.pricesStore.subscribeToAssets(assetIds));
    });
  }

  onSortChange(key: HoldingsSortKey): void {
    const next = nextSortState(this.sortKey(), this.sortDirection(), key);
    this.sortKey.set(next.key);
    this.sortDirection.set(next.direction);
  }

  onHoldingSelect(holding: Holding): void {
    void this.router.navigate(['/transactions'], {
      queryParams: { [TRANSACTIONS_ASSET_FILTER_PARAM]: holding.assetId },
    });
  }
}

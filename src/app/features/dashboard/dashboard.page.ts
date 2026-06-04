import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  untracked,
} from '@angular/core';

import { AllocationChart } from './allocation-chart';
import { HoldingsStore } from '@features/holdings/holdings.store';
import { PricesStore } from '@features/prices/prices.store';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { Holding } from '@shared/utils/holdings.types';
import { formatPercent, formatSignedUsd, formatUsd } from '@shared/utils/format-usd';

@Component({
  selector: 'app-dashboard',
  imports: [AllocationChart],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly transactionsStore = inject(TransactionsStore);
  private readonly pricesStore = inject(PricesStore);
  private readonly holdingsStore = inject(HoldingsStore);

  readonly loading = this.transactionsStore.loading;
  readonly hasTransactions = this.transactionsStore.hasTransactions;
  readonly holdings = this.holdingsStore.holdings;
  readonly totalValueUSD = this.holdingsStore.totalValueUSD;
  readonly totalPnLUSD = this.holdingsStore.totalPnLUSD;
  readonly totalPnLPercent = this.holdingsStore.totalPnLPercent;

  readonly showAllocation = computed(
    () => this.hasTransactions() && this.totalValueUSD() > 0,
  );

  readonly topHolding = computed((): Holding | null => {
    const holdings = this.holdingsStore.holdings();
    if (holdings.length === 0) return null;

    return holdings.reduce((best, holding) =>
      holding.currentValueUsd > best.currentValueUsd ? holding : best,
    );
  });

  readonly topHoldingPercent = computed(() => {
    const top = this.topHolding();
    const total = this.totalValueUSD();
    if (!top || total <= 0) return 0;
    return (top.currentValueUsd / total) * 100;
  });

  protected readonly formatUsd = formatUsd;
  protected readonly formatSignedUsd = formatSignedUsd;
  protected readonly formatPercent = formatPercent;

  protected readonly pnlToneClass = computed(() => {
    const pnl = this.totalPnLUSD();
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-(--color-text)';
  });

  constructor() {
    void this.transactionsStore.load();

    effect(() => {
      const assetIds = this.transactionsStore.transactions().map((tx) => tx.assetId);
      untracked(() => this.pricesStore.subscribeToAssets(assetIds));
    });
  }
}

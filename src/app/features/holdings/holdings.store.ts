import { computed, inject, Injectable } from '@angular/core';

import { PricesStore } from '@features/prices/prices.store';
import { TransactionsStore } from '@features/transactions/transactions.store';
import { calculateHoldings } from '@shared/utils/math';

@Injectable({ providedIn: 'root' })
export class HoldingsStore {
  private readonly transactionsStore = inject(TransactionsStore);
  private readonly pricesStore = inject(PricesStore);

  readonly holdings = computed(() =>
    calculateHoldings(this.transactionsStore.transactions(), this.pricesStore.prices()),
  );

  readonly totalValueUSD = computed(() =>
    this.holdings().reduce((sum, holding) => sum + holding.currentValueUsd, 0),
  );

  readonly totalCostUSD = computed(() =>
    this.holdings().reduce((sum, holding) => sum + holding.costBasisUsd, 0),
  );

  readonly totalPnLUSD = computed(() =>
    this.holdings().reduce((sum, holding) => sum + holding.pnlTotalUsd, 0),
  );

  readonly totalPnLPercent = computed(() => {
    const cost = this.totalCostUSD();
    return cost > 0 ? (this.totalPnLUSD() / cost) * 100 : 0;
  });
}

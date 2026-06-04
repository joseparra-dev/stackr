import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { AssetSearchResult } from '@features/assets/assets.types';

import { TransactionAssetFilter } from './transaction-asset-filter';
import type { TransactionFilters, TransactionTypeFilter } from './transactions-filter';

@Component({
  selector: 'app-transaction-filter-bar',
  imports: [TransactionAssetFilter],
  templateUrl: './transaction-filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFilterBar {
  readonly filters = input.required<TransactionFilters>();
  readonly assetOptions = input.required<readonly AssetSearchResult[]>();
  readonly showClear = input(false);

  readonly filtersChange = output<TransactionFilters>();
  readonly clearFilters = output<void>();

  protected readonly typeOptions = [
    { value: 'all' as const, label: 'All' },
    { value: 'buy' as const, label: 'Buy' },
    { value: 'sell' as const, label: 'Sell' },
  ];

  onAssetIdsChange(assetIds: readonly string[]): void {
    this.emitChange({ assetIds });
  }

  onTypeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as TransactionTypeFilter;
    this.emitChange({ type: value });
  }

  onFromDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.emitChange({ fromDate: value || null });
  }

  onToDateChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.emitChange({ toDate: value || null });
  }

  private emitChange(patch: Partial<TransactionFilters>): void {
    this.filtersChange.emit({ ...this.filters(), ...patch });
  }
}

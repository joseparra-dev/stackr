import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import type { AssetSearchResult } from '@features/assets/assets.types';
import { TranslatePipe } from '@shared/ui';

import { TransactionAssetFilter } from './transaction-asset-filter';
import type { TransactionFilters, TransactionTypeFilter } from './transactions-filter';

@Component({
  selector: 'app-transaction-filter-bar',
  imports: [TransactionAssetFilter, TranslatePipe],
  templateUrl: './transaction-filter-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionFilterBar {
  private readonly i18n = inject(I18nService);

  readonly filters = input.required<TransactionFilters>();
  readonly assetOptions = input.required<readonly AssetSearchResult[]>();
  readonly showClear = input(false);

  readonly filtersChange = output<TransactionFilters>();
  readonly clearFilters = output<void>();

  protected readonly typeOptions = computed(() => {
    this.i18n.locale();
    return [
      { value: 'all' as const, label: this.i18n.translate('transactions.filters.typeAll') },
      { value: 'buy' as const, label: this.i18n.translate('transactions.filters.typeBuy') },
      { value: 'sell' as const, label: this.i18n.translate('transactions.filters.typeSell') },
    ];
  });

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

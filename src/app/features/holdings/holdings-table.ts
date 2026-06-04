import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { formatQuantity } from '@features/transactions/transaction-format';
import { I18nService } from '@core/i18n/i18n.service';
import type { Holding } from '@shared/utils/holdings.types';
import { formatPercent, formatSignedUsd, formatUsd } from '@shared/utils/format-usd';
import { TranslatePipe } from '@shared/ui';

import { ariaSortValue, type HoldingsSortKey, type SortDirection } from './holdings-sort';

interface ColumnDef {
  readonly key: HoldingsSortKey;
  readonly labelKey: string;
  readonly align: 'left' | 'right';
}

@Component({
  selector: 'app-holdings-table',
  imports: [TranslatePipe],
  templateUrl: './holdings-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsTable {
  private readonly i18n = inject(I18nService);

  readonly holdings = input.required<readonly Holding[]>();
  readonly sortKey = input.required<HoldingsSortKey>();
  readonly sortDirection = input.required<SortDirection>();

  readonly sortChange = output<HoldingsSortKey>();
  readonly rowSelect = output<Holding>();

  protected readonly columns = computed((): readonly ColumnDef[] => {
    this.i18n.locale();
    return [
      { key: 'asset', labelKey: 'holdings.table.columns.asset', align: 'left' },
      { key: 'quantity', labelKey: 'holdings.table.columns.quantity', align: 'right' },
      { key: 'avgCost', labelKey: 'holdings.table.columns.avgCost', align: 'right' },
      { key: 'currentPrice', labelKey: 'holdings.table.columns.currentPrice', align: 'right' },
      { key: 'currentValue', labelKey: 'holdings.table.columns.currentValue', align: 'right' },
      { key: 'pnl', labelKey: 'holdings.table.columns.pnl', align: 'right' },
    ];
  });

  protected readonly formatQuantity = formatQuantity;
  protected readonly formatUsd = formatUsd;
  protected readonly formatSignedUsd = formatSignedUsd;
  protected readonly formatPercent = formatPercent;

  protected ariaSort(key: HoldingsSortKey): 'ascending' | 'descending' | 'none' {
    return ariaSortValue(key, this.sortKey(), this.sortDirection());
  }

  protected toggleSort(key: HoldingsSortKey): void {
    this.sortChange.emit(key);
  }

  protected selectRow(holding: Holding): void {
    this.rowSelect.emit(holding);
  }

  protected formatPrice(price: number | null): string {
    return price === null ? '—' : formatUsd(price);
  }

  protected pnlToneClass(pnl: number): string {
    if (pnl > 0) return 'text-success';
    if (pnl < 0) return 'text-danger';
    return 'text-(--color-text)';
  }

  protected cardAriaLabel(symbol: string): string {
    this.i18n.locale();
    return this.i18n.translate('holdings.table.cardAria', { symbol });
  }
}

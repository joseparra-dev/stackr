import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import { formatQuantity } from '@features/transactions/transaction-format';
import type { Holding } from '@shared/utils/holdings.types';
import { formatPercent, formatSignedUsd, formatUsd } from '@shared/utils/format-usd';

import { ariaSortValue, type HoldingsSortKey, type SortDirection } from './holdings-sort';

interface ColumnDef {
  readonly key: HoldingsSortKey;
  readonly label: string;
  readonly align: 'left' | 'right';
}

@Component({
  selector: 'app-holdings-table',
  templateUrl: './holdings-table.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingsTable {
  readonly holdings = input.required<readonly Holding[]>();
  readonly sortKey = input.required<HoldingsSortKey>();
  readonly sortDirection = input.required<SortDirection>();

  readonly sortChange = output<HoldingsSortKey>();
  readonly rowSelect = output<Holding>();

  protected readonly columns: readonly ColumnDef[] = [
    { key: 'asset', label: 'Asset', align: 'left' },
    { key: 'quantity', label: 'Quantity', align: 'right' },
    { key: 'avgCost', label: 'Avg cost', align: 'right' },
    { key: 'currentPrice', label: 'Current price', align: 'right' },
    { key: 'currentValue', label: 'Current value', align: 'right' },
    { key: 'pnl', label: 'P&L', align: 'right' },
  ];

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
}

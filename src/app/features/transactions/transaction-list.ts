import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';

import {
  formatQuantity,
  formatTransactionDate,
  formatTypeLabel,
  formatUsd,
} from './transaction-format';
import { TransactionRowActions } from './transaction-row-actions';
import { transactionTotal } from './transaction-total';
import type { TransactionWithAsset } from './transactions.types';

@Component({
  selector: 'app-transaction-list',
  imports: [TransactionRowActions],
  templateUrl: './transaction-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionList {
  readonly transactions = input.required<TransactionWithAsset[]>();

  readonly edit = output<TransactionWithAsset>();
  readonly delete = output<TransactionWithAsset>();

  private readonly openMenuId = signal<string | null>(null);

  protected readonly formatQuantity = formatQuantity;
  protected readonly formatUsd = formatUsd;
  protected readonly formatTransactionDate = formatTransactionDate;
  protected readonly formatTypeLabel = formatTypeLabel;
  protected readonly transactionTotal = transactionTotal;

  protected isMenuOpen(id: string): boolean {
    return this.openMenuId() === id;
  }

  protected toggleMenu(id: string): void {
    this.openMenuId.update((current) => (current === id ? null : id));
  }

  protected closeMenu(): void {
    this.openMenuId.set(null);
  }

  protected onEdit(tx: TransactionWithAsset): void {
    this.closeMenu();
    this.edit.emit(tx);
  }

  protected onDelete(tx: TransactionWithAsset): void {
    this.closeMenu();
    this.delete.emit(tx);
  }

  protected actionsLabel(tx: TransactionWithAsset): string {
    return `Actions for ${tx.asset.symbol} ${formatTypeLabel(tx.type)}`;
  }

  protected typeClass(type: TransactionWithAsset['type']): string {
    return type === 'buy' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger';
  }
}

import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@shared/ui';

import {
  formatQuantity,
  formatTransactionDate,
  formatUsd,
} from './transaction-format';
import { TransactionRowActions } from './transaction-row-actions';
import { transactionTotal } from './transaction-total';
import type { TransactionWithAsset } from './transactions.types';

@Component({
  selector: 'app-transaction-list',
  imports: [TransactionRowActions, TranslatePipe],
  templateUrl: './transaction-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionList {
  private readonly i18n = inject(I18nService);

  readonly transactions = input.required<readonly TransactionWithAsset[]>();

  readonly edit = output<TransactionWithAsset>();
  readonly delete = output<TransactionWithAsset>();

  protected readonly formatQuantity = formatQuantity;
  protected readonly formatUsd = formatUsd;
  protected readonly formatTransactionDate = formatTransactionDate;
  protected readonly transactionTotal = transactionTotal;

  protected readonly columnKeys = {
    date: 'transactions.list.columns.date',
    asset: 'transactions.list.columns.asset',
    type: 'transactions.list.columns.type',
    quantity: 'transactions.list.columns.quantity',
    price: 'transactions.list.columns.price',
    fee: 'transactions.list.columns.fee',
    total: 'transactions.list.columns.total',
    actions: 'transactions.list.columns.actions',
  } as const;

  protected onEdit(tx: TransactionWithAsset): void {
    this.edit.emit(tx);
  }

  protected onDelete(tx: TransactionWithAsset): void {
    this.delete.emit(tx);
  }

  protected typeLabel(type: TransactionWithAsset['type']): string {
    this.i18n.locale();
    return this.i18n.translate(`transactions.list.type.${type}`);
  }

  protected actionsLabel(tx: TransactionWithAsset): string {
    this.i18n.locale();
    return this.i18n.translate('transactions.list.actionsAria', {
      symbol: tx.asset.symbol,
      type: this.typeLabel(tx.type),
    });
  }

  protected cardAriaLabel(tx: TransactionWithAsset): string {
    this.i18n.locale();
    return this.i18n.translate('transactions.list.cardAria', {
      symbol: tx.asset.symbol,
      type: this.typeLabel(tx.type),
    });
  }

  protected actionsLabelShort(symbol: string): string {
    this.i18n.locale();
    return this.i18n.translate('transactions.list.actionsAriaShort', { symbol });
  }

  protected typeClass(type: TransactionWithAsset['type']): string {
    return type === 'buy' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger';
  }
}

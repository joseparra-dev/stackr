import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucidePlus } from '@lucide/angular';
import { firstValueFrom } from 'rxjs';

import { errorMessage } from '@core/errors/app-error';
import { DeleteTransactionDialog } from '@features/transactions/delete-transaction-dialog';
import type { DeleteTransactionDialogData } from '@features/transactions/delete-transaction-dialog';
import { TransactionForm } from '@features/transactions/transaction-form/transaction-form';
import type { TransactionFormDialogData } from '@features/transactions/transaction-form/transaction-form.dialog.types';
import { TransactionList } from '@features/transactions/transaction-list';
import { TransactionsStore } from '@features/transactions/transactions.store';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';
import { ToastService } from '@shared/ui';

const DIALOG_OPTIONS = {
  width: '100%',
  maxWidth: '32rem',
  panelClass: 'stackr-dialog-panel',
  backdropClass: 'stackr-dialog-backdrop',
} as const;

@Component({
  selector: 'app-transactions-page',
  imports: [LucidePlus, TransactionList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.page.html',
})
export class TransactionsPage {
  private readonly dialog = inject(Dialog);
  private readonly store = inject(TransactionsStore);
  private readonly toast = inject(ToastService);

  readonly transactions = this.store.transactions;
  readonly loading = this.store.loading;
  readonly error = this.store.error;
  readonly hasTransactions = this.store.hasTransactions;

  protected readonly errorMessage = errorMessage;

  constructor() {
    void this.store.load();
  }

  protected openCreateDialog(): void {
    this.dialog.open<boolean, TransactionFormDialogData>(TransactionForm, {
      ...DIALOG_OPTIONS,
      data: { mode: 'create' },
    });
  }

  protected openEditDialog(tx: TransactionWithAsset): void {
    this.dialog.open<boolean, TransactionFormDialogData>(TransactionForm, {
      ...DIALOG_OPTIONS,
      data: { mode: 'edit', transaction: tx, asset: tx.asset },
    });
  }

  protected async confirmDelete(tx: TransactionWithAsset): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog.open<boolean, DeleteTransactionDialogData>(DeleteTransactionDialog, {
        ...DIALOG_OPTIONS,
        maxWidth: '28rem',
        data: { assetSymbol: tx.asset.symbol, type: tx.type },
      }).closed,
    );

    if (!confirmed) return;

    try {
      await this.store.remove(tx.id);
      this.toast.success('Transaction deleted.');
    } catch {
      const code = this.store.error()?.code ?? 'unknown';
      this.toast.error(code);
    }
  }
}

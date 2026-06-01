import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { LucidePlus } from '@lucide/angular';

import { TransactionForm } from '@features/transactions/transaction-form/transaction-form';
import type { TransactionFormDialogData } from '@features/transactions/transaction-form/transaction-form.dialog.types';
import {
  TRANSACTION_SAVE_PORT,
  transactionSaveStub,
} from '@features/transactions/transaction-save.port';

@Component({
  selector: 'app-transactions-page',
  imports: [LucidePlus],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.page.html',
})
export class TransactionsPage {
  private readonly dialog = inject(Dialog);

  openCreateDialog(): void {
    this.dialog.open<boolean, TransactionFormDialogData>(TransactionForm, {
      width: '100%',
      maxWidth: '32rem',
      panelClass: 'stackr-dialog-panel',
      backdropClass: 'stackr-dialog-backdrop',
      data: { mode: 'create' },
      providers: [{ provide: TRANSACTION_SAVE_PORT, useValue: transactionSaveStub }],
    });
  }
}

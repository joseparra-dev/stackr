import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@shared/ui';

import type { TransactionType } from './transactions.types';

export interface DeleteTransactionDialogData {
  readonly assetSymbol: string;
  readonly type: TransactionType;
}

@Component({
  selector: 'app-delete-transaction-dialog',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-transaction-dialog.html',
})
export class DeleteTransactionDialog {
  private readonly dialogRef = inject(DialogRef<boolean>);
  private readonly i18n = inject(I18nService);

  protected readonly data = inject<DeleteTransactionDialogData>(DIALOG_DATA);

  protected readonly typeLabel = computed(() =>
    this.i18n.translate(`transactions.list.type.${this.data.type}`),
  );

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}

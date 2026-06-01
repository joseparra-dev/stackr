import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import type { TransactionType } from './transactions.types';

export interface DeleteTransactionDialogData {
  readonly assetSymbol: string;
  readonly type: TransactionType;
}

@Component({
  selector: 'app-delete-transaction-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col gap-5">
      <header>
        <h2 id="delete-transaction-title" class="text-lg font-semibold text-(--color-text)">
          Delete transaction
        </h2>
        <p class="mt-2 text-sm text-(--color-text-muted)">
          This will permanently remove your {{ data.type }} of {{ data.assetSymbol }}. This action
          cannot be undone.
        </p>
      </header>

      <div class="flex justify-end gap-3 border-t border-(--color-border) pt-4">
        <button
          type="button"
          (click)="cancel()"
          class="focus-visible:outline-brand-500 cursor-pointer rounded-lg border border-(--color-border) bg-(--color-surface) px-4 py-2.5 text-sm font-medium text-(--color-text) hover:bg-(--color-surface-2) focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Cancel
        </button>
        <button
          type="button"
          (click)="confirm()"
          class="bg-danger hover:bg-danger/90 focus-visible:outline-brand-500 cursor-pointer rounded-lg px-4 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Delete
        </button>
      </div>
    </div>
  `,
})
export class DeleteTransactionDialog {
  private readonly dialogRef = inject(DialogRef<boolean>);

  protected readonly data = inject<DeleteTransactionDialogData>(DIALOG_DATA);

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}

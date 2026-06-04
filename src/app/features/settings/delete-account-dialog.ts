import { DialogRef } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-delete-account-dialog',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-account-dialog.html',
})
export class DeleteAccountDialog {
  private readonly dialogRef = inject(DialogRef<boolean>);

  protected confirm(): void {
    this.dialogRef.close(true);
  }

  protected cancel(): void {
    this.dialogRef.close(false);
  }
}

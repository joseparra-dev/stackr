import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { LucideMoreHorizontal, LucidePencil, LucideTrash2 } from '@lucide/angular';

@Component({
  selector: 'app-transaction-row-actions',
  imports: [LucideMoreHorizontal, LucidePencil, LucideTrash2],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-row-actions.html',
})
export class TransactionRowActions {
  readonly open = input(false);
  readonly menuId = input.required<string>();
  readonly ariaLabel = input.required<string>();
  readonly variant = input<'table' | 'card'>('table');

  readonly menuToggle = output<void>();
  readonly edit = output<void>();
  readonly delete = output<void>();

  protected panelClass(): string {
    const base =
      'absolute z-10 mt-1 w-36 rounded-lg border border-(--color-border) bg-(--color-surface) py-1 shadow-lg';
    return this.variant() === 'table' ? `${base} right-4` : `${base} right-0`;
  }
}

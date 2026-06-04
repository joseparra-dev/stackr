import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  Overlay,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { LucideMoreHorizontal, LucidePencil, LucideTrash2 } from '@lucide/angular';

import { TranslatePipe } from '@shared/ui';

const MENU_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
    offsetY: -4,
  },
];

@Component({
  selector: 'app-transaction-row-actions',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    TranslatePipe,
    LucideMoreHorizontal,
    LucidePencil,
    LucideTrash2,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transaction-row-actions.html',
})
export class TransactionRowActions {
  readonly menuId = input.required<string>();
  readonly ariaLabel = input.required<string>();

  readonly edit = output<void>();
  readonly delete = output<void>();

  private readonly overlay = inject(Overlay);

  protected readonly menuOpen = signal(false);
  protected readonly menuPositions = MENU_POSITIONS;
  protected readonly scrollStrategy = this.overlay.scrollStrategies.reposition();

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }

  protected onEdit(): void {
    this.closeMenu();
    this.edit.emit();
  }

  protected onDelete(): void {
    this.closeMenu();
    this.delete.emit();
  }
}

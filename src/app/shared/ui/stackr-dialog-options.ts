import type { DialogConfig } from '@angular/cdk/dialog';

export const STACKR_DIALOG_OPTIONS = {
  width: '100%',
  maxWidth: '32rem',
  panelClass: 'stackr-dialog-panel',
  backdropClass: 'stackr-dialog-backdrop',
  autoFocus: 'first-tabbable',
  restoreFocus: true,
} as const satisfies Partial<DialogConfig>;

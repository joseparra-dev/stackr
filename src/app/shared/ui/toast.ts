import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ToastService } from './toast.service';

@Component({
  selector: 'app-toast',
  template: `
    @if (toast(); as message) {
      <div
        role="status"
        aria-live="polite"
        class="fixed right-4 bottom-4 z-[100] max-w-sm rounded-xl border px-4 py-3 text-sm shadow-lg"
        [class.border-success/30]="message.variant === 'success'"
        [class.bg-success/10]="message.variant === 'success'"
        [class.text-success]="message.variant === 'success'"
        [class.border-danger/30]="message.variant === 'error'"
        [class.bg-danger/10]="message.variant === 'error'"
        [class.text-danger]="message.variant === 'error'"
      >
        {{ message.text }}
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  private readonly toastService = inject(ToastService);

  readonly toast = this.toastService.message;
}

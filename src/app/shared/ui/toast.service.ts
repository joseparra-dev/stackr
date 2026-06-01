import { Injectable, signal } from '@angular/core';

import { type AppErrorCode, errorMessage } from '@core/errors/app-error';

export interface ToastMessage {
  readonly text: string;
  readonly variant: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _message = signal<ToastMessage | null>(null);

  readonly message = this._message.asReadonly();

  success(text: string): void {
    this.show(text, 'success');
  }

  error(code: AppErrorCode): void {
    this.show(errorMessage(code), 'error');
  }

  dismiss(): void {
    this._message.set(null);
  }

  private show(text: string, variant: ToastMessage['variant']): void {
    this._message.set({ text, variant });
    setTimeout(() => this._message.set(null), 4000);
  }
}

import { DestroyRef, inject, Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
  private readonly destroyRef = inject(DestroyRef);

  private readonly _isOnline = signal(readNavigatorOnline());

  readonly isOnline = this._isOnline.asReadonly();

  constructor() {
    if (typeof window === 'undefined') return;

    const onOnline = (): void => this._isOnline.set(true);
    const onOffline = (): void => this._isOnline.set(false);

    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);

    this.destroyRef.onDestroy(() => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    });
  }
}

function readNavigatorOnline(): boolean {
  if (typeof navigator === 'undefined') return true;
  return navigator.onLine;
}

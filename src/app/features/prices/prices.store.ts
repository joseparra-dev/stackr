import { inject, Injectable, signal } from '@angular/core';

import type { AppError } from '@core/errors/app-error';

import { CoinGeckoService } from './coingecko.service';
import type { PriceMap } from './coingecko.types';

@Injectable({ providedIn: 'root' })
export class PricesStore {
  private readonly coinGecko = inject(CoinGeckoService);

  private readonly _prices = signal<PriceMap>({});
  private readonly _loading = signal(false);
  private readonly _error = signal<AppError | null>(null);

  readonly prices = this._prices.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  subscribeToAssets(assetIds: readonly string[]): void {
    const unique = [...new Set(assetIds)];

    this.coinGecko.stopPolling();
    this._error.set(null);

    if (unique.length === 0) {
      this._prices.set({});
      this._loading.set(false);
      return;
    }

    this._loading.set(true);

    this.coinGecko.startPolling(
      unique,
      (prices) => {
        this._prices.set(prices);
        this._loading.set(false);
        this._error.set(null);
      },
      (error) => {
        this._error.set(error);
        this._loading.set(false);
      },
    );
  }

  stopPolling(): void {
    this.coinGecko.stopPolling();
    this._prices.set({});
    this._loading.set(false);
  }

  clearError(): void {
    this._error.set(null);
  }
}

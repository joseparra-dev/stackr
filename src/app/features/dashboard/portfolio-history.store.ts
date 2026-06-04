import { computed, inject, Injectable, signal } from '@angular/core';

import { AppError } from '@core/errors/app-error';
import { PortfolioHistoryService } from '@features/prices/portfolio-history.service';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';
import {
  countValuedHistoryDays,
  type DailyPortfolioPoint,
  type HistoryRangeDays,
} from '@shared/utils/portfolio-history';

@Injectable({ providedIn: 'root' })
export class PortfolioHistoryStore {
  private readonly service = inject(PortfolioHistoryService);

  private readonly _rangeDays = signal<HistoryRangeDays>(7);
  private readonly _points = signal<readonly DailyPortfolioPoint[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<AppError | null>(null);

  readonly rangeDays = this._rangeDays.asReadonly();
  readonly points = this._points.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly hasEnoughData = computed(() => countValuedHistoryDays(this._points()) >= 2);

  setRange(days: HistoryRangeDays): void {
    this._rangeDays.set(days);
  }

  clearError(): void {
    this._error.set(null);
  }

  async load(
    transactions: readonly TransactionWithAsset[],
    assetIds: readonly string[],
  ): Promise<void> {
    if (transactions.length === 0 || assetIds.length === 0) {
      this._points.set([]);
      this._loading.set(false);
      this._error.set(null);
      return;
    }

    this._loading.set(true);
    this._error.set(null);

    try {
      const points = await this.service.loadSeries(
        transactions,
        assetIds,
        this._rangeDays(),
      );
      this._points.set(points);
    } catch (cause) {
      this._points.set([]);
      this._error.set(AppError.from(cause));
    } finally {
      this._loading.set(false);
    }
  }
}

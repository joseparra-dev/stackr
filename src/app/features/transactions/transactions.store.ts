import { computed, inject, Injectable, signal } from '@angular/core';

import { AppError } from '@core/errors/app-error';

import { withAsset } from './transactions.mapper';
import { TransactionsService } from './transactions.service';
import type { TransactionInput, TransactionWithAsset } from './transactions.types';

@Injectable({ providedIn: 'root' })
export class TransactionsStore {
  private readonly service = inject(TransactionsService);

  private readonly _transactions = signal<TransactionWithAsset[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<AppError | null>(null);

  readonly transactions = this._transactions.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly totalCount = computed(() => this._transactions().length);
  readonly hasTransactions = computed(() => this.totalCount() > 0);

  async load(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      this._transactions.set(await this.service.list());
    } catch (err) {
      this._error.set(AppError.from(err));
    } finally {
      this._loading.set(false);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  async add(input: TransactionInput): Promise<void> {
    const prev = this._transactions();
    const optimistic = optimisticTransaction(`tmp-${crypto.randomUUID()}`, input);
    this._transactions.set([optimistic, ...prev]);
    try {
      const created = await this.service.create(input);
      const withAssetRow = withAsset(created, input.asset);
      this._transactions.set(
        this._transactions().map((t) => (t.id === optimistic.id ? withAssetRow : t)),
      );
    } catch (err) {
      this._transactions.set(prev);
      this._error.set(AppError.from(err));
      throw err;
    }
  }

  async edit(id: string, input: TransactionInput): Promise<void> {
    const prev = this._transactions();
    const index = prev.findIndex((t) => t.id === id);
    if (index === -1) return;

    const optimistic = optimisticTransaction(id, input);
    this._transactions.set(prev.map((t) => (t.id === id ? optimistic : t)));
    try {
      const updated = await this.service.update(id, input);
      const withAssetRow = withAsset(updated, input.asset);
      this._transactions.set(this._transactions().map((t) => (t.id === id ? withAssetRow : t)));
    } catch (err) {
      this._transactions.set(prev);
      this._error.set(AppError.from(err));
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    const prev = this._transactions();
    this._transactions.set(prev.filter((t) => t.id !== id));
    try {
      await this.service.delete(id);
    } catch (err) {
      this._transactions.set(prev);
      this._error.set(AppError.from(err));
      throw err;
    }
  }
}

function optimisticTransaction(id: string, input: TransactionInput): TransactionWithAsset {
  return {
    id,
    assetId: input.asset.id,
    type: input.type,
    quantity: input.quantity,
    pricePerUnitUsd: input.pricePerUnitUsd,
    feeUsd: input.feeUsd,
    executedAt: input.executedAt,
    notes: input.notes,
    asset: input.asset,
  };
}

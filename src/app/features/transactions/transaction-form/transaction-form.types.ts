import type { AssetSearchResult } from '@features/assets/assets.types';
import type { Transaction, TransactionType } from '../transactions.types';

export interface TransactionFormValue {
  readonly id: string;
  readonly asset: AssetSearchResult | null;
  readonly type: TransactionType;
  readonly quantity: number | null;
  readonly pricePerUnitUsd: number | null;
  readonly feeUsd: number;
  readonly executedAt: string;
  readonly notes: string;
}

export function toFormValue(
  transaction: Transaction,
  asset: AssetSearchResult,
): TransactionFormValue {
  return {
    id: transaction.id,
    asset,
    type: transaction.type,
    quantity: transaction.quantity,
    pricePerUnitUsd: transaction.pricePerUnitUsd,
    feeUsd: transaction.feeUsd,
    executedAt: toDatetimeLocalValue(transaction.executedAt),
    notes: transaction.notes ?? '',
  };
}

export function toPayload(value: TransactionFormValue): Omit<Transaction, 'id'> & { id?: string } {
  return {
    id: value.id || undefined,
    assetId: value.asset!.id,
    type: value.type,
    quantity: value.quantity!,
    pricePerUnitUsd: value.pricePerUnitUsd!,
    feeUsd: value.feeUsd,
    executedAt: new Date(value.executedAt).toISOString(),
    notes: value.notes.trim() || null,
  };
}

export function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

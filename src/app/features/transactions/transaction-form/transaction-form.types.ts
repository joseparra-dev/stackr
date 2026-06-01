import type { AssetSearchResult } from '@features/assets/assets.types';
import { toDatetimeLocalValue as formatDatetimeLocalFromDate } from '@shared/utils/datetime-local';

import type { Transaction, TransactionInput, TransactionType } from '../transactions.types';

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

export function formValueToInput(value: TransactionFormValue): TransactionInput {
  if (!value.asset || value.quantity === null || value.pricePerUnitUsd === null) {
    throw new Error('Cannot build TransactionInput: form is incomplete');
  }

  return {
    asset: value.asset,
    type: value.type,
    quantity: value.quantity,
    pricePerUnitUsd: value.pricePerUnitUsd,
    feeUsd: value.feeUsd,
    executedAt: new Date(value.executedAt).toISOString(),
    notes: value.notes.trim() || null,
  };
}

export function toDatetimeLocalValue(iso: string): string {
  return formatDatetimeLocalFromDate(new Date(iso));
}

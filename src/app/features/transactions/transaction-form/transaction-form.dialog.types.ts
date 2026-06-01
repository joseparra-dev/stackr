import type { AssetSearchResult } from '@features/assets/assets.types';
import type { Transaction } from '@features/transactions/transactions.types';

export type TransactionFormMode = 'create' | 'edit';

export interface TransactionFormDialogData {
  readonly mode: TransactionFormMode;
  readonly transaction?: Transaction;
  readonly asset?: AssetSearchResult;
}

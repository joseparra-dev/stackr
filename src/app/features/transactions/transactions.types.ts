export type TransactionType = 'buy' | 'sell';

export interface Transaction {
  readonly id: string;
  readonly assetId: string;
  readonly type: TransactionType;
  readonly quantity: number; // numeric(28,12) en DB
  readonly pricePerUnitUsd: number; // numeric(20,8)
  readonly feeUsd: number; // default 0
  readonly executedAt: string; // ISO timestamptz
  readonly notes: string | null;
}

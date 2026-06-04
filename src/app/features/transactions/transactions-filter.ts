import type { TransactionWithAsset } from './transactions.types';

export const TRANSACTIONS_ASSET_FILTER_PARAM = 'asset' as const;

export function filterTransactionsByAsset(
  transactions: readonly TransactionWithAsset[],
  assetId: string | null,
): readonly TransactionWithAsset[] {
  if (!assetId) return transactions;
  return transactions.filter((tx) => tx.assetId === assetId);
}

export function assetFilterLabel(
  transactions: readonly TransactionWithAsset[],
  assetId: string | null,
): string | null {
  if (!assetId) return null;
  const match = transactions.find((tx) => tx.assetId === assetId);
  return match?.asset.symbol ?? assetId;
}

import type { AssetSearchResult } from '@features/assets/assets.types';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

export const bitcoinAsset: AssetSearchResult = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  marketCapRank: 1,
  thumbUrl: 'https://cdn.example/btc.png',
};

export const ethereumAsset: AssetSearchResult = {
  id: 'ethereum',
  name: 'Ethereum',
  symbol: 'ETH',
  marketCapRank: 2,
  thumbUrl: 'https://cdn.example/eth.png',
};

type TxOverrides = Partial<Omit<TransactionWithAsset, 'asset'>> & {
  readonly asset?: AssetSearchResult;
};

export function makeTransaction(overrides: TxOverrides = {}): TransactionWithAsset {
  const asset = overrides.asset ?? bitcoinAsset;
  return {
    id: overrides.id ?? 'tx-1',
    assetId: asset.id,
    type: overrides.type ?? 'buy',
    quantity: overrides.quantity ?? 1,
    pricePerUnitUsd: overrides.pricePerUnitUsd ?? 50_000,
    feeUsd: overrides.feeUsd ?? 0,
    executedAt: overrides.executedAt ?? '2026-05-01T12:00:00.000Z',
    notes: overrides.notes ?? null,
    asset,
  };
}

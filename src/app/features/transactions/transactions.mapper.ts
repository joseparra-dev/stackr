import type { AssetSearchResult } from '@features/assets/assets.types';

import type {
  AssetRow,
  Transaction,
  TransactionInput,
  TransactionRow,
  TransactionRpcArgs,
  TransactionWithAsset,
  TransactionWithAssetRow,
} from './transactions.types';

export function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    assetId: row.asset_id,
    type: row.type,
    quantity: Number(row.quantity),
    pricePerUnitUsd: Number(row.price_per_unit_usd),
    feeUsd: Number(row.fee_usd),
    executedAt: row.executed_at,
    notes: row.notes,
  };
}

export function assetRowToSearchResult(row: AssetRow): AssetSearchResult {
  return {
    id: row.id,
    name: row.name,
    symbol: row.symbol,
    marketCapRank: row.market_cap_rank,
    thumbUrl: row.image_url ?? '',
  };
}

export function rowToTransactionWithAsset(row: TransactionWithAssetRow): TransactionWithAsset {
  const transaction = rowToTransaction(row);
  const assetRow = normalizeAssetRow(row.assets);
  if (!assetRow) {
    return {
      ...transaction,
      asset: {
        id: row.asset_id,
        name: row.asset_id,
        symbol: row.asset_id.toUpperCase(),
        marketCapRank: null,
        thumbUrl: '',
      },
    };
  }

  return { ...transaction, asset: assetRowToSearchResult(assetRow) };
}

function normalizeAssetRow(assets: AssetRow | AssetRow[] | null): AssetRow | null {
  if (!assets) return null;
  return Array.isArray(assets) ? (assets[0] ?? null) : assets;
}

export function toRpcArgs(input: TransactionInput): TransactionRpcArgs {
  return {
    p_asset_id: input.asset.id,
    p_asset_symbol: input.asset.symbol,
    p_asset_name: input.asset.name,
    p_asset_image_url: input.asset.thumbUrl,
    p_asset_rank: input.asset.marketCapRank,
    p_type: input.type,
    p_quantity: input.quantity,
    p_price_per_unit_usd: input.pricePerUnitUsd,
    p_fee_usd: input.feeUsd,
    p_executed_at: input.executedAt,
    p_notes: input.notes,
  };
}

export function withAsset(
  transaction: Transaction,
  asset: AssetSearchResult,
): TransactionWithAsset {
  return { ...transaction, asset };
}

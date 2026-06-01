import type {
  Transaction,
  TransactionInput,
  TransactionRow,
  TransactionRpcArgs,
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

export function toRpcArgs(input: TransactionInput): TransactionRpcArgs {
  return {
    p_asset_image_url: input.asset.thumbUrl,
    p_asset_rank: input.asset.marketCapRank,
    p_type: input.type,
    p_quantity: input.quantity,
    p_price_per_unit_usd: input.pricePerUnitUsd,
    p_fee_usd: input.feeUsd,
    p_executed_at: input.executedAt,
    p_notes: input.notes,
    p_asset_id: input.asset.id,
    p_asset_symbol: input.asset.symbol,
    p_asset_name: input.asset.name,
  };
}

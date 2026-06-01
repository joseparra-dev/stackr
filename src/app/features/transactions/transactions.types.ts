import type { AssetSearchResult } from '@features/assets/assets.types';

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

/**
 * What the UI hands to the service to create/update a transaction. Carries the
 * full asset (not just the id) because the RPC upserts the asset reference row
 * before writing the transaction.
 */
export interface TransactionInput {
  readonly asset: AssetSearchResult;
  readonly type: TransactionType;
  readonly quantity: number;
  readonly pricePerUnitUsd: number;
  readonly feeUsd: number;
  readonly executedAt: string; // ISO timestamptz
  readonly notes: string | null;
}

/**
 * Raw row as returned by Supabase/PostgREST (snake_case). `numeric` columns come
 * back as strings to preserve precision — the mapper parses them.
 */
export interface TransactionRow {
  readonly id: string;
  readonly user_id: string;
  readonly asset_id: string;
  readonly type: TransactionType;
  readonly quantity: string;
  readonly price_per_unit_usd: string;
  readonly fee_usd: string;
  readonly executed_at: string;
  readonly notes: string | null;
  readonly created_at: string;
  readonly updated_at: string;
}

/** Argument object for the `create_transaction` / `update_transaction` RPCs. */
export interface TransactionRpcArgs {
  readonly p_asset_id: string;
  readonly p_asset_symbol: string;
  readonly p_asset_name: string;
  readonly p_asset_image_url: string | null;
  readonly p_asset_rank: number | null;
  readonly p_type: TransactionType;
  readonly p_quantity: number;
  readonly p_price_per_unit_usd: number;
  readonly p_fee_usd: number;
  readonly p_executed_at: string;
  readonly p_notes: string | null;
}

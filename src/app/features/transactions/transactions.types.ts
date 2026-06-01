import type { AssetSearchResult } from '@features/assets/assets.types';

export type TransactionType = 'buy' | 'sell';

export interface Transaction {
  readonly id: string;
  readonly assetId: string;
  readonly type: TransactionType;
  readonly quantity: number;
  readonly pricePerUnitUsd: number;
  readonly feeUsd: number;
  readonly executedAt: string;
  readonly notes: string | null;
}

export interface TransactionWithAsset extends Transaction {
  readonly asset: AssetSearchResult;
}

export interface TransactionInput {
  readonly asset: AssetSearchResult;
  readonly type: TransactionType;
  readonly quantity: number;
  readonly pricePerUnitUsd: number;
  readonly feeUsd: number;
  readonly executedAt: string;
  readonly notes: string | null;
}

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

export interface AssetRow {
  readonly id: string;
  readonly symbol: string;
  readonly name: string;
  readonly image_url: string | null;
  readonly market_cap_rank: number | null;
}

export interface TransactionWithAssetRow extends TransactionRow {
  readonly assets: AssetRow | AssetRow[] | null;
}

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

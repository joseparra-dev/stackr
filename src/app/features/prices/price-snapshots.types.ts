export interface PriceSnapshotRow {
  readonly asset_id: string;
  readonly snapshot_date: string;
  readonly price_usd: number;
}

export type SnapshotPriceMap = ReadonlyMap<string, ReadonlyMap<string, number>>;

import { inject, Injectable } from '@angular/core';

import { mapSupabaseError } from '@core/errors/map-supabase-error';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import type { PriceSnapshotRow, SnapshotPriceMap } from './price-snapshots.types';

const TABLE = 'price_snapshots';

@Injectable({ providedIn: 'root' })
export class PriceSnapshotsService {
  private readonly client = inject(SUPABASE_CLIENT);

  async getForRange(
    assetIds: readonly string[],
    fromDate: string,
    toDate: string,
  ): Promise<SnapshotPriceMap> {
    const unique = [...new Set(assetIds)];
    if (unique.length === 0) return new Map();

    const { data, error } = await this.client
      .from(TABLE)
      .select('asset_id, snapshot_date, price_usd')
      .in('asset_id', unique)
      .gte('snapshot_date', fromDate)
      .lte('snapshot_date', toDate);

    if (error) throw mapSupabaseError(error);

    return rowsToSnapshotMap((data ?? []) as PriceSnapshotRow[]);
  }

  async upsert(rows: readonly PriceSnapshotRow[]): Promise<void> {
    if (rows.length === 0) return;

    const { error } = await this.client.from(TABLE).upsert([...rows], {
      onConflict: 'asset_id,snapshot_date',
    });

    if (error) throw mapSupabaseError(error);
  }
}

function rowsToSnapshotMap(rows: readonly PriceSnapshotRow[]): SnapshotPriceMap {
  const map = new Map<string, Map<string, number>>();

  for (const row of rows) {
    const price = Number(row.price_usd);
    if (!Number.isFinite(price)) continue;

    let byDate = map.get(row.asset_id);
    if (!byDate) {
      byDate = new Map();
      map.set(row.asset_id, byDate);
    }
    byDate.set(row.snapshot_date, price);
  }

  return map;
}

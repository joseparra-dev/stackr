import type { SnapshotPriceMap } from '@features/prices/price-snapshots.types';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

export type HistoryRangeDays = 7 | 30 | 90;

export interface DailyPortfolioPoint {
  readonly date: string;
  readonly valueUsd: number;
}

export function buildDateRange(dayCount: number, end = new Date()): readonly string[] {
  const endUtc = Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), end.getUTCDate());
  const dates: string[] = [];

  for (let offset = dayCount - 1; offset >= 0; offset--) {
    dates.push(toUtcDateString(endUtc - offset * 86_400_000));
  }

  return dates;
}

export function marketChartPricesToDailyMap(
  prices: readonly (readonly [number, number])[],
): ReadonlyMap<string, number> {
  const daily = new Map<string, number>();

  for (const [timestampMs, price] of prices) {
    if (!Number.isFinite(price)) continue;
    daily.set(toUtcDateString(timestampMs), price);
  }

  return daily;
}

export function quantitiesHeldOnDate(
  transactions: readonly TransactionWithAsset[],
  date: string,
): ReadonlyMap<string, number> {
  const cutoff = `${date}T23:59:59.999Z`;
  const totals = new Map<string, { bought: number; sold: number }>();

  for (const tx of transactions) {
    if (tx.executedAt > cutoff) continue;

    const current = totals.get(tx.assetId) ?? { bought: 0, sold: 0 };
    if (tx.type === 'buy') {
      current.bought += tx.quantity;
    } else {
      current.sold += tx.quantity;
    }
    totals.set(tx.assetId, current);
  }

  const quantities = new Map<string, number>();
  for (const [assetId, { bought, sold }] of totals) {
    const quantity = bought - sold;
    if (quantity > 0) quantities.set(assetId, quantity);
  }

  return quantities;
}

export function calculateDailyPortfolioValues(
  dates: readonly string[],
  transactions: readonly TransactionWithAsset[],
  snapshots: SnapshotPriceMap,
): readonly DailyPortfolioPoint[] {
  return dates.map((date) => {
    const quantities = quantitiesHeldOnDate(transactions, date);
    let valueUsd = 0;

    for (const [assetId, quantity] of quantities) {
      const price = snapshots.get(assetId)?.get(date);
      if (price === undefined) continue;
      valueUsd += quantity * price;
    }

    return { date, valueUsd };
  });
}

export function countValuedHistoryDays(points: readonly DailyPortfolioPoint[]): number {
  return points.filter((point) => point.valueUsd > 0).length;
}

export function toUtcDateString(timestampMs: number): string {
  const date = new Date(timestampMs);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mergeSnapshotMaps(
  base: SnapshotPriceMap,
  extra: SnapshotPriceMap,
): SnapshotPriceMap {
  const merged = new Map<string, Map<string, number>>();

  for (const source of [base, extra]) {
    for (const [assetId, byDate] of source) {
      let target = merged.get(assetId);
      if (!target) {
        target = new Map();
        merged.set(assetId, target);
      }
      for (const [date, price] of byDate) {
        target.set(date, price);
      }
    }
  }

  return merged;
}

export function snapshotMapToRows(map: SnapshotPriceMap): {
  readonly asset_id: string;
  readonly snapshot_date: string;
  readonly price_usd: number;
}[] {
  const rows: { asset_id: string; snapshot_date: string; price_usd: number }[] = [];

  for (const [assetId, byDate] of map) {
    for (const [snapshotDate, priceUsd] of byDate) {
      rows.push({ asset_id: assetId, snapshot_date: snapshotDate, price_usd: priceUsd });
    }
  }

  return rows;
}

export function findMissingSnapshotDates(
  assetIds: readonly string[],
  dates: readonly string[],
  snapshots: SnapshotPriceMap,
): ReadonlyMap<string, readonly string[]> {
  const missing = new Map<string, string[]>();

  for (const assetId of assetIds) {
    const gaps: string[] = [];
    const byDate = snapshots.get(assetId);

    for (const date of dates) {
      if (byDate?.get(date) === undefined) gaps.push(date);
    }

    if (gaps.length > 0) missing.set(assetId, gaps);
  }

  return missing;
}

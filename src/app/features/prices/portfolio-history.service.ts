import { inject, Injectable } from '@angular/core';

import type { TransactionWithAsset } from '@features/transactions/transactions.types';
import {
  buildDateRange,
  calculateDailyPortfolioValues,
  findMissingSnapshotDates,
  mergeSnapshotMaps,
  snapshotMapToRows,
  type DailyPortfolioPoint,
  type HistoryRangeDays,
} from '@shared/utils/portfolio-history';

import { CoinGeckoService } from './coingecko.service';
import { PriceSnapshotsService } from './price-snapshots.service';

@Injectable({ providedIn: 'root' })
export class PortfolioHistoryService {
  private readonly snapshots = inject(PriceSnapshotsService);
  private readonly coinGecko = inject(CoinGeckoService);

  async loadSeries(
    transactions: readonly TransactionWithAsset[],
    assetIds: readonly string[],
    rangeDays: HistoryRangeDays,
  ): Promise<readonly DailyPortfolioPoint[]> {
    const uniqueAssetIds = [...new Set(assetIds)];
    const dates = buildDateRange(rangeDays);
    if (dates.length === 0 || uniqueAssetIds.length === 0) return [];

    const fromDate = dates[0] ?? '';
    const toDate = dates[dates.length - 1] ?? '';

    let snapshotMap = await this.snapshots.getForRange(uniqueAssetIds, fromDate, toDate);
    const missingByAsset = findMissingSnapshotDates(uniqueAssetIds, dates, snapshotMap);

    for (const [assetId] of missingByAsset) {
      const fetched = await this.coinGecko.getDailyPrices(assetId, rangeDays);
      const assetMap = new Map<string, ReadonlyMap<string, number>>([[assetId, fetched]]);
      snapshotMap = mergeSnapshotMaps(snapshotMap, assetMap);

      const rows = snapshotMapToRows(assetMap);
      if (rows.length > 0) {
        try {
          await this.snapshots.upsert(rows);
        } catch {
          // Continue with in-memory snapshots when cache write is unavailable.
        }
      }
    }

    return calculateDailyPortfolioValues(dates, transactions, snapshotMap);
  }
}

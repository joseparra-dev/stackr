import { describe, expect, it } from 'vitest';

import { bitcoinAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import {
  buildDateRange,
  calculateDailyPortfolioValues,
  countValuedHistoryDays,
  findMissingSnapshotDates,
  marketChartPricesToDailyMap,
  mergeSnapshotMaps,
  quantitiesHeldOnDate,
  toUtcDateString,
} from './portfolio-history';

describe('portfolio-history', () => {
  it('buildDateRange returns consecutive UTC dates ending today', () => {
    const end = new Date(Date.UTC(2026, 5, 10));
    expect(buildDateRange(3, end)).toEqual(['2026-06-08', '2026-06-09', '2026-06-10']);
  });

  it('marketChartPricesToDailyMap keeps the last price for a UTC day', () => {
    const day = Date.UTC(2026, 5, 10, 12, 0, 0);
    const later = Date.UTC(2026, 5, 10, 18, 0, 0);
    const map = marketChartPricesToDailyMap([
      [day, 100],
      [later, 120],
    ]);
    expect(map.get('2026-06-10')).toBe(120);
  });

  it('quantitiesHeldOnDate ignores transactions after the day cutoff', () => {
    const early = makeTransaction({
      asset: bitcoinAsset,
      executedAt: '2026-06-01T10:00:00.000Z',
      quantity: 2,
    });
    const late = makeTransaction({
      asset: bitcoinAsset,
      executedAt: '2026-06-03T10:00:00.000Z',
      quantity: 1,
    });

    const quantities = quantitiesHeldOnDate([early, late], '2026-06-02');
    expect(quantities.get('bitcoin')).toBe(2);
  });

  it('calculateDailyPortfolioValues multiplies held quantity by snapshot price', () => {
    const tx = makeTransaction({
      asset: bitcoinAsset,
      executedAt: '2026-06-01T10:00:00.000Z',
      quantity: 2,
    });
    const snapshots = new Map<string, Map<string, number>>([
      ['bitcoin', new Map([['2026-06-01', 50_000]])],
    ]);

    const points = calculateDailyPortfolioValues(['2026-06-01'], [tx], snapshots);
    expect(points).toEqual([{ date: '2026-06-01', valueUsd: 100_000 }]);
  });

  it('countValuedHistoryDays counts only days with positive value', () => {
    expect(
      countValuedHistoryDays([
        { date: '2026-06-01', valueUsd: 0 },
        { date: '2026-06-02', valueUsd: 10 },
      ]),
    ).toBe(1);
  });

  it('findMissingSnapshotDates lists dates without a stored price', () => {
    const snapshots = new Map<string, Map<string, number>>([
      ['bitcoin', new Map([['2026-06-01', 1]])],
    ]);
    const missing = findMissingSnapshotDates(
      ['bitcoin'],
      ['2026-06-01', '2026-06-02'],
      snapshots,
    );
    expect(missing.get('bitcoin')).toEqual(['2026-06-02']);
  });

  it('mergeSnapshotMaps combines asset date maps', () => {
    const merged = mergeSnapshotMaps(
      new Map([['bitcoin', new Map([['2026-06-01', 1]])]]),
      new Map([['ethereum', new Map([['2026-06-01', 2]])]]),
    );
    expect(merged.get('bitcoin')?.get('2026-06-01')).toBe(1);
    expect(merged.get('ethereum')?.get('2026-06-01')).toBe(2);
  });

  it('toUtcDateString formats timestamps in UTC', () => {
    expect(toUtcDateString(Date.UTC(2026, 5, 4))).toBe('2026-06-04');
  });
});

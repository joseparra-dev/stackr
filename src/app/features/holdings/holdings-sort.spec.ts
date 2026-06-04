import { describe, expect, it } from 'vitest';

import type { Holding } from '@shared/utils/holdings.types';

import { ariaSortValue, nextSortState, sortHoldings } from './holdings-sort';

function makeHolding(overrides: Partial<Holding> & Pick<Holding, 'assetId' | 'symbol'>): Holding {
  return {
    name: overrides.name ?? overrides.symbol,
    thumbUrl: '',
    quantity: 1,
    avgCostUsd: 100,
    currentPriceUsd: 100,
    costBasisUsd: 100,
    currentValueUsd: 100,
    pnlRealizedUsd: 0,
    pnlUnrealizedUsd: 0,
    pnlTotalUsd: 0,
    pnlPercent: 0,
    ...overrides,
  };
}

describe('sortHoldings', () => {
  const holdings = [
    makeHolding({ assetId: 'eth', symbol: 'ETH', currentValueUsd: 200, pnlTotalUsd: 20 }),
    makeHolding({ assetId: 'btc', symbol: 'BTC', currentValueUsd: 800, pnlTotalUsd: -10 }),
  ];

  it('should sort by asset symbol ascending', () => {
    const sorted = sortHoldings(holdings, 'asset', 'asc');
    expect(sorted.map((h) => h.symbol)).toEqual(['BTC', 'ETH']);
  });

  it('should sort by current value descending', () => {
    const sorted = sortHoldings(holdings, 'currentValue', 'desc');
    expect(sorted.map((h) => h.symbol)).toEqual(['BTC', 'ETH']);
  });

  it('should place null current prices before numbers when ascending', () => {
    const rows = [
      makeHolding({ assetId: 'a', symbol: 'A', currentPriceUsd: 50 }),
      makeHolding({ assetId: 'b', symbol: 'B', currentPriceUsd: null }),
    ];
    const sorted = sortHoldings(rows, 'currentPrice', 'asc');
    expect(sorted[0]?.symbol).toBe('B');
  });
});

describe('nextSortState', () => {
  it('should default to descending when switching to a numeric column', () => {
    expect(nextSortState('asset', 'asc', 'currentValue')).toEqual({
      key: 'currentValue',
      direction: 'desc',
    });
  });

  it('should toggle direction when clicking the active column', () => {
    expect(nextSortState('quantity', 'desc', 'quantity')).toEqual({
      key: 'quantity',
      direction: 'asc',
    });
  });
});

describe('ariaSortValue', () => {
  it('should return none for inactive columns', () => {
    expect(ariaSortValue('asset', 'quantity', 'desc')).toBe('none');
  });

  it('should reflect the active sort direction', () => {
    expect(ariaSortValue('pnl', 'pnl', 'asc')).toBe('ascending');
  });
});

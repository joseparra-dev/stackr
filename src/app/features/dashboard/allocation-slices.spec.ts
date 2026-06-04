import { describe, expect, it } from 'vitest';

import type { Holding } from '@shared/utils/holdings.types';

import { buildAllocationSlices } from './allocation-slices';

function makeHolding(overrides: Partial<Holding> & Pick<Holding, 'assetId' | 'symbol'>): Holding {
  return {
    name: overrides.name ?? overrides.symbol,
    thumbUrl: '',
    quantity: 1,
    avgCostUsd: 100,
    currentPriceUsd: 100,
    costBasisUsd: 100,
    pnlRealizedUsd: 0,
    pnlUnrealizedUsd: 0,
    pnlTotalUsd: 0,
    pnlPercent: 0,
    currentValueUsd: overrides.currentValueUsd ?? 0,
    ...overrides,
  };
}

describe('buildAllocationSlices', () => {
  it('should return empty array when total value is zero', () => {
    const holdings = [makeHolding({ assetId: 'bitcoin', symbol: 'BTC', currentValueUsd: 100 })];
    expect(buildAllocationSlices(holdings, 0)).toEqual([]);
  });

  it('should exclude holdings with zero current value', () => {
    const holdings = [
      makeHolding({ assetId: 'bitcoin', symbol: 'BTC', currentValueUsd: 600 }),
      makeHolding({ assetId: 'ethereum', symbol: 'ETH', currentValueUsd: 0 }),
    ];
    const slices = buildAllocationSlices(holdings, 600);
    expect(slices).toHaveLength(1);
    expect(slices[0]?.symbol).toBe('BTC');
    expect(slices[0]?.percent).toBe(100);
  });

  it('should sort slices by value descending', () => {
    const holdings = [
      makeHolding({ assetId: 'eth', symbol: 'ETH', name: 'Ethereum', currentValueUsd: 200 }),
      makeHolding({ assetId: 'btc', symbol: 'BTC', name: 'Bitcoin', currentValueUsd: 800 }),
    ];
    const slices = buildAllocationSlices(holdings, 1000);
    expect(slices.map((s) => s.symbol)).toEqual(['BTC', 'ETH']);
    expect(slices[0]?.percent).toBe(80);
    expect(slices[1]?.percent).toBe(20);
  });
});

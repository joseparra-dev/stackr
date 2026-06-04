import type { Holding } from '@shared/utils/holdings.types';

export interface AllocationSlice {
  readonly assetId: string;
  readonly symbol: string;
  readonly name: string;
  readonly valueUsd: number;
  readonly percent: number;
};

export function buildAllocationSlices(
  holdings: readonly Holding[],
  totalValueUsd: number,
): readonly AllocationSlice[] {
  if (totalValueUsd <= 0) return [];

  const slices = holdings
    .filter((holding) => holding.currentValueUsd > 0)
    .map((holding) => ({
      assetId: holding.assetId,
      symbol: holding.symbol,
      name: holding.name,
      valueUsd: holding.currentValueUsd,
      percent: (holding.currentValueUsd / totalValueUsd) * 100,
    }))
    .sort((a, b) => b.valueUsd - a.valueUsd);

  return slices;
}

import type { Holding } from '@shared/utils/holdings.types';

export type HoldingsSortKey =
  | 'asset'
  | 'quantity'
  | 'avgCost'
  | 'currentPrice'
  | 'currentValue'
  | 'pnl';

export type SortDirection = 'asc' | 'desc';

export function sortHoldings(
  holdings: readonly Holding[],
  key: HoldingsSortKey,
  direction: SortDirection,
): readonly Holding[] {
  const sorted = [...holdings].sort((a, b) => compareHoldings(a, b, key));
  return direction === 'asc' ? sorted : sorted.reverse();
}

export function nextSortState(
  currentKey: HoldingsSortKey,
  currentDirection: SortDirection,
  clickedKey: HoldingsSortKey,
): { readonly key: HoldingsSortKey; readonly direction: SortDirection } {
  if (currentKey !== clickedKey) {
    return { key: clickedKey, direction: defaultDirectionFor(clickedKey) };
  }
  return {
    key: clickedKey,
    direction: currentDirection === 'asc' ? 'desc' : 'asc',
  };
}

export function ariaSortValue(
  key: HoldingsSortKey,
  activeKey: HoldingsSortKey,
  direction: SortDirection,
): 'ascending' | 'descending' | 'none' {
  if (key !== activeKey) return 'none';
  return direction === 'asc' ? 'ascending' : 'descending';
}

function defaultDirectionFor(key: HoldingsSortKey): SortDirection {
  return key === 'asset' ? 'asc' : 'desc';
}

function compareHoldings(a: Holding, b: Holding, key: HoldingsSortKey): number {
  switch (key) {
    case 'asset':
      return a.symbol.localeCompare(b.symbol);
    case 'quantity':
      return a.quantity - b.quantity;
    case 'avgCost':
      return a.avgCostUsd - b.avgCostUsd;
    case 'currentPrice':
      return compareNullableNumber(a.currentPriceUsd, b.currentPriceUsd);
    case 'currentValue':
      return a.currentValueUsd - b.currentValueUsd;
    case 'pnl':
      return a.pnlTotalUsd - b.pnlTotalUsd;
  }
}

function compareNullableNumber(a: number | null, b: number | null): number {
  if (a === null && b === null) return 0;
  if (a === null) return -1;
  if (b === null) return 1;
  return a - b;
}

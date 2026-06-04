import type { ParamMap } from '@angular/router';

import type { TranslationParams } from '@core/i18n/translate';
import type { AssetSearchResult } from '@features/assets/assets.types';

import type { TransactionType, TransactionWithAsset } from './transactions.types';

export const TRANSACTIONS_ASSETS_FILTER_PARAM = 'assets' as const;
export const TRANSACTIONS_ASSET_FILTER_PARAM = 'asset' as const;
export const TRANSACTIONS_TYPE_FILTER_PARAM = 'type' as const;
export const TRANSACTIONS_FROM_FILTER_PARAM = 'from' as const;
export const TRANSACTIONS_TO_FILTER_PARAM = 'to' as const;

export type TransactionTypeFilter = 'all' | TransactionType;

export interface TransactionFilters {
  readonly assetIds: readonly string[];
  readonly type: TransactionTypeFilter;
  readonly fromDate: string | null;
  readonly toDate: string | null;
}

export const EMPTY_TRANSACTION_FILTERS: TransactionFilters = {
  assetIds: [],
  type: 'all',
  fromDate: null,
  toDate: null,
};

export function parseFiltersFromParamMap(params: ParamMap): TransactionFilters {
  const assetsParam = params.get(TRANSACTIONS_ASSETS_FILTER_PARAM);
  const legacyAsset = params.get(TRANSACTIONS_ASSET_FILTER_PARAM);

  let assetIds: readonly string[] = [];
  if (assetsParam) {
    assetIds = parseAssetIdsParam(assetsParam);
  } else if (legacyAsset) {
    assetIds = [legacyAsset];
  }

  const typeParam = params.get(TRANSACTIONS_TYPE_FILTER_PARAM);
  const type: TransactionTypeFilter =
    typeParam === 'buy' || typeParam === 'sell' ? typeParam : 'all';

  return {
    assetIds,
    type,
    fromDate: params.get(TRANSACTIONS_FROM_FILTER_PARAM),
    toDate: params.get(TRANSACTIONS_TO_FILTER_PARAM),
  };
}

export function filtersToQueryParams(filters: TransactionFilters): Record<string, string | null> {
  return {
    [TRANSACTIONS_ASSETS_FILTER_PARAM]:
      filters.assetIds.length > 0 ? filters.assetIds.join(',') : null,
    [TRANSACTIONS_ASSET_FILTER_PARAM]: null,
    [TRANSACTIONS_TYPE_FILTER_PARAM]: filters.type === 'all' ? null : filters.type,
    [TRANSACTIONS_FROM_FILTER_PARAM]: filters.fromDate,
    [TRANSACTIONS_TO_FILTER_PARAM]: filters.toDate,
  };
}

export function applyTransactionFilters(
  transactions: readonly TransactionWithAsset[],
  filters: TransactionFilters,
): readonly TransactionWithAsset[] {
  return transactions.filter((tx) => matchesFilters(tx, filters));
}

export function hasActiveFilters(filters: TransactionFilters): boolean {
  return (
    filters.assetIds.length > 0 ||
    filters.type !== 'all' ||
    filters.fromDate !== null ||
    filters.toDate !== null
  );
}

export function uniqueAssetsFromTransactions(
  transactions: readonly TransactionWithAsset[],
): readonly AssetSearchResult[] {
  const byId = new Map<string, AssetSearchResult>();
  for (const tx of transactions) {
    byId.set(tx.assetId, tx.asset);
  }
  return [...byId.values()].sort((a, b) => a.symbol.localeCompare(b.symbol));
}

export function describeActiveFilters(
  transactions: readonly TransactionWithAsset[],
  filters: TransactionFilters,
  translate: (key: string, params?: TranslationParams) => string,
): string {
  const parts: string[] = [];

  if (filters.assetIds.length > 0) {
    const labels = filters.assetIds.map((id) => {
      const asset = transactions.find((tx) => tx.assetId === id)?.asset;
      return asset?.symbol ?? id;
    });
    parts.push(translate('transactions.filters.describeAssets', { list: labels.join(', ') }));
  }

  if (filters.type !== 'all') {
    const type = translate(`transactions.list.type.${filters.type}`);
    parts.push(translate('transactions.filters.describeType', { type }));
  }

  if (filters.fromDate) {
    parts.push(translate('transactions.filters.describeFrom', { date: filters.fromDate }));
  }

  if (filters.toDate) {
    parts.push(translate('transactions.filters.describeTo', { date: filters.toDate }));
  }

  return parts.join(translate('transactions.filters.separator'));
}

function matchesFilters(tx: TransactionWithAsset, filters: TransactionFilters): boolean {
  if (filters.assetIds.length > 0 && !filters.assetIds.includes(tx.assetId)) {
    return false;
  }

  if (filters.type !== 'all' && tx.type !== filters.type) {
    return false;
  }

  const executedDate = tx.executedAt.slice(0, 10);
  if (filters.fromDate && executedDate < filters.fromDate) {
    return false;
  }
  if (filters.toDate && executedDate > filters.toDate) {
    return false;
  }

  return true;
}

function parseAssetIdsParam(value: string): readonly string[] {
  return [
    ...new Set(
      value
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  ];
}

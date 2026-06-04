import { convertToParamMap } from '@angular/router';
import { describe, expect, it } from 'vitest';

import {
  bitcoinAsset,
  ethereumAsset,
  makeTransaction,
} from '@shared/utils/__fixtures__/transactions';

import {
  applyTransactionFilters,
  describeActiveFilters,
  filtersToQueryParams,
  hasActiveFilters,
  parseFiltersFromParamMap,
  uniqueAssetsFromTransactions,
} from './transactions-filter';

describe('transactions-filter', () => {
  const btcTx = makeTransaction({
    asset: bitcoinAsset,
    type: 'buy',
    executedAt: '2026-06-01T12:00:00.000Z',
  });
  const ethTx = makeTransaction({
    id: 'tx-2',
    asset: ethereumAsset,
    type: 'sell',
    executedAt: '2026-06-10T12:00:00.000Z',
  });

  it('should parse multi-asset, type, and date params from the url', () => {
    const filters = parseFiltersFromParamMap(
      convertToParamMap({
        assets: 'bitcoin,ethereum',
        type: 'sell',
        from: '2026-06-05',
        to: '2026-06-15',
      }),
    );

    expect(filters).toEqual({
      assetIds: ['bitcoin', 'ethereum'],
      type: 'sell',
      fromDate: '2026-06-05',
      toDate: '2026-06-15',
    });
  });

  it('should support legacy single asset query param', () => {
    const filters = parseFiltersFromParamMap(convertToParamMap({ asset: 'bitcoin' }));
    expect(filters.assetIds).toEqual(['bitcoin']);
  });

  it('should apply all filters together', () => {
    const filtered = applyTransactionFilters([btcTx, ethTx], {
      assetIds: ['ethereum'],
      type: 'sell',
      fromDate: '2026-06-01',
      toDate: '2026-06-30',
    });
    expect(filtered).toEqual([ethTx]);
  });

  it('should serialize active filters to query params', () => {
    expect(
      filtersToQueryParams({
        assetIds: ['bitcoin'],
        type: 'buy',
        fromDate: '2026-06-01',
        toDate: null,
      }),
    ).toEqual({
      assets: 'bitcoin',
      asset: null,
      type: 'buy',
      from: '2026-06-01',
      to: null,
    });
  });

  it('should detect active filters', () => {
    expect(hasActiveFilters({ assetIds: [], type: 'all', fromDate: null, toDate: null })).toBe(
      false,
    );
    expect(
      hasActiveFilters({ assetIds: ['bitcoin'], type: 'all', fromDate: null, toDate: null }),
    ).toBe(true);
  });

  it('should list unique assets sorted by symbol', () => {
    expect(uniqueAssetsFromTransactions([ethTx, btcTx]).map((a) => a.symbol)).toEqual([
      'BTC',
      'ETH',
    ]);
  });

  it('should describe active filters for empty state copy', () => {
    const description = describeActiveFilters([btcTx, ethTx], {
      assetIds: ['bitcoin'],
      type: 'buy',
      fromDate: '2026-06-01',
      toDate: null,
    });
    expect(description).toContain('BTC');
    expect(description).toContain('type: buy');
  });
});

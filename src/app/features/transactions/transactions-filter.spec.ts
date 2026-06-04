import { describe, expect, it } from 'vitest';

import { bitcoinAsset, ethereumAsset, makeTransaction } from '@shared/utils/__fixtures__/transactions';

import { assetFilterLabel, filterTransactionsByAsset } from './transactions-filter';

describe('transactions-filter', () => {
  const btcTx = makeTransaction({ asset: bitcoinAsset });
  const ethTx = makeTransaction({ id: 'tx-2', asset: ethereumAsset });

  it('should return all transactions when asset filter is empty', () => {
    expect(filterTransactionsByAsset([btcTx, ethTx], null)).toEqual([btcTx, ethTx]);
  });

  it('should filter transactions by asset id', () => {
    expect(filterTransactionsByAsset([btcTx, ethTx], 'bitcoin')).toEqual([btcTx]);
  });

  it('should resolve the asset symbol for the active filter', () => {
    expect(assetFilterLabel([btcTx, ethTx], 'ethereum')).toBe('ETH');
  });
});

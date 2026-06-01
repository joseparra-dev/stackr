import { describe, expect, it } from 'vitest';

import type { Transaction } from './transactions.types';
import { transactionTotal } from './transaction-total';

const base: Transaction = {
  id: 'tx-1',
  assetId: 'bitcoin',
  type: 'buy',
  quantity: 2,
  pricePerUnitUsd: 100,
  feeUsd: 5,
  executedAt: '2026-05-31T22:00:00.000Z',
  notes: null,
};

describe('transactionTotal', () => {
  it('adds fee for buys', () => {
    expect(transactionTotal(base)).toBe(205);
  });

  it('subtracts fee for sells', () => {
    expect(transactionTotal({ ...base, type: 'sell' })).toBe(195);
  });
});

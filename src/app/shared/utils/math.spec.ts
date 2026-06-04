import { describe, expect, it } from 'vitest';

import {
  bitcoinAsset,
  ethereumAsset,
  makeTransaction,
} from './__fixtures__/transactions';
import { calculateHoldings } from './math';

describe('calculateHoldings', () => {
  it('returns an empty array when there are no transactions', () => {
    expect(calculateHoldings([], {})).toEqual([]);
  });

  it('computes a single buy holding with current value from prices', () => {
    const tx = makeTransaction({
      quantity: 2,
      pricePerUnitUsd: 50_000,
      feeUsd: 100,
    });

    const [holding] = calculateHoldings([tx], { bitcoin: 60_000 });

    expect(holding).toMatchObject({
      assetId: 'bitcoin',
      symbol: 'BTC',
      quantity: 2,
      avgCostUsd: 50_050,
      currentPriceUsd: 60_000,
      costBasisUsd: 100_100,
      currentValueUsd: 120_000,
      pnlRealizedUsd: 0,
      pnlUnrealizedUsd: 19_900,
      pnlTotalUsd: 19_900,
    });
    expect(holding?.pnlPercent).toBeCloseTo(19.88, 2);
  });

  it('sorts transactions by executedAt before aggregating', () => {
    const later = makeTransaction({
      id: 'tx-later',
      quantity: 1,
      pricePerUnitUsd: 40_000,
      feeUsd: 0,
      executedAt: '2026-06-01T12:00:00.000Z',
    });
    const earlier = makeTransaction({
      id: 'tx-earlier',
      quantity: 1,
      pricePerUnitUsd: 30_000,
      feeUsd: 0,
      executedAt: '2026-05-01T12:00:00.000Z',
    });

    const [holding] = calculateHoldings([later, earlier], { bitcoin: 50_000 });

    expect(holding?.avgCostUsd).toBe(35_000);
    expect(holding?.quantity).toBe(2);
  });

  it('applies partial sell with weighted average realized PnL', () => {
    const buy = makeTransaction({
      id: 'buy-1',
      type: 'buy',
      quantity: 2,
      pricePerUnitUsd: 50_000,
      feeUsd: 0,
    });
    const sell = makeTransaction({
      id: 'sell-1',
      type: 'sell',
      quantity: 1,
      pricePerUnitUsd: 60_000,
      feeUsd: 50,
      executedAt: '2026-06-01T12:00:00.000Z',
    });

    const [holding] = calculateHoldings([buy, sell], { bitcoin: 55_000 });

    expect(holding?.quantity).toBe(1);
    expect(holding?.avgCostUsd).toBe(50_000);
    expect(holding?.pnlRealizedUsd).toBe(9_950);
    expect(holding?.pnlUnrealizedUsd).toBe(5_000);
    expect(holding?.pnlTotalUsd).toBe(14_950);
  });

  it('omits assets with zero remaining quantity after a full sell', () => {
    const buy = makeTransaction({ type: 'buy', quantity: 1, pricePerUnitUsd: 50_000 });
    const sell = makeTransaction({
      type: 'sell',
      quantity: 1,
      pricePerUnitUsd: 55_000,
      executedAt: '2026-06-01T12:00:00.000Z',
    });

    expect(calculateHoldings([buy, sell], { bitcoin: 60_000 })).toEqual([]);
  });

  it('returns holdings for multiple assets sorted by symbol', () => {
    const btc = makeTransaction({ asset: bitcoinAsset, quantity: 1, pricePerUnitUsd: 50_000 });
    const eth = makeTransaction({
      id: 'eth-buy',
      asset: ethereumAsset,
      quantity: 10,
      pricePerUnitUsd: 3_000,
    });

    const holdings = calculateHoldings([eth, btc], {
      bitcoin: 60_000,
      ethereum: 3_500,
    });

    expect(holdings.map((h) => h.symbol)).toEqual(['BTC', 'ETH']);
    expect(holdings[0]?.currentValueUsd).toBe(60_000);
    expect(holdings[1]?.currentValueUsd).toBe(35_000);
  });

  it('leaves USD value at zero when price is missing', () => {
    const tx = makeTransaction({ quantity: 1, pricePerUnitUsd: 50_000 });

    const [holding] = calculateHoldings([tx], {});

    expect(holding).toMatchObject({
      currentPriceUsd: null,
      currentValueUsd: 0,
      pnlUnrealizedUsd: 0,
      pnlRealizedUsd: 0,
    });
    expect(holding?.pnlTotalUsd).toBe(0);
  });

  it('includes buy fees in average cost and sell fees in realized proceeds', () => {
    const buy = makeTransaction({
      type: 'buy',
      quantity: 1,
      pricePerUnitUsd: 100,
      feeUsd: 10,
    });
    const sell = makeTransaction({
      type: 'sell',
      quantity: 0.5,
      pricePerUnitUsd: 120,
      feeUsd: 5,
      executedAt: '2026-06-01T12:00:00.000Z',
    });

    const [holding] = calculateHoldings([buy, sell], { bitcoin: 130 });

    expect(holding?.avgCostUsd).toBe(110);
    expect(holding?.pnlRealizedUsd).toBe(0);
  });
});

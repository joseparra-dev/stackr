import type { PriceMap } from '@features/prices/coingecko.types';
import type { TransactionWithAsset } from '@features/transactions/transactions.types';

import type { Holding } from './holdings.types';

export function calculateHoldings(
  transactions: readonly TransactionWithAsset[],
  prices: PriceMap,
): readonly Holding[] {
  const byAsset = new Map<string, TransactionWithAsset[]>();

  for (const tx of transactions) {
    const existing = byAsset.get(tx.assetId) ?? [];
    existing.push(tx);
    byAsset.set(tx.assetId, existing);
  }

  const holdings: Holding[] = [];

  for (const [assetId, txns] of byAsset) {
    const sorted = [...txns].sort((a, b) => a.executedAt.localeCompare(b.executedAt));
    const holding = buildHolding(assetId, sorted, prices[assetId]);
    if (holding) holdings.push(holding);
  }

  return holdings.sort((a, b) => a.symbol.localeCompare(b.symbol));
}

function buildHolding(
  assetId: string,
  txns: readonly TransactionWithAsset[],
  currentPrice: number | undefined,
): Holding | null {
  let totalBought = 0;
  let totalSpent = 0;
  let totalSold = 0;
  let totalEarned = 0;

  for (const tx of txns) {
    if (tx.type === 'buy') {
      totalBought += tx.quantity;
      totalSpent += tx.quantity * tx.pricePerUnitUsd + tx.feeUsd;
    } else {
      totalSold += tx.quantity;
      totalEarned += tx.quantity * tx.pricePerUnitUsd - tx.feeUsd;
    }
  }

  if (totalBought === 0) return null;

  const quantity = totalBought - totalSold;
  if (quantity <= 0) return null;

  const avgCostUsd = totalSpent / totalBought;
  const costBasisUsd = quantity * avgCostUsd;
  const currentPriceUsd = currentPrice ?? null;
  const currentValueUsd = currentPriceUsd !== null ? quantity * currentPriceUsd : 0;
  const pnlRealizedUsd = totalEarned - totalSold * avgCostUsd;
  const pnlUnrealizedUsd =
    currentPriceUsd !== null ? currentValueUsd - costBasisUsd : 0;
  const pnlTotalUsd = pnlRealizedUsd + pnlUnrealizedUsd;
  const pnlPercent = costBasisUsd > 0 ? (pnlTotalUsd / costBasisUsd) * 100 : 0;

  const asset = txns[txns.length - 1]?.asset;
  if (!asset) return null;

  return {
    assetId,
    symbol: asset.symbol,
    name: asset.name,
    thumbUrl: asset.thumbUrl,
    quantity,
    avgCostUsd,
    currentPriceUsd,
    costBasisUsd,
    currentValueUsd,
    pnlRealizedUsd,
    pnlUnrealizedUsd,
    pnlTotalUsd,
    pnlPercent,
  };
}

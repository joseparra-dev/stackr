import type { Transaction } from './transactions.types';

export function transactionTotal(tx: Transaction): number {
  const gross = tx.quantity * tx.pricePerUnitUsd;
  return tx.type === 'buy' ? gross + tx.feeUsd : gross - tx.feeUsd;
}

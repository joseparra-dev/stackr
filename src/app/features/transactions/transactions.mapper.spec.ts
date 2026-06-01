import { describe, expect, it } from 'vitest';

import type { AssetSearchResult } from '@features/assets/assets.types';

import { rowToTransaction, toRpcArgs } from './transactions.mapper';
import type { TransactionInput, TransactionRow } from './transactions.types';

const asset: AssetSearchResult = {
  id: 'bitcoin',
  name: 'Bitcoin',
  symbol: 'BTC',
  thumbUrl: 'https://cdn/btc.png',
  marketCapRank: 1,
};

const input: TransactionInput = {
  asset,
  type: 'buy',
  quantity: 0.5,
  pricePerUnitUsd: 65000,
  feeUsd: 10,
  executedAt: '2026-05-31T22:00:00.000Z',
  notes: 'test note',
};

describe('transactions.mapper', () => {
  describe('rowToTransaction', () => {
    it('maps snake_case row and parses numeric strings', () => {
      const row: TransactionRow = {
        id: 'tx-1',
        user_id: 'user-1',
        asset_id: 'bitcoin',
        type: 'buy',
        quantity: '0.500000000000',
        price_per_unit_usd: '65000.00000000',
        fee_usd: '10.00000000',
        executed_at: '2026-05-31T22:00:00.000Z',
        notes: 'test note',
        created_at: '2026-05-31T22:01:00.000Z',
        updated_at: '2026-05-31T22:01:00.000Z',
      };

      expect(rowToTransaction(row)).toEqual({
        id: 'tx-1',
        assetId: 'bitcoin',
        type: 'buy',
        quantity: 0.5,
        pricePerUnitUsd: 65000,
        feeUsd: 10,
        executedAt: '2026-05-31T22:00:00.000Z',
        notes: 'test note',
      });
    });
  });

  describe('toRpcArgs', () => {
    it('maps TransactionInput to RPC p_* params', () => {
      expect(toRpcArgs(input)).toEqual({
        p_asset_id: 'bitcoin',
        p_asset_symbol: 'BTC',
        p_asset_name: 'Bitcoin',
        p_asset_image_url: 'https://cdn/btc.png',
        p_asset_rank: 1,
        p_type: 'buy',
        p_quantity: 0.5,
        p_price_per_unit_usd: 65000,
        p_fee_usd: 10,
        p_executed_at: '2026-05-31T22:00:00.000Z',
        p_notes: 'test note',
      });
    });
  });
});

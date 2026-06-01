import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';
import type { AssetSearchResult } from '@features/assets/assets.types';

import { TransactionsService } from './transactions.service';
import type {
  TransactionInput,
  TransactionRow,
  TransactionWithAssetRow,
} from './transactions.types';

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
  quantity: 1,
  pricePerUnitUsd: 50000,
  feeUsd: 0,
  executedAt: '2026-05-31T22:00:00.000Z',
  notes: null,
};

const row: TransactionRow = {
  id: 'tx-1',
  user_id: 'user-1',
  asset_id: 'bitcoin',
  type: 'buy',
  quantity: '1',
  price_per_unit_usd: '50000',
  fee_usd: '0',
  executed_at: '2026-05-31T22:00:00.000Z',
  notes: null,
  created_at: '2026-05-31T22:01:00.000Z',
  updated_at: '2026-05-31T22:01:00.000Z',
};

function makeClientMock() {
  const chain = {
    select: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn(),
    delete: vi.fn().mockReturnThis(),
  };

  return {
    from: vi.fn(() => chain),
    rpc: vi.fn(),
    chain,
  };
}

describe('TransactionsService', () => {
  let client: ReturnType<typeof makeClientMock>;

  beforeEach(() => {
    client = makeClientMock();
    TestBed.configureTestingModule({
      providers: [{ provide: SUPABASE_CLIENT, useValue: client }],
    });
  });

  it('list() maps joined rows from Supabase', async () => {
    const joinedRow: TransactionWithAssetRow = {
      ...row,
      assets: {
        id: 'bitcoin',
        symbol: 'BTC',
        name: 'Bitcoin',
        image_url: 'https://cdn/btc.png',
        market_cap_rank: 1,
      },
    };
    client.chain.order.mockResolvedValue({ data: [joinedRow], error: null });
    const service = TestBed.inject(TransactionsService);
    const result = await service.list();
    expect(result[0]?.id).toBe('tx-1');
    expect(result[0]?.asset.symbol).toBe('BTC');
  });

  it('getById() returns null when no row exists', async () => {
    client.chain.maybeSingle.mockResolvedValue({ data: null, error: null });
    const service = TestBed.inject(TransactionsService);
    expect(await service.getById('missing')).toBeNull();
  });

  it('create() calls create_transaction RPC', async () => {
    client.rpc.mockResolvedValue({ data: row, error: null });
    const service = TestBed.inject(TransactionsService);
    const result = await service.create(input);
    expect(client.rpc).toHaveBeenCalledWith(
      'create_transaction',
      expect.objectContaining({
        p_asset_id: 'bitcoin',
      }),
    );
    expect(result.id).toBe('tx-1');
  });

  it('delete() throws AppError on Supabase failure', async () => {
    client.chain.eq.mockResolvedValue({ error: { code: '42501', message: 'denied' } });
    const service = TestBed.inject(TransactionsService);
    await expect(service.delete('tx-1')).rejects.toMatchObject({ code: 'auth/unauthorized' });
  });
});

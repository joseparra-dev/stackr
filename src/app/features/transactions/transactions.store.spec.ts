import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';
import type { AssetSearchResult } from '@features/assets/assets.types';

import { TransactionsService } from './transactions.service';
import { TransactionsStore } from './transactions.store';
import type { TransactionInput, TransactionWithAsset } from './transactions.types';

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

const tx: TransactionWithAsset = {
  id: 'tx-1',
  assetId: 'bitcoin',
  type: 'buy',
  quantity: 1,
  pricePerUnitUsd: 50000,
  feeUsd: 0,
  executedAt: '2026-05-31T22:00:00.000Z',
  notes: null,
  asset,
};

function makeServiceMock() {
  return {
    list: vi.fn().mockResolvedValue([tx]),
    create: vi.fn().mockResolvedValue({ ...tx, id: 'tx-created' }),
    update: vi.fn().mockResolvedValue({ ...tx, quantity: 2 }),
    delete: vi.fn().mockResolvedValue(undefined),
  } as unknown as TransactionsService;
}

describe('TransactionsStore', () => {
  let service: ReturnType<typeof makeServiceMock>;

  beforeEach(() => {
    service = makeServiceMock();
    TestBed.configureTestingModule({
      providers: [{ provide: TransactionsService, useValue: service }],
    });
  });

  it('starts empty with no loading error', () => {
    const store = TestBed.inject(TransactionsStore);
    expect(store.transactions()).toEqual([]);
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
    expect(store.hasTransactions()).toBe(false);
  });

  it('load() sets transactions on success', async () => {
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    expect(store.transactions()).toEqual([tx]);
    expect(store.totalCount()).toBe(1);
    expect(store.hasTransactions()).toBe(true);
    expect(store.loading()).toBe(false);
  });

  it('load() captures AppError on failure', async () => {
    service.list.mockRejectedValue(new AppError('network/offline', 'offline'));
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    expect(store.error()?.code).toBe('network/offline');
    expect(store.transactions()).toEqual([]);
  });

  it('add() prepends optimistically then replaces with server row', async () => {
    const store = TestBed.inject(TransactionsStore);
    await store.add(input);
    expect(store.transactions()[0]?.id).toBe('tx-created');
    expect(service.create).toHaveBeenCalledWith(input);
  });

  it('add() rolls back on service failure', async () => {
    service.create.mockRejectedValue(new AppError('api/server-error', 'fail'));
    const store = TestBed.inject(TransactionsStore);
    await expect(store.add(input)).rejects.toBeInstanceOf(AppError);
    expect(store.transactions()).toEqual([]);
    expect(store.error()?.code).toBe('api/server-error');
  });

  it('edit() updates in place on success', async () => {
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    await store.edit('tx-1', { ...input, quantity: 2 });
    expect(store.transactions()[0]?.quantity).toBe(2);
    expect(service.update).toHaveBeenCalledWith('tx-1', { ...input, quantity: 2 });
  });

  it('edit() rolls back on service failure', async () => {
    service.update.mockRejectedValue(new AppError('validation/invalid-input', 'bad'));
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    await expect(store.edit('tx-1', { ...input, quantity: 2 })).rejects.toBeInstanceOf(AppError);
    expect(store.transactions()[0]?.quantity).toBe(1);
    expect(store.error()?.code).toBe('validation/invalid-input');
  });

  it('remove() deletes optimistically and rolls back on failure', async () => {
    service.delete.mockRejectedValue(new AppError('api/server-error', 'fail'));
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    await expect(store.remove('tx-1')).rejects.toBeInstanceOf(AppError);
    expect(store.transactions()).toEqual([tx]);
  });

  it('clearError() resets the error signal', async () => {
    service.list.mockRejectedValue(new AppError('unknown', 'fail'));
    const store = TestBed.inject(TransactionsStore);
    await store.load();
    store.clearError();
    expect(store.error()).toBeNull();
  });
});

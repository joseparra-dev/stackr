import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';

import { CoinGeckoService } from './coingecko.service';
import type { PriceMap } from './coingecko.types';
import { PricesStore } from './prices.store';

function makeCoinGeckoMock() {
  let onUpdate: ((prices: PriceMap) => void) | undefined;
  let onError: ((error: AppError) => void) | undefined;

  return {
    startPolling: vi.fn(
      (
        _ids: readonly string[],
        update?: (prices: PriceMap) => void,
        error?: (e: AppError) => void,
      ) => {
        onUpdate = update;
        onError = error;
      },
    ),
    stopPolling: vi.fn(),
    simulateUpdate: (prices: PriceMap) => onUpdate?.(prices),
    simulateError: (error: AppError) => onError?.(error),
  };
}

describe('PricesStore', () => {
  let coinGecko: ReturnType<typeof makeCoinGeckoMock>;

  beforeEach(() => {
    coinGecko = makeCoinGeckoMock();
    TestBed.configureTestingModule({
      providers: [{ provide: CoinGeckoService, useValue: coinGecko }],
    });
  });

  it('starts empty with no loading or error', () => {
    const store = TestBed.inject(PricesStore);

    expect(store.prices()).toEqual({});
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('subscribeToAssets([]) clears prices and stops polling', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets([]);

    expect(store.prices()).toEqual({});
    expect(store.loading()).toBe(false);
    expect(coinGecko.stopPolling).toHaveBeenCalled();
    expect(coinGecko.startPolling).not.toHaveBeenCalled();
  });

  it('subscribeToAssets starts polling and sets loading until prices arrive', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin']);

    expect(coinGecko.stopPolling).toHaveBeenCalled();
    expect(coinGecko.startPolling).toHaveBeenCalledWith(
      ['bitcoin'],
      expect.any(Function),
      expect.any(Function),
    );
    expect(store.loading()).toBe(true);
    expect(store.error()).toBeNull();

    coinGecko.simulateUpdate({ bitcoin: 67_000 });

    expect(store.prices()).toEqual({ bitcoin: 67_000 });
    expect(store.loading()).toBe(false);
    expect(store.error()).toBeNull();
  });

  it('updates prices reactively on subsequent poll callbacks', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin', 'ethereum']);
    coinGecko.simulateUpdate({ bitcoin: 67_000, ethereum: 3_400 });

    coinGecko.simulateUpdate({ bitcoin: 68_000, ethereum: 3_500 });

    expect(store.prices()).toEqual({ bitcoin: 68_000, ethereum: 3_500 });
  });

  it('deduplicates asset ids before starting polling', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin', 'bitcoin', 'ethereum']);

    expect(coinGecko.startPolling).toHaveBeenCalledWith(
      ['bitcoin', 'ethereum'],
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('captures AppError from poll failures', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin']);
    coinGecko.simulateError(new AppError('api/rate-limit', 'Rate limited'));

    expect(store.error()?.code).toBe('api/rate-limit');
    expect(store.loading()).toBe(false);
  });

  it('restarts polling when subscribed to a new asset set', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin']);
    store.subscribeToAssets(['ethereum']);

    expect(coinGecko.stopPolling).toHaveBeenCalledTimes(2);
    expect(coinGecko.startPolling).toHaveBeenLastCalledWith(
      ['ethereum'],
      expect.any(Function),
      expect.any(Function),
    );
  });

  it('clearError() resets the error signal', () => {
    const store = TestBed.inject(PricesStore);

    store.subscribeToAssets(['bitcoin']);
    coinGecko.simulateError(new AppError('unknown', 'fail'));
    store.clearError();

    expect(store.error()).toBeNull();
  });
});

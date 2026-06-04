import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { AppError } from '@core/errors/app-error';
import { mapCoinGeckoError } from '@core/errors/map-coingecko-error';
import { environment } from '@env/environment';

import type { HistoryRangeDays } from '@shared/utils/portfolio-history';
import { marketChartPricesToDailyMap } from '@shared/utils/portfolio-history';

import type {
  CoinGeckoMarketChartResponse,
  CoinGeckoSimplePriceResponse,
  PriceMap,
} from './coingecko.types';
import { POLL_INTERVAL_MS } from './coingecko.types';
import { withExponentialBackoff } from './fetch-with-backoff';
import { getStaleIds, mergePrices, pricesForIds, type CacheEntry } from './price-cache';

@Injectable({ providedIn: 'root' })
export class CoinGeckoService {
  private readonly http = inject(HttpClient);
  private cache = new Map<string, CacheEntry>();
  private polledAssetIds: readonly string[] = [];
  private pollTimer: ReturnType<typeof setInterval> | null = null;
  private boundVisibilityHandler: (() => void) | null = null;
  private onUpdate: ((prices: PriceMap) => void) | null = null;
  private onError: ((error: AppError) => void) | null = null;

  async getDailyPrices(assetId: string, days: HistoryRangeDays): Promise<ReadonlyMap<string, number>> {
    const url = `${environment.coingecko.baseUrl}/coins/${assetId}/market_chart?vs_currency=usd&days=${days}`;

    const response = await withExponentialBackoff(async () => {
      try {
        return await firstValueFrom(this.http.get<CoinGeckoMarketChartResponse>(url));
      } catch (cause) {
        throw mapCoinGeckoError(cause);
      }
    });

    return marketChartPricesToDailyMap(response.prices);
  }

  async getPrices(assetIds: readonly string[]): Promise<PriceMap> {
    const unique = [...new Set(assetIds)];
    if (unique.length === 0) return {};

    const now = Date.now();
    const stale = getStaleIds(unique, this.cache, now);

    if (stale.length > 0) {
      const fresh = await this.fetchPrices(stale);
      this.cache = mergePrices(this.cache, fresh, now);
    }

    return pricesForIds(unique, this.cache);
  }

  startPolling(
    assetIds: readonly string[],
    onUpdate?: (prices: PriceMap) => void,
    onError?: (error: AppError) => void,
  ): void {
    this.stopPolling();
    this.polledAssetIds = [...new Set(assetIds)];
    this.onUpdate = onUpdate ?? null;
    this.onError = onError ?? null;

    if (this.polledAssetIds.length === 0) return;

    this.ensureVisibilityListener();
    void this.runPoll();
    this.startPollTimer();
  }

  stopPolling(): void {
    this.clearPollTimer();
    this.removeVisibilityListener();
    this.polledAssetIds = [];
    this.onUpdate = null;
    this.onError = null;
  }

  private async runPoll(): Promise<void> {
    try {
      const prices = await this.getPrices(this.polledAssetIds);
      this.onUpdate?.(prices);
    } catch (cause) {
      this.onError?.(AppError.from(cause));
    }
  }

  private async fetchPrices(ids: readonly string[]): Promise<PriceMap> {
    const url = `${environment.coingecko.baseUrl}/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;

    return withExponentialBackoff(async () => {
      try {
        return await firstValueFrom(
          this.http.get<CoinGeckoSimplePriceResponse>(url).pipe(map(mapSimplePriceResponse)),
        );
      } catch (cause) {
        throw mapCoinGeckoError(cause);
      }
    });
  }

  private onVisibilityChange(): void {
    if (this.polledAssetIds.length === 0) return;

    if (document.hidden) {
      this.clearPollTimer();
      return;
    }

    void this.runPoll();
    this.startPollTimer();
  }

  private startPollTimer(): void {
    this.clearPollTimer();
    if (typeof document === 'undefined' || document.hidden || this.polledAssetIds.length === 0) {
      return;
    }

    this.pollTimer = setInterval(() => {
      void this.runPoll();
    }, POLL_INTERVAL_MS);
  }

  private clearPollTimer(): void {
    if (this.pollTimer !== null) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private ensureVisibilityListener(): void {
    if (this.boundVisibilityHandler !== null || typeof document === 'undefined') return;

    this.boundVisibilityHandler = () => this.onVisibilityChange();
    document.addEventListener('visibilitychange', this.boundVisibilityHandler);
  }

  private removeVisibilityListener(): void {
    if (this.boundVisibilityHandler === null || typeof document === 'undefined') return;

    document.removeEventListener('visibilitychange', this.boundVisibilityHandler);
    this.boundVisibilityHandler = null;
  }
}

function mapSimplePriceResponse(response: CoinGeckoSimplePriceResponse): PriceMap {
  const result: PriceMap = {};

  for (const [id, data] of Object.entries(response)) {
    if (typeof data?.usd === 'number') {
      result[id] = data.usd;
    }
  }

  return result;
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { mapCoinGeckoError } from '@core/errors/map-coingecko-error';
import { environment } from '@env/environment';

import type { CoinGeckoSimplePriceResponse, PriceMap } from './coingecko.types';
import { getStaleIds, mergePrices, pricesForIds, type CacheEntry } from './price-cache';

@Injectable({ providedIn: 'root' })
export class CoinGeckoService {
  private readonly http = inject(HttpClient);
  private cache = new Map<string, CacheEntry>();

  async getPrices(assetIds: string[]): Promise<PriceMap> {
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

  private async fetchPrices(ids: readonly string[]): Promise<PriceMap> {
    const url = `${environment.coingecko.baseUrl}/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;

    try {
      return await firstValueFrom(
        this.http.get<CoinGeckoSimplePriceResponse>(url).pipe(map(mapSimplePriceResponse)),
      );
    } catch (cause) {
      throw mapCoinGeckoError(cause);
    }
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

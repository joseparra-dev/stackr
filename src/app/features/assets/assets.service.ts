import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';

import { mapCoinGeckoError } from '@core/errors/map-coingecko-error';
import { environment } from '@env/environment';

import type { AssetSearchResult, CoinGeckoCoin, CoinGeckoSearchResponse } from './assets.types';

const MAX_RESULTS = 10;

@Injectable({ providedIn: 'root' })
export class AssetsService {
  private readonly http = inject(HttpClient);
  private readonly searchCache = new Map<string, AssetSearchResult[]>();
  private readonly selectedCache = new Map<string, AssetSearchResult>();

  async search(query: string): Promise<AssetSearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (normalized.length < 2) return [];

    const cached = this.searchCache.get(normalized);
    if (cached) return cached;

    const url = `${environment.coingecko.baseUrl}/search?query=${encodeURIComponent(normalized)}`;

    try {
      const results = await firstValueFrom(
        this.http
          .get<CoinGeckoSearchResponse>(url)
          .pipe(
            map((data) => (data.coins ?? []).slice(0, MAX_RESULTS).map(mapCoinToAssetSearchResult)),
          ),
      );

      this.searchCache.set(normalized, results);
      return results;
    } catch (cause) {
      throw mapCoinGeckoError(cause);
    }
  }

  cacheSelected(asset: AssetSearchResult): void {
    this.selectedCache.set(asset.id, asset);
  }

  getCachedSelected(id: string): AssetSearchResult | undefined {
    return this.selectedCache.get(id);
  }
}

function mapCoinToAssetSearchResult(coin: CoinGeckoCoin): AssetSearchResult {
  return {
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    marketCapRank: coin.market_cap_rank ?? null,
    thumbUrl: coin.thumb,
  };
}

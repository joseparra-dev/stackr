export interface AssetSearchResult {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly marketCapRank: number | null;
  readonly thumbUrl: string;
}

export interface CoinGeckoSearchResponse {
  readonly coins: readonly CoinGeckoCoin[];
}

export interface CoinGeckoCoin {
  readonly id: string;
  readonly name: string;
  readonly symbol: string;
  readonly market_cap_rank: number | null;
  readonly thumb: string;
}

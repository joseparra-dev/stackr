export interface Holding {
  readonly assetId: string;
  readonly symbol: string;
  readonly name: string;
  readonly thumbUrl: string;
  readonly quantity: number;
  readonly avgCostUsd: number;
  readonly currentPriceUsd: number | null;
  readonly costBasisUsd: number;
  readonly currentValueUsd: number;
  readonly pnlRealizedUsd: number;
  readonly pnlUnrealizedUsd: number;
  readonly pnlTotalUsd: number;
  readonly pnlPercent: number;
}

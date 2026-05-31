import { ChangeDetectionStrategy, Component, signal } from '@angular/core';

import { AssetCombobox } from '@features/assets/asset-combobox';
import type { AssetSearchResult } from '@features/assets/assets.types';

@Component({
  selector: 'app-transactions-page',
  imports: [AssetCombobox],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './transactions.page.html',
})
export class TransactionsPage {
  readonly selectedAsset = signal<AssetSearchResult | null>(null);

  onAssetSelected(asset: AssetSearchResult): void {
    this.selectedAsset.set(asset);
  }

  onAssetCleared(): void {
    this.selectedAsset.set(null);
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import type { AssetSearchResult } from '@features/assets/assets.types';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-transaction-asset-filter',
  imports: [TranslatePipe],
  templateUrl: './transaction-asset-filter.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionAssetFilter {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly i18n = inject(I18nService);

  readonly options = input.required<readonly AssetSearchResult[]>();
  readonly selectedIds = input.required<readonly string[]>();

  readonly selectedIdsChange = output<readonly string[]>();

  readonly searchQuery = signal('');
  readonly panelOpen = signal(false);

  readonly filteredOptions = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const options = this.options();
    if (!query) return options;

    return options.filter(
      (asset) =>
        asset.symbol.toLowerCase().includes(query) || asset.name.toLowerCase().includes(query),
    );
  });

  readonly triggerLabel = computed(() => {
    this.i18n.locale();
    const count = this.selectedIds().length;
    if (count === 0) return this.i18n.translate('transactions.assetFilter.allAssets');
    if (count === 1) {
      const asset = this.options().find((item) => item.id === this.selectedIds()[0]);
      return asset?.symbol ?? this.i18n.translate('transactions.assetFilter.oneAsset');
    }
    return this.i18n.translate('transactions.assetFilter.nAssets', { count: String(count) });
  });

  togglePanel(): void {
    this.panelOpen.update((open) => !open);
  }

  onSearchInput(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  isSelected(assetId: string): boolean {
    return this.selectedIds().includes(assetId);
  }

  toggleAsset(assetId: string): void {
    const current = this.selectedIds();
    const next = current.includes(assetId)
      ? current.filter((id) => id !== assetId)
      : [...current, assetId];
    this.selectedIdsChange.emit(next);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.panelOpen()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) {
      return;
    }
    this.panelOpen.set(false);
  }
}

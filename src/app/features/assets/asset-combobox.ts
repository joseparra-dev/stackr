import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, from, of } from 'rxjs';

import { AppError, errorMessage } from '@core/errors/app-error';

import { AssetsService } from './assets.service';
import type { AssetSearchResult } from './assets.types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

@Component({
  selector: 'app-asset-combobox',
  imports: [],
  templateUrl: './asset-combobox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetCombobox {
  readonly disabled = input(false);
  readonly placeholder = input('Search by name or symbol…');

  readonly assetSelected = output<AssetSearchResult>();
  readonly assetCleared = output<void>();

  private readonly assetsService = inject(AssetsService);
  private readonly queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');

  private readonly rawQuery = signal('');
  private readonly focused = signal(false);
  private readonly selectionLocked = signal(false);

  private readonly apiQuery = computed(() =>
    this.selectionLocked() ? '' : this.rawQuery().trim(),
  );

  private readonly debouncedQuery = toSignal(
    toObservable(this.apiQuery).pipe(debounceTime(DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: '' },
  );

  private readonly assetsResource = rxResource({
    params: () => this.debouncedQuery(),
    stream: ({ params: query }) => {
      if (query.length < MIN_QUERY_LENGTH) {
        return of<AssetSearchResult[]>([]);
      }

      return from(this.assetsService.search(query));
    },
    defaultValue: [] as AssetSearchResult[],
  });

  readonly searchQuery = this.rawQuery.asReadonly();
  readonly results = computed(() =>
    this.assetsResource.hasValue() ? this.assetsResource.value() : [],
  );
  readonly loading = this.assetsResource.isLoading;
  readonly error = computed(() => {
    const err = this.assetsResource.error();
    return err ? AppError.from(err) : null;
  });
  readonly panelOpen = computed(
    () =>
      !this.selectionLocked() &&
      this.focused() &&
      this.rawQuery().trim().length >= MIN_QUERY_LENGTH,
  );
  readonly searched = computed(() => {
    if (this.selectionLocked() || this.debouncedQuery().length < MIN_QUERY_LENGTH) {
      return false;
    }

    const status = this.assetsResource.status();
    return status === 'resolved' || status === 'error';
  });

  private readonly highlightedIndex = linkedSignal<AssetSearchResult[], number>({
    source: this.results,
    computation: () => -1,
  });
  readonly activeIndex = this.highlightedIndex.asReadonly();
  readonly activeOptionId = computed(() => {
    const active = this.results()[this.activeIndex()];
    return active ? this.optionId(active.id) : null;
  });

  readonly errorMessage = errorMessage;

  onQueryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.focused.set(true);

    if (this.selectionLocked()) {
      this.selectionLocked.set(false);
      this.rawQuery.set('');
      input.value = '';
      this.assetCleared.emit();
      return;
    }

    this.rawQuery.set(input.value);
  }

  onInputFocus(): void {
    this.focused.set(true);
  }

  onInputBlur(): void {
    this.focused.set(false);
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        this.moveHighlight(1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.moveHighlight(-1);
        break;
      case 'Enter': {
        const target = this.results()[this.activeIndex()] ?? this.results()[0];
        if (target) {
          event.preventDefault();
          this.selectAsset(target);
        }
        break;
      }
      case 'Escape':
        this.focused.set(false);
        break;
    }
  }

  highlight(index: number): void {
    this.highlightedIndex.set(index);
  }

  selectAsset(asset: AssetSearchResult): void {
    this.assetsService.cacheSelected(asset);
    this.selectionLocked.set(true);
    this.rawQuery.set(`${asset.name} (${asset.symbol})`);
    this.focused.set(false);
    this.queryInput()?.nativeElement.blur();
    this.assetSelected.emit(asset);
  }

  preventBlur(event: Event): void {
    event.preventDefault();
  }

  optionId(assetId: string): string {
    return `asset-option-${assetId}`;
  }

  private moveHighlight(delta: number): void {
    const count = this.results().length;
    if (count === 0) {
      return;
    }

    const next = this.activeIndex() + delta;
    this.highlightedIndex.set(Math.max(0, Math.min(next, count - 1)));
  }
}

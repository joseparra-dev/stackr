import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  output,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { rxResource, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { debounceTime, distinctUntilChanged, from, of } from 'rxjs';

import { AppError } from '@core/errors/app-error';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@shared/ui';

import { AssetsService } from './assets.service';
import type { AssetSearchResult } from './assets.types';

const DEBOUNCE_MS = 300;
const MIN_QUERY_LENGTH = 2;

@Component({
  selector: 'app-asset-combobox',
  imports: [TranslatePipe],
  templateUrl: './asset-combobox.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AssetCombobox),
      multi: true,
    },
  ],
})
export class AssetCombobox implements ControlValueAccessor {
  readonly disabled = input(false);
  readonly placeholder = input('');

  readonly assetSelected = output<AssetSearchResult>();
  readonly assetCleared = output<void>();

  private readonly assetsService = inject(AssetsService);
  private readonly i18n = inject(I18nService);
  private readonly queryInput = viewChild<ElementRef<HTMLInputElement>>('queryInput');

  private readonly disabledByCva = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByCva());

  private readonly rawQuery = signal('');
  private readonly focused = signal(false);
  private readonly selectionLocked = signal(false);

  private onChange: (value: AssetSearchResult | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

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

  readonly resolvedPlaceholder = computed(() => {
    this.i18n.locale();
    return this.placeholder() || this.i18n.translate('shared.assetCombobox.defaultPlaceholder');
  });

  protected translateError = this.i18n.translateError.bind(this.i18n);

  writeValue(value: AssetSearchResult | null): void {
    if (value) {
      this.selectionLocked.set(true);
      this.syncInput(`${value.name} (${value.symbol})`);
      return;
    }

    this.selectionLocked.set(false);
    this.syncInput('');
  }

  registerOnChange(fn: (value: AssetSearchResult | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByCva.set(isDisabled);
  }

  onQueryInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.focused.set(true);

    if (this.selectionLocked()) {
      this.selectionLocked.set(false);
      this.rawQuery.set('');
      input.value = '';
      this.onChange(null);
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
    this.onTouched();
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
    this.syncInput(`${asset.name} (${asset.symbol})`);
    this.focused.set(false);
    this.queryInput()?.nativeElement.blur();
    this.onChange(asset);
    this.onTouched();
    this.assetSelected.emit(asset);
  }

  preventBlur(event: Event): void {
    event.preventDefault();
  }

  optionId(assetId: string): string {
    return `asset-option-${assetId}`;
  }

  private syncInput(value: string): void {
    this.rawQuery.set(value);
    const input = this.queryInput()?.nativeElement;
    if (input) {
      input.value = value;
    }
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

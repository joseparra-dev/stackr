import {
  CdkConnectedOverlay,
  CdkOverlayOrigin,
  Overlay,
  type ConnectedPosition,
} from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  inject,
  input,
  linkedSignal,
  signal,
  viewChild,
  type ElementRef,
} from '@angular/core';
import { type ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LucideCalendar, LucideChevronLeft, LucideChevronRight } from '@lucide/angular';

import { I18nService } from '@core/i18n/i18n.service';
import {
  formatDatetimeDisplay,
  getCalendarDays,
  HOURS,
  isSameDay,
  MINUTES,
  monthLabel,
  parseDatetimeLocal,
  toDatetimeLocalValue,
} from '@shared/utils/datetime-local';

import { TranslatePipe } from '../pipes/translate.pipe';

const WEEKDAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;

const OVERLAY_POSITIONS: ConnectedPosition[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
    offsetY: 4,
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
    offsetY: -4,
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
    offsetY: 4,
  },
];

@Component({
  selector: 'app-datetime-input',
  imports: [
    CdkConnectedOverlay,
    CdkOverlayOrigin,
    TranslatePipe,
    LucideCalendar,
    LucideChevronLeft,
    LucideChevronRight,
  ],
  templateUrl: './datetime-input.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatetimeInput),
      multi: true,
    },
  ],
})
export class DatetimeInput implements ControlValueAccessor {
  readonly disabled = input(false);
  readonly disableFuture = input(false);
  readonly placeholder = input('');
  readonly invalid = input(false);

  private readonly i18n = inject(I18nService);
  private readonly overlay = inject(Overlay);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly overlayPositions = OVERLAY_POSITIONS;
  protected readonly scrollStrategy = this.overlay.scrollStrategies.reposition();

  private readonly disabledByCva = signal(false);
  readonly isDisabled = computed(() => this.disabled() || this.disabledByCva());

  private readonly value = signal('');
  private readonly panelOpen = signal(false);
  private readonly viewMonth = linkedSignal<string, Date>({
    source: this.value,
    computation: (current) => parseDatetimeLocal(current) ?? new Date(),
  });

  readonly displayValue = computed(() => formatDatetimeDisplay(this.value()));
  readonly monthTitle = computed(() => monthLabel(this.viewMonth()));
  readonly calendarDays = computed(() =>
    getCalendarDays(this.viewMonth(), this.disableFuture() ? new Date() : undefined),
  );
  readonly selectedDate = computed(() => parseDatetimeLocal(this.value()));
  readonly hours = HOURS;
  readonly minutes = MINUTES;

  readonly resolvedPlaceholder = computed(() => {
    this.i18n.locale();
    return this.placeholder() || this.i18n.translate('shared.datetime.placeholder');
  });

  readonly weekdays = computed(() => {
    this.i18n.locale();
    return WEEKDAY_KEYS.map((key) => this.i18n.translate(`shared.datetime.weekdays.${key}`));
  });

  readonly selectedHour = computed(() => {
    const date = this.selectedDate();
    return date ? String(date.getHours()).padStart(2, '0') : '00';
  });

  readonly selectedMinute = computed(() => {
    const date = this.selectedDate();
    return date ? String(date.getMinutes()).padStart(2, '0') : '00';
  });

  private onChange: (value: string) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | null): void {
    this.value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabledByCva.set(isDisabled);
    if (isDisabled) {
      this.panelOpen.set(false);
    }
  }

  protected isPanelOpen(): boolean {
    return this.panelOpen();
  }

  protected togglePanel(): void {
    if (this.isDisabled()) {
      return;
    }

    const opening = !this.panelOpen();
    this.panelOpen.set(opening);

    if (opening && !this.value()) {
      this.setValue(new Date());
    }

    if (opening) {
      queueMicrotask(() => this.panel()?.nativeElement.focus());
    }
  }

  protected closePanel(): void {
    if (!this.panelOpen()) {
      return;
    }

    this.panelOpen.set(false);
    this.onTouched();
  }

  protected previousMonth(): void {
    const current = this.viewMonth();
    this.viewMonth.set(new Date(current.getFullYear(), current.getMonth() - 1, 1));
  }

  protected nextMonth(): void {
    const current = this.viewMonth();
    this.viewMonth.set(new Date(current.getFullYear(), current.getMonth() + 1, 1));
  }

  protected selectDay(day: { date: Date; disabled: boolean }): void {
    if (day.disabled) {
      return;
    }

    const current = this.selectedDate() ?? new Date();
    const next = new Date(day.date);
    next.setHours(current.getHours(), current.getMinutes(), 0, 0);
    this.setValue(next);
  }

  protected setHour(event: Event): void {
    const hour = Number((event.target as HTMLSelectElement).value);
    const current = this.selectedDate() ?? new Date();
    current.setHours(hour);
    this.setValue(current);
  }

  protected setMinute(event: Event): void {
    const minute = Number((event.target as HTMLSelectElement).value);
    const current = this.selectedDate() ?? new Date();
    current.setMinutes(minute);
    this.setValue(current);
  }

  protected setToday(): void {
    this.setValue(new Date());
    this.viewMonth.set(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  }

  protected isSelectedDay(date: Date): boolean {
    const selected = this.selectedDate();
    return selected ? isSameDay(selected, date) : false;
  }

  protected dayButtonClass(day: { inMonth: boolean; disabled: boolean; date: Date }): string {
    const classes = [
      'flex size-7 items-center justify-center rounded-md text-xs transition-colors',
    ];

    if (day.disabled) {
      classes.push('cursor-not-allowed text-(--color-text-muted)/40');
      return classes.join(' ');
    }

    if (this.isSelectedDay(day.date)) {
      classes.push('bg-brand-600 font-medium text-white');
      return classes.join(' ');
    }

    classes.push('cursor-pointer hover:bg-(--color-surface-2)');
    classes.push(day.inMonth ? 'text-(--color-text)' : 'text-(--color-text-muted)/60');
    return classes.join(' ');
  }

  private setValue(date: Date): void {
    const next = toDatetimeLocalValue(date);
    this.value.set(next);
    this.onChange(next);
  }
}

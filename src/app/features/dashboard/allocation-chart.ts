import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import type { Holding } from '@shared/utils/holdings.types';
import { EmptyState, TranslatePipe } from '@shared/ui';
import { formatUsd } from '@shared/utils/format-usd';

import { buildAllocationSlices, type AllocationSlice } from './allocation-slices';
import { ALLOCATION_CHART_COLORS } from './chart-theme';

/** Min bar fill % so tiny holdings (e.g. 0.3%) stay visible; label shows true %. */
const MIN_BAR_VISUAL_PERCENT = 2;

@Component({
  selector: 'app-allocation-chart',
  imports: [EmptyState, TranslatePipe],
  templateUrl: './allocation-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationChart {
  private readonly i18n = inject(I18nService);

  readonly holdings = input.required<readonly Holding[]>();
  readonly totalValueUsd = input.required<number>();

  protected readonly colors = [...ALLOCATION_CHART_COLORS];

  protected readonly formatUsd = formatUsd;
  protected readonly formatAllocationPercent = formatAllocationPercent;

  readonly slices = computed(() => buildAllocationSlices(this.holdings(), this.totalValueUsd()));

  readonly ariaSummary = computed(() => {
    this.i18n.locale();
    const slices = this.slices();
    if (slices.length === 0) {
      return this.i18n.translate('dashboard.allocation.emptyTitle');
    }
    const parts = slices.map(
      (slice) => `${slice.symbol} ${formatAllocationPercent(slice.percent)}`,
    );
    return this.i18n.translate('dashboard.allocation.ariaSummary', { parts: parts.join(', ') });
  });

  protected sliceColor(index: number): string {
    return this.colors[index % this.colors.length] ?? this.colors[0]!;
  }

  protected barWidthPercent(percent: number): number {
    if (percent <= 0) return 0;
    return Math.max(percent, MIN_BAR_VISUAL_PERCENT);
  }

  sliceAriaText(slice: AllocationSlice): string {
    this.i18n.locale();
    return this.i18n.translate('dashboard.allocation.ariaSlice', {
      name: slice.name,
      symbol: slice.symbol,
      value: formatUsd(slice.valueUsd),
      percent: formatAllocationPercent(slice.percent),
    });
  }
}

function formatAllocationPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

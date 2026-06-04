import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import {
  ChartComponent,
  type ApexChart,
  type ApexLegend,
  type ApexPlotOptions,
  type ApexStroke,
  type ApexTheme,
  type ApexTooltip,
} from 'ng-apexcharts';

import { I18nService } from '@core/i18n/i18n.service';
import { ThemeService } from '@core/theme/theme.service';
import type { Holding } from '@shared/utils/holdings.types';
import { EmptyState, TranslatePipe } from '@shared/ui';
import { formatUsd } from '@shared/utils/format-usd';

import { buildAllocationSlices, type AllocationSlice } from './allocation-slices';
import {
  ALLOCATION_CHART_COLORS,
  getChartThemeTokens,
  type ChartThemeTokens,
} from './chart-theme';

@Component({
  selector: 'app-allocation-chart',
  imports: [ChartComponent, EmptyState, TranslatePipe],
  templateUrl: './allocation-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AllocationChart {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);

  readonly holdings = input.required<readonly Holding[]>();
  readonly totalValueUsd = input.required<number>();

  protected readonly colors = [...ALLOCATION_CHART_COLORS];

  protected readonly dataLabels = { enabled: false } as const;

  protected readonly formatUsd = formatUsd;
  protected readonly formatAllocationPercent = formatAllocationPercent;

  readonly slices = computed(() =>
    buildAllocationSlices(this.holdings(), this.totalValueUsd()),
  );

  readonly series = computed(() => this.slices().map((slice) => slice.valueUsd));

  readonly labels = computed(() => this.slices().map((slice) => slice.symbol));

  private readonly themeTokens = computed((): ChartThemeTokens => {
    this.themeService.theme();
    return getChartThemeTokens(this.themeService.isDark());
  });

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

  readonly chart = computed(
    (): ApexChart => ({
      type: 'donut',
      fontFamily: 'inherit',
      foreColor: this.themeTokens().foreColor,
      background: 'transparent',
      toolbar: { show: false },
    }),
  );

  readonly stroke = computed(
    (): ApexStroke => ({
      width: 2,
      colors: [this.themeTokens().strokeColor],
    }),
  );

  readonly legend = computed(
    (): ApexLegend => ({
      position: 'bottom',
      horizontalAlign: 'center',
      fontSize: '13px',
      labels: { colors: this.themeTokens().legendColor },
      formatter: (symbol, opts) => {
        const slice = this.slices()[opts.seriesIndex];
        if (!slice) return symbol;
        return `${symbol} · ${formatAllocationPercent(slice.percent)}`;
      },
    }),
  );

  readonly plotOptions = computed(
    (): ApexPlotOptions => {
      this.i18n.locale();
      return {
        pie: {
          donut: {
            size: '68%',
            labels: {
              show: true,
              name: { color: this.themeTokens().legendColor },
              value: {
                color: this.themeTokens().legendColor,
                formatter: (value) => formatUsd(Number(value)),
              },
              total: {
                show: true,
                label: this.i18n.translate('dashboard.allocation.chartTotal'),
                color: this.themeTokens().foreColor,
                formatter: () => formatUsd(this.totalValueUsd()),
              },
            },
          },
        },
      };
    },
  );

  readonly tooltip = computed(
    (): ApexTooltip => ({
      theme: this.themeTokens().mode,
      y: {
        formatter: (value, opts) => {
          const slice = this.slices()[opts.seriesIndex];
          if (!slice) return formatUsd(Number(value));
          return `${slice.name}: ${formatUsd(Number(value))} (${formatAllocationPercent(slice.percent)})`;
        },
      },
    }),
  );

  readonly apexTheme = computed(
    (): ApexTheme => ({
      mode: this.themeTokens().mode,
    }),
  );

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

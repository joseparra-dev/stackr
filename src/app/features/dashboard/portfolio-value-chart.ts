import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import {
  ChartComponent,
  type ApexChart,
  type ApexFill,
  type ApexGrid,
  type ApexStroke,
  type ApexTheme,
  type ApexTooltip,
  type ApexXAxis,
  type ApexYAxis,
} from 'ng-apexcharts';

import { ThemeService } from '@core/theme/theme.service';
import { formatUsd } from '@shared/utils/format-usd';
import type { DailyPortfolioPoint, HistoryRangeDays } from '@shared/utils/portfolio-history';

import { getChartThemeTokens, type ChartThemeTokens } from './chart-theme';

const RANGE_OPTIONS = [
  { days: 7 as const, label: '7d' },
  { days: 30 as const, label: '30d' },
  { days: 90 as const, label: '90d' },
] as const;

const AREA_COLOR = '#3b82f6';

@Component({
  selector: 'app-portfolio-value-chart',
  imports: [ChartComponent],
  templateUrl: './portfolio-value-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioValueChart {
  private readonly themeService = inject(ThemeService);

  readonly points = input.required<readonly DailyPortfolioPoint[]>();
  readonly loading = input(false);
  readonly hasEnoughData = input(true);
  readonly selectedRange = input.required<HistoryRangeDays>();

  readonly rangeChange = output<HistoryRangeDays>();

  protected readonly rangeOptions = RANGE_OPTIONS;
  protected readonly chartColors = [AREA_COLOR];
  protected readonly formatUsd = formatUsd;
  protected readonly dataLabels = { enabled: false } as const;

  private readonly themeTokens = computed((): ChartThemeTokens => {
    this.themeService.theme();
    return getChartThemeTokens(this.themeService.isDark());
  });

  readonly series = computed(() => [
    {
      name: 'Portfolio value',
      data: this.points().map((point) => point.valueUsd),
    },
  ]);

  readonly categories = computed(() => this.points().map((point) => formatChartDate(point.date)));

  readonly ariaSummary = computed(() => {
    const points = this.points();
    if (points.length === 0) return 'No portfolio history';
    const first = points[0];
    const last = points[points.length - 1];
    if (!first || !last) return 'No portfolio history';
    return `Portfolio value from ${formatChartDate(first.date)} ${formatUsd(first.valueUsd)} to ${formatChartDate(last.date)} ${formatUsd(last.valueUsd)}`;
  });

  readonly chart = computed(
    (): ApexChart => ({
      type: 'area',
      height: 280,
      fontFamily: 'inherit',
      foreColor: this.themeTokens().foreColor,
      background: 'transparent',
      toolbar: { show: false },
      zoom: { enabled: false },
    }),
  );

  readonly stroke = computed(
    (): ApexStroke => ({
      curve: 'smooth',
      width: 2,
      colors: [AREA_COLOR],
    }),
  );

  readonly fill = computed(
    (): ApexFill => ({
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.4,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 90, 100],
      },
    }),
  );

  readonly grid = computed(
    (): ApexGrid => ({
      borderColor: this.themeTokens().strokeColor,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
    }),
  );

  readonly xaxis = computed(
    (): ApexXAxis => ({
      categories: this.categories(),
      labels: { style: { colors: this.themeTokens().foreColor } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    }),
  );

  readonly yaxis = computed(
    (): ApexYAxis => ({
      labels: {
        style: { colors: this.themeTokens().foreColor },
        formatter: (value) => formatUsd(Number(value)),
      },
    }),
  );

  readonly tooltip = computed(
    (): ApexTooltip => ({
      theme: this.themeTokens().mode,
      x: { show: true },
      y: {
        formatter: (value) => formatUsd(Number(value)),
      },
    }),
  );

  readonly apexTheme = computed(
    (): ApexTheme => ({
      mode: this.themeTokens().mode,
    }),
  );

  selectRange(days: HistoryRangeDays): void {
    if (days !== this.selectedRange()) {
      this.rangeChange.emit(days);
    }
  }
}

function formatChartDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${month}/${day}`;
}

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

import type { AppError } from '@core/errors/app-error';
import { I18nService } from '@core/i18n/i18n.service';
import { ThemeService } from '@core/theme/theme.service';
import { EmptyState, ErrorState, Skeleton, TranslatePipe } from '@shared/ui';
import { formatUsd } from '@shared/utils/format-usd';
import type { DailyPortfolioPoint, HistoryRangeDays } from '@shared/utils/portfolio-history';

import { getChartThemeTokens, type ChartThemeTokens } from './chart-theme';

const RANGE_DAYS = [7, 30, 90] as const satisfies readonly HistoryRangeDays[];

const RANGE_LABEL_KEYS: Record<HistoryRangeDays, string> = {
  7: 'dashboard.history.range7d',
  30: 'dashboard.history.range30d',
  90: 'dashboard.history.range90d',
};

const AREA_COLOR = '#3b82f6';

@Component({
  selector: 'app-portfolio-value-chart',
  imports: [ChartComponent, EmptyState, ErrorState, Skeleton, TranslatePipe],
  templateUrl: './portfolio-value-chart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioValueChart {
  private readonly themeService = inject(ThemeService);
  private readonly i18n = inject(I18nService);

  readonly points = input.required<readonly DailyPortfolioPoint[]>();
  readonly loading = input(false);
  readonly error = input<AppError | null>(null);
  readonly hasEnoughData = input(true);
  readonly selectedRange = input.required<HistoryRangeDays>();

  readonly rangeChange = output<HistoryRangeDays>();
  readonly retry = output<void>();

  protected readonly rangeOptions = computed(() => {
    this.i18n.locale();
    return RANGE_DAYS.map((days) => ({
      days,
      label: this.i18n.translate(RANGE_LABEL_KEYS[days]),
    }));
  });
  protected readonly chartColors = [AREA_COLOR];
  protected readonly formatUsd = formatUsd;
  protected readonly dataLabels = { enabled: false } as const;

  private readonly themeTokens = computed((): ChartThemeTokens => {
    this.themeService.theme();
    return getChartThemeTokens(this.themeService.isDark());
  });

  readonly series = computed(() => {
    this.i18n.locale();
    return [
      {
        name: this.i18n.translate('dashboard.history.seriesName'),
        data: this.points().map((point) => point.valueUsd),
      },
    ];
  });

  readonly categories = computed(() => this.points().map((point) => formatChartDate(point.date)));

  readonly ariaSummary = computed(() => {
    this.i18n.locale();
    const points = this.points();
    if (points.length === 0) {
      return this.i18n.translate('dashboard.history.emptyTitle');
    }
    const first = points[0];
    const last = points[points.length - 1];
    if (!first || !last) {
      return this.i18n.translate('dashboard.history.emptyTitle');
    }
    return this.i18n.translate('dashboard.history.ariaSummary', {
      startDate: formatChartDate(first.date),
      startValue: formatUsd(first.valueUsd),
      endDate: formatChartDate(last.date),
      endValue: formatUsd(last.valueUsd),
    });
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

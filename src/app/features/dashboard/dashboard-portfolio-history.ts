import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { AppError } from '@core/errors/app-error';
import type { DailyPortfolioPoint, HistoryRangeDays } from '@shared/utils/portfolio-history';

import { PortfolioValueChart } from './portfolio-value-chart';

@Component({
  selector: 'app-dashboard-portfolio-history',
  imports: [PortfolioValueChart],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-portfolio-value-chart
      [points]="points()"
      [loading]="loading()"
      [error]="error()"
      [hasEnoughData]="hasEnoughData()"
      [selectedRange]="selectedRange()"
      (rangeChange)="rangeChange.emit($event)"
      (retry)="retry.emit()"
    />
  `,
})
export class DashboardPortfolioHistory {
  readonly points = input.required<readonly DailyPortfolioPoint[]>();
  readonly loading = input(false);
  readonly error = input<AppError | null>(null);
  readonly hasEnoughData = input(true);
  readonly selectedRange = input.required<HistoryRangeDays>();

  readonly rangeChange = output<HistoryRangeDays>();
  readonly retry = output<void>();
}

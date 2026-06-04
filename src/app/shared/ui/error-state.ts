import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { type AppError, errorMessage } from '@core/errors/app-error';

@Component({
  selector: 'app-error-state',
  templateUrl: './error-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  readonly error = input.required<AppError>();
  readonly showRetry = input(true);

  readonly retry = output<void>();

  protected readonly message = computed(() => errorMessage(this.error().code));
}

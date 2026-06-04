import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';

import { type AppError } from '@core/errors/app-error';
import { I18nService } from '@core/i18n/i18n.service';

import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'app-error-state',
  imports: [TranslatePipe],
  templateUrl: './error-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  private readonly i18n = inject(I18nService);

  readonly error = input.required<AppError>();
  readonly showRetry = input(true);

  readonly retry = output<void>();

  protected readonly message = computed(() => this.i18n.translateError(this.error().code));
}

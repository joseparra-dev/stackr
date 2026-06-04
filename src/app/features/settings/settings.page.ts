import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import { APP_LOCALES, isAppLocale, type AppLocale } from '@core/i18n/locale.types';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-settings-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private readonly i18n = inject(I18nService);

  readonly locale = this.i18n.locale;
  readonly locales = APP_LOCALES;

  localeLabel(code: AppLocale): string {
    return this.i18n.translate(`settings.language.${code}`);
  }

  onLocaleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isAppLocale(value)) {
      void this.i18n.setLocale(value);
    }
  }
}

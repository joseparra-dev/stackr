import { inject, Pipe, type PipeTransform } from '@angular/core';

import { I18nService } from '@core/i18n/i18n.service';
import type { TranslationParams } from '@core/i18n/translate';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  private readonly i18n = inject(I18nService);

  transform(key: string, params?: TranslationParams): string {
    this.i18n.locale();
    return this.i18n.translate(key, params);
  }
}

import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal, untracked } from '@angular/core';

import type { AppErrorCode } from '@core/errors/app-error';
import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';

import en from '../../../locales/en.json';
import es from '../../../locales/es.json';

import { errorTranslationKey } from './error-keys';
import { detectBrowserLocale, type AppLocale } from './locale.types';
import {
  interpolate,
  resolveTranslation,
  type TranslationParams,
  type TranslationTree,
} from './translate';

const TRANSLATIONS: Record<AppLocale, TranslationTree> = {
  en: en as TranslationTree,
  es: es as TranslationTree,
};

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly authStore = inject(AuthStore, { optional: true });
  private readonly profileService = inject(ProfileService, { optional: true });

  private readonly _locale = signal<AppLocale>(detectBrowserLocale());

  readonly locale = this._locale.asReadonly();

  constructor() {
    effect(() => {
      const user = this.authStore?.user();
      if (!user) return;

      untracked(() => {
        void this.hydrateFromProfile(user.id);
      });
    });

    effect(() => {
      this.document.documentElement.lang = this._locale();
    });
  }

  translate(key: string, params?: TranslationParams): string {
    const template =
      resolveTranslation(TRANSLATIONS[this._locale()], key) ??
      resolveTranslation(TRANSLATIONS.en, key) ??
      key;
    return interpolate(template, params);
  }

  translateError(code: AppErrorCode): string {
    return this.translate(errorTranslationKey(code));
  }

  async setLocale(locale: AppLocale): Promise<void> {
    this._locale.set(locale);

    const user = this.authStore?.user();
    if (!user || !this.profileService) return;

    await this.profileService.updateLocale(user.id, locale);
  }

  private async hydrateFromProfile(userId: string): Promise<void> {
    try {
      if (!this.profileService) return;

      const locale = await this.profileService.getLocale(userId);
      if (locale) {
        this._locale.set(locale);
        return;
      }
    } catch {
      this._locale.set(detectBrowserLocale());
    }
  }
}

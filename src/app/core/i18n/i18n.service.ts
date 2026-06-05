import { DOCUMENT } from '@angular/common';
import { effect, inject, Injectable, signal, untracked } from '@angular/core';

import type { AppErrorCode } from '@core/errors/app-error';
import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';

import { errorTranslationKey } from './error-keys';
import { EN_TRANSLATIONS, LAZY_LOCALE_LOADERS } from './locale-loaders';
import { detectBrowserLocale, type AppLocale } from './locale.types';
import {
  interpolate,
  resolveTranslation,
  type TranslationParams,
  type TranslationTree,
} from './translate';

@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly authStore = inject(AuthStore, { optional: true });
  private readonly profileService = inject(ProfileService, { optional: true });

  private readonly _locale = signal<AppLocale>(detectBrowserLocale());
  private readonly _translations: Partial<Record<AppLocale, TranslationTree>> = {
    en: EN_TRANSLATIONS,
  };

  readonly locale = this._locale.asReadonly();

  async bootstrap(): Promise<void> {
    const locale = this._locale();
    if (locale !== 'en') {
      await this.ensureLocale(locale);
    }
  }

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
    const locale = this._locale();
    const template =
      resolveTranslation(this._translations[locale] ?? EN_TRANSLATIONS, key) ??
      resolveTranslation(EN_TRANSLATIONS, key) ??
      key;
    return interpolate(template, params);
  }

  translateError(code: AppErrorCode): string {
    return this.translate(errorTranslationKey(code));
  }

  async setLocale(locale: AppLocale): Promise<void> {
    await this.ensureLocale(locale);
    this._locale.set(locale);

    const user = this.authStore?.user();
    if (!user || !this.profileService) return;

    await this.profileService.updateLocale(user.id, locale);
  }

  private async ensureLocale(locale: AppLocale): Promise<void> {
    if (this._translations[locale]) return;

    const loader = LAZY_LOCALE_LOADERS[locale];
    if (!loader) return;

    this._translations[locale] = await loader();
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

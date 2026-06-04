import { Dialog } from '@angular/cdk/dialog';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AuthStore } from '@core/auth/auth.store';
import { I18nService } from '@core/i18n/i18n.service';
import { APP_LOCALES, isAppLocale, type AppLocale } from '@core/i18n/locale.types';
import { ProfileService } from '@core/profile/profile.service';
import {
  APP_THEME_PREFERENCES,
  isAppThemePreference,
  type AppThemePreference,
} from '@core/theme/theme.types';
import { ThemeService } from '@core/theme/theme.service';
import { STACKR_DIALOG_OPTIONS, ToastService, TranslatePipe } from '@shared/ui';

import { DeleteAccountDialog } from './delete-account-dialog';

@Component({
  selector: 'app-settings-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.page.html',
})
export class SettingsPage {
  private readonly i18n = inject(I18nService);
  private readonly theme = inject(ThemeService);
  protected readonly auth = inject(AuthStore);
  private readonly profile = inject(ProfileService);
  private readonly dialog = inject(Dialog);
  private readonly toast = inject(ToastService);

  readonly locale = this.i18n.locale;
  readonly locales = APP_LOCALES;
  readonly themePreferences = APP_THEME_PREFERENCES;
  readonly preference = this.theme.preference;

  readonly deleting = signal(false);

  readonly userEmail = computed(() => this.auth.user()?.email ?? '');
  readonly userName = computed(() => this.auth.user()?.name ?? '');

  localeLabel(code: AppLocale): string {
    return this.i18n.translate(`settings.language.${code}`);
  }

  themeLabel(code: AppThemePreference): string {
    return this.i18n.translate(`settings.appearance.${code}`);
  }

  onLocaleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isAppLocale(value)) {
      void this.i18n.setLocale(value);
    }
  }

  onThemeChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (isAppThemePreference(value)) {
      this.theme.setPreference(value);
    }
  }

  signOut(): void {
    void this.auth.signOut();
  }

  async openDeleteAccountDialog(): Promise<void> {
    const confirmed = await firstValueFrom(
      this.dialog
        .open<boolean>(DeleteAccountDialog, {
          ...STACKR_DIALOG_OPTIONS,
          maxWidth: '28rem',
          role: 'alertdialog',
          ariaLabelledBy: 'delete-account-title',
        })
        .closed,
    );

    if (!confirmed) return;

    this.deleting.set(true);
    try {
      await this.profile.deleteAccount();
      await this.auth.signOut();
    } catch {
      this.toast.error('api/server-error');
    } finally {
      this.deleting.set(false);
    }
  }
}

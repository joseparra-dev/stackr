import {
  computed,
  DestroyRef,
  DOCUMENT,
  effect,
  inject,
  Injectable,
  signal,
  untracked,
} from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';

import {
  isAppThemePreference,
  resolveThemePreference,
  type AppThemePreference,
  type ResolvedTheme,
} from './theme.types';

export const THEME_STORAGE_KEY = 'stackr:theme' as const;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly authStore = inject(AuthStore, { optional: true });
  private readonly profileService = inject(ProfileService, { optional: true });

  private readonly mediaQuery =
    this.document.defaultView?.matchMedia?.('(prefers-color-scheme: dark)') ?? null;

  private readonly _prefersDark = signal(this.mediaQuery?.matches ?? false);
  private readonly _preference = signal<AppThemePreference>(this.readStoredPreference());

  readonly preference = this._preference.asReadonly();

  readonly theme = computed((): ResolvedTheme =>
    resolveThemePreference(this._preference(), this._prefersDark()),
  );

  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    this.applyResolvedTheme(this.theme());

    this.mediaQuery?.addEventListener('change', this.onSystemPreferenceChange);
    this.destroyRef.onDestroy(() => {
      this.mediaQuery?.removeEventListener('change', this.onSystemPreferenceChange);
    });

    effect(() => {
      const user = this.authStore?.user();
      if (!user) return;

      untracked(() => {
        void this.hydrateFromProfile(user.id);
      });
    });
  }

  toggle(): void {
    this.setPreference(this.isDark() ? 'light' : 'dark');
  }

  setPreference(preference: AppThemePreference): void {
    this._preference.set(preference);
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    this.applyResolvedTheme(this.theme());

    const user = this.authStore?.user();
    if (!user || !this.profileService) return;

    void this.profileService.updateTheme(user.id, preference);
  }

  private readonly onSystemPreferenceChange = (event: MediaQueryListEvent): void => {
    this._prefersDark.set(event.matches);
    if (this._preference() !== 'system') return;
    this.applyResolvedTheme(this.theme());
  };

  private applyResolvedTheme(theme: ResolvedTheme): void {
    this.document.documentElement.setAttribute('data-theme', theme);
  }

  private readStoredPreference(): AppThemePreference {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isAppThemePreference(stored)) {
      return stored;
    }
    const prefersDark = this.mediaQuery?.matches ?? false;
    return prefersDark ? 'dark' : 'light';
  }

  private async hydrateFromProfile(userId: string): Promise<void> {
    try {
      if (!this.profileService) return;

      const theme = await this.profileService.getTheme(userId);
      if (!theme) return;

      this._preference.set(theme);
      localStorage.setItem(THEME_STORAGE_KEY, theme);
      this.applyResolvedTheme(this.theme());
    } catch {
      /* keep local preference */
    }
  }
}

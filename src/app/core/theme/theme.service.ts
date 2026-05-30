import { computed, Injectable, signal, inject, DOCUMENT } from '@angular/core';

type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'stackr:theme' as const;

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly _theme = signal<Theme>('light');
  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this.theme() === 'dark');

  constructor() {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;

    if (storedTheme) {
      this._theme.set(storedTheme);
    }
  }

  toggle(): void {
    this.setTheme(this.theme() === 'light' ? 'dark' : 'light');
  }

  setTheme(theme: Theme): void {
    this._theme.set(theme);

    localStorage.setItem(THEME_STORAGE_KEY, theme);

    this.document.documentElement.setAttribute('data-theme', theme);
  }
}

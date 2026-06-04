export const APP_THEME_PREFERENCES = ['light', 'dark', 'system'] as const;

export type AppThemePreference = (typeof APP_THEME_PREFERENCES)[number];

export type ResolvedTheme = 'light' | 'dark';

export function isAppThemePreference(value: string): value is AppThemePreference {
  return (APP_THEME_PREFERENCES as readonly string[]).includes(value);
}

export function resolveThemePreference(
  preference: AppThemePreference,
  prefersDark: boolean,
): ResolvedTheme {
  if (preference === 'system') {
    return prefersDark ? 'dark' : 'light';
  }
  return preference;
}

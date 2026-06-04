export const APP_LOCALES = ['en', 'es'] as const;

export type AppLocale = (typeof APP_LOCALES)[number];

export function isAppLocale(value: string): value is AppLocale {
  return (APP_LOCALES as readonly string[]).includes(value);
}

export function detectBrowserLocale(): AppLocale {
  if (typeof navigator === 'undefined') return 'en';
  const language = navigator.language.toLowerCase();
  return language.startsWith('es') ? 'es' : 'en';
}

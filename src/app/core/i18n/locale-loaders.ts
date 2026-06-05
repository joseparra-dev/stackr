import en from '../../../locales/en.json';

import type { AppLocale } from './locale.types';
import type { TranslationTree } from './translate';

export const EN_TRANSLATIONS = en as TranslationTree;

/** Non-default locales load on demand; `en` stays eager as the fallback tree. */
export const LAZY_LOCALE_LOADERS: Partial<Record<AppLocale, () => Promise<TranslationTree>>> = {
  es: () => import('../../../locales/es.json').then((m) => m.default as TranslationTree),
};

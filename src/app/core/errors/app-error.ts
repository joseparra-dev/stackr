import { errorTranslationKey } from '@core/i18n/error-keys';
import { resolveTranslation, type TranslationTree } from '@core/i18n/translate';

import en from '../../../locales/en.json';

export type AppErrorCode =
  | 'auth/unauthorized'
  | 'auth/session-expired'
  | 'network/offline'
  | 'network/timeout'
  | 'api/rate-limit'
  | 'api/server-error'
  | 'validation/invalid-input'
  | 'unknown';

const EN_TRANSLATIONS = en as TranslationTree;

export class AppError extends Error {
  public override readonly cause?: unknown;

  constructor(
    public readonly code: AppErrorCode,
    message: string,
    cause?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    this.cause = cause;
  }

  static from(value: unknown, fallbackMessage = 'Unexpected error'): AppError {
    if (value instanceof AppError) {
      return value;
    }
    const message = value instanceof Error ? value.message : fallbackMessage;
    return new AppError('unknown', message, value);
  }
}

export function errorMessage(code: AppErrorCode): string {
  return (
    resolveTranslation(EN_TRANSLATIONS, errorTranslationKey(code)) ??
    resolveTranslation(EN_TRANSLATIONS, 'errors.unknown') ??
    'Something went wrong. Please try again.'
  );
}

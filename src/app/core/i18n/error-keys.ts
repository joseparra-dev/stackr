import type { AppErrorCode } from '@core/errors/app-error';

const ERROR_KEY_BY_CODE: Record<AppErrorCode, string> = {
  'auth/unauthorized': 'errors.auth.unauthorized',
  'auth/session-expired': 'errors.auth.sessionExpired',
  'network/offline': 'errors.network.offline',
  'network/timeout': 'errors.network.timeout',
  'api/rate-limit': 'errors.api.rateLimit',
  'api/server-error': 'errors.api.serverError',
  'validation/invalid-input': 'errors.validation.invalidInput',
  unknown: 'errors.unknown',
};

export function errorTranslationKey(code: AppErrorCode): string {
  return ERROR_KEY_BY_CODE[code];
}

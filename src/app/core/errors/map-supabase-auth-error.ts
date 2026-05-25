import { isAuthError, type AuthError } from '@supabase/supabase-js';

import { AppError, type AppErrorCode } from './app-error';

function isNetworkError(value: unknown): boolean {
  return value instanceof TypeError && /fetch|network/i.test(value.message);
}

// Codes sourced from `@supabase/auth-js/dist/lib/error-codes.d.ts`.
const SESSION_EXPIRED_CODES = new Set<string>([
  'session_not_found',
  'session_expired',
  'refresh_token_not_found',
  'refresh_token_already_used',
  'flow_state_expired',
  'bad_jwt',
]);

const RATE_LIMIT_CODES = new Set<string>([
  'over_request_rate_limit',
  'over_email_send_rate_limit',
  'over_sms_send_rate_limit',
]);

function codeForAuthError(err: AuthError): AppErrorCode {
  const status = err.status ?? 0;
  const code = err.code;

  if (code && SESSION_EXPIRED_CODES.has(code)) return 'auth/session-expired';
  if (code && RATE_LIMIT_CODES.has(code)) return 'api/rate-limit';
  if (err.name === 'AuthSessionMissingError') return 'auth/session-expired';
  if (err.name === 'AuthRetryableFetchError') {
    return status >= 500 ? 'api/server-error' : 'network/offline';
  }
  if (status >= 500) return 'api/server-error';
  return 'auth/unauthorized';
}

/**
 * Centralised here (not inside `AuthService`) so the same rules apply to
 * any code path touching Supabase Auth — guards, interceptors, callbacks.
 * Pure function: takes a value, returns an `AppError`. No mocks required.
 */
export function mapSupabaseAuthError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  if (isNetworkError(value)) {
    return new AppError('network/offline', 'No internet connection', value);
  }
  if (isAuthError(value)) {
    return new AppError(codeForAuthError(value), value.message, value);
  }
  return AppError.from(value, 'Authentication failed');
}

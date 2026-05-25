/**
 * Closed taxonomy of error codes used across the app. Adding a new code
 * requires a conscious decision — usually an ADR. Components render UI
 * based on `code` (never the message), so each entry should map to a
 * distinct user-facing message or recovery action.
 */
export type AppErrorCode =
  | 'auth/unauthorized'
  | 'auth/session-expired'
  | 'network/offline'
  | 'network/timeout'
  | 'api/rate-limit'
  | 'api/server-error'
  | 'validation/invalid-input'
  | 'unknown';

/**
 * Single error type that crosses every layer of the app. Services map
 * vendor errors (Supabase, CoinGecko, fetch) to `AppError`, stores capture
 * it in their `_error` signal, and components render UI based on `code`.
 *
 * `cause` is preserved for diagnostics (Sentry) but never shown to users
 * — OWASP A09: detailed errors stay server-side only.
 */
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

  /** Returns the value unchanged when it's already an `AppError`, so
   *  re-throws don't lose code/cause. */
  static from(value: unknown, fallbackMessage = 'Unexpected error'): AppError {
    if (value instanceof AppError) {
      return value;
    }
    const message = value instanceof Error ? value.message : fallbackMessage;
    return new AppError('unknown', message, value);
  }
}

export type AppErrorCode =
  | 'auth/unauthorized'
  | 'auth/session-expired'
  | 'network/offline'
  | 'network/timeout'
  | 'api/rate-limit'
  | 'api/server-error'
  | 'validation/invalid-input'
  | 'unknown';

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

export function errorMessage(code: AppErrorCode): string {
  switch (code) {
    case 'auth/unauthorized':
      return 'Sign-in failed. Please try again.';
    case 'auth/session-expired':
      return 'Your session has expired. Please sign in again.';
    case 'network/offline':
      return 'No internet connection. Check your network and try again.';
    case 'network/timeout':
      return 'The request took too long. Please try again.';
    case 'api/rate-limit':
      return 'Too many attempts. Please wait a moment and try again.';
    case 'api/server-error':
      return 'Something went wrong on our side. Please try again later.';
    case 'validation/invalid-input':
      return 'Some of the information provided is invalid.';
    case 'unknown':
      return 'Something went wrong. Please try again.';
    default: {
      const _exhaustive: never = code;
      return _exhaustive;
    }
  }
}

import { AppError } from '@core/errors/app-error';

export const DEFAULT_MAX_ATTEMPTS = 3;
export const DEFAULT_BASE_DELAY_MS = 1_000;

export function backoffDelayMs(attempt: number, baseDelayMs = DEFAULT_BASE_DELAY_MS): number {
  return baseDelayMs * 2 ** attempt;
}

export function isRateLimitError(error: unknown): boolean {
  return error instanceof AppError && error.code === 'api/rate-limit';
}

export async function withExponentialBackoff<T>(
  fn: () => Promise<T>,
  options: {
    readonly maxAttempts?: number;
    readonly baseDelayMs?: number;
    readonly sleep?: (ms: number) => Promise<void>;
    readonly shouldRetry?: (error: unknown) => boolean;
  } = {},
): Promise<T> {
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const baseDelayMs = options.baseDelayMs ?? DEFAULT_BASE_DELAY_MS;
  const sleep = options.sleep ?? ((ms) => new Promise((resolve) => setTimeout(resolve, ms)));
  const shouldRetry = options.shouldRetry ?? isRateLimitError;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxAttempts - 1;
      if (isLastAttempt || !shouldRetry(error)) {
        throw error;
      }
      await sleep(backoffDelayMs(attempt, baseDelayMs));
    }
  }

  throw new Error('withExponentialBackoff exhausted attempts without returning');
}

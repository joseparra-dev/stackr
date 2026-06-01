import { AppError, type AppErrorCode } from './app-error';

/**
 * Minimal shape of a Supabase/PostgREST error. It's a plain object (not an
 * `Error` subclass), so we narrow structurally instead of with `instanceof`.
 */
interface SupabaseLikeError {
  readonly code?: string;
  readonly message?: string;
}

function isSupabaseError(value: unknown): value is SupabaseLikeError {
  return typeof value === 'object' && value !== null && ('code' in value || 'message' in value);
}

function isNetworkError(value: unknown): boolean {
  return value instanceof TypeError && /fetch|network/i.test(value.message);
}

/** Maps a Postgres SQLSTATE / PostgREST code to an {@link AppErrorCode}. */
function codeForPostgres(code: string | undefined): AppErrorCode {
  switch (code) {
    // Ownership / auth: raised by our RPC (28000) or RLS denials (42501).
    case '28000':
    case '42501':
    case 'PGRST301':
      return 'auth/unauthorized';
    // Integrity violations map to invalid input (CHECK, FK, unique, not-found).
    case '23514': // check_violation (quantity > 0, fee >= 0, executed_at <= now, …)
    case '23503': // foreign_key_violation
    case '23505': // unique_violation
    case 'P0002': // raised by update_transaction when the row isn't owned/found
      return 'validation/invalid-input';
    default:
      return 'api/server-error';
  }
}

/** Maps Supabase/PostgREST failures to {@link AppError}. Pure function — easy to test. */
export function mapSupabaseError(value: unknown): AppError {
  if (value instanceof AppError) return value;
  if (isNetworkError(value)) {
    return new AppError('network/offline', 'No internet connection', value);
  }
  if (isSupabaseError(value)) {
    const code = codeForPostgres(value.code);
    return new AppError(code, value.message ?? 'Supabase request failed', value);
  }
  return AppError.from(value, 'Supabase request failed');
}

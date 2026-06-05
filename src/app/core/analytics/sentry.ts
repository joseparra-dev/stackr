import * as Sentry from '@sentry/angular';
import { createErrorHandler, type SentryErrorHandler } from '@sentry/angular';

import { environment } from '@env/environment';

export function initSentry(): void {
  const dsn = environment.sentryDsn;
  if (!dsn) return;

  const release = import.meta.env['NG_APP_SENTRY_RELEASE'];

  Sentry.init({
    dsn,
    environment: import.meta.env['NG_APP_ENV'] ?? 'development',
    ...(typeof release === 'string' && release.length > 0 ? { release } : {}),
    // Benign Supabase auth lock contention (zone.js + Web Locks API); auth still works.
    ignoreErrors: [
      'NavigatorLockAcquireTimeoutError',
      'ProcessLockAcquireTimeoutError',
      /Acquiring an exclusive Navigator LockManager lock/,
      /Acquiring process lock with name/,
    ],
  });
}

export function createSentryErrorHandler(): SentryErrorHandler | null {
  if (!environment.sentryDsn) return null;
  return createErrorHandler({ showDialog: false });
}

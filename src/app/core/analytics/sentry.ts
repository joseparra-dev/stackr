import * as Sentry from '@sentry/angular';
import { createErrorHandler, type SentryErrorHandler } from '@sentry/angular';

import { environment } from '@env/environment';

export function initSentry(): void {
  const dsn = environment.sentryDsn;
  if (!dsn) return;

  Sentry.init({
    dsn,
    environment: import.meta.env['NG_APP_ENV'] ?? 'development',
  });
}

export function createSentryErrorHandler(): SentryErrorHandler | null {
  if (!environment.sentryDsn) return null;
  return createErrorHandler({ showDialog: false });
}

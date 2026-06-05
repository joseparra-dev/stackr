import type { ApplicationConfig } from '@angular/core';
import {
  ErrorHandler,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { scheduleSentryInit } from '@core/analytics/schedule-sentry-init';
import { SentryErrorHandler } from '@core/analytics/sentry-error-handler';
import { AuthStore } from '@core/auth/auth.store';
import { I18nService } from '@core/i18n/i18n.service';
import { PageTitleService } from '@core/page-title/page-title.service';
import { provideSupabase } from '@core/supabase/supabase.client';

import { routes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSupabase(),
    // Force-instantiate AuthStore so it subscribes to `onAuthStateChange`
    // before the first protected route activates. Without this, a guard
    // could run while `user` is still `null` and wrongly redirect to
    // /login on a page refresh.
    { provide: ErrorHandler, useClass: SentryErrorHandler },
    provideAppInitializer(() => {
      scheduleSentryInit();
      inject(AuthStore);
      inject(PageTitleService);
      return inject(I18nService).bootstrap();
    }),
    provideHttpClient(withFetch()),
  ],
};

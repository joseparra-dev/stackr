import type { ApplicationConfig } from '@angular/core';
import { inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { AuthStore } from '@core/auth/auth.store';
import { provideSupabase } from '@core/supabase/supabase.client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideSupabase(),
    // Force-instantiate AuthStore so it subscribes to `onAuthStateChange`
    // before the first protected route activates. Without this, a guard
    // could run while `user` is still `null` and wrongly redirect to
    // /login on a page refresh.
    provideAppInitializer(() => {
      inject(AuthStore);
    }),
  ],
};

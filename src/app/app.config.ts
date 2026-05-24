import type { ApplicationConfig } from '@angular/core';
import { provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideSupabase } from '@core/supabase/supabase.client';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideRouter(routes), provideSupabase()],
};

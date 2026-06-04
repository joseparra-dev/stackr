import { signal, type Provider } from '@angular/core';

import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';

export function provideI18nTestDeps(): Provider[] {
  return [
    {
      provide: AuthStore,
      useValue: {
        user: signal(null),
      },
    },
    {
      provide: ProfileService,
      useValue: {
        getLocale: async () => null,
        updateLocale: async () => undefined,
      },
    },
  ];
}

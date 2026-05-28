import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { AuthStore } from './auth.store';
import { Router } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';

async function waitUntilReady(store: AuthStore): Promise<void> {
  if (!store.loading()) return;
  const ready$ = toObservable(store.loading).pipe(filter((v) => v === false));
  await firstValueFrom(ready$);
}

export const authGuard: CanActivateFn = async (_route, state) => {
  const store = inject(AuthStore);
  const router = inject(Router);

  await waitUntilReady(store);

  return store.isAuthenticated()
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};

export const guestGuard: CanActivateFn = async () => {
  const store = inject(AuthStore);
  const router = inject(Router);

  await waitUntilReady(store);

  return store.isAuthenticated() ? router.parseUrl('/') : true;
};

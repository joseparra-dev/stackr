import { TestBed } from '@angular/core/testing';
import { signal, EnvironmentInjector } from '@angular/core';
import { Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';

import { AuthStore } from './auth.store';
import { authGuard, guestGuard } from './auth.guard';
import type { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';

function makeAuthStub(opts: { isAuthenticated: boolean; loading?: boolean }) {
  return {
    isAuthenticated: signal(opts.isAuthenticated),
    loading: signal(opts.loading ?? false),
  };
}

function makeRouterStub() {
  return {
    createUrlTree: vi.fn((commands, extras) => ({ kind: 'url-tree', commands, extras })),
    parseUrl: vi.fn((url) => ({ kind: 'parsed', url })),
  };
}

function configure(authStub: ReturnType<typeof makeAuthStub>, routerStub = makeRouterStub()) {
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthStore, useValue: authStub },
      { provide: Router, useValue: routerStub },
    ],
  });
  return { authStub, routerStub };
}

async function runGuard(guard: typeof authGuard, url = '/protected') {
  const injector = TestBed.inject(EnvironmentInjector);
  return injector.runInContext(() =>
    guard({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot),
  );
}

describe('authGuard', () => {
  it('returns true when the user is authenticated', async () => {
    configure(makeAuthStub({ isAuthenticated: true }));
    const result = await runGuard(authGuard);
    expect(result).toBe(true);
  });

  it('redirects to /login with returnUrl when not authenticated', async () => {
    const { routerStub } = configure(makeAuthStub({ isAuthenticated: false }));
    const result = await runGuard(authGuard);

    expect(routerStub.createUrlTree).toHaveBeenCalledWith(['/login'], {
      queryParams: { returnUrl: '/protected' },
    });
    expect(result).toBe(routerStub.createUrlTree.mock.results[0].value);
  });

  it('waits for AuthStore to finish loading before deciding', async () => {
    const { authStub } = configure(makeAuthStub({ isAuthenticated: false, loading: true }));

    let resolved = false;
    const guardPromise = runGuard(authGuard).then((result) => {
      resolved = true;
      return result;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(false);

    authStub.isAuthenticated.set(true);
    await Promise.resolve();
    expect(resolved).toBe(false);

    authStub.loading.set(false);
    const result = await guardPromise;

    expect(resolved).toBe(true);
    expect(result).toBe(true);
  });
});

describe('guestGuard', () => {
  it('returns true when the user is NOT authenticated', async () => {
    configure(makeAuthStub({ isAuthenticated: false }));
    const result = await runGuard(guestGuard);
    expect(result).toBe(true);
  });

  it('redirects to / when an authenticated user visits a guest route', async () => {
    const { routerStub } = configure(makeAuthStub({ isAuthenticated: true }));
    const result = await runGuard(guestGuard);

    expect(routerStub.parseUrl).toHaveBeenCalledWith('/');
    expect(result).toBe(routerStub.parseUrl.mock.results[0].value);
  });

  it('waits for AuthStore to finish loading before deciding', async () => {
    const { authStub, routerStub } = configure(
      makeAuthStub({ isAuthenticated: false, loading: true }),
    );

    let resolved = false;
    const guardPromise = runGuard(guestGuard).then((result) => {
      resolved = true;
      return result;
    });

    await Promise.resolve();
    await Promise.resolve();
    expect(resolved).toBe(false);

    authStub.isAuthenticated.set(true);
    await Promise.resolve();
    expect(resolved).toBe(false);

    authStub.loading.set(false);
    const result = await guardPromise;

    expect(routerStub.parseUrl).toHaveBeenCalledWith('/');
    expect(result).toBe(routerStub.parseUrl.mock.results[0].value);
  });
});

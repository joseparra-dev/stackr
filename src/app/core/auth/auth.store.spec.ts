import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';

import { AuthService } from './auth.service';
import { AuthStore } from './auth.store';
import type { AuthEvent, AuthSubscription } from './auth.types';

type AuthCallback = (event: AuthEvent, session: unknown) => void;

function makeAuthServiceMock() {
  const listeners: AuthCallback[] = [];
  const unsubscribe = vi.fn();

  const subscription: AuthSubscription = { unsubscribe };

  const mock = {
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
    getCurrentSession: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn((cb: AuthCallback) => {
      listeners.push(cb);
      return subscription;
    }),
  } as Pick<
    AuthService,
    'signInWithGoogle' | 'signOut' | 'getCurrentSession' | 'onAuthStateChange'
  >;

  return {
    mock,
    unsubscribe,
    emit: (event: AuthEvent, session: unknown = null) =>
      listeners.forEach((cb) => cb(event, session)),
  };
}

function makeFakeSession(
  overrides: Partial<{ id: string; email: string; name: string; avatar: string }> = {},
) {
  return {
    user: {
      id: overrides.id ?? 'user-1',
      email: overrides.email ?? 'jose@example.com',
      user_metadata: {
        full_name: overrides.name ?? 'Jose Parra',
        avatar_url: overrides.avatar ?? 'https://avatars/jose.png',
      },
    },
  } as const;
}

function configure(authServiceMock: ReturnType<typeof makeAuthServiceMock>['mock']) {
  const router = { navigateByUrl: vi.fn().mockResolvedValue(true) } as unknown as Router;
  TestBed.configureTestingModule({
    providers: [
      { provide: AuthService, useValue: authServiceMock },
      { provide: Router, useValue: router },
    ],
  });
  return { store: TestBed.inject(AuthStore), router };
}

describe('AuthStore', () => {
  let mock: ReturnType<typeof makeAuthServiceMock>;

  beforeEach(() => {
    mock = makeAuthServiceMock();
  });

  it('starts with loading=true and no user', () => {
    const { store } = configure(mock.mock);
    expect(store.loading()).toBe(true);
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('subscribes to onAuthStateChange on construction', () => {
    configure(mock.mock);
    expect(mock.mock.onAuthStateChange).toHaveBeenCalledTimes(1);
  });

  it('updates user on SIGNED_IN and flips isAuthenticated', () => {
    const { store } = configure(mock.mock);

    mock.emit('SIGNED_IN', makeFakeSession());

    expect(store.isAuthenticated()).toBe(true);
    expect(store.user()).toMatchObject({
      id: 'user-1',
      email: 'jose@example.com',
      name: 'Jose Parra',
      avatarUrl: 'https://avatars/jose.png',
    });
    expect(store.loading()).toBe(false);
  });

  it('clears user and flips isAuthenticated to false on SIGNED_OUT', () => {
    const { store } = configure(mock.mock);
    mock.emit('SIGNED_IN', makeFakeSession());

    mock.emit('SIGNED_OUT', null);

    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBe(false);
  });

  it('rehydrates from getCurrentSession when no event fires', async () => {
    mock.mock.getCurrentSession = vi.fn().mockResolvedValue(makeFakeSession({ id: 'user-2' }));
    const { store } = configure(mock.mock);

    await Promise.resolve();
    await Promise.resolve();

    expect(store.user()?.id).toBe('user-2');
    expect(store.loading()).toBe(false);
  });

  it('captures sign-in errors in the error signal', async () => {
    mock.mock.signInWithGoogle = vi
      .fn()
      .mockRejectedValue(new AppError('network/offline', 'no net'));
    const { store } = configure(mock.mock);

    await store.signInWithGoogle();

    expect(store.error()?.code).toBe('network/offline');
    expect(store.loading()).toBe(false);
  });

  it('navigates to /login after sign-out (even on error)', async () => {
    mock.mock.signOut = vi.fn().mockRejectedValue(new AppError('unknown', 'boom'));
    const { store, router } = configure(mock.mock);
    mock.emit('SIGNED_IN', makeFakeSession());

    await store.signOut();

    expect(router.navigateByUrl).toHaveBeenCalledWith('/login');
    expect(store.user()).toBeNull();
    expect(store.error()?.code).toBe('unknown');
  });

  it('clears the error via clearError()', async () => {
    mock.mock.signInWithGoogle = vi.fn().mockRejectedValue(new AppError('unknown', 'x'));
    const { store } = configure(mock.mock);

    await store.signInWithGoogle();
    expect(store.error()).not.toBeNull();

    store.clearError();
    expect(store.error()).toBeNull();
  });

  it('unsubscribes from the auth listener when the injector is destroyed', () => {
    configure(mock.mock);
    TestBed.resetTestingModule();
    expect(mock.unsubscribe).toHaveBeenCalledTimes(1);
  });
});

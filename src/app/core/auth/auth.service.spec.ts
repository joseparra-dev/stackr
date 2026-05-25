import { DOCUMENT } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { AuthError } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';
import { SUPABASE_CLIENT } from '@core/supabase/supabase.client';

import { AuthService } from './auth.service';

type AuthStateCallback = (event: string, session: unknown) => void;

interface MockSupabaseAuth {
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signOut: ReturnType<typeof vi.fn>;
  getSession: ReturnType<typeof vi.fn>;
  onAuthStateChange: ReturnType<typeof vi.fn>;
}

interface MockSupabaseClient {
  auth: MockSupabaseAuth;
}

function makeMockClient(): {
  client: MockSupabaseClient;
  unsubscribe: ReturnType<typeof vi.fn>;
  emit: (event: string, session?: unknown) => void;
} {
  const listeners: AuthStateCallback[] = [];
  const unsubscribe = vi.fn();

  const client: MockSupabaseClient = {
    auth: {
      signInWithOAuth: vi
        .fn()
        .mockResolvedValue({ data: { provider: 'google', url: 'x' }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      onAuthStateChange: vi.fn((cb: AuthStateCallback) => {
        listeners.push(cb);
        return { data: { subscription: { unsubscribe } } };
      }),
    },
  };

  return {
    client,
    unsubscribe,
    emit: (event: string, session: unknown = null) => listeners.forEach((cb) => cb(event, session)),
  };
}

function configure(client: MockSupabaseClient, origin = 'http://localhost:4200') {
  const fakeDoc = {
    defaultView: { location: { origin } },
  } as unknown as Document;

  TestBed.configureTestingModule({
    providers: [
      { provide: SUPABASE_CLIENT, useValue: client },
      { provide: DOCUMENT, useValue: fakeDoc },
    ],
  });

  return TestBed.inject(AuthService);
}

describe('AuthService', () => {
  let mock: ReturnType<typeof makeMockClient>;

  beforeEach(() => {
    mock = makeMockClient();
  });

  describe('signInWithGoogle', () => {
    it('calls signInWithOAuth with google + redirect to /auth/callback', async () => {
      const service = configure(mock.client);

      await service.signInWithGoogle();

      expect(mock.client.auth.signInWithOAuth).toHaveBeenCalledTimes(1);
      expect(mock.client.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          provider: 'google',
          options: expect.objectContaining({
            redirectTo: 'http://localhost:4200/auth/callback',
            queryParams: { access_type: 'offline', prompt: 'consent' },
          }),
        }),
      );
    });

    it('honours an explicit redirectTo argument', async () => {
      const service = configure(mock.client);

      await service.signInWithGoogle('http://localhost:4200/elsewhere');

      expect(mock.client.auth.signInWithOAuth).toHaveBeenCalledWith(
        expect.objectContaining({
          options: expect.objectContaining({ redirectTo: 'http://localhost:4200/elsewhere' }),
        }),
      );
    });

    it('throws AppError("auth/unauthorized") when Supabase returns an AuthError', async () => {
      const service = configure(mock.client);
      mock.client.auth.signInWithOAuth.mockResolvedValueOnce({
        data: { provider: 'google', url: null },
        error: new AuthError('Provider disabled', 400, 'provider_disabled'),
      });

      await expect(service.signInWithGoogle()).rejects.toMatchObject({
        code: 'auth/unauthorized',
      });
    });

    it('throws AppError("network/offline") on fetch failures', async () => {
      const service = configure(mock.client);
      mock.client.auth.signInWithOAuth.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(service.signInWithGoogle()).rejects.toMatchObject({
        code: 'network/offline',
      });
    });

    it('fails closed when no window/origin is available', async () => {
      const fakeDoc = { defaultView: { location: { origin: '' } } } as unknown as Document;
      TestBed.configureTestingModule({
        providers: [
          { provide: SUPABASE_CLIENT, useValue: mock.client },
          { provide: DOCUMENT, useValue: fakeDoc },
        ],
      });
      const service = TestBed.inject(AuthService);

      await expect(service.signInWithGoogle()).rejects.toBeInstanceOf(AppError);
      expect(mock.client.auth.signInWithOAuth).not.toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('calls supabase.auth.signOut on the happy path', async () => {
      const service = configure(mock.client);

      await service.signOut();

      expect(mock.client.auth.signOut).toHaveBeenCalledTimes(1);
    });

    it('maps AuthSessionMissingError to auth/session-expired', async () => {
      const service = configure(mock.client);
      const err = new AuthError('Auth session missing!', 400);
      err.name = 'AuthSessionMissingError';
      mock.client.auth.signOut.mockResolvedValueOnce({ error: err });

      await expect(service.signOut()).rejects.toMatchObject({ code: 'auth/session-expired' });
    });
  });

  describe('getCurrentSession', () => {
    it('returns the session from Supabase', async () => {
      const service = configure(mock.client);
      const fakeSession = { access_token: 'jwt', user: { id: 'u1' } };
      mock.client.auth.getSession.mockResolvedValueOnce({
        data: { session: fakeSession },
        error: null,
      });

      const session = await service.getCurrentSession();
      expect(session).toBe(fakeSession);
    });

    it('throws AppError when getSession rejects', async () => {
      const service = configure(mock.client);
      mock.client.auth.getSession.mockRejectedValueOnce(new TypeError('Failed to fetch'));

      await expect(service.getCurrentSession()).rejects.toMatchObject({ code: 'network/offline' });
    });
  });

  describe('onAuthStateChange', () => {
    it('forwards INITIAL_SESSION, SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED', () => {
      const service = configure(mock.client);
      const seen: string[] = [];

      service.onAuthStateChange((event) => seen.push(event));

      mock.emit('INITIAL_SESSION');
      mock.emit('SIGNED_IN');
      mock.emit('SIGNED_OUT');
      mock.emit('TOKEN_REFRESHED');

      expect(seen).toEqual(['INITIAL_SESSION', 'SIGNED_IN', 'SIGNED_OUT', 'TOKEN_REFRESHED']);
    });

    it('drops events outside the curated list', () => {
      const service = configure(mock.client);
      const seen: string[] = [];

      service.onAuthStateChange((event) => seen.push(event));

      mock.emit('USER_UPDATED');
      mock.emit('PASSWORD_RECOVERY');

      expect(seen).toEqual([]);
    });

    it('forwards unsubscribe to the underlying subscription', () => {
      const service = configure(mock.client);

      const sub = service.onAuthStateChange(() => undefined);
      sub.unsubscribe();

      expect(mock.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});

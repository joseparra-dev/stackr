import { TestBed } from '@angular/core/testing';
import type * as SupabaseJs from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideSupabase, SUPABASE_CLIENT } from './supabase.client';

const { createClientMock } = vi.hoisted(() => ({
  createClientMock: vi.fn((url: string, anonKey: string, options: unknown) => ({
    __mock: true,
    url,
    anonKey,
    options,
  })),
}));

// `importOriginal` + spread keeps every other export (AuthError, isAuthError,
// type re-exports) real. Without this, sibling specs that pull `AuthError`
// from `@supabase/supabase-js` would race against this mock depending on
// worker / module-cache order.
vi.mock('@supabase/supabase-js', async (importOriginal) => {
  const actual = await importOriginal<typeof SupabaseJs>();
  return { ...actual, createClient: createClientMock };
});

describe('SUPABASE_CLIENT provider', () => {
  beforeEach(() => {
    createClientMock.mockClear();
  });

  it('builds the Supabase client with the configured URL and anon key', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSupabase({
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        }),
      ],
    });

    const client = TestBed.inject(SUPABASE_CLIENT);

    expect(client).toBeDefined();
    expect(createClientMock).toHaveBeenCalledTimes(1);
    expect(createClientMock).toHaveBeenCalledWith(
      'https://test.supabase.co',
      'test-anon-key',
      expect.any(Object),
    );
  });

  it('configures the auth client to persist the session across reloads', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSupabase({
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        }),
      ],
    });

    TestBed.inject(SUPABASE_CLIENT);

    expect(createClientMock).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'stackr.auth.token',
        }),
      }),
    );
  });

  it('returns the same client instance on repeated injection (singleton)', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSupabase({
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
        }),
      ],
    });

    const first = TestBed.inject(SUPABASE_CLIENT);
    const second = TestBed.inject(SUPABASE_CLIENT);

    expect(first).toBe(second);
    expect(createClientMock).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the Supabase URL is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: '', anonKey: 'test-anon-key' })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(createClientMock).not.toHaveBeenCalled();
  });

  it('fails closed when the anon key is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: 'https://test.supabase.co', anonKey: '' })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(createClientMock).not.toHaveBeenCalled();
  });
});

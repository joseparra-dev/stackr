import { TestBed } from '@angular/core/testing';
import type { SupabaseClient } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { provideSupabase, SUPABASE_CLIENT, type CreateSupabaseClient } from './supabase.client';

function makeCreateClientStub(): CreateSupabaseClient & ReturnType<typeof vi.fn> {
  return vi.fn((url: string, anonKey: string, options: unknown) => ({
    __mock: true,
    url,
    anonKey,
    options,
  })) as unknown as CreateSupabaseClient & ReturnType<typeof vi.fn>;
}

describe('SUPABASE_CLIENT provider', () => {
  let createClient: CreateSupabaseClient & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    createClient = makeCreateClientStub();
  });

  it('builds the Supabase client with the configured URL and anon key', () => {
    TestBed.configureTestingModule({
      providers: [
        provideSupabase({
          url: 'https://test.supabase.co',
          anonKey: 'test-anon-key',
          createClient,
        }),
      ],
    });

    const client = TestBed.inject<SupabaseClient>(SUPABASE_CLIENT);

    expect(client).toBeDefined();
    expect(createClient).toHaveBeenCalledTimes(1);
    expect(createClient).toHaveBeenCalledWith(
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
          createClient,
        }),
      ],
    });

    TestBed.inject(SUPABASE_CLIENT);

    expect(createClient).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(String),
      expect.objectContaining({
        auth: expect.objectContaining({
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'stackr.auth.token',
          lock: expect.any(Function),
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
          createClient,
        }),
      ],
    });

    const first = TestBed.inject(SUPABASE_CLIENT);
    const second = TestBed.inject(SUPABASE_CLIENT);

    expect(first).toBe(second);
    expect(createClient).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the Supabase URL is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: '', anonKey: 'test-anon-key', createClient })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(createClient).not.toHaveBeenCalled();
  });

  it('fails closed when the anon key is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: 'https://test.supabase.co', anonKey: '', createClient })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(createClient).not.toHaveBeenCalled();
  });
});

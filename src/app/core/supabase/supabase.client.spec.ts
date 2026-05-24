import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import * as supabaseJs from '@supabase/supabase-js';

import { provideSupabase, SUPABASE_CLIENT } from './supabase.client';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn((url: string, anonKey: string, options: unknown) => ({
    __mock: true,
    url,
    anonKey,
    options,
  })),
}));

describe('SUPABASE_CLIENT provider', () => {
  beforeEach(() => {
    vi.mocked(supabaseJs.createClient).mockClear();
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
    expect(supabaseJs.createClient).toHaveBeenCalledTimes(1);
    expect(supabaseJs.createClient).toHaveBeenCalledWith(
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

    expect(supabaseJs.createClient).toHaveBeenCalledWith(
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
    expect(supabaseJs.createClient).toHaveBeenCalledTimes(1);
  });

  it('fails closed when the Supabase URL is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: '', anonKey: 'test-anon-key' })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(supabaseJs.createClient).not.toHaveBeenCalled();
  });

  it('fails closed when the anon key is missing', () => {
    TestBed.configureTestingModule({
      providers: [provideSupabase({ url: 'https://test.supabase.co', anonKey: '' })],
    });

    expect(() => TestBed.inject(SUPABASE_CLIENT)).toThrowError(/Missing/i);
    expect(supabaseJs.createClient).not.toHaveBeenCalled();
  });
});

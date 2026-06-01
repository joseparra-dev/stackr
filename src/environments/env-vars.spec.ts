import { describe, expect, it } from 'vitest';

import { envVar } from './env-vars';

describe('envVar', () => {
  it('returns a string without throwing when env is absent', () => {
    expect(typeof envVar('NG_APP_SENTRY_DSN')).toBe('string');
    expect(typeof envVar('NG_APP_SUPABASE_URL', 'fallback')).toBe('string');
  });
});

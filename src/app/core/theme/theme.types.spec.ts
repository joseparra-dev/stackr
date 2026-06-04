import { describe, expect, it } from 'vitest';

import { isAppThemePreference, resolveThemePreference } from './theme.types';

describe('theme.types', () => {
  it('resolveThemePreference maps system to OS preference', () => {
    expect(resolveThemePreference('system', true)).toBe('dark');
    expect(resolveThemePreference('system', false)).toBe('light');
  });

  it('resolveThemePreference passes through explicit themes', () => {
    expect(resolveThemePreference('dark', false)).toBe('dark');
    expect(resolveThemePreference('light', true)).toBe('light');
  });

  it('isAppThemePreference narrows valid values', () => {
    expect(isAppThemePreference('system')).toBe(true);
    expect(isAppThemePreference('invalid')).toBe(false);
  });
});

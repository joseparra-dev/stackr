import { describe, expect, it } from 'vitest';

import { interpolate, resolveTranslation } from './translate';

describe('translate', () => {
  it('resolves nested keys', () => {
    const tree = { nav: { brand: { name: 'Stackr' } } };
    expect(resolveTranslation(tree, 'nav.brand.name')).toBe('Stackr');
  });

  it('interpolates placeholders', () => {
    expect(interpolate('Hello {name}', { name: 'Ada' })).toBe('Hello Ada');
  });
});

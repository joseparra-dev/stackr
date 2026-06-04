import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { I18nService } from './i18n.service';

describe('I18nService', () => {
  it('translates keys in the active locale', async () => {
    const service = TestBed.configureTestingModule({}).inject(I18nService);

    await service.setLocale('es');

    expect(service.translate('nav.items.transactions')).toBe('Transacciones');
  });

  it('interpolates params in templates', () => {
    const service = TestBed.configureTestingModule({}).inject(I18nService);

    expect(
      service.translate('transactions.filteredEmpty.message', { filters: 'BTC' }),
    ).toContain('BTC');
  });
});

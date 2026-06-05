import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { provideI18nTestDeps } from './i18n-testing';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
  let service: I18nService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: provideI18nTestDeps(),
    }).compileComponents();

    service = TestBed.inject(I18nService);
    await service.bootstrap();
  });

  it('translates keys in the active locale', async () => {
    await service.setLocale('es');

    expect(service.translate('nav.items.transactions')).toBe('Transacciones');
  });

  it('interpolates params in templates', () => {
    expect(
      service.translate('transactions.filteredEmpty.message', { filters: 'BTC' }),
    ).toContain('BTC');
  });
});

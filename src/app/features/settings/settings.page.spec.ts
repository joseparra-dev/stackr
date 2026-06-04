import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';

import { I18nService } from '@core/i18n/i18n.service';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let component: SettingsPage;
  let fixture: ComponentFixture<SettingsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('marks the active locale option as selected', async () => {
    const i18n = TestBed.inject(I18nService);
    await i18n.setLocale('es');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#settings-locale') as HTMLSelectElement;

    expect(select.value).toBe('es');
  });
});

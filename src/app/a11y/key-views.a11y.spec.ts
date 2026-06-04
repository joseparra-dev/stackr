import { Dialog } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runAxe, formatAxeViolations } from '@app/a11y/run-axe';

import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';
import { ThemeService } from '@core/theme/theme.service';
import { LoginPage } from '@features/auth/login/login.page';
import { SettingsPage } from '@features/settings/settings.page';
import { TransactionForm } from '@features/transactions/transaction-form/transaction-form';
import { TRANSACTION_SAVE_PORT } from '@features/transactions/transaction-save.port';
import { ToastService } from '@shared/ui';

describe('key views accessibility', () => {
  describe('LoginPage', () => {
    let fixture: ComponentFixture<LoginPage>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [LoginPage],
        providers: [
          {
            provide: AuthStore,
            useValue: {
              user: signal(null),
              loading: signal(false),
              error: signal(null),
              isAuthenticated: signal(false),
              signInWithGoogle: async () => undefined,
              signOut: async () => undefined,
            },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(LoginPage);
      fixture.detectChanges();
    });

    it('has no axe violations', async () => {
      const results = await runAxe(fixture.nativeElement);
      expect(results.violations, formatAxeViolations(results)).toHaveLength(0);
    });
  });

  describe('SettingsPage', () => {
    let fixture: ComponentFixture<SettingsPage>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [SettingsPage],
        providers: [
          {
            provide: AuthStore,
            useValue: {
              user: signal({ id: 'u1', email: 'user@example.com', name: 'User' }),
              loading: signal(false),
              error: signal(null),
              isAuthenticated: signal(true),
              signInWithGoogle: vi.fn(),
              signOut: vi.fn(),
            },
          },
          {
            provide: ThemeService,
            useValue: {
              preference: signal('light'),
              setPreference: vi.fn(),
            },
          },
          {
            provide: ProfileService,
            useValue: {
              deleteAccount: vi.fn(),
              updateLocale: vi.fn(),
            },
          },
          { provide: Dialog, useValue: { open: vi.fn() } },
          { provide: ToastService, useValue: { error: vi.fn(), success: vi.fn() } },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(SettingsPage);
      fixture.detectChanges();
    });

    it('has no axe violations', async () => {
      const results = await runAxe(fixture.nativeElement);
      expect(results.violations, formatAxeViolations(results)).toHaveLength(0);
    });
  });

  describe('TransactionForm', () => {
    let fixture: ComponentFixture<TransactionForm>;

    beforeEach(async () => {
      await TestBed.configureTestingModule({
        imports: [TransactionForm],
        providers: [
          {
            provide: TRANSACTION_SAVE_PORT,
            useValue: { save: async () => undefined },
          },
        ],
      }).compileComponents();

      fixture = TestBed.createComponent(TransactionForm);
      fixture.detectChanges();
    });

    it('has no axe violations', async () => {
      const results = await runAxe(fixture.nativeElement);
      expect(results.violations, formatAxeViolations(results)).toHaveLength(0);
    });
  });
});

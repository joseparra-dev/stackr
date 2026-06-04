import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { runAxe, formatAxeViolations } from '@app/a11y/run-axe';

import { AuthStore } from '@core/auth/auth.store';
import { LoginPage } from '@features/auth/login/login.page';
import { SettingsPage } from '@features/settings/settings.page';
import { TransactionForm } from '@features/transactions/transaction-form/transaction-form';
import { TRANSACTION_SAVE_PORT } from '@features/transactions/transaction-save.port';

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

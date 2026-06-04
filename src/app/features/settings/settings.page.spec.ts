import { Dialog } from '@angular/cdk/dialog';
import { signal } from '@angular/core';
import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';
import { I18nService } from '@core/i18n/i18n.service';
import { ProfileService } from '@core/profile/profile.service';
import { ThemeService } from '@core/theme/theme.service';
import { ToastService } from '@shared/ui';

import { SettingsPage } from './settings.page';

describe('SettingsPage', () => {
  let fixture: ComponentFixture<SettingsPage>;
  let profileStub: {
    deleteAccount: ReturnType<typeof vi.fn>;
    updateLocale: ReturnType<typeof vi.fn>;
  };
  let authStub: {
    user: ReturnType<typeof signal>;
    loading: ReturnType<typeof signal>;
    signOut: ReturnType<typeof vi.fn>;
  };
  beforeEach(async () => {
    profileStub = {
      deleteAccount: vi.fn().mockResolvedValue(undefined),
      updateLocale: vi.fn().mockResolvedValue(undefined),
    };
    authStub = {
      user: signal({ id: 'u1', email: 'user@example.com', name: 'User' }),
      loading: signal(false),
      signOut: vi.fn().mockResolvedValue(undefined),
    };
    await TestBed.configureTestingModule({
      imports: [SettingsPage],
      providers: [
        { provide: ProfileService, useValue: profileStub },
        { provide: AuthStore, useValue: authStub },
        {
          provide: ThemeService,
          useValue: {
            preference: signal('light'),
            setPreference: vi.fn(),
          },
        },
        {
          provide: Dialog,
          useValue: {
            open: vi.fn().mockReturnValue({ closed: of(true) }),
          },
        },
        {
          provide: ToastService,
          useValue: { error: vi.fn(), success: vi.fn() },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsPage);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('marks the active locale option as selected', async () => {
    const i18n = TestBed.inject(I18nService);
    await i18n.setLocale('es');
    fixture.detectChanges();

    const select = fixture.nativeElement.querySelector('#settings-locale') as HTMLSelectElement;

    expect(select.value).toBe('es');
  });

  it('shows the signed-in email', () => {
    expect(fixture.nativeElement.textContent).toContain('user@example.com');
  });

  it('calls signOut when the account sign-out button is clicked', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const signOutButton = [...buttons].find((button: HTMLButtonElement) =>
      button.textContent?.includes('Sign out'),
    ) as HTMLButtonElement;

    signOutButton.click();

    expect(authStub.signOut).toHaveBeenCalledOnce();
  });

  it('deletes the account after confirmation', async () => {
    const page = fixture.componentInstance;
    await page.openDeleteAccountDialog();

    expect(profileStub.deleteAccount).toHaveBeenCalledOnce();
    expect(authStub.signOut).toHaveBeenCalledOnce();
  });
});

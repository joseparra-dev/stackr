import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';
import { ProfileService } from '@core/profile/profile.service';

import { ThemeService } from './theme.service';
import { THEME_STORAGE_KEY } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let setAttributeSpy: ReturnType<typeof vi.spyOn>;
  let profileStub: {
    getTheme: ReturnType<typeof vi.fn>;
    updateTheme: ReturnType<typeof vi.fn>;
  };

  function prepareEnvironment(stored: string | null = null): void {
    localStorage.clear();
    if (stored !== null) {
      localStorage.setItem(THEME_STORAGE_KEY, stored);
    }
    setAttributeSpy = vi.spyOn(document.documentElement, 'setAttribute');
    profileStub = {
      getTheme: vi.fn().mockResolvedValue(null),
      updateTheme: vi.fn().mockResolvedValue(undefined),
    };
    TestBed.configureTestingModule({
      providers: [
        { provide: ProfileService, useValue: profileStub },
        {
          provide: AuthStore,
          useValue: {
            user: signal({ id: 'user-1', email: 'a@b.com' }),
            loading: signal(false),
            error: signal(null),
            isAuthenticated: signal(true),
            signInWithGoogle: vi.fn(),
            signOut: vi.fn(),
          },
        },
      ],
    });
    service = TestBed.inject(ThemeService);
  }

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    prepareEnvironment();
    expect(service).toBeTruthy();
  });

  it('defaults to light when nothing is stored', () => {
    prepareEnvironment(null);
    expect(service.theme()).toBe('light');
    expect(service.preference()).toBe('light');
  });

  it('hydrates from localStorage on init', () => {
    prepareEnvironment('dark');
    expect(service.theme()).toBe('dark');
    expect(service.preference()).toBe('dark');
  });

  it('setPreference updates signal, storage and data-theme', () => {
    prepareEnvironment();
    service.setPreference('dark');
    expect(service.preference()).toBe('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('setPreference persists to profile when signed in', () => {
    prepareEnvironment();
    service.setPreference('system');
    expect(profileStub.updateTheme).toHaveBeenCalledWith('user-1', 'system');
  });

  it('toggle switches to the opposite resolved theme', () => {
    prepareEnvironment('light');
    service.toggle();
    expect(service.preference()).toBe('dark');
  });
});

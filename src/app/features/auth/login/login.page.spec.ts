import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { AppError } from '@core/errors/app-error';
import { AuthStore } from '@core/auth/auth.store';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  function setup() {
    const stub = {
      user: signal(null),
      loading: signal(false),
      error: signal<AppError | null>(null),
      isAuthenticated: signal(false),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [{ provide: AuthStore, useValue: stub }],
    });

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    return { fixture, stub };
  }

  it('should create', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls signInWithGoogle when the button is clicked', () => {
    const { fixture, stub } = setup();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(stub.signInWithGoogle).toHaveBeenCalledOnce();
  });

  it('renders the error banner when auth.error() is set', () => {
    const { fixture, stub } = setup();
    stub.error.set(new AppError('network/offline', 'No internet'));
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('[role="alert"]');
    expect(banner).not.toBeNull();
    expect(banner?.textContent).toContain('No internet connection');
  });

  it('shows the loading state and disables the button when loading', () => {
    const { fixture, stub } = setup();
    stub.loading.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.textContent).toContain('Signing in');
  });

  it('disables the button when already authenticated', () => {
    const { fixture, stub } = setup();
    stub.isAuthenticated.set(true);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});

import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { AppError } from '@core/errors/app-error';
import { AuthStore } from '@core/auth/auth.store';
import { CallbackPage } from './callback.page';
import { Router } from '@angular/router';

describe('CallbackPage', () => {
  function setup() {
    const navigateByUrl = vi.fn();

    const stub = {
      user: signal(null),
      loading: signal(false),
      error: signal<AppError | null>(null),
      isAuthenticated: signal(false),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    TestBed.configureTestingModule({
      imports: [CallbackPage],
      providers: [
        { provide: AuthStore, useValue: stub },
        {
          provide: Router,
          useValue: {
            navigateByUrl,
          },
        },
      ],
    });

    const fixture = TestBed.createComponent(CallbackPage);
    fixture.detectChanges();

    return {
      fixture,
      stub,
      navigateByUrl,
    };
  }

  it('should create', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('navigates to / when loading false + authenticated true', () => {
    const { fixture, stub, navigateByUrl } = setup();

    stub.loading.set(false);
    stub.isAuthenticated.set(true);

    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledWith('/', {
      replaceUrl: true,
    });
  });

  it('navigates to /login when loading false + error', () => {
    const { fixture, stub, navigateByUrl } = setup();

    stub.loading.set(false);
    stub.error.set(new AppError('auth/unauthorized', 'Unauthorized'));

    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledWith('/login', {
      replaceUrl: true,
    });
  });

  it('navigation uses { replaceUrl: true }', () => {
    const { fixture, stub, navigateByUrl } = setup();

    stub.loading.set(false);
    stub.isAuthenticated.set(false);

    fixture.detectChanges();

    expect(navigateByUrl).toHaveBeenCalledWith('/login', {
      replaceUrl: true,
    });
  });
});

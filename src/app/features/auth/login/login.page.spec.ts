import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';

import { LoginPage } from './login.page';

describe('LoginPage', () => {
  beforeEach(async () => {
    const authStoreStub = {
      user: signal(null),
      loading: signal(false),
      error: signal(null),
      isAuthenticated: signal(false),
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [{ provide: AuthStore, useValue: authStoreStub }],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(LoginPage);
    expect(fixture.componentInstance).toBeTruthy();
  });
});

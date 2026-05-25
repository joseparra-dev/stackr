import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';

import { App } from './app';

function configure() {
  const authStoreStub = {
    user: signal(null),
    loading: signal(false),
    error: signal(null),
    isAuthenticated: signal(false),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };

  TestBed.configureTestingModule({
    imports: [App],
    providers: [provideRouter([]), { provide: AuthStore, useValue: authStoreStub }],
  });
  return { authStoreStub };
}

describe('App', () => {
  it('should create the app', () => {
    configure();
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders the auth smoke-test panel', async () => {
    configure();
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Stackr');
  });
});

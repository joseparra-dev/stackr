import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';
import { PageTitleService } from '@core/page-title/page-title.service';
import { ThemeService } from '@core/theme/theme.service';

import { TopBar } from './top-bar';

describe('TopBar', () => {
  let component: TopBar;
  let fixture: ComponentFixture<TopBar>;

  beforeEach(async () => {
    const themeStub = {
      theme: signal<'light' | 'dark'>('dark'),
      isDark: signal(true),
      toggle: vi.fn(),
      setTheme: vi.fn(),
    };

    const authStoreStub = {
      user: signal({
        id: '1',
        email: 'jose@example.com',
        name: 'Jose Parra',
      }),
      loading: signal(false),
      error: signal(null),
      isAuthenticated: signal(true),
      signInWithGoogle: vi.fn(),
      signOut: vi.fn().mockResolvedValue(undefined),
    };

    const pageTitleStub = {
      title: signal('Dashboard'),
    };

    await TestBed.configureTestingModule({
      imports: [TopBar],
      providers: [
        provideRouter([]),
        { provide: ThemeService, useValue: themeStub },
        { provide: AuthStore, useValue: authStoreStub },
        { provide: PageTitleService, useValue: pageTitleStub },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TopBar);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calls theme.toggle when the theme button is clicked', () => {
    const themeButton = fixture.nativeElement.querySelector(
      'button[aria-label="Switch to light mode"]',
    ) as HTMLButtonElement;
    themeButton.click();
    expect(component.theme.toggle).toHaveBeenCalledOnce();
  });

  it('calls signOut when the menu sign-out action is clicked', () => {
    const userMenuButton = fixture.nativeElement.querySelector(
      'button[aria-label="User menu"]',
    ) as HTMLButtonElement;
    userMenuButton.click();
    fixture.detectChanges();

    const signOutButton = fixture.nativeElement.querySelector(
      'button[role="menuitem"]',
    ) as HTMLButtonElement;
    signOutButton.click();

    expect(component.auth.signOut).toHaveBeenCalledOnce();
  });
});

import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { AuthStore } from '@core/auth/auth.store';
import { ThemeService } from '@core/theme/theme.service';

import { Shell } from './shell';

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [
        provideRouter([]),
        {
          provide: ThemeService,
          useValue: {
            theme: signal('dark'),
            isDark: signal(true),
            toggle: vi.fn(),
            setTheme: vi.fn(),
          },
        },
        {
          provide: AuthStore,
          useValue: {
            user: signal({ id: '1', email: 'jose@example.com', name: 'Jose Parra' }),
            loading: signal(false),
            error: signal(null),
            isAuthenticated: signal(true),
            signInWithGoogle: vi.fn(),
            signOut: vi.fn(),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

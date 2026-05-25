import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { AppError } from '@core/errors/app-error';

import { AuthService } from './auth.service';
import type { AuthSubscription, AuthUser } from './auth.types';
import { sessionToAuthUser } from './auth.types';

const LOGIN_PATH = '/login';

/**
 * Single source of truth for authentication state.
 *
 * Bootstrap is intentionally redundant:
 * 1. `onAuthStateChange` (Supabase emits `INITIAL_SESSION` on subscribe).
 * 2. `getCurrentSession()` as a fallback in case the event is slow or
 *    fails — without it, `loading` could be stuck at `true` forever.
 * Whichever path lands first flips `loading` to `false`.
 */
@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _user = signal<AuthUser | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<AppError | null>(null);

  readonly user = this._user.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly isAuthenticated = computed(() => this._user() !== null);

  private subscription: AuthSubscription | null = null;

  constructor() {
    this.subscription = this.authService.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        this._user.set(null);
      } else {
        this._user.set(sessionToAuthUser(session));
      }
      this._loading.set(false);
    });

    this.destroyRef.onDestroy(() => this.subscription?.unsubscribe());

    void this.hydrate();
  }

  async signInWithGoogle(redirectTo?: string): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.authService.signInWithGoogle(redirectTo);
    } catch (err) {
      this._error.set(AppError.from(err));
      this._loading.set(false);
    }
  }

  /**
   * Always navigates to /login, even if the server call fails. Leaving the
   * UI in a "logged-in" state while the local session is gone is worse
   * than not signing out at all — fail closed.
   */
  async signOut(): Promise<void> {
    this._loading.set(true);
    this._error.set(null);
    try {
      await this.authService.signOut();
    } catch (err) {
      this._error.set(AppError.from(err));
    } finally {
      this._user.set(null);
      this._loading.set(false);
      await this.router.navigateByUrl(LOGIN_PATH);
    }
  }

  clearError(): void {
    this._error.set(null);
  }

  private async hydrate(): Promise<void> {
    try {
      const session = await this.authService.getCurrentSession();
      if (this._user() === null && session) {
        this._user.set(sessionToAuthUser(session));
      }
    } catch (err) {
      this._error.set(AppError.from(err));
    } finally {
      this._loading.set(false);
    }
  }
}

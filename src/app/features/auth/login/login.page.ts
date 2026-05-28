import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-login-page',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="flex flex-col items-center justify-center gap-6">
      <button
        type="button"
        class="flex-1 rounded-lg bg-[var(--color-brand-600)] px-4 py-2.5 text-sm font-medium text-white hover:bg-[var(--color-brand-700)] disabled:cursor-not-allowed disabled:opacity-50"
        [disabled]="auth.loading() || auth.isAuthenticated()"
        (click)="signIn()"
      >
        Sign in with Google
      </button>
    </section>
  `,
})
export class LoginPage {
  protected readonly auth = inject(AuthStore);

  protected signIn(): void {
    void this.auth.signInWithGoogle();
  }
}

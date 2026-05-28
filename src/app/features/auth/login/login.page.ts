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
        class="bg-brand-600 hover:bg-brand-700 flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
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

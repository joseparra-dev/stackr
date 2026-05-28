import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';
import { errorMessage } from '@core/errors/app-error';

@Component({
  selector: 'app-login-page',
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly auth = inject(AuthStore);
  protected readonly errorMessage = errorMessage;

  protected signIn(): void {
    void this.auth.signInWithGoogle();
  }
}

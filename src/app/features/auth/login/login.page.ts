import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { AuthStore } from '@core/auth/auth.store';
import { I18nService } from '@core/i18n/i18n.service';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-login-page',
  imports: [TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.page.html',
})
export class LoginPage {
  protected readonly auth = inject(AuthStore);
  private readonly i18n = inject(I18nService);

  protected readonly translateError = this.i18n.translateError.bind(this.i18n);

  protected signIn(): void {
    void this.auth.signInWithGoogle();
  }
}

import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router } from '@angular/router';

import { AuthStore } from '@core/auth/auth.store';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-callback',
  imports: [TranslatePipe],
  templateUrl: './callback.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CallbackPage {
  protected readonly auth = inject(AuthStore);
  protected readonly router = inject(Router);

  constructor() {
    effect(() => {
      if (!this.auth.loading() && this.auth.isAuthenticated()) {
        void this.router.navigateByUrl('/', { replaceUrl: true });
      }

      if (!this.auth.loading() && this.auth.error()) {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      }

      if (!this.auth.isAuthenticated() && !this.auth.error() && !this.auth.loading()) {
        void this.router.navigateByUrl('/login', { replaceUrl: true });
      }
    });
  }
}

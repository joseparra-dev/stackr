import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { AuthStore } from '@core/auth/auth.store';

// TEMP — smoke-test panel for HU-02. Replaced by LoginPage + ShellComponent
// in HU-04 / HU-05. Once those exist, restore `<router-outlet />` only.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly auth = inject(AuthStore);

  protected signIn(): void {
    void this.auth.signInWithGoogle();
  }

  protected signOut(): void {
    void this.auth.signOut();
  }
}

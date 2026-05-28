import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthStore } from '@core/auth/auth.store';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);

  protected signOut(): void {
    void this.auth.signOut();
  }
}

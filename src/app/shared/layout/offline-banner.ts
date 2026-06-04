import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ConnectivityService } from '@core/connectivity/connectivity.service';

@Component({
  selector: 'app-offline-banner',
  template: `
    @if (!connectivity.isOnline()) {
      <div
        role="alert"
        aria-live="polite"
        class="border-warning/40 bg-warning/15 text-warning shrink-0 border-b px-4 py-2.5 text-center text-sm font-medium"
      >
        You are offline. Reconnect to load portfolio data.
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBanner {
  protected readonly connectivity = inject(ConnectivityService);
}

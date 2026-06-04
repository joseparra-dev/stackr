import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ConnectivityService } from '@core/connectivity/connectivity.service';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-offline-banner',
  imports: [TranslatePipe],
  templateUrl: './offline-banner.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OfflineBanner {
  protected readonly connectivity = inject(ConnectivityService);
}

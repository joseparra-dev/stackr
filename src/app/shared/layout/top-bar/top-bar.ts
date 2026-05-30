import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ThemeService } from '@app/core/theme/theme.service';

@Component({
  selector: 'app-top-bar',
  imports: [],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  readonly theme = inject(ThemeService);
}

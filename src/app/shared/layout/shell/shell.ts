import { CdkTrapFocus } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Toast, TranslatePipe } from '@shared/ui';

import { OfflineBanner } from '../offline-banner';
import { Sidebar } from '../sidebar/sidebar';
import { TopBar } from '../top-bar/top-bar';

@Component({
  selector: 'app-shell',
  imports: [CdkTrapFocus, OfflineBanner, RouterOutlet, Sidebar, TopBar, Toast, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.html',
})
export class Shell {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly drawerOpen = signal(false);

  constructor() {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.drawerOpen.set(false));
  }

  openDrawer(): void {
    this.drawerOpen.set(true);
  }

  closeDrawer(): void {
    this.drawerOpen.set(false);
  }
}

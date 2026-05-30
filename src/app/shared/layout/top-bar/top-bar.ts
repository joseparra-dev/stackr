import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { LucideLogOut, LucideMenu, LucideMoon, LucideSun } from '@lucide/angular';

import { AuthStore } from '@core/auth/auth.store';
import { PageTitleService } from '@core/page-title/page-title.service';
import { ThemeService } from '@core/theme/theme.service';

@Component({
  selector: 'app-top-bar',
  imports: [LucideLogOut, LucideMenu, LucideMoon, LucideSun],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  readonly menuToggle = output<void>();

  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthStore);
  readonly pageTitle = inject(PageTitleService).title;

  readonly userMenuOpen = signal(false);

  readonly userInitial = computed(() => {
    const user = this.auth.user();
    if (!user) return '?';
    const source = user.name?.trim() || user.email;
    return source.charAt(0).toUpperCase();
  });

  readonly userLabel = computed(() => {
    const user = this.auth.user();
    return user?.name ?? user?.email ?? '';
  });

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  signOut(): void {
    this.closeUserMenu();
    void this.auth.signOut();
  }
}

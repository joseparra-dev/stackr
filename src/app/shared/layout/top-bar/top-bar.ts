import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideLogOut, LucideMenu, LucideMoon, LucideSun } from '@lucide/angular';

import { AuthStore } from '@core/auth/auth.store';
import { PageTitleService } from '@core/page-title/page-title.service';
import { ThemeService } from '@core/theme/theme.service';
import { TranslatePipe } from '@shared/ui';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink, TranslatePipe, LucideLogOut, LucideMenu, LucideMoon, LucideSun],
  templateUrl: './top-bar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TopBar {
  private readonly host = inject(ElementRef<HTMLElement>);

  readonly menuToggle = output<void>();

  readonly theme = inject(ThemeService);
  readonly auth = inject(AuthStore);
  readonly pageTitle = inject(PageTitleService).title;

  readonly userMenuOpen = signal(false);
  readonly avatarBroken = signal(false);

  readonly themeToggleAria = computed(() =>
    this.theme.isDark() ? 'nav.aria.switchToLightMode' : 'nav.aria.switchToDarkMode',
  );

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

  readonly showAvatarImage = computed(
    () => Boolean(this.auth.user()?.avatarUrl) && !this.avatarBroken(),
  );

  toggleUserMenu(): void {
    this.userMenuOpen.update((open) => !open);
  }

  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  onAvatarError(): void {
    this.avatarBroken.set(true);
  }

  signOut(): void {
    this.closeUserMenu();
    void this.auth.signOut();
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeUserMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.userMenuOpen()) return;
    const target = event.target;
    if (target instanceof Node && this.host.nativeElement.contains(target)) return;
    this.closeUserMenu();
  }
}

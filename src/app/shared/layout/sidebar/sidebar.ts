import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideArrowLeftRight,
  LucideLayoutDashboard,
  LucideSettings,
  LucideWallet,
} from '@lucide/angular';

import { TranslatePipe } from '@shared/ui';

interface SidebarItem {
  readonly labelKey: string;
  readonly path: string;
  readonly icon: 'dashboard' | 'transactions' | 'holdings' | 'settings';
  readonly exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    LucideLayoutDashboard,
    LucideArrowLeftRight,
    LucideWallet,
    LucideSettings,
  ],
  templateUrl: './sidebar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Sidebar {
  readonly sidebarItems: readonly SidebarItem[] = [
    { labelKey: 'nav.items.dashboard', path: '/', icon: 'dashboard', exact: true },
    { labelKey: 'nav.items.transactions', path: '/transactions', icon: 'transactions' },
    { labelKey: 'nav.items.holdings', path: '/holdings', icon: 'holdings' },
    { labelKey: 'nav.items.settings', path: '/settings', icon: 'settings' },
  ];
}

import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideArrowLeftRight,
  LucideLayoutDashboard,
  LucideSettings,
  LucideWallet,
} from '@lucide/angular';

interface SidebarItem {
  readonly label: string;
  readonly path: string;
  readonly icon: 'dashboard' | 'transactions' | 'holdings' | 'settings';
  readonly exact?: boolean;
}

@Component({
  selector: 'app-sidebar',
  imports: [
    RouterLink,
    RouterLinkActive,
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
    { label: 'Dashboard', path: '/', icon: 'dashboard', exact: true },
    { label: 'Transactions', path: '/transactions', icon: 'transactions' },
    { label: 'Holdings', path: '/holdings', icon: 'holdings' },
    { label: 'Settings', path: '/settings', icon: 'settings' },
  ];
}

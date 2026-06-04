import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('@features/auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'auth/callback',
    loadComponent: () =>
      import('@features/auth/callback/callback.page').then((m) => m.CallbackPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@shared/layout/shell/shell').then((m) => m.Shell),
    children: [
      {
        path: '',
        data: { titleKey: 'nav.pageTitle.dashboard' },
        loadComponent: () =>
          import('@features/dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'transactions',
        data: { titleKey: 'nav.pageTitle.transactions' },
        loadComponent: () =>
          import('@features/transactions/transactions.page').then((m) => m.TransactionsPage),
      },
      {
        path: 'holdings',
        data: { titleKey: 'nav.pageTitle.holdings' },
        loadComponent: () => import('@features/holdings/holdings.page').then((m) => m.HoldingsPage),
      },
      {
        path: 'settings',
        data: { titleKey: 'nav.pageTitle.settings' },
        loadComponent: () => import('@features/settings/settings.page').then((m) => m.SettingsPage),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

import type { Routes } from '@angular/router';
import { authGuard, guestGuard } from '@core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('@features/auth/login/login.page').then((m) => m.LoginPage),
  },
  { path: 'auth/callback', redirectTo: '', pathMatch: 'full' },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('@features/dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  { path: '**', redirectTo: '' },
];

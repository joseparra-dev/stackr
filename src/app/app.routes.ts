import type { Routes } from '@angular/router';

export const routes: Routes = [
  // Temporary; replaced by a real callback page in HU-04.
  { path: 'auth/callback', redirectTo: '', pathMatch: 'full' },
];

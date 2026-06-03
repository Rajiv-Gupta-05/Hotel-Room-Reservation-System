import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

/**
 * Application routes:
 *  /login      – Public login page
 *  /register   – Public registration page
 *  /dashboard  – Protected main dashboard (requires JWT)
 *  **          – Redirect unknown paths to login
 */
export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./pages/auth/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./pages/auth/register/register.component').then((m) => m.RegisterComponent),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then((m) => m.DashboardComponent),
    canActivate: [authGuard], // Only logged-in users can access the dashboard
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];

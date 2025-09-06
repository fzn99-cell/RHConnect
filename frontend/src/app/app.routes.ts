import { Routes } from '@angular/router';
import { AuthGuard } from './guards/auth.guard';
import { DashboardLayout } from './layouts/dashboard-layout';
import { dashboardRoutes } from './routes';

export const routes: Routes = [
  // Public
  { path: '', loadComponent: () => import('./pages/home').then((m) => m.Home) },
  {
    path: 'profile/:id',
    loadComponent: () => import('./pages/profile').then((m) => m.Profile),
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login').then((m) => m.Login),
  },
  {
    path: 'forgot-password',
    loadComponent: () =>
      import('./pages/auth/forgot-password').then((m) => m.ForgotPassword),
  },
  {
    path: 'reset-password',
    loadComponent: () =>
      import('./pages/auth/reset-password').then((m) => m.ResetPassword),
  },

  // Protected Dashboard
  {
    path: '',
    component: DashboardLayout,
    canActivate: [AuthGuard],
    children: [...dashboardRoutes],
  },

  // Wildcard
  {
    path: '**',
    loadComponent: () =>
      import('./pages/error/not-found').then((m) => m.NotFound),
  },
];

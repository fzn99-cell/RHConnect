import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';

export const hrRoutes: Routes = [
  {
    path: 'hr-dashboard',
    loadComponent: () =>
      import('../pages/hr/hr-dashboard').then((m) => m.HrDashboard),
    canActivate: [RoleGuard],
    data: { roles: ['hr'] },
  },
  {
    path: 'hr-manage-requests',
    loadComponent: () =>
      import('../pages/hr/hr-manage-requests').then((m) => m.HrManageRequests),
    canActivate: [RoleGuard],
    data: { roles: ['hr'] },
  },
  {
    path: 'hr-profile',
    loadComponent: () =>
      import('../pages/hr/hr-profile').then((m) => m.HrProfile),
    canActivate: [RoleGuard],
    data: { roles: ['hr'] },
  },
];

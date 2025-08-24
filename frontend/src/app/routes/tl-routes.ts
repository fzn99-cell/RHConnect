import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';

export const tlRoutes: Routes = [
  {
    path: 'tl-dashboard',
    loadComponent: () =>
      import('../pages/tl/tl-dashboard').then((m) => m.TlDashboard),
    canActivate: [RoleGuard],
    data: { roles: ['tl'] },
  },
  {
    path: 'tl-manage-requests',
    loadComponent: () =>
      import('../pages/tl/tl-manage-requests').then(
        (m) => m.TlManageRequests,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['tl'] },
  },

  {
    path: 'tl-profile',
    loadComponent: () =>
      import('../pages/tl/tl-profile').then((m) => m.TlProfile),
    canActivate: [RoleGuard],
    data: { roles: ['tl'] },
  },
];

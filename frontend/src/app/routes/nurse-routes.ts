import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';

export const nurseRoutes: Routes = [
  {
    path: 'nurse-dashboard',
    loadComponent: () =>
      import('../pages/nurse/nurse-dashboard').then((m) => m.NurseDashboard),
    canActivate: [RoleGuard],
    data: { roles: ['nurse'] },
  },
  {
    path: 'nurse-manage-requests',
    loadComponent: () =>
      import('../pages/nurse/nurse-manage-requests').then(
        (m) => m.NurseManageRequests,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['nurse'] },
  },

  {
    path: 'nurse-profile',
    loadComponent: () =>
      import('../pages/nurse/nurse-profile').then((m) => m.NurseProfile),
    canActivate: [RoleGuard],
    data: { roles: ['nurse'] },
  },
];

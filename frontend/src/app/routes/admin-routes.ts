import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';

export const adminRoutes: Routes = [
  {
    path: 'admin-dashboard',
    loadComponent: () =>
      import('../pages/admin/admin-dashboard').then((m) => m.AdminDashboard),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin-manage-users',
    loadComponent: () =>
      import('../pages/admin/admin-manage-users').then(
        (m) => m.AdminManageUser,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin-manage-users/:userId',
    loadComponent: () =>
      import('../pages/admin/admin-user-detail').then((m) => m.AdminUserDetail),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin-manage-requests',
    loadComponent: () =>
      import('../pages/admin/admin-manage-requests').then(
        (m) => m.AdminManageRequests,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin-create-user',
    loadComponent: () =>
      import('../pages/admin/admin-create-user').then((m) => m.AdminCreateUser),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
  {
    path: 'admin-profile',
    loadComponent: () =>
      import('../pages/admin/admin-profile').then((m) => m.AdminProfile),
    canActivate: [RoleGuard],
    data: { roles: ['admin'] },
  },
];

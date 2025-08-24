import { Routes } from '@angular/router';
import { RoleGuard } from '../guards/role.guard';

export const employeeRoutes: Routes = [
  {
    path: 'employee-dashboard',
    loadComponent: () =>
      import('../pages/employee/employee-dashboard').then(
        (m) => m.EmployeeDashboard,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['employee'] },
  },
  {
    path: 'employee-new-request',
    loadComponent: () =>
      import('../pages/employee/employee-new-request').then(
        (m) => m.NewRequest,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['employee'] },
  },
  {
    path: 'employee-profile',
    loadComponent: () =>
      import('../pages/employee/employee-profile').then(
        (m) => m.EmployeeProfile,
      ),
    canActivate: [RoleGuard],
    data: { roles: ['employee'] },
  },
];

import { Routes } from '@angular/router';
import { adminRoutes } from './admin-routes';
import { hrRoutes } from './hr-routes';
import { tlRoutes } from './tl-routes';
import { employeeRoutes } from './employee-routes';
import { nurseRoutes } from './nurse-routes';

export const dashboardRoutes: Routes = [
  ...adminRoutes,
  ...hrRoutes,
  ...tlRoutes,
  ...employeeRoutes,
  ...nurseRoutes,
];

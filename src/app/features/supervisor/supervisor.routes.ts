import { Routes } from '@angular/router';

export const SUPERVISOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/supervisor-dashboard/supervisor-dashboard.component').then(
        (m) => m.SupervisorDashboardComponent
      ),
    title: 'My Students',
  },
];
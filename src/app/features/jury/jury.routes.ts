import { Routes } from '@angular/router';

export const JURY_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/jury-dashboard/jury-dashboard.component').then(
        (m) => m.JuryDashboardComponent
      ),
    title: 'My Defenses',
  },
];
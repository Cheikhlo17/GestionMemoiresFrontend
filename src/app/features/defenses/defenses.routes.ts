import { Routes } from '@angular/router';

export const DEFENSES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/defense-calendar/defense-calendar.component').then(
        (m) => m.DefenseCalendarComponent
      ),
    title: 'Calendrier des soutenances',
  },
  {
    path: 'schedule',
    loadComponent: () =>
      import('./pages/defense-form/defense-form.component').then(
        (m) => m.DefenseFormComponent
      ),
    title: 'Planifier une soutenance',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/defense-detail/defense-detail.component').then(
        (m) => m.DefenseDetailComponent
      ),
    title: 'Détail de la soutenance',
  },
];
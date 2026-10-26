import { Routes } from '@angular/router';
import { roleGuard } from '../../core/guards/role.guard';

export const DEFENSES_ROUTES: Routes = [
  {
    path: 'pre-sessions',
    canActivate: [roleGuard(['administrator', 'head-of-department', 'supervisor', 'student'])],
    loadComponent: () =>
      import('./pages/pre-defense-sessions/pre-defense-sessions.component').then(
        (m) => m.PreDefenseSessionsComponent
      ),
    title: 'Pré-soutenances',
  },
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
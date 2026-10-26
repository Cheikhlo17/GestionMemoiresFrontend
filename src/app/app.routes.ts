// src/app/app.routes.ts (updated: adds public /archives route, outside authGuard)
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  {
    path: 'archives',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/archives/archives.routes').then(
            (m) => m.ARCHIVES_ROUTES
          ),
      },
    ],
  },
  {
    path: 'public-defense-calendar',
    loadComponent: () =>
      import('./layout/public-layout/public-layout.component').then(
        (m) => m.PublicLayoutComponent
      ),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/defenses/pages/public-defense-calendar/public-defense-calendar.component').then(
            (m) => m.PublicDefenseCalendarComponent
          ),
        title: 'Calendrier public des soutenances',
      },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(
        (m) => m.MainLayoutComponent
      ),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
        title: 'Dashboard',
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
        title: 'Mon profil',
      },
      {
        path: 'students',
        canActivate: [roleGuard(['administrator', 'head-of-department'])],
        loadChildren: () =>
          import('./features/students/students.routes').then(
            (m) => m.STUDENTS_ROUTES
          ),
      },
      {
        path: 'supervisor',
        canActivate: [roleGuard(['supervisor'])],
        loadChildren: () =>
          import('./features/supervisor/supervisor.routes').then(
            (m) => m.SUPERVISOR_ROUTES
          ),
      },
      {
        path: 'jury',
        canActivate: [roleGuard(['jury-member'])],
        loadChildren: () =>
          import('./features/jury/jury.routes').then((m) => m.JURY_ROUTES),
      },
      {
        path: 'theses',
        loadChildren: () =>
          import('./features/theses/theses.routes').then((m) => m.THESES_ROUTES),
      },
      {
        path: 'subjects',
        canActivate: [roleGuard(['administrator', 'head-of-department', 'supervisor', 'student'])],
        loadComponent: () =>
          import('./features/thesis-subjects/thesis-subjects.component').then(
            (m) => m.ThesisSubjectsComponent
          ),
        title: 'Sujets de mémoire',
      },
      {
        path: 'supervision-meetings',
        canActivate: [roleGuard(['student', 'supervisor'])],
        loadComponent: () =>
          import('./features/supervision-meetings/supervision-meetings.component').then(
            (m) => m.SupervisionMeetingsComponent
          ),
        title: 'Réunions d’encadrement',
      },
      {
        path: 'defenses',
        loadChildren: () =>
          import('./features/defenses/defenses.routes').then(
            (m) => m.DEFENSES_ROUTES
          ),
      },
      {
        path: 'admin',
        canActivate: [roleGuard(['administrator'])],
        loadChildren: () =>
          import('./features/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./features/forbidden/forbidden.component').then(
            (m) => m.ForbiddenComponent
          ),
        title: 'Forbidden',
      },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
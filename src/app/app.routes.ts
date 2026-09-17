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
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
    title: 'Dashboard',
  },
  {
    path: 'students',
    canActivate: [authGuard, roleGuard(['administrator', 'head-of-department'])],
    loadChildren: () =>
      import('./features/students/students.routes').then(
        (m) => m.STUDENTS_ROUTES
      ),
  },
  {
    path: 'theses',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/theses/theses.routes').then((m) => m.THESES_ROUTES),
  },
  {
    path: 'defenses',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/defenses/defenses.routes').then(
        (m) => m.DEFENSES_ROUTES
      ),
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard(['administrator'])],
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
  { path: '**', redirectTo: 'dashboard' },
];
import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/admin-overview/admin-overview.component').then(
        (m) => m.AdminOverviewComponent
      ),
    title: 'Administration',
    children: [
      { path: '', redirectTo: 'departments', pathMatch: 'full' },
      {
        path: 'departments',
        loadComponent: () =>
          import('./pages/departements/departments.component').then(
            (m) => m.DepartmentsComponent
          ),
      },
      {
        path: 'programs',
        loadComponent: () =>
          import('./pages/programs/programs.component').then((m) => m.ProgramsComponent),
      },
      {
        path: 'academic-years',
        loadComponent: () =>
          import('./pages/academic-years/academic-years.component').then(
            (m) => m.AcademicYearsComponent
          ),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./pages/users/users.component').then((m) => m.UsersComponent),
      },
    ],
  },
];
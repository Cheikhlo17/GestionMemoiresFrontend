import { Routes } from '@angular/router';

export const STUDENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/student-list/student-list.component').then(
        (m) => m.StudentListComponent
      ),
    title: 'Étudiants',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/student-form/student-form.component').then(
        (m) => m.StudentFormComponent
      ),
    title: 'Nouvel étudiant',
  },
  {
    path: ':id/edit',
    loadComponent: () =>
      import('./pages/student-form/student-form.component').then(
        (m) => m.StudentFormComponent
      ),
    title: 'Modifier l’étudiant',
  },
];
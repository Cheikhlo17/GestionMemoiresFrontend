import { Routes } from '@angular/router';

export const THESES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/thesis-list/thesis-list.component').then(
        (m) => m.ThesisListComponent
      ),
    title: 'Mémoires',
  },
  {
    path: 'create',
    loadComponent: () =>
      import('./pages/thesis-form/thesis-form.component').then(
        (m) => m.ThesisFormComponent
      ),
    title: 'Nouveau mémoire',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/thesis-detail/thesis-detail.component').then(
        (m) => m.ThesisDetailComponent
      ),
    title: 'Détail du mémoire',
  },
];
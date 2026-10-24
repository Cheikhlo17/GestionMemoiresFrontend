// src/app/features/archives/archives.routes.ts
import { Routes } from '@angular/router';

export const ARCHIVES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/archive-list/archive-list.component').then(
        (m) => m.ArchiveListComponent
      ),
    title: 'Archives des mémoires',
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/archive-detail/archive-detail.component').then(
        (m) => m.ArchiveDetailComponent
      ),
    title: 'Détail du mémoire',
  },
];
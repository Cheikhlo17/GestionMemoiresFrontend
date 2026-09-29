// src/app/app.config.ts
import {
  ApplicationConfig,
  LOCALE_ID,
  provideZoneChangeDetection,
} from '@angular/core';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

registerLocaleData(localeFr);

const frenchPaginatorIntl = new MatPaginatorIntl();
frenchPaginatorIntl.itemsPerPageLabel = 'Éléments par page :';
frenchPaginatorIntl.nextPageLabel = 'Page suivante';
frenchPaginatorIntl.previousPageLabel = 'Page précédente';
frenchPaginatorIntl.firstPageLabel = 'Première page';
frenchPaginatorIntl.lastPageLabel = 'Dernière page';
frenchPaginatorIntl.getRangeLabel = (page, pageSize, length) => {
  if (length === 0 || pageSize === 0) return `0 sur ${length}`;
  const startIndex = page * pageSize;
  const endIndex = Math.min(startIndex + pageSize, length);
  return `${startIndex + 1} à ${endIndex} sur ${length}`;
};

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
    { provide: MatPaginatorIntl, useValue: frenchPaginatorIntl },
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient(
      withInterceptors([authInterceptor, loadingInterceptor, errorInterceptor])
    ),
  ],
};
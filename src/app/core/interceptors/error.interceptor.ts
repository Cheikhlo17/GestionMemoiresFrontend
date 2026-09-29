import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { catchError, throwError } from 'rxjs';
import { TokenStorageService } from '../services/token-storage.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const snackBar = inject(MatSnackBar);
  const tokenStorage = inject(TokenStorageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'Une erreur inattendue est survenue.';

      if (error.status === 401) {
        message = 'Votre session a expiré. Veuillez vous reconnecter.';
        tokenStorage.clear();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        message = 'Vous n’êtes pas autorisé à effectuer cette action.';
      } else if (error.status === 404) {
        message = 'La ressource demandée est introuvable.';
      } else if (error.status === 422) {
        message = 'Les données saisies sont invalides. Vérifiez les champs du formulaire.';
      } else if (error.status >= 500) {
        message = 'Une erreur est survenue sur le serveur. Veuillez réessayer.';
      }

      snackBar.open(message, 'Fermer', { duration: 5000 });

      return throwError(() => error);
    })
  );
};
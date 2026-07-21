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
      let message = 'An unexpected error occurred.';

      if (error.error?.message) {
        message = error.error.message;
      }

      if (error.status === 401) {
        tokenStorage.clear();
        router.navigate(['/auth/login']);
      } else if (error.status === 403) {
        message = message || 'You are not authorized to perform this action.';
      } else if (error.status === 422 && error.error?.errors) {
        const firstError = Object.values(error.error.errors)[0] as string[];
        message = firstError?.[0] ?? message;
      }

      snackBar.open(message, 'Close', { duration: 5000 });

      return throwError(() => error);
    })
  );
};
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, timeout } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { FeedbackService } from '@gob-ui/shared/services';
import { MatSnackBar } from '@angular/material/snack-bar';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const feedback = inject(FeedbackService);

  const snackBar = inject(MatSnackBar);
  const TIMEOUT_MS = 15000;

  return next(req).pipe(
    timeout(TIMEOUT_MS),
    catchError((error: HttpErrorResponse) => {
      const userMessage = 'Ocurrió un error desconocido.';
      const isNetworkError = false;
      // LOGICA DE NEGOCIO POR STATUS CODE
      if (error.error instanceof ErrorEvent) {
        feedback.error('Error del navegador', error.error.message);
      } else {
        // Error de lado del servidor (HTTP Code)
        switch (error.status) {
          case 400:
            // Bad Request: Generalmente validación de datos
            feedback.warning(
              'Datos inválidos. Verifique la información enviada.',
            );
            break;

          case 401:
            // Unauthorized: Token vencido o inválido
            feedback.info(
              'Su sesión ha expirado. Por favor, ingrese nuevamente.',
            );
            // Forzamos logout para limpiar estado y redirigir a Login
            authService.logout();
            break;

          case 403:
            // Forbidden: Logueado pero sin permisos
            feedback.error(
              'Acceso Denegado',
              'No tiene permisos para realizar esta acción.',
            );
            break;

          case 404:
            // Not Found
            feedback.warning('El recurso solicitado no existe.');
            break;

          case 500:
          case 503: {
            // Server Error: Problema crítico
            // Intentamos extraer el Trace ID si el backend lo envía
            const traceId =
              error.error?.traceId || error.error?.requestId || 'N/A';
            feedback.error(
              'Error Interno del Servidor',
              `Contacte a soporte. Trace ID: ${traceId}`,
            );
            break;
          }

          case 0:
            // Network Error: Servidor caído o usuario sin internet
            feedback.error(
              'Sin conexión',
              'No se pudo contactar con el servidor. Verifique su red.',
            );
            break;

          default:
            feedback.error('Error inesperado', error.message);
        }
      }

      if (isNetworkError) {
        snackBar.open(userMessage, 'CERRAR', {
          duration: 5000,
          panelClass: ['snackbar-error'], // Clase CSS global
        });
      }

      // Propagamos el error para que el componente también se entere
      // (ej. para apagar un isLoading = false)
      return throwError(() => error);
    }),
  );
};

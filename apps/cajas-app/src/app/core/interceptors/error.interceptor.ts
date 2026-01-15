import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { FeedbackService } from '../services/feedback.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const feedback = inject(FeedbackService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
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

      // Propagamos el error para que el componente también se entere
      // (ej. para apagar un isLoading = false)
      return throwError(() => error);
    }),
  );
};

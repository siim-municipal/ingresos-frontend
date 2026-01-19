import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core'; // Ajustar ruta
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  const municipio = authService.getMunicipioContext();

  // Filtrar peticiones: Solo inyectar a nuestra API o microservicios
  // Evitar inyectar token a peticiones externas (como Google Maps o el mismo Discovery Doc del SSO)
  const isApiRequest = req.url.includes('/api/') || req.url.includes('ms-');

  let authReq = req;

  if (token && isApiRequest) {
    // Preparamos los headers dinámicos
    const headersToSet: Record<string, string> = {
      Authorization: `Bearer ${token}`,
    };

    // Solo agregamos el header si tenemos un valor válido
    if (municipio) {
      headersToSet['X-Municipio-Alias'] = municipio;
    }

    // Clonamos el request una sola vez con todos los headers
    authReq = req.clone({
      setHeaders: headersToSet,
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        // Token inválido o expirado que no se pudo refrescar
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};

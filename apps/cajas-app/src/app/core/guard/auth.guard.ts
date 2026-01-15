import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificamos si la señal de isLoggedIn es true
  if (authService.isLoggedIn()) {
    return true;
  }

  // Si no está logueado, guardamos la URL a la que quería ir (opcional)
  // y forzamos el login (redirección a Keycloak)
  authService.login();
  return false;
};

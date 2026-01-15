import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();

  // 1. Obtener roles requeridos desde la configuración de la ruta
  const requiredRoles = route.data['roles'] as Array<string>;

  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // Si la ruta no pide roles, pasa.
  }

  if (!user || !user.realm_access?.roles) {
    return router.createUrlTree(['/login']);
  }

  // 2. Verificar intersección de roles (Soporta con y sin prefijo ROLE_)
  const hasRole = requiredRoles.some(
    (req) =>
      user.realm_access!.roles.includes(req) ||
      user.realm_access!.roles.includes(`ROLE_${req}`),
  );

  if (hasRole) {
    return true;
  }

  // 3. Si falla, redirigir al Dashboard (o a una página 403 Forbidden)
  // Usamos createUrlTree para una redirección segura dentro del Guard
  return router.createUrlTree(['/dashboard']);
};

import { Route } from '@angular/router';
import { GobButtonComponent } from '@gob-ui/components';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { LoginComponent } from './features/auth/login';
import { authGuard } from './core/guard/auth.guard';
import { roleGuard } from './core/guard/role.guard';

export const appRoutes: Route[] = [
  // 1. RUTAS PÚBLICAS (Login)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        component: LoginComponent,
      },
    ],
  },

  // 2. RUTAS PRIVADAS
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: GobButtonComponent,
      },
      {
        path: 'padron',
        loadComponent: () =>
          import('@gob-ui/padron').then((m) => m.ContribuyenteList),
      },
      {
        path: 'ingresos',
        // Aquí iría loadComponent: () => import(...)
        component: GobButtonComponent,

        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'ADMIN'] },
      },
      {
        path: 'configuracion',
        component: GobButtonComponent,

        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
      },
    ],
  },

  { path: '**', redirectTo: 'login' },
];

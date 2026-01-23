import { Route } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { LoginComponent } from './features/auth/login';
import { authGuard } from './core/guard/auth.guard';
import { roleGuard } from './core/guard/role.guard';
import { DashboardComponent } from './features/dashboards/dashboard';
import { salesRoutes } from '@gob-ui/sales';

export const appRoutes: Route[] = [
  // RUTAS PÚBLICAS (Auth)
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent, title: 'Iniciar Sesión' },
    ],
  },

  // RUTAS PRIVADAS (App Principal)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      // A. Dashboard (Carga inmediata o ligera)
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Tablero Principal - SIIM',
      },

      // B. Módulo Padrón (LAZY LOADING DE RUTAS HIJAS)
      {
        path: 'padron',
        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'ADMIN'] },
        loadChildren: () =>
          import('@gob-ui/padron').then((m) => m.padronRoutes),
      },
      {
        path: 'catastro',
        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'ADMIN'] },
        loadChildren: () =>
          import('@gob-ui/catastro').then((m) => m.catastroRoutes),
      },
      {
        path: 'caja',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN', 'CAJERO'] },
        children: salesRoutes,
      },
      {
        path: 'agua',
        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'ADMIN'] },
        loadChildren: () => import('@gob-ui/agua').then((m) => m.aguaRoutes),
      },

      // Redirección por defecto interna
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];

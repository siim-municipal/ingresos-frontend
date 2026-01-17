import { Route } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout';
import { MainLayoutComponent } from './layouts/main-layout/main-layout';
import { LoginComponent } from './features/auth/login';
import { authGuard } from './core/guard/auth.guard';
import { roleGuard } from './core/guard/role.guard';

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
        // Opción A: Si creaste el componente en 'apps/cajas-app/src/app/features/dashboard'
        loadComponent: () =>
          import('./features/dashboards/dashboard').then(
            (m) => m.DashboardComponent,
          ),
        title: 'Tablero Principal - SIIM',
      },

      // B. Módulo Padrón (LAZY LOADING DE RUTAS HIJAS)
      {
        path: 'padron',
        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'CAJERO'] },
        loadChildren: () =>
          import('@gob-ui/padron').then((m) => m.padronRoutes),
      },
      {
        path: 'catastro',
        canActivate: [roleGuard],
        data: { roles: ['TESORERO', 'CAJERO'] },
        loadChildren: () =>
          import('@gob-ui/catastro').then((m) => m.catastroRoutes),
      },

      // C. Módulo Ingresos (Protegido por Rol)
      // {
      //   path: 'ingresos',
      //   canActivate: [roleGuard],
      //   data: { roles: ['TESORERO', 'ADMIN'] },
      //   component: GobButtonComponent,
      // },

      // D. Configuración
      // {
      //   path: 'configuracion',
      //   canActivate: [roleGuard],
      //   data: { roles: ['ADMIN'] },
      //   component: GobButtonComponent,
      // },

      // Redirección por defecto interna
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  { path: '**', redirectTo: 'login' },
];

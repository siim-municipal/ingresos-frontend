import { Route } from '@angular/router';
import { GobButtonComponent } from '@gob-ui/components';
import { authGuard } from './core/guard/auth.guard';

export const appRoutes: Route[] = [
  // 1. Ruta para Vistas Públicas (Login)
  {
    path: '',
    loadComponent: () =>
      import('./layouts/auth-layout/auth-layout').then(
        (m) => m.AuthLayoutComponent,
      ),
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login').then((m) => m.LoginComponent),
      },
    ],
  },

  // 2. Ruta para Vistas Privadas (Dashboard)
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./layouts/main-layout/main-layout').then(
        (m) => m.MainLayoutComponent,
      ),
    children: [
      {
        path: 'dashboard',
        component: GobButtonComponent,
      },
    ],
  },

  // 3. Fallback
  { path: '**', redirectTo: 'login' },
];

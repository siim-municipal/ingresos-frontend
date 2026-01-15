import { Route } from '@angular/router';
import {
  AuthLayoutComponent,
  MainLayoutComponent,
  GobButtonComponent,
} from '@gob-ui/components';
import { LoginComponent } from './features/auth/login';

export const appRoutes: Route[] = [
  // 1. Ruta para Vistas Públicas (Login)
  {
    path: '',
    component: AuthLayoutComponent,
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
    component: MainLayoutComponent,
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

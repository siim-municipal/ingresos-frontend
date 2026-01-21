import { Route } from '@angular/router';

export const aguaRoutes: Route[] = [
  {
    path: 'contratos/nuevo',
    loadComponent: () =>
      import('./ui/contrato-agua-form/contrato-agua-form').then(
        (m) => m.ContratoAguaForm,
      ),
    title: 'Alta de Contrato de Agua',
  },
  {
    path: '',
    loadComponent: () =>
      import('./ui/contrato-agua-list/contrato-agua-list').then(
        (m) => m.ContratoAguaList,
      ),
    title: 'Alta de Contrato de Agua',
  },
];

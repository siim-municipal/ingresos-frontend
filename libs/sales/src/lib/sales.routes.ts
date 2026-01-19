import { Route } from '@angular/router';

export const salesRoutes: Route[] = [
  {
    path: 'recibos/:id',
    loadComponent: () =>
      import('./ui/recibo-visor/recibo-visor').then((m) => m.ReciboVisor),
    title: 'Visor de Recibo Oficial',
  },
  // {
  //   path: '',
  //   loadComponent: () =>
  //     import('./ui/caja-dashboard/caja-dashboard').then(m => m.CajaDashboardComponent),
  //   title: 'Punto de Venta'
  // }
];

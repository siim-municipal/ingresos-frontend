import { Routes } from '@angular/router';
import { PredioList } from './predio-list/predio-list';

export const catastroRoutes: Routes = [
  {
    path: '', // Ruta base: /catastro
    component: PredioList,
    title: 'Gestión Catastral - Listado de Predios',
  },
  {
    path: 'nuevo', // Ruta: /catastro/nuevo
    loadComponent: () =>
      import('./predio-list/predio-list').then((m) => m.PredioList),
    title: 'Alta de Nuevo Predio',
  },
  {
    path: 'detalle/:id', // Ruta: /catastro/detalle/uuid
    component: PredioList, // Placeholder
    title: 'Detalle del Predio',
  },
];

import { Routes } from '@angular/router';
import { ContribuyenteList } from './contribuyente-list/contribuyente-list';
import { ContribuyenteForm } from './contribuyente-form/contribuyente-form';

export const padronRoutes: Routes = [
  {
    path: '', // Ruta base: /padron
    component: ContribuyenteList,
    title: 'Padrón - Listado',
  },
  {
    path: 'nuevo', // Ruta: /padron/nuevo
    component: ContribuyenteForm,
    title: 'Padrón - Nuevo Contribuyente',
  },
  {
    path: 'editar/:id', // Ruta: /padron/editar/uuid
    component: ContribuyenteForm,
    title: 'Padrón - Editar Contribuyente',
  },
];

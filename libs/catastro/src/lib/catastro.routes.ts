import { ResolveFn, Router, Routes } from '@angular/router';
import { PredioList } from './predio-list/predio-list';
import { inject } from '@angular/core';
import { PredioService } from './services/predio.service';
import { Predio } from './models/predio.model';
import { catchError, EMPTY } from 'rxjs';
import { PredioDetail } from './predio-detail/predio-detail';

// Precarga los datos. Si falla (404), redirige al listado.
export const predioResolver: ResolveFn<Predio> = (route, state) => {
  const service = inject(PredioService);
  const router = inject(Router);
  const id = route.paramMap.get('id');

  if (!id) {
    router.navigate(['/catastro']);
    return EMPTY;
  }

  return service.findById(id).pipe(
    catchError(() => {
      router.navigate(['/catastro']); // O a una página de 404
      return EMPTY;
    }),
  );
};

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
  {
    path: 'predio/:id',
    component: PredioDetail,
    resolve: { predio: predioResolver },
    title: 'Detalle del Predio',
  },
];

import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PredioService } from '../services/predio.service';
import { Predio } from '../models/predio.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-predio-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
  ],
  templateUrl: './predio-list.html',
  styleUrl: './predio-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredioList {
  private predioService = inject(PredioService);

  // Constante para calcular deuda (Año actual)
  readonly currentYear = new Date().getFullYear();

  // --- Signals de Estado ---
  dataSource = signal<Predio[]>([]);
  totalElements = signal(0);
  loading = signal(true); // Empieza cargando

  // --- Signals de Parámetros ---
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('claveCatastral');
  sortDirection = signal<'asc' | 'desc'>('asc');

  // Columnas a mostrar
  displayedColumns = [
    'claveCatastral',
    'coloniaBarrio',
    'tipoPredio',
    'ultimoPago',
    'estatus',
    'acciones',
  ];

  // Array dummy para el Skeleton (filas falsas)
  skeletonData = Array(5).fill(0);

  constructor() {
    // Effect: Escucha cambios en paginación u ordenamiento y recarga automáticamente
    effect(() => {
      this.loadData(
        this.pageIndex(),
        this.pageSize(),
        this.sortActive(),
        this.sortDirection(),
      );
    });
  }

  private loadData(
    page: number,
    size: number,
    active: string,
    direction: string,
  ): void {
    this.loading.set(true);

    // Mapeo formato Sort de Angular MatSort -> Spring Data ("campo,dir")
    // Nota: Si direction es vacío, usamos 'asc' por defecto
    const sortParam = direction ? `${active},${direction}` : `${active},asc`;

    this.predioService.findAll({ page, size, sort: sortParam }).subscribe({
      next: (resp) => {
        this.dataSource.set(resp.content);
        this.totalElements.set(resp.totalElements);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  // --- Handlers de la Tabla ---

  onPageChange(e: PageEvent): void {
    this.pageIndex.set(e.pageIndex);
    this.pageSize.set(e.pageSize);
  }

  onSortChange(sort: Sort): void {
    this.sortActive.set(sort.active);
    this.sortDirection.set(sort.direction as 'asc' | 'desc');
    this.pageIndex.set(0); // Reset a página 1 al reordenar
  }

  // Helper para lógica de negocio visual
  esDeudor(ultimoAnio: number | undefined): boolean {
    if (!ultimoAnio) return true; // Si nunca ha pagado, debe
    return ultimoAnio < this.currentYear;
  }
}

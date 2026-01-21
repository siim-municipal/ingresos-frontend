import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  effect,
  OnInit,
  OnDestroy,
  viewChild,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PredioService } from '@gob-ui/catastro-ui';
import { Predio } from '@gob-ui/catastro-ui';
import { RouterLink } from '@angular/router';
import { AppHotkey, HotkeysService } from '@gob-ui/shared/services';
import { FormsModule } from '@angular/forms';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  Subscription,
} from 'rxjs';
import { MatFormField, MatLabel } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'lib-predio-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    MatFormField,
    MatLabel,
  ],
  templateUrl: './predio-list.html',
  styleUrl: './predio-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PredioList implements OnInit, OnDestroy {
  private predioService = inject(PredioService);

  // Constante para calcular deuda (Año actual)
  readonly currentYear = new Date().getFullYear();

  private hotkeys = inject(HotkeysService);

  searchInput = viewChild<ElementRef>('searchInput');

  // --- Signals de Estado ---
  dataSource = signal<Predio[]>([]);
  totalElements = signal(0);
  loading = signal(true); // Empieza cargando

  // --- Signals de Parámetros ---
  pageIndex = signal(0);
  pageSize = signal(10);
  sortActive = signal('claveCatastral');
  sortDirection = signal<'asc' | 'desc'>('asc');
  searchQuery = signal('');

  private searchSubject = new Subject<string>();
  private sub = new Subscription();

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
        this.searchQuery(),
      );
    });
  }

  private loadData(
    page: number,
    size: number,
    active: string,
    direction: string,
    search: string,
  ): void {
    this.loading.set(true);

    // TODO implementar busqueda por rfc, nombre, etc utilizando search: string,

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

  focusSearch(): void {
    // Accedemos al elemento nativo de forma segura usando el Signal viewChild
    const inputEl = this.searchInput()?.nativeElement;
    if (inputEl) {
      inputEl.focus();
      inputEl.select(); // Opcional: Seleccionar texto existente para sobrescribir rápido
    }
  }

  onSearch(term: string): void {
    this.searchSubject.next(term);
  }

  ngOnInit(): void {
    // 1. Configurar Debounce para el buscador (esperar 300ms antes de buscar)
    this.sub.add(
      this.searchSubject
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((term) => {
          this.pageIndex.set(0); // Reset a página 1
          this.searchQuery.set(term); // Actualiza el signal -> Dispara el effect -> loadData
        }),
    );

    // Escuchar Tecla F2 (Focus)
    this.sub.add(
      this.hotkeys.hotkey$.subscribe((key) => {
        if (key === AppHotkey.SEARCH_FOCUS) {
          this.focusSearch();
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}

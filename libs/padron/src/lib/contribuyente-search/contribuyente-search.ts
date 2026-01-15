import { Component, OnInit, inject, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject, of } from 'rxjs';
import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  catchError,
  takeUntil,
  tap,
  filter,
  map,
} from 'rxjs/operators';

import { ContribuyenteStore } from '../state/contribuyente.store';
import { ContribuyenteApiService } from '../services/contribuyente-api.service';
import { HighlightPipe } from '@gob-ui/shared/services';
import { ContribuyenteMapper } from '../utils/contribuyente.mapper';

@Component({
  selector: 'lib-contribuyente-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HighlightPipe],
  templateUrl: './contribuyente-search.html',
  styles: [],
})
export class ContribuyenteSearch implements OnInit, OnDestroy {
  // Inyecciones
  public store = inject(ContribuyenteStore);
  private apiService = inject(ContribuyenteApiService);

  // Form Control para el Input (Reactive Forms)
  searchControl = new FormControl('');

  isOpen = signal(false);

  // Control de suscripciones
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.setupSearchStream();
  }

  private setupSearchStream(): void {
    this.searchControl.valueChanges
      .pipe(
        // Limpieza inicial
        map((term) => term?.trim() || ''),

        // Esperar 400ms de inactividad (evita spam al backend)
        debounceTime(400),

        // Evitar duplicados (si escribe "Juan", borra "n", escribe "n" rápido)
        distinctUntilChanged(),

        // Efectos secundarios (Loading UI)
        tap((term) => {
          if (term.length > 0) {
            this.store.setLoading(true);
            this.isOpen.set(true);
          } else {
            // Si borró todo, limpiar resultados
            this.store.setSearchResults([], 0, '');
            this.isOpen.set(false);
          }
        }),

        // Filtrar búsquedas muy cortas (opcional, regla de negocio)
        filter((term) => term.length > 0),

        switchMap((term) => {
          // Nota: Pasamos page:0, size:10 para resultados rápidos en el dropdown
          return this.apiService.search(term, 0, 10).pipe(
            // Manejo de error SILENCIOSO dentro del stream para no romperlo
            catchError(() => {
              this.store.setError('Error de conexión al buscar');
              return of({ content: [], totalElements: 0 }); // Retorno seguro
            }),
          );
        }),

        // 7. Limpieza al destruir componente
        takeUntil(this.destroy$),
      )
      .subscribe((response) => {
        const domainEntities = ContribuyenteMapper.toDomainList(
          response.content,
        );

        // Actualizamos el Store
        this.store.setSearchResults(
          domainEntities,
          response.totalElements,
          this.searchControl.value || '',
        );
      });
  }

  // Selección de un ítem
  selectItem(id: string): void {
    this.store.selectContribuyente(id);
    this.isOpen.set(false);
  }

  onInputFocus(): void {
    if (this.searchControl.value) {
      this.isOpen.set(true);
    }
  }

  onInputBlur(): void {
    setTimeout(() => {
      this.isOpen.set(false);
    }, 200);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

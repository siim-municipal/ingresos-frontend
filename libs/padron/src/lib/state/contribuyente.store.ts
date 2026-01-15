import {
  Injectable,
  inject,
  signal,
  computed,
  WritableSignal,
} from '@angular/core';
import { finalize, map } from 'rxjs/operators';
import { Contribuyente } from '../models/contribuyente.model';
import { ContribuyenteApiService } from '../services/contribuyente-api.service';
import { ContribuyenteMapper } from '../utils/contribuyente.mapper';
import { HttpErrorResponse } from '@angular/common/http';
import { FeedbackService } from '@gob-ui/shared/services';

interface ContribuyenteState {
  entities: Contribuyente[];
  selectedId: string | null;
  filter: string;
  page: number;
  pageSize: number;
  totalElements: number;
  loading: boolean;
  error: string | null;
}

const initialState: ContribuyenteState = {
  entities: [],
  selectedId: null,
  filter: '',
  page: 0,
  pageSize: 20,
  totalElements: 0,
  loading: false,
  error: null,
};

@Injectable({ providedIn: 'root' })
export class ContribuyenteStore {
  private api = inject(ContribuyenteApiService);
  private feedback = inject(FeedbackService);

  // Estado Reactivo
  private state: WritableSignal<ContribuyenteState> = signal(initialState);

  // Selectors
  readonly contribuyentes = computed(() => this.state().entities);
  readonly loading = computed(() => this.state().loading);
  readonly totalElements = computed(() => this.state().totalElements);
  readonly page = computed(() => this.state().page);
  readonly error = computed(() => this.state().error);

  readonly selectedContribuyente = computed(() => {
    const s = this.state();
    return s.entities.find((c) => c.id === s.selectedId) || null;
  });

  /**
   * Carga con soporte de paginación
   * @param query Texto a buscar (opcional)
   * @param page Página solicitada (0 por defecto)
   */
  loadContribuyentes(query: string, page = 0): void {
    const currentFilter = query.trim();

    // Si cambiamos de filtro, reseteamos a página 0
    const isNewFilter = currentFilter !== this.state().filter;
    const targetPage = isNewFilter ? 0 : page;

    this.state.update((s) => ({
      ...s,
      loading: true,
      filter: currentFilter,
      page: targetPage,
      error: null,
      selectedId: null, // Limpiamos selección al buscar de nuevo
    }));

    // Llamada al API
    this.api
      .search(currentFilter, targetPage, this.state().pageSize)
      .pipe(
        map((response) => ({
          entities: ContribuyenteMapper.toDomainList(response.content),
          total: response.totalElements,
        })),
        finalize(() => this.state.update((s) => ({ ...s, loading: false }))),
      )
      .subscribe({
        next: ({ entities, total }) => {
          this.state.update((s) => ({
            ...s,
            entities,
            totalElements: total,
          }));
        },
        error: (err: HttpErrorResponse) => {
          const msg = `No se pudo cargar el padrón: ${err}`;
          this.state.update((s) => ({
            ...s,
            error: msg,
            entities: [],
            totalElements: 0,
          }));
          this.feedback.error(msg);
        },
      });
  }

  // Métodos para el Paginador UI
  nextPage(): void {
    const s = this.state();
    if ((s.page + 1) * s.pageSize < s.totalElements) {
      this.loadContribuyentes(s.filter, s.page + 1);
    }
  }

  prevPage(): void {
    const s = this.state();
    if (s.page > 0) {
      this.loadContribuyentes(s.filter, s.page - 1);
    }
  }

  selectContribuyente(id: string): void {
    this.state.update((s) => ({ ...s, selectedId: id }));
  }

  clearSelection(): void {
    this.state.update((s) => ({ ...s, selectedId: null }));
  }
}

import { Component, inject, OnDestroy, OnInit, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContribuyenteStore } from '../state/contribuyente.store';
import { ContribuyenteSearch } from '../contribuyente-search/contribuyente-search';
import { ContribuyenteDetail } from '../contribuyente-detail/contribuyente-detail';
import { Router, RouterLink } from '@angular/router';
import { GobButtonComponent } from '@gob-ui/components';
import { AppHotkey, HotkeysService } from '@gob-ui/shared/services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'lib-contribuyente-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ContribuyenteSearch,
    ContribuyenteDetail,
    RouterLink,
    GobButtonComponent,
  ],
  templateUrl: './contribuyente-list.html',
  styles: [],
})
export class ContribuyenteList implements OnInit, OnDestroy {
  // Inyectamos el Store
  readonly store = inject(ContribuyenteStore);

  private hotkeys = inject(HotkeysService);
  private router = inject(Router);

  searchComponent = viewChild<ContribuyenteSearch>('searchComponent');

  private sub = new Subscription();

  constructor() {
    this.store.loadContribuyentes('');
  }

  ngOnInit(): void {
    // Escuchar eventos globales de teclado
    this.sub.add(
      this.hotkeys.hotkey$.subscribe((key) => {
        switch (key) {
          case AppHotkey.SEARCH_FOCUS: // F2
            this.focusSearch();
            break;
          // Opcional: Si quieres mapear una tecla para "Nuevo" (ej. Insert o F3)
          case AppHotkey.NEW_ITEM:
            this.router.navigate(['/padron/nuevo']);
            break;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  focusSearch(): void {
    // Delegamos la responsabilidad al componente hijo
    const searchCmp = this.searchComponent();
    if (searchCmp) {
      searchCmp.focusInput(); // Llamamos al método público que creamos en el Paso 1
    }
  }

  onEdit(id: string): void {
    console.log('Navegar a edición:', id);
    this.router.navigate(['/padron/editar', id]);
  }
}

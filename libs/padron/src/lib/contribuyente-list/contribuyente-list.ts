import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContribuyenteStore } from '../state/contribuyente.store';
import { ContribuyenteSearch } from '../contribuyente-search/contribuyente-search';
import { ContribuyenteDetail } from '../contribuyente-detail/contribuyente-detail';
import { RouterLink } from '@angular/router';
import { GobButtonComponent } from '@gob-ui/components';

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
export class ContribuyenteList {
  // Inyectamos el Store
  readonly store = inject(ContribuyenteStore);

  constructor() {
    this.store.loadContribuyentes('');
  }

  onEdit(id: string): void {
    console.log('Navegar a edición:', id);
    // router.navigate(['/padron/editar', id]);
  }
}

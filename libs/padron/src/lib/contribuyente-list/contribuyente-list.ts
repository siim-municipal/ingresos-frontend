import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContribuyenteStore } from '../state/contribuyente.store';

@Component({
  selector: 'lib-contribuyente-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contribuyente-list.html',
  styles: [],
})
export class ContribuyenteList {
  // Inyectamos el Store
  readonly store = inject(ContribuyenteStore);

  // Signal local para el input de búsqueda
  searchQuery = signal('');

  constructor() {
    this.store.loadContribuyentes('');
  }

  buscar(): void {
    this.store.loadContribuyentes(this.searchQuery());
  }

  limpiar(): void {
    this.searchQuery.set('');
    this.store.loadContribuyentes('');
  }
}

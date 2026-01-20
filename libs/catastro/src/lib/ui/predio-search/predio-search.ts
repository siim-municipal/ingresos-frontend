import { Component, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import {
  debounceTime,
  distinctUntilChanged,
  switchMap,
  tap,
  finalize,
} from 'rxjs/operators';
import { of } from 'rxjs';

import { PredioService } from '../../services/predio.service';
import { Predio } from '../../models/predio.model';

@Component({
  selector: 'lib-predio-search',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './predio-search.html',
})
export class PredioSearch {
  private predioService = inject(PredioService);

  allowSelection = input(true);

  // Output moderno (Angular 17+)
  predioSelected = output<Predio>();

  searchControl = new FormControl('');
  isLoading = signal(false);
  resultados = signal<Predio[]>([]);

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        debounceTime(400), // Esperar a que deje de escribir
        distinctUntilChanged(),
        tap(() => {
          this.isLoading.set(true);
          this.resultados.set([]);
        }),
        switchMap((query) => {
          // Validar que sea string y tenga longitud mínima
          if (typeof query === 'string' && query.length > 2) {
            return this.predioService
              .buscarPredios(query)
              .pipe(finalize(() => this.isLoading.set(false)));
          } else {
            this.isLoading.set(false);
            return of([]); // Retornar vacío si no cumple requisitos
          }
        }),
      )
      .subscribe((data) => {
        this.resultados.set(data);
      });
  }

  displayFn(predio: Predio): string {
    return predio && predio.claveCatastral ? predio.claveCatastral : '';
  }

  onSelect(predio: Predio): void {
    if (this.allowSelection() && predio) {
      this.predioSelected.emit(predio);
    }
  }
}

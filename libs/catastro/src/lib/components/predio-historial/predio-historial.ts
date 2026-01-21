import { Component, input, signal, OnInit, inject } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { ReciboPago, TesoreriaApiService } from '@gob-ui/sales';

@Component({
  selector: 'lib-predio-historial',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    CurrencyPipe,
    DatePipe,
  ],
  templateUrl: './predio-historial.html',
  styleUrl: './predio-historial.scss',
})
export class PredioHistorial implements OnInit {
  private tesoreriaService = inject(TesoreriaApiService);
  predioId = input.required<string>();

  pagos = signal<ReciboPago[]>([]);
  loading = signal(true);
  displayedColumns = ['anio', 'folio', 'fecha', 'importe', 'estatus'];

  ngOnInit(): void {
    // Reemplazar el setTimeout por:
    this.tesoreriaService.getHistorialPagos(this.predioId()).subscribe({
      next: (data) => {
        this.pagos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
      },
    });
  }
}

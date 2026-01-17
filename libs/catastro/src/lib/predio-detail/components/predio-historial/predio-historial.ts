import { Component, input, signal, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';

export interface ReciboPago {
  folio: string;
  anioFiscal: number;
  fechaPago: Date;
  importe: number;
  estatus: 'PAGADO' | 'CANCELADO';
}

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
  // TODO implementar y llamar el service de historial de pagos
  predioId = input.required<string>();

  pagos = signal<ReciboPago[]>([]);
  loading = signal(true);
  displayedColumns = ['anio', 'folio', 'fecha', 'importe', 'estatus'];

  ngOnInit(): void {
    // Simulación de delay de red (Fetch de 1.5 segundos)
    setTimeout(() => {
      this.pagos.set([
        {
          folio: 'REC-2024-00589',
          anioFiscal: 2024,
          fechaPago: new Date('2024-01-15'),
          importe: 1250.0,
          estatus: 'PAGADO',
        },
        {
          folio: 'REC-2023-11200',
          anioFiscal: 2023,
          fechaPago: new Date('2023-02-20'),
          importe: 1100.5,
          estatus: 'PAGADO',
        },
        {
          folio: 'REC-2022-05444',
          anioFiscal: 2022,
          fechaPago: new Date('2022-03-10'),
          importe: 980.0,
          estatus: 'PAGADO',
        },
      ]);
      this.loading.set(false);
    }, 1500);
  }
}

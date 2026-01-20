import { Component, input, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ContribuyenteApiService } from '@gob-ui/padron';
import { PropiedadPredio } from '@gob-ui/padron';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

// Interface local (o muévela a models)
export interface PropietarioRow {
  id: string;
  nombre: string;
  tipoRelacion: 'PROPIETARIO' | 'POSEEDOR';
  porcentaje: number;
  esResponsable: boolean;
}

@Component({
  selector: 'lib-predio-propietarios',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatProgressSpinner,
  ],
  templateUrl: './predio-propietarios.html',
  styleUrl: './predio-propietarios.scss',
})
export class PredioPropietarios {
  // Servicios
  private contribuyenteService = inject(ContribuyenteApiService);

  // Inputs
  predioId = input.required<string>();

  // Estado
  isLoading = signal(false);
  dataSource = signal<PropietarioRow[]>([]);
  displayedColumns = ['nombre', 'tipo', 'porcentaje', 'acciones'];

  constructor() {
    // Reaccionamos cada vez que cambia el predioId
    effect(() => {
      const id = this.predioId();
      if (id) {
        this.cargarPropietarios(id);
      } else {
        this.dataSource.set([]);
      }
    });
  }

  private cargarPropietarios(id: string): void {
    this.isLoading.set(true);

    this.contribuyenteService.getPropietariosPorPredio(id).subscribe({
      next: (data) => {
        // Mapeamos la respuesta del API a las filas de la tabla
        const rows = data.map((item) => this.mapearAView(item));
        this.dataSource.set(rows);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error cargando propietarios', err);
        this.dataSource.set([]);
        this.isLoading.set(false);
      },
    });
  }

  /**
   * Transforma el objeto del Backend al objeto visual de la Tabla
   */
  private mapearAView(item: PropiedadPredio): PropietarioRow {
    // 1. Construir Nombre Completo
    const nombreCompleto = item.razonSocial
      ? item.razonSocial
      : [item.razonSocial, item.apellidoPaterno, item.apellidoMaterno]
          .filter(Boolean) // Elimina nulos o undefined
          .join(' ');

    // 2. Determinar Tipo y Porcentaje
    // NOTA: Como el endpoint actual no devuelve 'tipoRelacion' ni 'porcentaje',
    // usamos valores por defecto o lógica simulada hasta que el backend lo soporte.
    return {
      id: item.id,
      nombre: nombreCompleto || 'SIN NOMBRE',
      esResponsable: item.esResponsablePago,
      // TODO: Pedir al Backend que envíe estos campos reales
      tipoRelacion: item.tipoRelacion || 'PROPIETARIO',
      porcentaje: item.porcentajePropiedad || 100.0,
    };
  }

  verDetalleCiudadano(id: string): void {
    // TODO implementar metodo para visualizar informacion del contribuyente
    throw new Error('Method not implemented.');
  }
}

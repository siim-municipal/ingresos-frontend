import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Material
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

// Core
import { AguaService } from '../../services/agua.service';
import { FeedbackService } from '@gob-ui/shared/services';
import {
  ContratoResumenDTO,
  EstatusContrato,
} from '../../models/contrato.models';

@Component({
  selector: 'lib-contrato-agua-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './contrato-agua-list.html',
  styleUrls: ['./contrato-agua-list.scss'],
})
export class ContratoAguaList implements OnInit {
  private aguaService = inject(AguaService);
  private feedback = inject(FeedbackService);

  // Estados
  dataSource = signal<ContratoResumenDTO[]>([]);
  isLoading = signal(true);

  // Columnas de la tabla
  displayedColumns = [
    'clave',
    'propietario',
    'servicio',
    'estatus',
    'acciones',
  ];

  // Exponemos el Enum al template
  Estatus = EstatusContrato;

  ngOnInit(): void {
    this.cargarContratos();
  }

  cargarContratos(): void {
    this.isLoading.set(true);
    this.aguaService.listarContratos().subscribe({
      next: (data) => {
        this.dataSource.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.isLoading.set(false);
        this.feedback.error('Error', 'No se pudieron cargar los contratos.');
      },
    });
  }

  cambiarEstatus(
    contrato: ContratoResumenDTO,
    nuevoEstatus: EstatusContrato,
  ): void {
    // Optimistic UI o bloqueo simple
    this.isLoading.set(true);

    this.aguaService.actualizarEstatus(contrato.id, nuevoEstatus).subscribe({
      next: () => {
        this.feedback.success(
          'Estatus Actualizado',
          `El contrato ahora está ${nuevoEstatus}`,
        );
        // Recargamos la lista para ver el cambio reflejado
        this.cargarContratos();
      },
      error: (err) => {
        this.isLoading.set(false);
        this.feedback.error(
          'Error',
          `No se pudo cambiar el estatus del contrato.${err}`,
        );
      },
    });
  }

  // Helper para colores de estatus
  getStatusColor(estatus: EstatusContrato): string {
    switch (estatus) {
      case EstatusContrato.ACTIVO:
        return 'accent';
      case EstatusContrato.SUSPENDIDO:
        return 'warn';
      case EstatusContrato.CANCELADO:
        return 'primary';
      default:
        return '';
    }
  }
}

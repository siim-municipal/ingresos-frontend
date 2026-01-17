import { Component, input, signal, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// Interface local (o muévela a models)
export interface PropietarioRow {
  nombre: string;
  tipoRelacion: 'PROPIETARIO' | 'POSEEDOR';
  porcentaje: number;
  esResponsable: boolean;
}

@Component({
  selector: 'lib-predio-propietarios',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatIconModule, MatButtonModule],
  templateUrl: './predio-propietarios.html',
  styleUrl: './predio-propietarios.scss',
})
export class PredioPropietarios implements OnInit {
  // Input requerido: El ID del predio para buscar sus dueños
  predioId = input.required<string>();

  displayedColumns = ['nombre', 'tipo', 'porcentaje', 'acciones'];
  dataSource = signal<PropietarioRow[]>([]);

  ngOnInit(): void {
    // TODO AQUÍ LLAMARÍAS A TU SERVICIO REAL: this.service.getPropietarios(this.predioId())
    // Simulamos datos para que veas la UI funcionando ya:
    setTimeout(() => {
      this.dataSource.set([
        {
          nombre: 'JUAN PEREZ LOPEZ',
          tipoRelacion: 'PROPIETARIO',
          porcentaje: 50.0,
          esResponsable: true,
        },
        {
          nombre: 'MARIA GONZALEZ RUIZ',
          tipoRelacion: 'PROPIETARIO',
          porcentaje: 50.0,
          esResponsable: false,
        },
      ]);
    }, 500);
  }
}

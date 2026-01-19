// libs/sales/src/lib/ui/corte-caja/corte-caja.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

import { CajaStore } from '../../stores/caja.store';
import { CajaApiService } from '../../services/caja-api.service';
import { DENOMINACIONES, CorteCajaRequest } from '../../models/caja.models';
import { PdfHandlerService, FeedbackService } from '@gob-ui/shared/services';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

@Component({
  selector: 'lib-corte-caja',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinner,
  ],
  templateUrl: './corte-caja.html',
  styleUrl: './corte-caja.scss',
})
export class CorteCaja {
  // Inyecciones
  public store = inject(CajaStore);
  private api = inject(CajaApiService);
  private pdfHandler = inject(PdfHandlerService);
  private feedback = inject(FeedbackService);
  private router = inject(Router);

  // Constantes
  readonly denominaciones = DENOMINACIONES;

  // Estados Reactivos (Signals)
  isLoading = signal(false);
  observaciones = signal('');
  pdfResultante = signal<Blob | null>(null);

  // Mapa de conteo: { "500": 10, "200": 5 ... }
  conteo = signal<Record<number, number>>({});

  // Asumimos que el Store tiene el acumulado local de ventas del día
  // Si no, esto vendría de un endpoint GET /resumen-preliminar
  totalSistema = computed(() => this.store.totalVendido() || 0);

  // Cálculos Derivados
  totalDeclarado = computed(() => {
    const mapa = this.conteo();
    return Object.entries(mapa).reduce((acc, [denom, cantidad]) => {
      return acc + Number(denom) * (cantidad || 0);
    }, 0);
  });

  diferencia = computed(() => {
    return this.totalDeclarado() - this.totalSistema();
  });

  esFaltante = computed(() => this.diferencia() < 0);
  esSobrante = computed(() => this.diferencia() > 0);

  // --- Actions ---

  actualizarConteo(denominacion: number, cantidad: number): void {
    this.conteo.update((current) => ({
      ...current,
      [denominacion]: cantidad,
    }));
  }

  realizarCorte(): void {
    const sesionId = this.store.sesionId();
    if (!sesionId) {
      this.feedback.error('Error', 'No hay sesión activa para cerrar.');
      return;
    }

    if (this.esFaltante() && !this.observaciones()) {
      this.feedback.warning(
        'Justificación Requerida',
        'Existe un faltante. Debe agregar observaciones.',
      );
      return;
    }

    if (
      !confirm(
        '¿Está seguro de realizar el Corte de Caja? Esta acción es irreversible.',
      )
    )
      return;

    this.isLoading.set(true);

    // 1. Preparar Payload
    const request: CorteCajaRequest = {
      sesionCajaId: sesionId,
      desgloseEfectivo: this.transformarConteoParaBackend(),
      observaciones: this.observaciones(),
    };

    // 2. Llamada API
    this.api.realizarCorte(request).subscribe({
      next: (pdfBlob) => {
        this.isLoading.set(false);
        this.feedback.success('Corte Exitoso', 'La sesión ha sido cerrada.');

        this.pdfResultante.set(pdfBlob);

        // 3. Manejo del PDF (Imprimir)
        this.pdfHandler.printPdf(pdfBlob);

        // 4. Limpieza Local
        this.store.cerrarSesionLocal(); // Método en store que limpia localStorage y estado
      },
      error: (err) => {
        console.error(err);
        this.feedback.error(
          'Error en Corte',
          'No se pudo procesar el cierre. Intente nuevamente.',
        );
        this.isLoading.set(false);
      },
    });
  }

  reimprimir(): void {
    const blob = this.pdfResultante();
    if (blob) this.pdfHandler.printPdf(blob);
  }

  finalizarYSalir(): void {
    this.router.navigate(['/auth/login']);
  }

  private transformarConteoParaBackend(): Record<string, number> {
    const raw = this.conteo();
    const result: Record<string, number> = {};

    // Convertimos claves numéricas a strings con formato decimal si es necesario
    // Java BigDecimal espera string o number, pero el Map key en JSON es string
    Object.entries(raw).forEach(([denom, cant]) => {
      if (cant > 0) {
        // Aseguramos formato "500.00" para consistencia, aunque Java suele parsear "500" bien
        const key = Number(denom).toFixed(2);
        result[key] = cant;
      }
    });
    return result;
  }
}

// libs/sales/src/lib/ui/recibo-visor/recibo-visor.component.ts
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ReciboApiService } from '../../services/recibo-api.service';
import { PdfHandlerService } from '@gob-ui/shared/services';

@Component({
  selector: 'lib-recibo-visor',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    RouterLink,
  ],
  templateUrl: './recibo-visor.html',
  styleUrl: './recibo-visor.scss',
})
export class ReciboVisor implements OnInit {
  // Inyecciones
  private api = inject(ReciboApiService);
  private pdfHandler = inject(PdfHandlerService);

  // Inputs & Signals
  // Recibimos el ID desde la ruta (withComponentInputBinding habilitado en app.config)
  id = input.required<string>();
  // Estado interno
  isLoading = signal(false);
  error = signal<string | null>(null);
  pdfBlob = signal<Blob | null>(null); // Guardamos el Blob para no volver a pedirlo

  ngOnInit(): void {
    if (!this.id()) return;

    this.isLoading.set(true);

    this.cargarRecibo();
  }

  cargarRecibo(): void {
    if (!this.id()) return;

    this.isLoading.set(true);
    this.error.set(null);

    this.api.descargarRecibo(this.id()).subscribe({
      next: (blob) => {
        this.pdfBlob.set(blob);
        this.isLoading.set(false);

        // ✅ REQUERIMIENTO: Disparar automáticamente
        this.imprimir();
      },
      error: (err) => {
        console.error('Error descargando PDF:', err);
        this.error.set('No se pudo descargar el archivo del servidor.');
        this.isLoading.set(false);

        // Aquí podrías intentar leer el Blob de error si el backend manda JSON dentro del 400/500
        // pero requiere FileReader.
      },
    });
  }

  imprimir(): void {
    const blob = this.pdfBlob();
    if (blob) {
      this.pdfHandler.printPdf(blob);
    }
  }

  abrirEnPestana(): void {
    const blob = this.pdfBlob();
    if (blob) {
      this.pdfHandler.openInNewTab(blob, `recibo_${this.id()}.pdf`);
    }
  }
}

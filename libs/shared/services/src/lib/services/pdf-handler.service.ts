import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class PdfHandlerService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    @Inject(PLATFORM_ID) private platformId: object,
  ) {}

  /**
   * Abre el PDF en una nueva pestaña del navegador.
   */
  openInNewTab(blob: Blob, filename = 'documento.pdf'): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = this.createBlobUrl(blob);
    // Abrir en nueva pestaña
    const newWindow = window.open(url, '_blank');

    if (!newWindow) {
      alert('Por favor habilite las ventanas emergentes para ver el recibo.');
    }

    // Limpieza de memoria (esperamos un poco para asegurar que la nueva tab cargó)
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  /**
   * Crea un iframe invisible, carga el PDF y dispara window.print()
   * Esta es la técnica para "Auto-Print".
   */
  printPdf(blob: Blob): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const url = this.createBlobUrl(blob);
    const iframe = this.document.createElement('iframe');

    // Ocultar iframe
    iframe.style.display = 'none';
    iframe.src = url;

    this.document.body.appendChild(iframe);

    iframe.onload = (): void => {
      // Esperamos un ciclo para asegurar renderizado
      setTimeout(() => {
        iframe.contentWindow?.print();

        // Limpieza del DOM y memoria después de imprimir
        // (Damos tiempo al usuario para interactuar con el diálogo de impresión)
        setTimeout(() => {
          this.document.body.removeChild(iframe);
          URL.revokeObjectURL(url);
        }, 60000);
      }, 500);
    };
  }

  private createBlobUrl(blob: Blob): string {
    return URL.createObjectURL(blob);
  }
}

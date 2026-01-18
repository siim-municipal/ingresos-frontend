import { CalculoState } from '../models/calculo.models';
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, retry, throwError, Observable } from 'rxjs';
import { API_BASE_URL } from '@gob-ui/shared/services';

import {
  SolicitudCalculo,
  ResultadoCalculoDTO,
  EstadoCuentaView,
  ConceptoView,
} from '../models/calculo.models';

@Injectable({
  providedIn: 'root',
})
export class CalculoService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  // Ajusta la URL según tu Gateway o Backend directo
  private apiUrl = `${this.baseUrl}/v1/calculos`;

  // Estado Reactivo
  private _state = signal<CalculoState>({
    status: 'IDLE',
    data: null,
    errorMessage: null,
  });

  readonly estadoCuenta = computed(() => this._state().data);
  readonly isLoading = computed(() => this._state().status === 'LOADING');
  readonly error = computed(() => this._state().errorMessage);

  /**
   * Llama al endpoint POST /estimar del CalculoImpuestosController.java
   */
  calcularPredial(predioId: string, anio: number): void {
    this._state.set({ status: 'LOADING', data: null, errorMessage: null });

    // 1. Construir el DTO que espera Java (SolicitudCalculo)
    const payload: SolicitudCalculo = {
      claveConcepto: 'IMP_PREDIAL_URBANO', // Debe coincidir con tu Tarifa en BD
      cantidad: 1,
      referenciaId: predioId,
      anioFiscal: anio,
      // baseCalculo: No lo enviamos, dejamos que el backend lo busque en PadrónClient
    };

    this.http
      .post<ResultadoCalculoDTO>(`${this.apiUrl}/estimar`, payload)
      .pipe(
        retry({ count: 2, delay: 1000 }), // Resiliencia básica
        map((dto) => this.adaptarRespuestaJava(dto)),
        catchError((err) => this.handleError(err)),
      )
      .subscribe({
        next: (viewData) => {
          this._state.set({
            status: 'SUCCESS',
            data: viewData,
            errorMessage: null,
          });
        },
        error: (msg) => {
          this._state.set({
            status: 'ERROR',
            data: null,
            errorMessage: msg,
          });
        },
      });
  }

  /**
   * ADAPTER: Transforma el DTO rico del backend al View Model
   */
  private adaptarRespuestaJava(dto: ResultadoCalculoDTO): EstadoCuentaView {
    // 1. Mapeo directo de la lista (Sin cálculos manuales)
    const conceptos: ConceptoView[] = dto.desglose.map((rubro) => ({
      descripcion: rubro.concepto,
      monto: rubro.monto,
      esDescuento: rubro.tipo === 'DESCUENTO',
      esRecargo:
        rubro.esImpuestoAdicional ||
        (rubro.tipo === 'CARGO' && rubro.concepto.includes('Recargo')),
      esInformativo: rubro.tipo === 'INFORMATIVO',
      detalles: rubro.detalles,
    }));

    // 2. Calcular totales para el resumen (Opcional, si el backend no los manda separados)
    // Filtramos solo CARGOS y DESCUENTOS para las sumas, ignoramos INFORMATIVOS
    const recargos = conceptos
      .filter((c) => c.esRecargo)
      .reduce((acc, c) => acc + c.monto, 0);

    const descuentos = conceptos
      .filter((c) => c.esDescuento)
      .reduce((acc, c) => acc + c.monto, 0);

    // Calculamos el subtotal (Cargos normales que no son recargos)
    const subtotal = conceptos
      .filter((c) => !c.esRecargo && !c.esDescuento && !c.esInformativo)
      .reduce((acc, c) => acc + c.monto, 0);

    return {
      folio: `EST-${new Date().getTime().toString().slice(-6)}`,
      listaConceptos: conceptos, // Pasamos la lista completa (incluyendo informativos)
      subtotal: subtotal,
      totalRecargos: recargos,
      totalDescuentos: descuentos,
      granTotal: dto.total, // Confiamos en el total del backend
      fechaLimite: new Date(new Date().getFullYear(), 11, 31),
      metadatos: dto.metadatos, // ✅ Pasamos los metadatos
    };
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let msg = 'Error al calcular impuestos.';

    if (error.status === 403) {
      msg = 'Error de Seguridad: Token inválido o sin municipio asignado.';
    } else if (error.status === 400) {
      msg =
        'Datos incorrectos. Verifique que el predio tenga valores catastrales.';
    } else if (error.status === 500) {
      msg =
        'Error interno en el motor de cálculo (Formula/Tarifa no encontrada).';
    }

    console.error('Backend Error:', error);
    return throwError(() => msg);
  }
}

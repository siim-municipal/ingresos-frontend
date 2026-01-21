import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { API_BASE_URL } from '@gob-ui/shared/services';

// DTO espejo de IntencionPagoDTO.java
export interface IntencionPagoRequest {
  paymentRequestUUID: string; // UUID v4
  contribuyenteId: string;
  sesionCajaId: string;
  claveConcepto: string;
  montoTotal: number;
  referenciaId: string;
  anioFiscal?: number;
}

export interface IngresoResponse {
  id: string;
  folio: string;
  estatus: string;
}

export interface ReciboPago {
  folio: string;
  anioFiscal: number;
  fechaPago: Date;
  importe: number;
  estatus: string;
}

@Injectable({ providedIn: 'root' })
export class TesoreriaApiService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/v1/pagos`;

  procesarPago(payload: IntencionPagoRequest): Observable<IngresoResponse> {
    return this.http.post<IngresoResponse>(`${this.apiUrl}/procesar`, payload);
  }

  getHistorialPagos(predioId: string): Observable<ReciboPago[]> {
    return this.http
      .get<
        ReciboPago[]
      >(`${this.baseUrl}/v1/ingresos/historial/predio/${predioId}`)
      .pipe(
        map((data) =>
          data.map((item) => ({
            folio: item.folio,
            anioFiscal: item.anioFiscal,
            fechaPago: new Date(item.fechaPago), // Convertir string ISO a Date
            importe: item.importe,
            estatus: item.estatus,
          })),
        ),
      );
  }
}

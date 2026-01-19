// libs/sales/src/lib/services/recibo-api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '@gob-ui/shared/services';

@Injectable({ providedIn: 'root' })
export class ReciboApiService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/v1/recibos`;

  /**
   * Solicita el PDF como Blob.
   * Importante: responseType: 'blob' evita que Angular intente parsear JSON.
   */
  descargarRecibo(ingresoId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${ingresoId}/pdf`, {
      responseType: 'blob',
    });
  }
}

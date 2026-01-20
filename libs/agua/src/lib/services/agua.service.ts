import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ContratoAguaRequest,
  EstatusContrato,
} from '../models/contrato.models';
import { API_BASE_URL } from '@gob-ui/shared/services';

@Injectable({ providedIn: 'root' })
export class AguaService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/v1/contratos`;

  crearContrato(request: ContratoAguaRequest): Observable<void> {
    return this.http.post<void>(this.apiUrl, request);
  }

  // Método para futura implementación de suspensión
  actualizarEstatus(id: string, estatus: EstatusContrato): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/estatus`, { estatus });
  }

  verificarExistenciaContrato(predioId: string): Observable<boolean> {
    return this.http
      .get<{ existe: boolean }>(`${this.apiUrl}/existe-por-predio/${predioId}`)
      .pipe(map((response) => response.existe));
  }
}

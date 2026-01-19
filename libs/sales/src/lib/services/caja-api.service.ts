import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CorteCajaRequest } from '../models/caja.models';
import { API_BASE_URL } from '@gob-ui/shared/services';

@Injectable({ providedIn: 'root' })
export class CajaApiService {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);
  private readonly apiUrl = `${this.baseUrl}/v1/cajas`;

  realizarCorte(payload: CorteCajaRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/corte`, payload, {
      responseType: 'blob',
    });
  }
}

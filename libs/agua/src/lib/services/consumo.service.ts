// src/app/services/consumo.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, of } from 'rxjs';
import { HistorialLecturaDTO } from '../models/consumo.model';

@Injectable({ providedIn: 'root' })
export class ConsumoService {
  private http = inject(HttpClient);

  getHistorialUltimos12Meses(
    contratoId: string,
  ): Observable<HistorialLecturaDTO[]> {
    // TODO En producción: return this.http.get<...>(`/api/v1/contratos/${contratoId}/historial`);

    // Mock para la demostración
    const mockData: HistorialLecturaDTO[] = Array.from(
      { length: 12 },
      (_, i) => ({
        periodo: `2024-${(i + 1).toString().padStart(2, '0')}`,
        consumoM3: Math.floor(Math.random() * 30) + 10, // 10 a 40 m3
        importePagado: Math.floor(Math.random() * 500) + 150,
        fechaLectura: new Date().toISOString(),
      }),
    );

    return of(mockData).pipe(delay(800));
  }
}

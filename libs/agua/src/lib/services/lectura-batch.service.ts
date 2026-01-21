// services/lectura-batch.service.ts
import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { LecturaDTO, LecturaBatchPayload } from '../models/lectura.model';
import { LecturaRowViewModel } from '../view-models/lectura-row.vm';
import { delay, of, tap } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LecturaBatchService {
  private http = inject(HttpClient);

  // Estado global de la pantalla
  rows = signal<LecturaRowViewModel[]>([]);
  loading = signal<boolean>(false);

  // Carga inicial (Mock)
  loadLecturas(): void {
    this.loading.set(true);
    // Simulación de API
    const mockData: LecturaDTO[] = Array.from({ length: 500 }).map((_, i) => ({
      id: i + 1,
      predioDireccion: `Calle ${i} #100`,
      medidorSerie: `SN-${1000 + i}`,
      lecturaAnterior: 1000 + i * 10,
      promedioHistorico: 15,
      lecturaActual: null,
      sinMedidor: false,
    }));

    of(mockData)
      .pipe(delay(500))
      .subscribe((data) => {
        this.rows.set(data.map((d) => new LecturaRowViewModel(d)));
        this.loading.set(false);
      });
  }

  saveBatch(): void {
    const rows = this.rows();
    const toSave = rows.filter((r) => r.actual() !== null && r.esValido());

    if (toSave.length === 0) return;

    this.loading.set(true);
    const payload: LecturaBatchPayload = {
      lecturas: toSave.map((r) => ({ id: r.id, lecturaActual: r.actual()! })),
    };

    // Llamada real al backend
    // return this.http.post('/api/lecturas/batch', payload)...

    console.log('Enviando batch a ms-agua:', payload);
    setTimeout(() => this.loading.set(false), 1000);
  }
}

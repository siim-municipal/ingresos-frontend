import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { API_BASE_URL, FeedbackService } from '@gob-ui/shared/services';
import {
  PageResponse,
  Predio,
  PredioTableParams,
} from '../models/predio.model';

@Injectable({ providedIn: 'root' })
export class PredioService {
  private http = inject(HttpClient);

  private feedBack = inject(FeedbackService);

  private baseUrl = inject(API_BASE_URL);

  private apiUrl = `${this.baseUrl}/v1/predios`;

  findAll(params: PredioTableParams): Observable<PageResponse<Predio>> {
    let httpParams = new HttpParams()
      .set('page', params.page.toString())
      .set('size', params.size.toString())
      .set('sort', params.sort);

    if (params.search) {
      httpParams = httpParams.set('busqueda', params.search);
    }

    return this.http
      .get<PageResponse<Predio>>(this.apiUrl, { params: httpParams })
      .pipe(
        catchError((error) => {
          console.error('Error al cargar predios:', error);
          // Retornamos estructura vacía segura para no romper la tabla
          return of({
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: params.size,
            number: 0,
          });
        }),
      );
  }

  findById(id: string): Observable<Predio> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Predio>(url).pipe(
      catchError((error) => {
        this.feedBack.error('Error al obtener Predio', `Detalles: ${error}`);
        throw error;
      }),
    );
  }
}

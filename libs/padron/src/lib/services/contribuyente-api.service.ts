import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ContribuyenteDTO,
  PersonaFisicaDTO,
  PersonaMoralDTO,
} from '../models/contribuyente.dto';
import { API_BASE_URL } from '@gob-ui/shared/services';

// Interfaz auxiliar para leer la paginación de Spring Boot
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface BackendSujetoDTO {
  id: string;
  tipoPersona: 'FISICA' | 'MORAL';
  nombreRazonSocial: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  rfc: string;
  curp?: string;
  email?: string;
  telefonoMovil?: string;
  direccionFiscal?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContribuyenteApiService {
  private http = inject(HttpClient);

  private baseUrl = inject(API_BASE_URL);

  private readonly apiUrl = `${this.baseUrl}/v1/sujetos-pasivos`;

  search(
    query: string,
    page = 0,
    size = 20,
  ): Observable<PageResponse<ContribuyenteDTO>> {
    let params = new HttpParams()
      .set('page', page.toString()) // Spring Boot usa 0-index
      .set('size', size.toString());

    if (query) {
      params = params.set('busqueda', query);
    }

    return this.http
      .get<PageResponse<BackendSujetoDTO>>(this.apiUrl, { params })
      .pipe(
        map((pageResp) => ({
          ...pageResp,
          // Mapeamos solo el contenido, preservamos totalElements, totalPages, etc.
          content: pageResp.content.map((item) =>
            this.mapBackendToFrontend(item),
          ),
        })),
      );
  }

  getById(id: string): Observable<ContribuyenteDTO> {
    return this.http
      .get<BackendSujetoDTO>(`${this.apiUrl}/${id}`)
      .pipe(map((item) => this.mapBackendToFrontend(item)));
  }

  // ADAPTADOR: Convierte tu DTO de Java al DTO estricto que definimos en el Frontend
  private mapBackendToFrontend(backend: BackendSujetoDTO): ContribuyenteDTO {
    const direccionCompleta = backend.direccionFiscal || '';

    const base = {
      id: backend.id,
      rfc: backend.rfc,
      tipoPersona: backend.tipoPersona,
      fechaRegistro: new Date().toISOString(),
      domicilio: {
        calle: direccionCompleta,
        numeroExterior: '',
        codigoPostal: '',
        colonia: '',
      },
    };

    if (backend.tipoPersona === 'FISICA') {
      return {
        ...base,
        tipoPersona: 'FISICA',
        nombre: backend.nombreRazonSocial,
        apellidoPaterno: backend.apellidoPaterno || '',
        apellidoMaterno: backend.apellidoMaterno || '',
        curp: backend.curp || '',
        email: backend.email || '',
        telefono: backend.telefonoMovil || '',
      } as PersonaFisicaDTO;
    } else {
      return {
        ...base,
        tipoPersona: 'MORAL',
        razonSocial: backend.nombreRazonSocial,
        fechaConstitucion: new Date().toISOString(),
      } as PersonaMoralDTO;
    }
  }
}

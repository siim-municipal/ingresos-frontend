import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { catchError, map, Observable, of } from 'rxjs';
import {
  ContribuyenteDTO,
  PersonaFisicaDTO,
  PersonaMoralDTO,
} from '../models/contribuyente.dto';
import { API_BASE_URL } from '@gob-ui/shared/services';
import { CreateContribuyentePayload } from '../interfaces/contribuyente.form.interface';
interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

interface BackendSujetoDTO {
  id?: string | null;
  tipoPersona: 'FISICA' | 'MORAL';
  nombreRazonSocial: string;
  apellidoPaterno?: string | null;
  apellidoMaterno?: string | null;
  rfc: string;
  curp?: string | null;
  email?: string;
  telefonoMovil?: string | null;
  direccionFiscal?: string;
  fechaConstitucion?: string | null;
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

  /**
   * Verifica si un RFC ya existe en la base de datos.
   * Retorna true si existe, false si está disponible.
   */
  verificarExistenciaRfc(rfc: string): Observable<boolean> {
    const cleanRfc = rfc.trim().toUpperCase();

    if (!cleanRfc) {
      return of(false);
    }

    const url = `${this.apiUrl}/existe/${cleanRfc}`;

    return this.http.get<PageResponse<BackendSujetoDTO>>(url).pipe(
      map((response) => {
        // Verificación Estricta:
        if (response.totalElements > 0 && response.content.length > 0) {
          return response.content.some((c) => c.rfc === cleanRfc);
        }
        return false;
      }),
      // Manejo de Errores:
      catchError((err) => {
        console.error('Error validando RFC:', err);
        return of(false);
      }),
    );
  }

  /**
   * Registra un nuevo contribuyente.
   * Mapea el Formulario (Frontend) -> SujetoPasivoDTO (Backend)
   */
  registrar(datos: CreateContribuyentePayload): Observable<ContribuyenteDTO> {
    const payloadBackend: BackendSujetoDTO = {
      id: null,
      tipoPersona: datos.tipoPersona,
      rfc: datos.rfc.toUpperCase().trim(),
      email: datos.email.toLowerCase().trim(),

      // 4. Lógica de Nombres vs Razón Social
      // Si es FÍSICA: nombreRazonSocial lleva solo el nombre de pila.
      // Si es MORAL: nombreRazonSocial lleva la Razón Social completa.
      nombreRazonSocial:
        datos.tipoPersona === 'FISICA'
          ? (datos.nombre || '').toUpperCase().trim()
          : (datos.razonSocial || '').toUpperCase().trim(),

      // Apellidos (Solo existen si es FÍSICA)
      apellidoPaterno:
        datos.tipoPersona === 'FISICA'
          ? (datos.apellidoPaterno || '').toUpperCase().trim()
          : null,

      apellidoMaterno:
        datos.tipoPersona === 'FISICA' && datos.apellidoMaterno
          ? datos.apellidoMaterno.toUpperCase().trim()
          : undefined,

      // CURP (Solo si es FÍSICA)
      // Importante: Enviar null si es MORAL para no romper el @Pattern del backend
      curp:
        datos.tipoPersona === 'FISICA'
          ? (datos.curp || '').toUpperCase().trim()
          : undefined,

      // Dirección Fiscal (Concatenación)
      direccionFiscal: `${datos.calle.toUpperCase().trim()}, C.P. ${datos.codigoPostal}`,

      telefonoMovil: datos.telefonoMovil
        ? datos.telefonoMovil.trim()
        : undefined,

      fechaConstitucion:
        datos.tipoPersona === 'MORAL' ? datos.fechaConstitucion : null,
    };

    return this.http
      .post<BackendSujetoDTO>(this.apiUrl, payloadBackend)
      .pipe(map((response) => this.mapBackendToFrontend(response)));
  }

  // TODO hacer un mapper en otra clase
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

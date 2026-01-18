export type TipoPredio = 'URBANO' | 'RUSTICO' | 'EJIDAL' | 'SUBURBANO';

export interface Predio {
  id: string; // UUID
  claveCatastral: string;
  claveAnterior?: string;
  cuentaPredial?: string;
  tipoPredio: TipoPredio;
  usoSuelo?: string;
  valorCatastral?: number;

  areaTerrenoM2?: number;
  areaConstruccionM2?: number;

  latitud?: number;
  longitud?: number;

  // Dirección
  calle?: string;
  numeroExterior?: string;
  coloniaBarrio?: string;
  codigoPostal?: string;

  // Estado Fiscal
  ultimoAnioPagado?: number;

  // Auditoría (Heredado de BaseEntity)
  createdBy?: string;
  createdAt?: string;
  lastModifiedBy?: string;
  lastModifiedAt?: string;
}

// Interfaces auxiliares para la paginación de Spring Boot
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; // Page index actual (0-based)
}

export interface PredioTableParams {
  page: number;
  size: number;
  sort: string; // formato: "campo,asc" o "campo,desc"
  search?: string;
}

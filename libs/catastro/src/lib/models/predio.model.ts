export type TipoPredio = 'URBANO' | 'RUSTICO' | 'EJIDAL' | 'SUBURBANO';

export interface Predio {
  id: string; // UUID
  claveCatastral: string;
  claveAnterior?: string;
  cuentaPredial?: string;
  tipoPredio: TipoPredio;
  usoSuelo?: string;
  valorCatastral?: number;

  // Dirección
  calle?: string;
  numeroExterior?: string;
  coloniaBarrio?: string; // Nombre exacto de tu Entity
  codigoPostal?: string;

  // Estado Fiscal
  ultimoAnioPagado?: number; // Vital para el Estatus (Verde/Rojo)

  // Auditoría (Heredado de BaseEntity)
  createdAt?: string;
  updatedAt?: string;
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

/**
 * 1. DTOs (Data Transfer Objects)
 * Contratos directos con el Backend (ms-calculo-impuestos)
 */

import { TaxConcept } from '../enums/tax-concepts.enum';

// Request: Lo que enviamos para pedir el cálculo
export interface SolicitudCalculo {
  claveConcepto: TaxConcept | string; // Ej: "IMP_PREDIAL_URBANO"
  cantidad: number; // Default 1
  baseCalculo?: number; // Opcional (m2, valor catastral)
  referenciaId?: string; // UUID del Predio o Licencia
  parametrosExtra?: Record<string, string>; // Ej: { "zona": "CENTRO" }
  anioFiscal?: number;
}

// Atom: Renglón individual del desglose (Backend)
export interface RubroDTO {
  concepto: string;
  monto: string | number;
  tipo: 'CARGO' | 'DESCUENTO' | 'INFORMATIVO';
  esImpuestoAdicional: boolean;
  detalles: string;
}

// Response: La respuesta "rica" del Backend
export interface ResultadoCalculoDTO {
  claveConcepto: string;
  descripcion: string;
  desglose: RubroDTO[]; // Lista desglosada (Fuente de verdad)
  metadatos: Record<string, number | string | object>; // Datos de auditoría (UMA, Tasa)
  total: string | number;
  metodoCalculo: string;
}

/**
 * 2. VIEW MODELS (Modelos de Vista)
 * Estructuras optimizadas para el HTML (Components)
 */

// Renglón visual para la tabla de desglose
export interface ConceptoView {
  descripcion: string;
  monto: number;
  esDescuento: boolean; // Para color VERDE
  esRecargo: boolean; // Para color ROJO
  esInformativo: boolean; // Para color GRIS / Cursiva
  detalles?: string; // Texto secundario (tooltips o subtítulos)
}

// Objeto completo listo para renderizar la "Hoja de Cuenta"
export interface EstadoCuentaView {
  folio: string; // Generado temporal o real
  listaConceptos: ConceptoView[];
  subtotal: number;
  totalRecargos: number;
  totalDescuentos: number;
  granTotal: number;
  fechaLimite: Date;
  metadatos: Record<string, number | string | object>; // Para mostrar info técnica al usuario
}

/**
 * 3. STATE MANAGEMENT
 * Estados para el manejo reactivo del Servicio (Signals)
 */

export type CalculoStatus = 'IDLE' | 'LOADING' | 'SUCCESS' | 'ERROR';

export enum CalculoErrorType {
  GENERICO = 'GENERICO',
  REQUIERE_VALUACION = 'REQUIERE_VALUACION', // Status 422
  PREDIO_NO_ENCONTRADO = 'PREDIO_NO_ENCONTRADO', // Status 404
}

export interface CalculoState {
  status: CalculoStatus;
  data: EstadoCuentaView | null;
  errorMessage: string | null;
  errorType: CalculoErrorType | null;
}

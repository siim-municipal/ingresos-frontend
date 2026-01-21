export enum TipoToma {
  DOMESTICA = 'DOMESTICA',
  COMERCIAL = 'COMERCIAL',
  INDUSTRIAL = 'INDUSTRIAL',
  MIXTA = 'MIXTA',
}

export enum EstatusContrato {
  ACTIVO = 'ACTIVO',
  SUSPENDIDO = 'SUSPENDIDO',
  CANCELADO = 'CANCELADO',
}

export interface ContratoAguaRequest {
  predioId: string;
  tipoToma: TipoToma;
  esServicioMedido: boolean;
  numeroMedidor?: string; // Obligatorio si esServicioMedido = true
  lecturaInicial?: number;
  observaciones?: string;
}

export interface ContratoResumenDTO {
  id: string;
  predioId: string;
  claveCatastral: string; // Dato proyectado del predio
  propietario: string; // Dato proyectado del predio
  numeroMedidor?: string;
  tipoToma: string;
  estatus: EstatusContrato;
  ultimaLectura?: number;
}

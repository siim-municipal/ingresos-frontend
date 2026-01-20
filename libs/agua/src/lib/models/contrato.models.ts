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

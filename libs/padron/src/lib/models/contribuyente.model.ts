import { DomicilioDTO, TipoPersona } from './contribuyente.dto';

export interface Contribuyente {
  id: string;
  rfc: string;
  tipoPersona: TipoPersona;
  nombreCompleto: string;
  fechaRegistro: Date;
  domicilio: DomicilioDTO;
  datosAdicionales: {
    curp?: string;
    fechaConstitucion?: Date;
    email?: string;
    telefono?: string;
  };
}
